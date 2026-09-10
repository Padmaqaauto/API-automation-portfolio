import 'dotenv/config';
import {
  Given,
  Then,
  Before
} from '@cucumber/cucumber';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';

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
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
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

async function resolveEndpointKey(
  world,
  requestPath,
  requestMethod,
  requestVersion
) {
  const normalizedPath =
    String(requestPath)
      .trim();

  const normalizedMethod =
    String(requestMethod)
      .trim()
      .toUpperCase();

  const normalizedVersion =
    String(requestVersion)
      .trim();

  if (
    world.endpointKey &&
    world.endpoint &&
    (
      world.endpoint.path ??
      world.endpoint.basePath
    ) === normalizedPath &&
    String(world.endpoint.method)
      .trim()
      .toUpperCase() === normalizedMethod &&
    String(world.endpoint.version)
      .trim() === normalizedVersion
  ) {
    return world.endpointKey;
  }

  const registry =
    await loadEndpointRegistry();

  const endpoints =
    registry.endpoints ??
    registry;

  for (
    const [
      endpointKey,
      endpoint
    ] of Object.entries(endpoints)
  ) {
    const endpointPath =
      endpoint.path ??
      endpoint.basePath;

    const endpointMethod =
      String(
        endpoint.method
      )
        .trim()
        .toUpperCase();

    const endpointVersion =
      String(
        endpoint.version
      )
        .trim();

    if (
      endpointPath === normalizedPath &&
      endpointMethod === normalizedMethod &&
      endpointVersion === normalizedVersion
    ) {
      world.endpointKey =
        endpointKey;

      world.endpoint =
        endpoint;

      console.log(
        'Endpoint resolved automatically:',
        {
          endpointKey,
          path: endpointPath,
          method: endpointMethod,
          version: endpointVersion
        }
      );

      return endpointKey;
    }
  }

  throw new Error(
    'Unable to determine endpointKey.\n' +
    `Path: ${normalizedPath}\n` +
    `Method: ${normalizedMethod}\n` +
    `Version: ${normalizedVersion}\n` +
    'No matching endpoint was found in api-versions.json.'
  );
}
async function getEndpoint(world) {
  const registry =
    await loadEndpointRegistry();

  const endpointKey =
    await resolveEndpointKey(world);

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
    this.pickle = pickle;
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

function loadEndpointSchema(schemaName, endpointMetadata) {
  // Target file name passed or inferred
  const targetFileName = schemaName || endpointMetadata?.schemaFile;
  // Search directories under schemas and pages/data
  const searchDirs = [
    path.resolve(process.cwd(), 'page-objects', 'data', 'pet'),
    path.resolve(process.cwd(), 'page-objects', 'data', 'store'),
    path.resolve(process.cwd(), 'page-objects', 'data', 'user'),
    path.resolve(process.cwd(), schemaRoot)
  ];

  let resolvedPath = null;

  // Search across target directories for matching *.schema.json file
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const match = files.find((file) => {
        if (!file.endsWith('schema.json')) return false;
        if (targetFileName) {
          return file === targetFileName || file.includes(targetFileName.replace('.json', ''));
        }
        return true;
      });

      if (match) {
        resolvedPath = path.join(dir, match);
        break;
      }
    }
  }
  if (!resolvedPath) {
    throw new Error(
      `Schema file matching "${targetFileName || 'schema.json'}" was not found inside pet, store, or user subfolders.`
    );
  }

  const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
  return JSON.parse(fileContent);
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
    const testDataFile =
      path.resolve(
        testDataRoot,
        'pet',
        apiData
      );

    const allTestData =
      await loadJson(
        testDataFile
      );

    let scenarioData;

    if (
      Object.keys(
        allTestData
      ).length === 1
    ) {
      scenarioData =
        allTestData[
        Object.keys(
          allTestData
        )[0]
        ];
    } else if (
      allTestData.request
    ) {
      scenarioData =
        allTestData;
    } else {
      scenarioData =
        resolveScenarioData(
          allTestData,
          apiData
        );
    }

    const request =
      scenarioData?.request ??
      scenarioData;

    const requestPath =
      request?.url ??
      request?.path;

    const requestMethod =
      request?.method ??
      method;

    const requestVersion =
      request?.version ??
      process.env.API_VERSION;

    if (!requestPath) {
      throw new Error(
        `API path/url is missing in test data: ${apiData}`
      );
    }

    if (!requestMethod) {
      throw new Error(
        `HTTP method is missing in test data: ${apiData}`
      );
    }

    if (!requestVersion) {
      throw new Error(
        `API version is missing in test data: ${apiData} ` +
        'and API_VERSION is not configured.'
      );
    }

    const endpointKey =
      await resolveEndpointKey(
        this,
        requestPath,
        requestMethod,
        requestVersion
      );

    const endpoint =
      this.endpoint;

    if (!this.apiRequestBuilder) {
      const registry =
        await loadEndpointRegistry();

      this.apiRequestBuilder =
        new ApiRequestBuilderUtils(
          registry
        );
    }

    const requestedMethod =
      String(method)
        .trim()
        .toUpperCase();

    const configuredMethod =
      String(
        endpoint.method
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

    this.endpointKey =
      endpointKey;

    this.endpoint =
      endpoint;

    this.testData =
      allTestData;

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
      configuredMethod;

    console.log(
      '[API Request Prepared]',
      {
        endpointKey:
          this.endpointKey,
        method:
          this.requestMethod,
        version:
          endpoint.version,
        url:
          this.requestUrl
      }
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

Then('verify the response schema should be matching {string}', async function (schemaName) {
  let responseBody = this.responseBody;

  // Safely parse responseBody if it is passed as a string or double-stringified JSON
  while (typeof responseBody === 'string') {
    try {
      responseBody = JSON.parse(responseBody);
    } catch (e) {
      break;
    }
  }

  const schema = loadEndpointSchema(schemaName, this.endpoint);

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(responseBody);

  if (!valid) {
    const errorDetails = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Response body does not match schema "${schemaName}":\n${errorDetails}`);
  }
});