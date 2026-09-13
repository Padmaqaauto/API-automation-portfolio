import { cloneJson } from './json-helper-utils.js';
import { generateValue } from './random-utils.js';

const PLACEHOLDER = /\{\{([^}]+)\}\}/g;
const FULL_PLACEHOLDER = /^\{\{([^}]+)\}\}$/;

/**
 * Converts a Cucumber Examples table value
 * into the most appropriate JavaScript type.
 *
 * Examples:
 * "1001"       -> 1001
 * "true"       -> true
 * "false"      -> false
 * "null"       -> null
 * ""           -> null
 * "[1,2]"      -> [1, 2]
 * "{\"id\":1}" -> { id: 1 }
 * "doggie"     -> "doggie"
 */
function resolveExampleValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const trimmedValue = String(value).trim();

    if (trimmedValue === '') {
        return null;
    }

    if (trimmedValue === 'null') {
        return null;
    }

    if (trimmedValue === 'true') {
        return true;
    }

    if (trimmedValue === 'false') {
        return false;
    }

    if (
        /^-?\d+(\.\d+)?$/.test(trimmedValue)
    ) {
        const numberValue = Number(trimmedValue);

        if (Number.isFinite(numberValue)) {
            return numberValue;
        }
    }

    if (
        (trimmedValue.startsWith('{') &&
            trimmedValue.endsWith('}')) ||
        (trimmedValue.startsWith('[') &&
            trimmedValue.endsWith(']'))
    ) {
        try {
            return JSON.parse(trimmedValue);
        } catch {
            return trimmedValue;
        }
    }

    return trimmedValue;
}

/**
 * Resolves special string values such as:
 *
 * env:VARIABLE_NAME
 * static:value
 * context:key
 * {{runtimeVariable}}
 *
 * options.missingPlaceholderValue:
 * Used when a placeholder is not supplied by
 * the Cucumber Examples table.
 *
 * Example:
 * "{{petId}}" + missingPlaceholderValue: null
 * => null
 */
function resolveSpecialValue(
    value,
    variables,
    options = {}
) {
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
        const key = value
            .slice(8)
            .split('|')[0]
            .trim();

        if (
            Object.prototype.hasOwnProperty.call(
                variables,
                key
            )
        ) {
            return variables[key];
        }

        throw new Error(
            `Runtime context value "${key}" is not available.`
        );
    }

    /*
     * Handle a placeholder that represents the
     * complete value.
     *
     * "{{petId}}" -> 1001
     *
     * The original data type is preserved.
     */
    const fullMatch = value.match(
        FULL_PLACEHOLDER
    );

    if (fullMatch) {
        const normalized = fullMatch[1].trim();

        if (
            Object.prototype.hasOwnProperty.call(
                variables,
                normalized
            )
        ) {
            return variables[normalized];
        }

        /*
         * For POST negative scenarios:
         *
         * Example table does not contain petId
         * but test-data JSON contains "{{petId}}".
         *
         * Return actual JavaScript null instead of
         * generating a value or throwing an error.
         */
        if (
            Object.prototype.hasOwnProperty.call(
                options,
                'missingPlaceholderValue'
            )
        ) {
            return options.missingPlaceholderValue;
        }

        /*
         * Preserve existing framework behaviour
         * for GET and other existing tests.
         */
        const generated =
            generateValue(normalized);

        if (generated === undefined) {
            throw new Error(
                `No runtime value or generator exists for placeholder {{${normalized}}}`
            );
        }

        variables[normalized] = generated;

        return generated;
    }

    /*
     * Handle placeholders embedded inside a larger
     * string.
     *
     * Example:
     * "/pet/{{petId}}/photo"
     */
    return value.replace(
        PLACEHOLDER,
        (_, key) => {
            const normalized = key.trim();

            if (
                Object.prototype.hasOwnProperty.call(
                    variables,
                    normalized
                )
            ) {
                const runtimeValue =
                    variables[normalized];

                /*
                 * Embedded placeholders are strings,
                 * therefore null/undefined become empty
                 * string rather than the text "null".
                 */
                if (
                    runtimeValue === null ||
                    runtimeValue === undefined
                ) {
                    return '';
                }

                return String(runtimeValue);
            }

            /*
             * A missing embedded placeholder cannot
             * become a real null because the surrounding
             * value is a string.
             */
            if (
                Object.prototype.hasOwnProperty.call(
                    options,
                    'missingPlaceholderValue'
                )
            ) {
                return '';
            }

            /*
             * Preserve existing generator behaviour.
             */
            const generated =
                generateValue(normalized);

            if (generated === undefined) {
                throw new Error(
                    `No runtime value or generator exists for placeholder {{${normalized}}}`
                );
            }

            variables[normalized] = generated;

            return String(generated);
        }
    );
}

/**
 * Recursively resolves dynamic values in:
 *
 * - strings
 * - arrays
 * - objects
 * - nested objects
 * - nested arrays
 *
 * Existing callers can continue using:
 *
 * resolveDynamicData(value)
 * resolveDynamicData(value, variables)
 *
 * POST can additionally use:
 *
 * resolveDynamicData(
 *     value,
 *     variables,
 *     { missingPlaceholderValue: null }
 * )
 */
export function resolveDynamicData(
    value,
    variables = {},
    options = {}
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
            variables,
            options
        );
    }

    if (Array.isArray(value)) {
        return value.map(
            item =>
                resolveDynamicData(
                    item,
                    variables,
                    options
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
                        variables,
                        options
                    )
                ]
            )
        );
    }

    return value;
}

/**
 * Resolves complete test data.
 *
 * Existing usage remains valid:
 *
 * resolveTestData(testData)
 * resolveTestData(testData, variables)
 *
 * Optional POST behaviour:
 *
 * resolveTestData(
 *     testData,
 *     variables,
 *     { missingPlaceholderValue: null }
 * )
 */
export function resolveTestData(
    testData,
    variables = {},
    options = {}
) {
    return cloneJson(
        resolveDynamicData(
            testData,
            variables,
            options
        )
    );
}

/**
 * Returns a specific field from a named test-data
 * keyword.
 *
 * Existing function signature is preserved:
 *
 * resolveTestDataField(
 *     testData,
 *     keyword,
 *     field
 * )
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

    const keywordData =
        testData[keyword];

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
 * Merges multiple variable sources.
 *
 * Later sources override earlier sources.
 */
export function mergeVariables(
    ...sources
) {
    return Object.assign(
        {},
        ...sources
    );
}

/**
 * Extracts runtime values from a Cucumber
 * Scenario Outline Examples table.
 *
 * Example:
 *
 * | petId | petName | status    |
 * | 1001  | doggie  | available |
 *
 * Produces:
 *
 * {
 *   petId: 1001,
 *   petName: "doggie",
 *   status: "available"
 * }
 *
 * Missing Example Table columns are simply not
 * added to the variables object.
 *
 * This allows the POST resolver to turn a missing
 * placeholder into actual JavaScript null.
 */
export function resolveExampleTableVariables(
    pickle,
    gherkinDocument
) {
    if (
        !pickle ||
        !gherkinDocument
    ) {
        return {};
    }

    const astNodeIds =
        pickle.astNodeIds || [];

    if (astNodeIds.length === 0) {
        return {};
    }

    /*
     * For a Scenario Outline:
     *
     * astNodeIds[0] = Scenario/ScenarioOutline
     * astNodeIds[1] = Examples table row
     */
    const scenarioId =
        astNodeIds[0];

    const exampleRowId =
        astNodeIds[1];

    if (
        !scenarioId ||
        !exampleRowId
    ) {
        return {};
    }

    const scenario =
        findScenario(
            gherkinDocument.feature?.children,
            scenarioId
        );

    if (!scenario) {
        return {};
    }

    let matchedExamples = null;
    let matchedRow = null;

    for (
        const examples of
        scenario.examples || []
    ) {
        const row =
            (examples.tableBody || []).find(
                item =>
                    item.id ===
                    exampleRowId
            );

        if (row) {
            matchedExamples =
                examples;

            matchedRow =
                row;

            break;
        }
    }

    if (
        !matchedExamples ||
        !matchedRow
    ) {
        return {};
    }

    const headers =
        matchedExamples.tableHeader?.cells ||
        [];

    const cells =
        matchedRow.cells || [];

    const variables = {};

    headers.forEach(
        (header, index) => {
            const key =
                String(
                    header.value ?? ''
                ).trim();

            if (!key) {
                return;
            }

            /*
             * If the row does not have a value for
             * this column, leave the variable absent.
             *
             * The POST resolver will subsequently
             * convert the missing placeholder to null.
             */
            if (
                cells[index] === undefined
            ) {
                return;
            }

            variables[key] =
                resolveExampleValue(
                    cells[index].value
                );
        }
    );

    return variables;
}

/**
 * Recursively finds the Scenario or
 * Scenario Outline in the Gherkin AST.
 */
function findScenario(
    children,
    scenarioId
) {
    for (
        const child of children || []
    ) {
        if (
            child.scenario &&
            child.scenario.id ===
                scenarioId
        ) {
            return child.scenario;
        }

        const nestedScenario =
            findScenario(
                child.rule?.children,
                scenarioId
            );

        if (nestedScenario) {
            return nestedScenario;
        }
    }

    return null;
}