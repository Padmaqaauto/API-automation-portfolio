import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';

Then(
    'verify all returned pets should have status {string}',
    async function (expectedPetStatus) {
        if (!this.responseBody) {
            throw new Error(
                'Response body is not available. Make sure the API request was sent first.'
            );
        }

if (!Array.isArray(this.responseBody)) {
  throw new Error(
    'Expected the response body to be an array of pets.'
  );
}

for (const pet of this.responseBody) {
  assert.equal(
    pet.status,
    expectedPetStatus,
    `Expected every returned pet to have status "${expectedPetStatus}" ` +
    `but received "${pet.status}" for pet ID "${pet.id}".`
  );
}

}
);
