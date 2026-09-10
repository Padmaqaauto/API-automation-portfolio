import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// =============================================================================
// RESOLVE PET ID FROM KEYWORD (e.g. "valid pet ID", "invalid pet ID")
// =============================================================================

const petIdDataFile = path.resolve(
  process.cwd(),
  'test-data',
  'pet',
  'pet-test-data.json'
);

function loadPetIdValues() {
  const fileContent = fs.readFileSync(petIdDataFile, 'utf-8');
  return JSON.parse(fileContent);
}

Given(
  'the user sets the pet ID to {string}',
  async function (petIdKeyword) {
    if (!this.endpoint) {
      throw new Error(
        'Endpoint metadata is not available. Make sure "the user creates a GET request URL and headers with api data" step ran first.'
      );
    }

    if (!this.apiRequestBuilder) {
      throw new Error(
        'API request builder is not initialized. Make sure "the user creates a GET request URL and headers with api data" step ran first.'
      );
    }

    const petIdValues = loadPetIdValues();

    if (!Object.prototype.hasOwnProperty.call(petIdValues, petIdKeyword)) {
      throw new Error(
        `Pet ID keyword "${petIdKeyword}" was not found in pet-id-values.json. ` +
        `Available keywords: ${Object.keys(petIdValues).join(', ')}`
      );
    }

    const resolvedPetId = petIdValues[petIdKeyword];

    this.pathParams = {
      ...this.pathParams,
      petId: resolvedPetId
    };

    // Rebuild the request URL now that petId has changed
    this.requestUrl = this.apiRequestBuilder.buildUrl(
      this.endpoint,
      this.pathParams,
      this.queryParams
    );

    console.log('[Pet ID Resolved]', {
      keyword: petIdKeyword,
      resolvedPetId,
      requestUrl: this.requestUrl
    });
  }
);

// =============================================================================
// VERIFY RESPONSE PET ID
// =============================================================================
Then(
  'verify the response pet ID should match the requested pet ID',
  async function () {
    if (!this.responseBody) {
      throw new Error(
        'Response body is not available. Make sure the API request was sent first.'
      );
    }

    if (!this.pathParams) {
      throw new Error(
        'Path parameters are not available.'
      );
    }

    const requestedPetId =
      this.pathParams.petId ??
      this.pathParams.id;

    if (
      requestedPetId === undefined ||
      requestedPetId === null
    ) {
      throw new Error(
        'Requested pet ID was not found in path parameters.'
      );
    }

    const actualPetId =
      this.responseBody.id;

    assert.equal(
      String(actualPetId),
      String(requestedPetId),
      `Expected response pet ID "${requestedPetId}" ` +
      `but received "${actualPetId}".`
    );
  }
);

// =============================================================================
// VERIFY RESPONSE PET NAME
// =============================================================================
Then(
  'verify the response pet name should be {string}',
  async function (expectedPetName) {
    if (!this.responseBody) {
      throw new Error(
        'Response body is not available. Make sure the API request was sent first.'
      );
    }

    const actualPetName =
      this.responseBody.name;

    assert.equal(
      actualPetName,
      expectedPetName,
      `Expected pet name "${expectedPetName}" ` +
      `but received "${actualPetName}".`
    );
  }
);

// =============================================================================
// VERIFY RESPONSE PET STATUS
// =============================================================================
Then(
  'verify the response pet status should be {string}',
  async function (expectedPetStatus) {
    if (!this.responseBody) {
      throw new Error(
        'Response body is not available. Make sure the API request was sent first.'
      );
    }

    const actualPetStatus =
      this.responseBody.status;

    assert.equal(
      actualPetStatus,
      expectedPetStatus,
      `Expected pet status "${expectedPetStatus}" ` +
      `but received "${actualPetStatus}".`
    );
  }
);