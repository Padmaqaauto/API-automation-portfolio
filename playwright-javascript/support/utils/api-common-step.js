// support/utils/api-common.steps.js

import {
  Given,
  Then,
  Before
} from '@cucumber/cucumber';

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveDynamicData } from './data-utils.js';


// =============================================================================
// CONFIGURATION
// =============================================================================

const endpointRegistryFile =
  process.env.API_ENDPOINT_REGISTRY_FILE;

const testDataRoot =
  process.env.API_TEST_DATA_ROOT;

const schemaRoot =
  process.env.API_SCHEMA_ROOT;


// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================

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


// =============================================================================
// LOAD ENDPOINT REGISTRY
// =============================================================================

async function loadEndpointRegistry() {

  const filePath =
    path.resolve(
      endpointRegistryFile
    );

  const fileContent =
    await fs.readFile(
      filePath,
      'utf-8'
    );

  return JSON.parse(
    fileContent
  );
}


// =============================================================================
// NORMALIZE TAG
// =============================================================================

function normalizeTag(tag) {

  return String(tag)
    .replace(/^@/, '')
    .trim();

}


// =============================================================================
// RESOLVE ENDPOINT KEY
// =============================================================================
//
// The endpoint key must come from the scenario/framework context.
// This function does NOT hardcode endpoint filenames, URLs,
// request payloads, schemas, etc.
//
// Supported approaches:
//
// 1. World already contains endpointKey
//
// 2. Endpoint registry contains tags:
//
//    "pet.getById": {
//       "tags": ["GetPetById"]
//    }
//
// The feature tag can then resolve the endpoint.
//
// =============================================================================

async function resolveEndpointKey(world) {

  // ---------------------------------------------------------------------------
  // 1. Endpoint key already available
  // ---------------------------------------------------------------------------

  if (world.endpointKey) {

    return world.endpointKey;

  }


  // ---------------------------------------------------------------------------
  // 2. Get scenario tags
  // ---------------------------------------------------------------------------

  const pickleTags =
    world.pickle?.tags ?? [];

  const scenarioTags =
    pickleTags.map(
      tag =>
        normalizeTag(
          tag.name
        )
    );


  // ---------------------------------------------------------------------------
  // 3. Load endpoint registry
  // ---------------------------------------------------------------------------

  const registry =
    await loadEndpointRegistry();


  // ---------------------------------------------------------------------------
  // 4. Search endpoint metadata
  // ---------------------------------------------------------------------------

  for (
    const [
      endpointKey,
      endpoint
    ]
    of Object.entries(registry)
  ) {

    const endpointTags = [];


    // -------------------------------------------------------------------------
    // Endpoint tags
    // -------------------------------------------------------------------------

    if (
      Array.isArray(
        endpoint.tags
      )
    ) {

      endpointTags.push(
        ...endpoint.tags.map(
          normalizeTag
        )
      );

    }


    // -------------------------------------------------------------------------
    // Optional single tag
    // -------------------------------------------------------------------------

    if (
      endpoint.tag
    ) {

      endpointTags.push(
        normalizeTag(
          endpoint.tag
        )
      );

    }


    // -------------------------------------------------------------------------
    // Optional endpoint name
    // -------------------------------------------------------------------------

    if (
      endpoint.name
    ) {

      endpointTags.push(
        normalizeTag(
          endpoint.name
        )
      );

    }


    // -------------------------------------------------------------------------
    // Match scenario tag
    // -------------------------------------------------------------------------

    const matched =
      scenarioTags.some(
        scenarioTag =>
          endpointTags.includes(
            scenarioTag
          )
      );


    if (matched) {

      world.endpointKey =
        endpointKey;

      return endpointKey;

    }

  }


  // ---------------------------------------------------------------------------
  // No endpoint found
  // ---------------------------------------------------------------------------

  throw new Error(
    `Unable to determine endpointKey. ` +
    `Scenario tags: ${scenarioTags.join(', ')}`
  );

}


// =============================================================================
// GET ENDPOINT METADATA
// =============================================================================

async function getEndpoint(world) {

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


  return endpoint;

}


// =============================================================================
// BEFORE HOOK
// =============================================================================
//
// Resolve endpoint before executing API steps.
//
// No endpoint-specific values are stored here.
//
// =============================================================================

Before(
  async function () {

    await resolveEndpointKey(
      this
    );

  }
);


// =============================================================================
// LOAD ENDPOINT TEST DATA
// =============================================================================
//
// The endpoint registry controls which test-data JSON belongs to the endpoint.
//
// Example registry:
//
// "pet.getById": {
//    "testData": "pet-get-petId-test-data.json"
// }
//
// =============================================================================

async function loadEndpointTestData(endpoint) {

  if (
    !endpoint.testData
  ) {

    throw new Error(
      'testData configuration is missing from endpoint registry.'
    );

  }


  const fileName =
    typeof endpoint.testData === 'string'
      ? endpoint.testData
      : endpoint.testData.source;


  if (!fileName) {

    throw new Error(
      'Test-data source filename is missing from endpoint metadata.'
    );

  }


  const configuredRoot =
    typeof endpoint.testData === 'object' &&
    endpoint.testData.root
      ? endpoint.testData.root
      : testDataRoot;


  const filePath =
    path.resolve(
      configuredRoot,
      fileName
    );


  const fileContent =
    await fs.readFile(
      filePath,
      'utf-8'
    );


  return JSON.parse(
    fileContent
  );

}


// =============================================================================
// LOAD ENDPOINT SCHEMA
// =============================================================================
//
// Schema file is selected through endpoint metadata.
//
// =============================================================================

async function loadEndpointSchema(endpoint) {

  if (
    !endpoint.schema
  ) {

    throw new Error(
      'Schema configuration is missing from endpoint registry.'
    );

  }


  const fileName =
    typeof endpoint.schema === 'string'
      ? endpoint.schema
      : endpoint.schema.source;


  if (!fileName) {

    throw new Error(
      'Schema source filename is missing from endpoint metadata.'
    );

  }


  const configuredRoot =
    typeof endpoint.schema === 'object' &&
    endpoint.schema.root
      ? endpoint.schema.root
      : schemaRoot;


  const filePath =
    path.resolve(
      configuredRoot,
      fileName
    );


  const fileContent =
    await fs.readFile(
      filePath,
      'utf-8'
    );


  return JSON.parse(
    fileContent
  );

}


// =============================================================================
// RESOLVE SCENARIO TEST DATA
// =============================================================================
//
// apiData can represent:
//
// 1. A direct test-data key
//
//    validPet
//
// 2. A grouped test-data key
//
//    positive.validPet
//
// 3. A test-data filename
//
//    pet-get-petId-test-data.json
//
// The function remains generic.
//
// =============================================================================

function resolveScenarioData(
  testData,
  apiData
) {

  // ---------------------------------------------------------------------------
  // Validate input
  // ---------------------------------------------------------------------------

  if (
    !testData ||
    typeof testData !== 'object'
  ) {

    throw new Error(
      'Loaded test data must be a JSON object.'
    );

  }


  // ---------------------------------------------------------------------------
  // 1. Direct key
  // ---------------------------------------------------------------------------

  if (
    typeof apiData === 'string' &&
    Object.prototype.hasOwnProperty.call(
      testData,
      apiData
    )
  ) {

    return resolveDynamicData(
      testData[apiData]
    );

  }


  // ---------------------------------------------------------------------------
  // 2. Search grouped structures
  //
  // Example:
  //
  // {
  //   "positive": {
  //      "validPet": {}
  //   },
  //   "negative": {
  //      "invalidPet": {}
  //   }
  // }
  // ---------------------------------------------------------------------------

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


  // ---------------------------------------------------------------------------
  // 3. If apiData is a JSON filename,
  //    use the loaded endpoint test-data object.
  // ---------------------------------------------------------------------------

  if (
    typeof apiData === 'string' &&
    apiData
      .toLowerCase()
      .endsWith('.json')
  ) {

    return resolveDynamicData(
      testData
    );

  }


  // ---------------------------------------------------------------------------
  // Data not found
  // ---------------------------------------------------------------------------

  throw new Error(
    `Test-data reference "${apiData}" was not found.`
  );

}


// =============================================================================
// BUILD REQUEST DATA
// =============================================================================
//
// Extracts all request information without knowing which endpoint is running.
//
// Supported:
//
// pathParams
// queryParams
// headers
// requestBody
// body
//
// =============================================================================

function buildRequestData(
  scenarioData,
  endpoint
) {

  const request =
    scenarioData?.request ??
    scenarioData;


  const pathParams =
    request?.pathParams ??
    {};


  const queryParams =
    request?.queryParams ??
    {};


  const headers =
    request?.headers ??
    endpoint.headers ??
    {};


  const requestBody =
    request?.requestBody ??
    request?.body ??
    null;


  return {

    pathParams:
      resolveDynamicData(
        pathParams
      ),

    queryParams:
      resolveDynamicData(
        queryParams
      ),

    headers:
      resolveDynamicData(
        headers
      ),

    requestBody:
      resolveDynamicData(
        requestBody
      )

  };

}


// =============================================================================
// BUILD REQUEST URL
// =============================================================================

function buildRequestUrl(
  world,
  endpoint,
  pathParams,
  queryParams
) {

  return world.apiRequestBuilder.buildUrl(
    endpoint.path,
    pathParams,
    queryParams,
    endpoint.version
  );

}


// =============================================================================
// BUILD REQUEST HEADERS
// =============================================================================

function buildRequestHeaders(
  world,
  headers
) {

  return world.apiRequestBuilder.buildHeaders({
    headers
  });

}


// =============================================================================
// HTTP METHOD FUNCTION - GET
// =============================================================================

async function sendGetRequest(
  world,
  requestOptions
) {

  return await world.apiRequestUtils.get(
    world.requestContext,
    requestOptions
  );

}


// =============================================================================
// HTTP METHOD FUNCTION - POST
// =============================================================================

async function sendPostRequest(
  world,
  requestOptions
) {

  return await world.apiRequestUtils.post(
    world.requestContext,
    requestOptions
  );

}


// =============================================================================
// HTTP METHOD FUNCTION - PUT
// =============================================================================

async function sendPutRequest(
  world,
  requestOptions
) {

  return await world.apiRequestUtils.put(
    world.requestContext,
    requestOptions
  );

}


// =============================================================================
// HTTP METHOD FUNCTION - DELETE
// =============================================================================

async function sendDeleteRequest(
  world,
  requestOptions
) {

  return await world.apiRequestUtils.delete(
    world.requestContext,
    requestOptions
  );

}


// =============================================================================
// HTTP METHOD FUNCTION - PATCH
// =============================================================================

async function sendPatchRequest(
  world,
  requestOptions
) {

  return await world.apiRequestUtils.patch(
    world.requestContext,
    requestOptions
  );

}


// =============================================================================
// GENERIC HTTP REQUEST FUNCTION
// =============================================================================
//
// No switch/case.
//
// The method supplied by the feature is converted into the corresponding
// function name dynamically.
//
// Example:
//
// GET     -> sendGetRequest
// POST    -> sendPostRequest
// PUT     -> sendPutRequest
// DELETE  -> sendDeleteRequest
// PATCH   -> sendPatchRequest
//
// =============================================================================

async function sendRequest(
  world,
  method,
  requestOptions
) {

  const normalizedMethod =
    String(method)
      .trim()
      .toLowerCase();


  const methodFunctionName =
    `send${
      normalizedMethod
        .charAt(0)
        .toUpperCase()
      +
      normalizedMethod.slice(1)
    }Request`;


  const httpMethodFunctions = {

    sendGetRequest,

    sendPostRequest,

    sendPutRequest,

    sendDeleteRequest,

    sendPatchRequest

  };


  const requestFunction =
    httpMethodFunctions[
      methodFunctionName
    ];


  if (
    typeof requestFunction !== 'function'
  ) {

    throw new Error(
      `Unsupported HTTP method: ${method}`
    );

  }


  return await requestFunction(
    world,
    requestOptions
  );

}


// =============================================================================
// GIVEN - CREATE REQUEST URL AND HEADERS
// =============================================================================
//
// Common for every endpoint and every HTTP method.
//
// Feature:
//
// Given the user creates a GET request URL and headers with api data "<apiData>"
//
// Given the user creates a POST request URL and headers with api data "<apiData>"
//
// Given the user creates a PUT request URL and headers with api data "<apiData>"
//
// Given the user creates a DELETE request URL and headers with api data "<apiData>"
//
// Given the user creates a PATCH request URL and headers with api data "<apiData>"
//
// =============================================================================

Given(
  'the user creates a {word} request URL and headers with api data {string}',
  async function (
    method,
    apiData
  ) {

    // -------------------------------------------------------------------------
    // 1. Get endpoint metadata
    // -------------------------------------------------------------------------

    const endpoint =
      await getEndpoint(
        this
      );


    // -------------------------------------------------------------------------
    // 2. Validate HTTP method
    // -------------------------------------------------------------------------

    const configuredMethod =
      String(
        endpoint.method
      )
        .trim()
        .toUpperCase();


    const requestedMethod =
      String(
        method
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


    // -------------------------------------------------------------------------
    // 3. Load endpoint test-data file
    // -------------------------------------------------------------------------

    const testData =
      await loadEndpointTestData(
        endpoint
      );


    // -------------------------------------------------------------------------
    // 4. Resolve scenario data
    // -------------------------------------------------------------------------

    const scenarioData =
      resolveScenarioData(
        testData,
        apiData
      );


    // -------------------------------------------------------------------------
    // 5. Store endpoint information in World
    // -------------------------------------------------------------------------

    this.endpoint =
      endpoint;


    this.endpointKey =
      await resolveEndpointKey(
        this
      );


    this.apiData =
      apiData;


    this.testData =
      testData;


    this.scenarioData =
      scenarioData;


    // -------------------------------------------------------------------------
    // 6. Build request data
    // -------------------------------------------------------------------------

    const requestData =
      buildRequestData(
        scenarioData,
        endpoint
      );


    // -------------------------------------------------------------------------
    // 7. Store request data
    // -------------------------------------------------------------------------

    this.pathParams =
      requestData.pathParams;


    this.queryParams =
      requestData.queryParams;


    this.requestHeaders =
      requestData.headers;


    this.requestPayload =
      requestData.requestBody;


    // -------------------------------------------------------------------------
    // 8. Build URL
    // -------------------------------------------------------------------------

    this.requestUrl =
      buildRequestUrl(
        this,
        endpoint,
        this.pathParams,
        this.queryParams
      );


    // -------------------------------------------------------------------------
    // 9. Build headers
    // -------------------------------------------------------------------------

    this.requestHeaders =
      buildRequestHeaders(
        this,
        this.requestHeaders
      );


    // -------------------------------------------------------------------------
    // 10. Store method
    // -------------------------------------------------------------------------

    this.requestMethod =
      configuredMethod;

  }
);


// =============================================================================
// THEN - SEND REQUEST
// =============================================================================
//
// IMPORTANT:
//
// Request sending is implemented as THEN as requested.
//
// Feature:
//
// Then the user sends a GET request to API
//
// Then the user sends a POST request to API
//
// Then the user sends a PUT request to API
//
// Then the user sends a DELETE request to API
//
// Then the user sends a PATCH request to API
//
// =============================================================================

Then(
  'the user sends a {word} request to API',
  async function (
    method
  ) {

    // -------------------------------------------------------------------------
    // 1. Normalize requested method
    // -------------------------------------------------------------------------

    const requestedMethod =
      String(method)
        .trim()
        .toUpperCase();


    // -------------------------------------------------------------------------
    // 2. Make sure endpoint metadata exists
    // -------------------------------------------------------------------------

    if (
      !this.endpoint
    ) {

      throw new Error(
        'Endpoint metadata is not available. ' +
        'Run the request creation step before sending the request.'
      );

    }


    // -------------------------------------------------------------------------
    // 3. Get configured HTTP method
    // -------------------------------------------------------------------------

    const configuredMethod =
      String(
        this.endpoint.method
      )
        .trim()
        .toUpperCase();


    // -------------------------------------------------------------------------
    // 4. Validate HTTP method
    // -------------------------------------------------------------------------

    assert.equal(
      requestedMethod,
      configuredMethod,
      `HTTP method mismatch. ` +
      `Feature requested "${requestedMethod}" ` +
      `but endpoint registry contains "${configuredMethod}".`
    );


    // -------------------------------------------------------------------------
    // 5. Validate URL
    // -------------------------------------------------------------------------

    if (
      !this.requestUrl
    ) {

      throw new Error(
        'Request URL is not available.'
      );

    }


    // -------------------------------------------------------------------------
    // 6. Build request options
    // -------------------------------------------------------------------------

    const requestOptions = {

      url:
        this.requestUrl,

      headers:
        this.requestHeaders,

      data:
        this.requestPayload

    };


    // -------------------------------------------------------------------------
    // 7. Send request dynamically
    // -------------------------------------------------------------------------

    this.requestResult =
      await sendRequest(
        this,
        requestedMethod,
        requestOptions
      );


    // -------------------------------------------------------------------------
    // 8. Store response object
    // -------------------------------------------------------------------------

    this.response =
      this.requestResult.response;


    // -------------------------------------------------------------------------
    // 9. Store response body
    // -------------------------------------------------------------------------

    this.responseBody =
      this.requestResult.body;


    // -------------------------------------------------------------------------
    // 10. Store response headers
    // -------------------------------------------------------------------------

    this.responseHeaders =
      this.requestResult.headers;

  }
);


// =============================================================================
// THEN - VERIFY RESPONSE STATUS
// =============================================================================

Then(
  'verify the response status code should be {string}',
  async function (
    expectedStatus
  ) {

    const expected =
      Number(
        expectedStatus
      );


    if (
      Number.isNaN(
        expected
      )
    ) {

      throw new Error(
        `Invalid expected status value: ${expectedStatus}`
      );

    }


    const actualStatus =
      this.response.status();


    assert.equal(
      actualStatus,
      expected,
      `Expected HTTP status ${expected} ` +
      `but received ${actualStatus}`
    );

  }
);


// =============================================================================
// THEN - VERIFY CONTENT TYPE
// =============================================================================

Then(
  'verify the content type in response header should be {string}',
  async function (
    expectedContentType
  ) {

    const headers =
      this.responseHeaders ??
      this.response.headers();


    const actualContentType =
      headers[
        'content-type'
      ] ?? '';


    assert.ok(

      actualContentType
        .toLowerCase()
        .includes(
          expectedContentType
            .toLowerCase()
        ),

      `Expected Content-Type "${expectedContentType}" ` +
      `but received "${actualContentType}"`

    );

  }
);


// =============================================================================
// THEN - VERIFY RESPONSE SCHEMA
// =============================================================================
//
// The actual schema file is determined by endpoint metadata.
//
// The step argument is treated as the logical schema reference passed to the
// schema validator, not as the physical file path.
//
// =============================================================================

Then(
  'verify the response schema should be matching {string}',
  async function (
    schemaReference
  ) {

    if (
      !this.endpoint
    ) {

      throw new Error(
        'Endpoint metadata is not available.'
      );

    }


    const schema =
      await loadEndpointSchema(
        this.endpoint
      );


    await this.apiResponseUtils.validateSchema(

      this.responseBody,

      schema,

      schemaReference

    );

  }
);