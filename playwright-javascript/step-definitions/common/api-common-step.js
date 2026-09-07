import 'dotenv/config';
import {
  Given,
  Then,
  Before
} from '@cucumber/cucumber';

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveDynamicData } from '../../support/utils/data-utils.js';
import { ApiRequestBuilderUtils } from '../../support/utils/api-request-builder-utils.js';

const endpointRegistryFile =
  process.env.API_ENDPOINT_REGISTRY_FILE;

const testDataRoot =
  process.env.API_TEST_DATA_ROOT;

const schemaRoot =
  process.env.API_SCHEMA_ROOT;

if (!endpointRegistryFile) {
  throw new Error(
    'API_ENDPOINT_REGISTRY_FILE is not configured.'
  );
}

if (!testDataRoot) {
  throw new Error(
    'API_TEST_DATA_ROOT is not configured.'
  );
}

if (!schemaRoot) {
  throw new Error(
    'API_SCHEMA_ROOT is not configured.'
  );
}

async function loadJson(filePath) {
  return JSON.parse(
    await fs.readFile(
      filePath,
      'utf-8'
    )
  );
}

async function loadEndpointRegistry() {
  return loadJson(
    path.resolve(
      endpointRegistryFile
    )
  );
}

function normalizeTag(tag) {
  return String(tag)
    .replace(/^@/, '')
    .trim();
}

async function resolveEndpointKey(world) {
  if (world.endpointKey) return world.endpointKey;

  const registry = await loadEndpointRegistry();

  // 1. Tag matching (Highest Priority) - e.g. @petById
  const scenarioTags = (world.pickle?.tags || []).map((t) =>
    t.name.replace(/^@/, '').toLowerCase()
  );

  for (const key of Object.keys(registry)) {
    if (scenarioTags.includes(key.toLowerCase())) {
      world.endpointKey = key;
      return key;
    }
  }

  // 2. Direct filename match
  const filePath = world.pickle?.uri || '';
  const baseName = filePath.split(/[/\\]/).pop().replace(/\.feature$/i, '');

  if (registry[baseName]) {
    world.endpointKey = baseName;
    return baseName;
  }

  // 3. Fallback: Exact key match ignoring hyphens/casing
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  for (const key of Object.keys(registry)) {
    const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanKey === cleanBaseName) {
      world.endpointKey = key;
      return key;
    }
  }

  throw new Error(
    `Unable to determine endpointKey for scenario. Add a registry tag (e.g., @petById) ` +
    `to '${baseName}.feature'. Available keys: [${Object.keys(registry).join(', ')}]`
  );
}

async function getEndpoint(
  world
) {
  const registry =
    await loadEndpointRegistry();

  const endpointKey =
    await resolveEndpointKey(
      world
    );

  const endpoint =
    registry[endpointKey];

  if (!endpoint) {
    throw new Error(
      `Endpoint metadata not found for: ${endpointKey}`
    );
  }

  world.apiRequestBuilder =
    new ApiRequestBuilderUtils(
      registry
    );

  return endpoint;
}

Before(
  async function ({ pickle }) {
    /*
     * FIX:
     * Cucumber provides the pickle through
     * the hook argument. Do not use scenario.pickle.
     */
    this.pickle = pickle;

    await resolveEndpointKey(
      this
    );
  }
);

async function loadEndpointTestData(
  endpoint
) {
  const configuration =
    typeof endpoint.testData === 'string'
      ? {
        source: endpoint.testData
      }
      : endpoint.testData;

  if (
    !configuration?.source
  ) {
    throw new Error(
      'Test-data source filename is missing from endpoint metadata.'
    );
  }

  const root =
    configuration.root ??
    testDataRoot;

  return loadJson(
    path.resolve(
      root,
      configuration.source
    )
  );
}

async function loadEndpointSchema(
  endpoint
) {
  const configuration =
    typeof endpoint.schema === 'string'
      ? {
        source: endpoint.schema
      }
      : endpoint.schema;

  if (
    !configuration?.source
  ) {
    throw new Error(
      'Schema source filename is missing from endpoint metadata.'
    );
  }

  const root =
    configuration.root ??
    schemaRoot;

  return loadJson(
    path.resolve(
      root,
      configuration.source
    )
  );
}

function resolveScenarioData(
  testData,
  apiData
) {
  if (
    !testData ||
    typeof testData !== 'object'
  ) {
    throw new Error(
      'Loaded test data must be a JSON object.'
    );
  }

  /*
   * Exact key match.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      testData,
      apiData
    )
  ) {
    return resolveDynamicData(
      testData[apiData]
    );
  }

  /*
   * Feature may provide a JSON filename.
   * When the loaded file contains only one
   * scenario object, use that object.
   */
  if (
    typeof apiData === 'string' &&
    apiData
      .toLowerCase()
      .endsWith('.json')
  ) {
    const keys =
      Object.keys(
        testData
      );

    if (keys.length === 1) {
      return resolveDynamicData(
        testData[keys[0]]
      );
    }

    return resolveDynamicData(
      testData
    );
  }

  /*
   * Search one level below the top-level object.
   */
  for (
    const group
    of Object.values(
      testData
    )
  ) {
    if (
      group &&
      typeof group === 'object' &&
      Object.prototype.hasOwnProperty.call(
        group,
        apiData
      )
    ) {
      return resolveDynamicData(
        group[apiData]
      );
    }
  }

  throw new Error(
    `Test-data reference "${apiData}" was not found.`
  );
}

function buildRequestData(
  scenarioData,
  endpoint
) {
  const request =
    scenarioData?.request ??
    scenarioData;

  return {
    pathParams:
      resolveDynamicData(
        request?.pathParams ?? {}
      ),

    queryParams:
      resolveDynamicData(
        request?.queryParams ?? {}
      ),

    headers:
      resolveDynamicData(
        request?.headers ??
        endpoint.headers ??
        {}
      ),

    requestBody:
      resolveDynamicData(
        request?.requestBody ??
        request?.body ??
        null
      )
  };
}

function buildRequestUrl(
  world,
  endpoint,
  pathParams,
  queryParams
) {
  return world.apiRequestBuilder
    .buildUrl(
      endpoint,
      pathParams,
      queryParams
    );
}

function buildRequestHeaders(
  world,
  headers
) {
  return world.apiRequestBuilder
    .buildHeaders({
      headers
    });
}

async function sendRequest(
  world,
  method,
  requestOptions
) {
  const normalized =
    String(method)
      .trim()
      .toLowerCase();

  const functions = {
    get:
      world.apiRequestUtils.get.bind(
        world.apiRequestUtils
      ),

    post:
      world.apiRequestUtils.post.bind(
        world.apiRequestUtils
      ),

    put:
      world.apiRequestUtils.put.bind(
        world.apiRequestUtils
      ),

    delete:
      world.apiRequestUtils.delete.bind(
        world.apiRequestUtils
      ),

    patch:
      world.apiRequestUtils.patch.bind(
        world.apiRequestUtils
      )
  };

  const requestFunction =
    functions[normalized];

  if (!requestFunction) {
    throw new Error(
      `Unsupported HTTP method: ${method}`
    );
  }

  return requestFunction(
    world.requestContext,
    requestOptions
  );
}

Given(
  'the user creates a {word} request URL and headers with api data {string}',
  async function (
    method,
    apiData
  ) {
    const endpoint =
      await getEndpoint(
        this
      );

    // Extract allowed methods array or single string from registry
    const allowedMethods = Array.isArray(endpoint.methods)
      ? endpoint.methods.map((m) => String(m).trim().toUpperCase())
      : [String(endpoint.method || '').trim().toUpperCase()];

    const requestedMethod =
      String(method)
        .trim()
        .toUpperCase();

    if (!allowedMethods.includes(requestedMethod)) {
      throw new Error(
        `HTTP method mismatch. Feature requested "${requestedMethod}" ` +
        `but endpoint registry allows: [${allowedMethods.join(', ')}].`
      );
    }

    const testData =
      await loadEndpointTestData(
        endpoint
      );

    const scenarioData =
      resolveScenarioData(
        testData,
        apiData
      );

    this.endpoint =
      endpoint;

    this.testData =
      testData;

    this.apiData =
      apiData;

    this.scenarioData =
      scenarioData;

    const requestData =
      buildRequestData(
        scenarioData,
        endpoint
      );

    this.pathParams =
      requestData.pathParams;

    this.queryParams =
      requestData.queryParams;

    this.requestHeaders =
      buildRequestHeaders(
        this,
        requestData.headers
      );

    this.requestPayload =
      requestData.requestBody;

    this.requestUrl =
      buildRequestUrl(
        this,
        endpoint,
        this.pathParams,
        this.queryParams
      );

    this.requestMethod =
      requestedMethod;

    console.log(
      `[API Request Prepared] ${this.requestMethod} ${this.requestUrl}`
    );
  }
);

Then(
  'the user sends a {word} request to API',
  async function (
    method
  ) {
    const requestedMethod =
      String(method)
        .trim()
        .toUpperCase();

    if (!this.endpoint) {
      throw new Error(
        'Endpoint metadata is not available.'
      );
    }

    const configuredMethod =
      String(
        this.endpoint.method
      )
        .trim()
        .toUpperCase();

    assert.equal(
      requestedMethod,
      configuredMethod,
      `HTTP method mismatch. ` +
      `Feature requested "${requestedMethod}" ` +
      `but endpoint registry contains "${configuredMethod}".`
    );

    if (!this.requestUrl) {
      throw new Error(
        'Request URL is not available.'
      );
    }

    if (!this.requestContext) {
      throw new Error(
        'Playwright APIRequestContext is not initialized.'
      );
    }

    const requestOptions = {
      url:
        this.requestUrl,

      headers:
        this.requestHeaders,

      data:
        this.requestPayload
    };

    this.requestResult =
      await sendRequest(
        this,
        requestedMethod,
        requestOptions
      );

    this.response =
      this.requestResult.response;

    this.responseBody =
      this.requestResult.body;

    this.responseHeaders =
      this.requestResult.headers;
  }
);

Then(
  'verify the response status code should be {string}',
  async function (
    expectedStatus
  ) {
    if (!this.response) {
      throw new Error(
        'Response is not available for status validation.'
      );
    }

    const actual =
      this.response.status();

    assert.equal(
      actual,
      Number(expectedStatus),
      `Expected HTTP status ${expectedStatus} ` +
      `but received ${actual}`
    );
  }
);

Then(
  'verify the content type in response header should be {string}',
  async function (
    expectedContentType
  ) {
    const actual =
      this.responseHeaders?.[
      'content-type'
      ] ?? '';

    assert.ok(
      actual
        .toLowerCase()
        .includes(
          expectedContentType
            .toLowerCase()
        ),
      `Expected Content-Type "${expectedContentType}" ` +
      `but received "${actual}"`
    );
  }
);

Then(
  'verify the response schema should be matching {string}',
  async function (
    schemaReference
  ) {
    const schema =
      await loadEndpointSchema(
        this.endpoint
      );

    if (!this.apiResponseUtils) {
      throw new Error(
        'apiResponseUtils is not available on the Cucumber World.'
      );
    }

    this.apiResponseUtils
      .validateSchema(
        this.responseBody,
        schema,
        schemaReference
      );
  }
);
