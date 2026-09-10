import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
    resolveTestDataField
} from '../../support/utils/data-utils.js';

// =============================================================================
// TEST DATA FILE
// =============================================================================

const petTestDataFile = path.resolve(
    process.cwd(),
    'test-data',
    'pet',
    'pet-test-data.json'
);

// =============================================================================
// LOAD PET TEST DATA
// =============================================================================

function loadPetTestData() {
    if (!fs.existsSync(petTestDataFile)) {
        throw new Error(
            `Pet test-data file was not found: ${petTestDataFile}`
        );
    }

    const fileContent = fs.readFileSync(
        petTestDataFile,
        'utf-8'
    );

    try {
        return JSON.parse(fileContent);
    } catch (error) {
        throw new Error(
            `Unable to parse pet test-data file: ${petTestDataFile}. ` +
            `Error: ${error.message}`
        );
    }
}

// =============================================================================
// RESOLVE PET TEST DATA FIELD
// =============================================================================

function resolvePetTestData(
    keyword,
    field
) {
    const testData = loadPetTestData();

    return resolveTestDataField(
        testData,
        keyword,
        field
    );
}

// =============================================================================
// SET PET ID
// =============================================================================

Given(
    'the user sets the pet ID to {string}',

    async function (petIdKeyword) {

        if (!this.endpoint) {
            throw new Error(
                'Endpoint metadata is not available. ' +
                'Make sure "the user creates a GET request URL and headers with api data" ' +
                'step ran first.'
            );
        }

        if (!this.apiRequestBuilder) {
            throw new Error(
                'API request builder is not initialized. ' +
                'Make sure "the user creates a GET request URL and headers with api data" ' +
                'step ran first.'
            );
        }

        const resolvedPetId = resolvePetTestData(
            petIdKeyword,
            'id'
        );

        this.petTestDataKeyword = petIdKeyword;

        this.petTestData = {
            id: resolvedPetId
        };

        this.pathParams = {
            ...this.pathParams,
            petId: resolvedPetId
        };

        this.requestUrl =
            this.apiRequestBuilder.buildUrl(
                this.endpoint,
                this.pathParams,
                this.queryParams
            );

        console.log(
            '[Pet Test Data Resolved]',
            {
                keyword: petIdKeyword,
                field: 'id',
                value: resolvedPetId,
                requestUrl: this.requestUrl
            }
        );
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
                'Response body is not available. ' +
                'Make sure the API request was sent first.'
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

    async function (petNameKeyword) {

        if (!this.responseBody) {
            throw new Error(
                'Response body is not available. ' +
                'Make sure the API request was sent first.'
            );
        }

        const expectedPetName =
            resolvePetTestData(
                petNameKeyword,
                'name'
            );

        const actualPetName =
            this.responseBody.name;

        assert.equal(
            actualPetName,
            expectedPetName,

            `Expected pet name "${expectedPetName}" ` +
            `but received "${actualPetName}".`
        );

        console.log(
            '[Pet Name Validation]',
            {
                keyword: petNameKeyword,
                expected: expectedPetName,
                actual: actualPetName
            }
        );
    }
);

// =============================================================================
// VERIFY RESPONSE PET STATUS
// =============================================================================

Then(
    'verify the response pet status should be {string}',

    async function (petStatusKeyword) {

        if (!this.responseBody) {
            throw new Error(
                'Response body is not available. ' +
                'Make sure the API request was sent first.'
            );
        }

        const expectedPetStatus =
            resolvePetTestData(
                petStatusKeyword,
                'status'
            );

        const actualPetStatus =
            this.responseBody.status;

        assert.equal(
            actualPetStatus,
            expectedPetStatus,

            `Expected pet status "${expectedPetStatus}" ` +
            `but received "${actualPetStatus}".`
        );

        console.log(
            '[Pet Status Validation]',
            {
                keyword: petStatusKeyword,
                expected: expectedPetStatus,
                actual: actualPetStatus
            }
        );
    }
);