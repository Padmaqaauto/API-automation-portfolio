import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';


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