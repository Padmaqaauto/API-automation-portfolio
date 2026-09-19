import assert from 'node:assert/strict';

export class PostPetPage {

    /**
     * Verify that the pet details returned by the POST /pet API
     * match the details that were actually sent in the request.
     *
     * @param {Object} requestPayload
     * @param {Object|string} responseBody
     * @param {Array<Object>} expectedFields
     */
    verifyResponsePetDetails(
        requestPayload,
        responseBody,
        expectedFields
    ) {

        if (
            !requestPayload ||
            typeof requestPayload !== 'object'
        ) {
            throw new Error(
                'Request payload is not available for pet response validation.'
            );
        }

        if (
            responseBody === null ||
            responseBody === undefined
        ) {
            throw new Error(
                'Response body is not available for pet response validation.'
            );
        }

        /*
         * Parse response body when it is returned as a JSON string.
         */
        let parsedResponseBody =
            responseBody;

        while (
            typeof parsedResponseBody === 'string'
        ) {
            try {
                parsedResponseBody =
                    JSON.parse(
                        parsedResponseBody
                    );
            } catch {
                break;
            }
        }

        if (
            !parsedResponseBody ||
            typeof parsedResponseBody !== 'object'
        ) {
            throw new Error(
                'Response body is not a valid JSON object.'
            );
        }

        if (
            !Array.isArray(expectedFields) ||
            expectedFields.length === 0
        ) {
            throw new Error(
                'Pet response validation fields cannot be empty.'
            );
        }

        /*
         * Resolve both simple and nested properties.
         *
         * Examples:
         *
         * id
         * name
         * status
         * category.id
         * category.name
         */
        const getNestedValue = (
            object,
            fieldPath
        ) => {

            return fieldPath
                .split('.')
                .reduce(
                    (
                        current,
                        key
                    ) => {

                        if (
                            current === null ||
                            current === undefined
                        ) {
                            return undefined;
                        }

                        return current[key];

                    },
                    object
                );
        };

        /*
         * Compare every requested field.
         */
        for (
            const fieldData
            of expectedFields
        ) {

            const field =
                fieldData.field?.trim();

            const valueKeyword =
                fieldData.value?.trim();

            if (!field) {
                throw new Error(
                    'Pet response validation field cannot be empty.'
                );
            }

            if (!valueKeyword) {
                throw new Error(
                    `Pet response validation value is missing for field "${field}".`
                );
            }

            /*
             * The expected value comes from the SAME payload
             * that was actually sent to the API.
             *
             * Therefore we are validating:
             *
             * requestPayload.field === responseBody.field
             */
            const expectedValue =
                getNestedValue(
                    requestPayload,
                    field
                );

            const actualValue =
                getNestedValue(
                    parsedResponseBody,
                    field
                );

            assert.deepStrictEqual(
                actualValue,
                expectedValue,
                `Response pet field "${field}" does not match the requested pet detail. ` +
                `Expected: ${JSON.stringify(expectedValue)}, ` +
                `Actual: ${JSON.stringify(actualValue)}`
            );

            console.log(
                `[PostPetPage] Response field "${field}" matched successfully.`,
                {
                    expected: expectedValue,
                    actual: actualValue
                }
            );
        }

        console.log(
            '[PostPetPage] All requested pet details matched successfully.'
        );

        return true;
    }
}
