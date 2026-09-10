import { cloneJson } from './json-helper-utils.js';
import { generateValue } from './random-utils.js';

const PLACEHOLDER = /\{\{([^}]+)\}\}/g;

/**
 * Resolves special string values such as:
 * env:VARIABLE_NAME
 * static:value
 * context:key
 * {{runtimeVariable}}
 */
function resolveSpecialValue(value, variables) {
    if (typeof value !== 'string') {
        return value;
    }

    if (value.startsWith('env:')) {
        const name = value.slice(4).trim();
        const envValue = process.env[name];

        if (envValue === undefined) {
            throw new Error(
                `Environment variable "${name}" is not defined.`
            );
        }

        return envValue;
    }

    if (value.startsWith('static:')) {
        return value.slice(7);
    }

    if (value.startsWith('context:')) {
        const key = value.slice(8).split('|')[0].trim();

        if (variables[key] !== undefined) {
            return variables[key];
        }

        throw new Error(
            `Runtime context value "${key}" is not available.`
        );
    }

    return value.replace(
        PLACEHOLDER,
        (_, key) => {
            const normalized = key.trim();

            if (variables[normalized] !== undefined) {
                return String(variables[normalized]);
            }

            const generated = generateValue(normalized);

            if (generated === undefined) {
                throw new Error(
                    `No runtime value or generator exists for placeholder ` +
                    `{{${normalized}}}`
                );
            }

            variables[normalized] = generated;

            return String(generated);
        }
    );
}

/**
 * Recursively resolves dynamic values in strings,
 * arrays and objects.
 */
export function resolveDynamicData(
    value,
    variables = {}
) {
    if (
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (typeof value === 'string') {
        return resolveSpecialValue(
            value,
            variables
        );
    }

    if (Array.isArray(value)) {
        return value.map(
            item =>
                resolveDynamicData(
                    item,
                    variables
                )
        );
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(
                ([key, child]) => [
                    key,
                    resolveDynamicData(
                        child,
                        variables
                    )
                ]
            )
        );
    }

    return value;
}

/**
 * Resolves complete test-data objects.
 */
export function resolveTestData(
    testData,
    variables = {}
) {
    return cloneJson(
        resolveDynamicData(
            testData,
            variables
        )
    );
}

/**
 * Returns a field from a keyword-based test-data object.
 *
 * Example:
 *
 * testData = {
 *     "valid pet ID": {
 *         "id": 123,
 *         "name": "doggie",
 *         "status": "available"
 *     }
 * }
 *
 * resolveTestDataField(testData, "valid pet ID", "id")
 *      -> 123
 *
 * resolveTestDataField(testData, "valid pet ID", "name")
 *      -> doggie
 *
 * resolveTestDataField(testData, "valid pet ID", "status")
 *      -> available
 */
export function resolveTestDataField(
    testData,
    keyword,
    field
) {
    if (
        !testData ||
        typeof testData !== 'object'
    ) {
        throw new Error(
            'Test data must be a valid JSON object.'
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            testData,
            keyword
        )
    ) {
        throw new Error(
            `Test data keyword "${keyword}" was not found. ` +
            `Available keywords: ${Object.keys(testData).join(', ')}`
        );
    }

    const keywordData = testData[keyword];

    if (
        !keywordData ||
        typeof keywordData !== 'object' ||
        Array.isArray(keywordData)
    ) {
        throw new Error(
            `Test data for keyword "${keyword}" must be an object.`
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            keywordData,
            field
        )
    ) {
        throw new Error(
            `Field "${field}" was not found for test data keyword "${keyword}".`
        );
    }

    return keywordData[field];
}

/**
 * Combines multiple runtime-variable sources.
 */
export function mergeVariables(
    ...sources
) {
    return Object.assign(
        {},
        ...sources
    );
}