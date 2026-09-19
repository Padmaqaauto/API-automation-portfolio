import 'dotenv/config';

import {
    Given,
    When,
    Then,
    Before
} from '@cucumber/cucumber';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';

import {
    resolveDynamicData,
    resolveExampleTableVariables
} from '../../support/utils/data-utils.js';

import { ApiRequestBuilderUtils } from '../../support/utils/api-request-builder-utils.js';


const endpointRegistryFile =
    process.env.API_ENDPOINT_REGISTRY_FILE;

const testDataRoot =
    process.env.API_TEST_DATA_ROOT;

const scenarioDataRoot =
    process.env.API_SCENARIO_DATA_ROOT;

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

if (!scenarioDataRoot) {
    throw new Error(
        'API_SCENARIO_DATA_ROOT is not configured.'
    );
}

if (!schemaRoot) {
    throw new Error(
        'API_SCHEMA_ROOT is not configured.'
    );
}


/* =========================================================
   FILE UTILITIES
   ========================================================= */

function readJsonFile(filePath) {

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Test data file was not found: ${filePath}`
        );
    }

    try {

        return JSON.parse(
            fs.readFileSync(
                filePath,
                'utf-8'
            )
        );

    } catch (error) {

        throw new Error(
            `Unable to parse JSON file "${filePath}". ` +
            `Reason: ${error.message}`
        );
    }
}


async function loadJson(filePath) {

    const fileContent =
        await fs.promises.readFile(
            filePath,
            'utf-8'
        );

    return JSON.parse(fileContent);
}


/* =========================================================
   NESTED OBJECT UTILITIES
   ========================================================= */

function getNestedValue(
    object,
    fieldPath
) {

    const parts =
        fieldPath
            .split('.')
            .map(part => part.trim())
            .filter(Boolean);

    let current = object;

    for (const part of parts) {

        if (
            current === null ||
            current === undefined ||
            !Object.prototype.hasOwnProperty.call(
                current,
                part
            )
        ) {

            throw new Error(
                `Field "${fieldPath}" was not found in the ` +
                `test-data keyword.`
            );
        }

        current = current[part];
    }

    return current;
}


function setNestedValue(
    target,
    fieldPath,
    value
) {

    const parts =
        fieldPath
            .split('.')
            .map(part => part.trim())
            .filter(Boolean);

    if (parts.length === 0) {
        throw new Error(
            'Request body field cannot be empty.'
        );
    }

    let current = target;

    for (
        let index = 0;
        index < parts.length - 1;
        index++
    ) {

        const part = parts[index];

        if (
            current[part] === undefined ||
            current[part] === null
        ) {
            current[part] = {};
        }

        current = current[part];
    }

    current[
        parts[parts.length - 1]
    ] = value;
}


function cloneValue(value) {

    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}


/* =========================================================
   ENDPOINT REGISTRY
   ========================================================= */

async function loadEndpointRegistry() {

    if (!endpointRegistryFile) {
        throw new Error(
            'API_ENDPOINT_REGISTRY_FILE environment variable is not defined.'
        );
    }

    const registryPath =
        path.resolve(
            process.cwd(),
            endpointRegistryFile
        );

    return readJsonFile(
        registryPath
    );
}


function findEndpointByScenarioTags(
    registry,
    pickle
) {

    const tags =
        pickle?.tags || [];

    const scenarioTags =
        tags.map(tag => {

            if (
                typeof tag === 'string'
            ) {

                return tag.replace(
                    /^@/,
                    ''
                );
            }

            return String(
                tag.name || ''
            ).replace(
                /^@/,
                ''
            );
        });

    for (
        const [
            endpointKey,
            endpoint
        ] of Object.entries(registry)
    ) {

        if (!endpoint) {
            continue;
        }

        const endpointTags =
            endpoint.tags || [];

        if (
            endpointTags.some(
                tag =>
                    scenarioTags.includes(
                        String(tag).replace(
                            /^@/,
                            ''
                        )
                    )
            )
        ) {

            return {
                key: endpointKey,
                endpoint
            };
        }
    }

    return null;
}


function normalizeTag(tag) {

    return String(tag)
        .replace(/^@/, '')
        .trim();
}


/*
 * Resolve endpoint automatically from:
 *
 * 1. Scenario tags
 * 2. Existing world.endpointKey
 */

async function resolveEndpoint(world) {

    const registry =
        await loadEndpointRegistry();

    const endpoints =
        registry.endpoints ??
        registry;

    let endpointResult =
        findEndpointByScenarioTags(
            endpoints,
            world.pickle
        );

    if (
        !endpointResult &&
        world.endpointKey &&
        endpoints[world.endpointKey]
    ) {

        endpointResult = {
            key:
                world.endpointKey,

            endpoint:
                endpoints[
                world.endpointKey
                ]
        };
    }

    if (!endpointResult) {

        const scenarioTags =
            (world.pickle?.tags || [])
                .map(tag =>
                    typeof tag === 'string'
                        ? tag.replace(/^@/, '')
                        : String(
                            tag.name || ''
                        ).replace(
                            /^@/,
                            ''
                        )
                );

        throw new Error(
            'Unable to resolve API endpoint from scenario tags or endpoint key.\n' +
            `Scenario tags: ${scenarioTags.join(', ')}`
        );
    }

    world.endpointKey =
        endpointResult.key;

    world.endpoint =
        endpointResult.endpoint;

    console.log(
        'Endpoint resolved automatically:',
        {
            endpointKey:
                endpointResult.key,

            method:
                endpointResult.endpoint.method,

            path:
                endpointResult.endpoint.path ??
                endpointResult.endpoint.url,

            version:
                endpointResult.endpoint.version
        }
    );

    return endpointResult.endpoint;
}


/* =========================================================
   TEST DATA UTILITIES
   ========================================================= */

function findJsonFiles(
    directory
) {

    if (
        !fs.existsSync(directory)
    ) {
        return [];
    }

    const result = [];

    for (
        const entry of
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        )
    ) {

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {

            result.push(
                ...findJsonFiles(
                    fullPath
                )
            );

        } else if (
            entry.isFile() &&
            entry.name.endsWith(
                '.json'
            )
        ) {

            result.push(
                fullPath
            );
        }
    }

    return result;
}


/*
 * Recursively resolve API test-data from API_TEST_DATA_ROOT.
 * Supports:
 * - file name matching by basename
 * - keyword matching within nested JSON objects
 * - any domain folder structure without hardcoding pet/store/user
 */
function resolveTestDataFile(
    apiData
) {

    const root =
        path.resolve(
            process.cwd(),
            testDataRoot
        );

    if (
        !fs.existsSync(root)
    ) {
        throw new Error(
            `API test-data root does not exist: "${root}"`
        );
    }

    const files =
        findJsonFiles(
            root
        );

    if (
        files.length === 0
    ) {
        throw new Error(
            `No API test-data JSON files were found under "${root}".`
        );
    }

    const filenameMatch =
        files.find(
            file =>
                path.basename(file) === apiData
        );

    if (filenameMatch) {
        return filenameMatch;
    }

    const valueMatch =
        files.find(
            file => {
                const json =
                    readJsonFile(file);

                function findKey(current) {
                    if (
                        current === null ||
                        current === undefined
                    ) {
                        return false;
                    }

                    if (
                        Array.isArray(current)
                    ) {
                        return current.some(findKey);
                    }

                    if (
                        typeof current !== 'object'
                    ) {
                        return false;
                    }

                    for (
                        const [
                            key,
                            value
                        ] of Object.entries(current)
                    ) {
                        if (
                            key === apiData
                        ) {
                            return true;
                        }

                        if (
                            findKey(value)
                        ) {
                            return true;
                        }
                    }

                    return false;
                }

                return findKey(json);
            }
        );

    if (valueMatch) {
        return valueMatch;
    }

    throw new Error(
        `Unable to resolve API test-data "${apiData}" under "${root}".`
    );
}


function getKeywordData(
    testData,
    keyword
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            testData,
            keyword
        )
    ) {

        throw new Error(
            `Test-data keyword "${keyword}" was not found. ` +
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
            `Test-data keyword "${keyword}" must contain an object.`
        );
    }

    return keywordData;
}


/* =========================================================
   HTTP METHODS
   ========================================================= */

const requestMethods = {

    get: async (
        requestContext,
        url,
        options
    ) =>
        requestContext.get(
            url,
            options
        ),

    post: async (
        requestContext,
        url,
        options
    ) =>
        requestContext.post(
            url,
            options
        ),

    put: async (
        requestContext,
        url,
        options
    ) =>
        requestContext.put(
            url,
            options
        ),

    delete: async (
        requestContext,
        url,
        options
    ) =>
        requestContext.delete(
            url,
            options
        ),

    patch: async (
        requestContext,
        url,
        options
    ) =>
        requestContext.patch(
            url,
            options
        )
};


/* =========================================================
   REQUEST BODY
   ========================================================= */

function buildRequestBodyFromTable(
    keywordData,
    dataTable,
    variables
) {

    const rows =
        dataTable.hashes();

    if (
        !rows ||
        rows.length === 0
    ) {

        throw new Error(
            'The request body DataTable cannot be empty.'
        );
    }

    const requestBody = {};

    for (
        const row of rows
    ) {

        const field =
            row.field?.trim();

        const valueKeyword =
            row.value?.trim();

        if (!field) {

            throw new Error(
                'Request body field cannot be empty.'
            );
        }

        if (!valueKeyword) {

            throw new Error(
                `Request body field "${field}" does not have a value keyword.`
            );
        }

        const selectedKeywordData =
            keywordData[
            valueKeyword
            ];

        if (
            selectedKeywordData ===
            undefined
        ) {

            throw new Error(
                `Request body value keyword "${valueKeyword}" ` +
                `was not found in the selected test-data.`
            );
        }

        const value =
            getNestedValue(
                selectedKeywordData,
                field
            );

        const resolvedValue =
            resolveDynamicData(
                cloneValue(value),
                variables,
                {
                    missingPlaceholderValue:
                        null
                }
            );

        setNestedValue(
            requestBody,
            field,
            resolvedValue
        );
    }

    return requestBody;
}


/* =========================================================
   REQUEST DEFINITION
   ========================================================= */

async function buildRequestDefinition(
    world,
    method,
    apiData,
    bodyFieldTable = null
) {

    const endpoint =
        await resolveEndpoint(
            world
        );

    const testDataFile =
        resolveTestDataFile(
            apiData
        );

    const allTestData =
        readJsonFile(
            testDataFile
        );

    let keyword;

    if (
        Object.prototype.hasOwnProperty.call(
            allTestData,
            apiData
        )
    ) {

        keyword =
            apiData;

    } else {

        keyword =
            Object.keys(
                allTestData
            )[0];
    }

    const keywordData =
        getKeywordData(
            allTestData,
            keyword
        );

    world.testData =
        keywordData;

    world.scenarioData =
        keywordData;

    world.apiData =
        apiData;

    const requestBuilder =
        new ApiRequestBuilderUtils();

    world.pathParams =
        resolveDynamicData(
            keywordData.pathParams || {},
            world.variables
        );

    world.queryParams =
        resolveDynamicData(
            keywordData.queryParams || {},
            world.variables
        );

    const headers =
        resolveDynamicData(
            keywordData.headers || {},
            world.variables
        );

    let url =
        keywordData.url ||
        endpoint.path ||
        endpoint.url;

    if (!url) {

        throw new Error(
            `URL/path is not defined for endpoint "${world.endpointKey}".`
        );
    }

    url =
        requestBuilder.buildUrl(
            url,
            world.pathParams,
            world.queryParams,
            endpoint,
            world.variables
        );

    world.requestHeaders =
        requestBuilder.buildHeaders(
            headers,
            method,
            world.variables
        );

    world.requestUrl =
        url;

    world.requestMethod =
        method.toUpperCase();

    if (
        [
            'POST',
            'PUT',
            'PATCH'
        ].includes(
            method.toUpperCase()
        )
    ) {

        if (bodyFieldTable) {

            world.requestPayload =
                buildRequestBodyFromTable(
                    keywordData,
                    bodyFieldTable,
                    world.variables
                );

        } else {

            world.requestPayload =
                resolveDynamicData(
                    keywordData.requestBody ??
                    keywordData.body ??
                    null,
                    world.variables,
                    {
                        missingPlaceholderValue:
                            null
                    }
                );
        }

    } else {

        world.requestPayload =
            null;
    }

    return {
        url:
            world.requestUrl,

        method:
            world.requestMethod,

        headers:
            world.requestHeaders,

        data:
            world.requestPayload
    };
}


/* =========================================================
   ENDPOINT KEY RESOLUTION
   ========================================================= */

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
        String(
            world.endpoint.method
        )
            .trim()
            .toUpperCase() ===
        normalizedMethod &&
        String(
            world.endpoint.version
        )
            .trim() ===
        normalizedVersion
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
        ] of Object.entries(
            endpoints
        )
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
            endpointPath ===
            normalizedPath &&
            endpointMethod ===
            normalizedMethod &&
            endpointVersion ===
            normalizedVersion
        ) {

            world.endpointKey =
                endpointKey;

            world.endpoint =
                endpoint;

            console.log(
                'Endpoint resolved automatically:',
                {
                    endpointKey,
                    path:
                        endpointPath,
                    method:
                        endpointMethod,
                    version:
                        endpointVersion
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


async function getEndpoint(
    world
) {

    const registry =
        await loadEndpointRegistry();

    const endpointKey =
        await resolveEndpointKey(
            world
        );

    const endpoints =
        registry.endpoints ??
        registry;

    const endpoint =
        endpoints[
        endpointKey
        ];

    if (!endpoint) {

        throw new Error(
            `Endpoint metadata not found for: ${endpointKey}`
        );
    }

    world.apiRequestBuilder =
        new ApiRequestBuilderUtils(
            endpoints
        );

    return endpoint;
}


/* =========================================================
   CUCUMBER BEFORE HOOK
   ========================================================= */

Before(
    async function ({
        pickle,
        gherkinDocument
    }) {

        this.pickle =
            pickle;

        this.gherkinDocument =
            gherkinDocument;

        this.exampleVariables =
            resolveExampleTableVariables(
                pickle,
                gherkinDocument
            );

        this.variables = {
            ...(this.variables ?? {}),
            ...this.exampleVariables
        };
    }
);


/* =========================================================
   ENDPOINT TEST DATA
   ========================================================= */

async function loadEndpointTestData(
    endpoint
) {

    const configuration =
        typeof endpoint.testData === 'string'
            ? {
                source:
                    endpoint.testData
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


/* =========================================================
   SCHEMA
   ========================================================= */

function loadEndpointSchema(
    schemaName,
    endpointMetadata
) {

    const targetFileName =
        schemaName ||
        endpointMetadata?.schemaFile;

    const searchDirs = [
        path.resolve(
            process.cwd(),
            'page-objects',
            'data',
            'pet'
        ),

        path.resolve(
            process.cwd(),
            'page-objects',
            'data',
            'store'
        ),

        path.resolve(
            process.cwd(),
            'page-objects',
            'data',
            'user'
        ),

        path.resolve(
            process.cwd(),
            schemaRoot
        )
    ];

    let resolvedPath =
        null;

    for (
        const dir of searchDirs
    ) {

        if (
            fs.existsSync(dir)
        ) {

            const files =
                fs.readdirSync(
                    dir
                );

            const match =
                files.find(
                    file => {

                        if (
                            !file.endsWith(
                                'schema.json'
                            )
                        ) {
                            return false;
                        }

                        if (
                            targetFileName
                        ) {

                            return (
                                file ===
                                targetFileName ||
                                file.includes(
                                    targetFileName.replace(
                                        '.json',
                                        ''
                                    )
                                )
                            );
                        }

                        return true;
                    }
                );

            if (match) {

                resolvedPath =
                    path.join(
                        dir,
                        match
                    );

                break;
            }
        }
    }

    if (!resolvedPath) {

        throw new Error(
            `Schema file matching "${targetFileName || 'schema.json'}" was not found inside pet, store, or user subfolders.`
        );
    }

    const fileContent =
        fs.readFileSync(
            resolvedPath,
            'utf-8'
        );

    return JSON.parse(
        fileContent
    );
}


/* =========================================================
   SCENARIO DATA
   ========================================================= */

/*
 * Generic recursive scenario keyword resolver.
 * Supports:
 * - valid pet
 * - validPet
 * - valid-pet
 * - valid_pet
 * - nested object keys and array members
 */
function resolveScenarioData(
    testData,
    apiData,
    variables = {},
    options = {}
) {
    if (
        !testData ||
        typeof testData !== 'object'
    ) {
        throw new Error(
            'Loaded test data must be a JSON object.'
        );
    }

    const normalizeKey =
        value =>
            String(value)
                .trim()
                .replace(/[\s_-]+/g, '')
                .toLowerCase();

    const targetKey =
        normalizeKey(apiData);

    function findScenario(current) {
        if (
            current === null ||
            current === undefined
        ) {
            return undefined;
        }

        if (
            Array.isArray(current)
        ) {
            for (
                const item of current
            ) {
                const result =
                    findScenario(item);

                if (
                    result !== undefined
                ) {
                    return result;
                }
            }

            return undefined;
        }

        if (
            typeof current !== 'object'
        ) {
            return undefined;
        }

        /*
         * First search object keys in the current object.
         */
        for (
            const [
                key,
                value
            ] of Object.entries(current)
        ) {
            if (
                normalizeKey(key) ===
                targetKey
            ) {
                return resolveDynamicData(
                    cloneValue(value),
                    variables,
                    options
                );
            }
        }

        /*
         * Then search nested objects and arrays recursively.
         */
        for (
            const value of Object.values(current)
        ) {
            if (
                value &&
                typeof value === 'object'
            ) {
                const result =
                    findScenario(value);

                if (
                    result !== undefined
                ) {
                    return result;
                }
            }
        }

        return undefined;
    }

    const resolved =
        findScenario(
            testData
        );

    if (
        resolved !== undefined
    ) {
        return resolved;
    }

    throw new Error(
        `Test-data reference "${apiData}" was not found.`
    );
}


/* =========================================================
   REQUEST DATA
   ========================================================= */

function buildRequestData(
    scenarioData,
    endpoint,
    variables = {},
    options = {}
) {

    const request =
        scenarioData?.request ??
        scenarioData;

    return {

        pathParams:
            resolveDynamicData(
                request?.pathParams ?? {},
                variables,
                options
            ),

        queryParams:
            resolveDynamicData(
                request?.queryParams ?? {},
                variables,
                options
            ),

        headers:
            resolveDynamicData(
                request?.headers ??
                endpoint.headers ??
                {},
                variables,
                options
            ),

        requestBody:
            resolveDynamicData(
                request?.requestBody ??
                request?.body ??
                null,
                variables,
                options
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


/* =========================================================
   SEND REQUEST
   ========================================================= */

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
        functions[
        normalized
        ];

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


/* =========================================================
   GET / POST / PUT / PATCH / DELETE
   REQUEST PREPARATION
   ========================================================= */

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

        const resolutionOptions =
            String(method)
                .trim()
                .toUpperCase() === 'POST'
                ? {
                    missingPlaceholderValue:
                        null
                }
                : {};

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
                    apiData,
                    this.variables,
                    resolutionOptions
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
                `API version is missing for ${apiData} ` +
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
                    registry.endpoints ??
                    registry
                );
        }

        const requestedMethod =
            String(method)
                .trim()
                .toUpperCase();

        this.resolutionOptions =
            resolutionOptions;

        this.variables = {
            ...(this.variables ?? {}),
            ...(this.exampleVariables ?? {})
        };

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
                endpoint,
                this.variables,
                resolutionOptions
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


/* =========================================================
   POST / PUT / PATCH REQUEST WITH BODY

   API DATA:
   API_TEST_DATA_ROOT

   SCENARIO VALUES:
   API_SCENARIO_DATA_ROOT
   ========================================================= */

Given(
    'the user creates a {word} request URL and headers with api data {string} and request body',

    async function (
        method,
        apiData,
        dataTable
    ) {
        const requestedMethod =
            String(method)
                .trim()
                .toUpperCase();

        const resolutionOptions = {
            missingPlaceholderValue:
                null
        };

        this.variables = {
            ...(this.variables ?? {}),
            ...(this.exampleVariables ?? {})
        };

        /* =====================================================
           1. RESOLVE API DATA FILE
           ===================================================== */

        const apiDataFile =
            resolveTestDataFile(
                apiData
            );

        const apiDataJson =
            readJsonFile(
                apiDataFile
            );

        console.log(
            'API data file resolved:',
            apiDataFile
        );

        /* =====================================================
           2. RESOLVE API REQUEST DEFINITION
           ===================================================== */

        let scenarioData =
            apiDataJson;

        const requestDefinition =
            apiDataJson.request ??
            apiDataJson;

        if (
            !requestDefinition.url &&
            !requestDefinition.path
        ) {
            const keys =
                Object.keys(
                    apiDataJson
                );

            if (
                keys.length === 1
            ) {
                scenarioData =
                    apiDataJson[
                    keys[0]
                    ];
            } else {
                throw new Error(
                    `No API request definition was found inside "${apiDataFile}".`
                );
            }
        }

        const request =
            scenarioData.request ??
            scenarioData;

        const requestPath =
            request.url ??
            request.path;

        const requestMethod =
            request.method ??
            requestedMethod;

        const requestVersion =
            request.version ??
            process.env.API_VERSION;

        if (!requestPath) {
            throw new Error(
                `API path/url is missing in "${apiDataFile}".`
            );
        }

        if (!requestMethod) {
            throw new Error(
                `HTTP method is missing in "${apiDataFile}".`
            );
        }

        if (!requestVersion) {
            throw new Error(
                `API version is missing in "${apiDataFile}".`
            );
        }

        /* =====================================================
           3. RESOLVE ENDPOINT
           ===================================================== */

        const endpointKey =
            await resolveEndpointKey(
                this,
                requestPath,
                requestMethod,
                requestVersion
            );

        const registry =
            await loadEndpointRegistry();

        const endpoints =
            registry.endpoints ??
            registry;

        const endpoint =
            endpoints[
            endpointKey
            ];

        if (!endpoint) {
            throw new Error(
                `Endpoint metadata not found for "${endpointKey}".`
            );
        }

        this.endpointKey =
            endpointKey;

        this.endpoint =
            endpoint;

        /* =====================================================
           4. METHOD VALIDATION
           ===================================================== */

        const configuredMethod =
            String(
                endpoint.method ??
                requestMethod
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

        /* =====================================================
           5. REUSE EXISTING REQUEST DATA FUNCTION
           ===================================================== */

        const requestData =
            buildRequestData(
                scenarioData,
                endpoint,
                this.variables,
                resolutionOptions
            );

        this.pathParams =
            requestData.pathParams;

        this.queryParams =
            requestData.queryParams;

        /* =====================================================
           6. SCENARIO DATA ROOT
           ===================================================== */

        const configuredScenarioRoot =
            process.env.API_SCENARIO_DATA_ROOT;

        if (!configuredScenarioRoot) {
            throw new Error(
                'API_SCENARIO_DATA_ROOT is not configured.'
            );
        }

        const scenarioRoot =
            path.resolve(
                process.cwd(),
                configuredScenarioRoot
            );

        const scenarioFiles =
            findJsonFiles(
                scenarioRoot
            );

        if (
            scenarioFiles.length === 0
        ) {
            throw new Error(
                `No scenario test-data JSON files were found under "${scenarioRoot}".`
            );
        }

        /* =====================================================
           7. REQUEST BODY DATATABLE
           ===================================================== */

        const rows =
            dataTable.hashes();

        if (
            !rows ||
            rows.length === 0
        ) {
            throw new Error(
                'The request body DataTable cannot be empty.'
            );
        }

        const requestBody =
            {};

        const keywordCache =
            new Map();

        /* =====================================================
           8. RESOLVE EACH FIELD
           ===================================================== */

        for (
            const row of rows
        ) {
            const field =
                row.field?.trim();

            const valueKeyword =
                row.value?.trim();

            if (!field) {
                throw new Error(
                    'Request body field cannot be empty.'
                );
            }

            if (!valueKeyword) {
                throw new Error(
                    `Request body field "${field}" does not have a value keyword.`
                );
            }

            const normalizedKeyword =
                valueKeyword
                    .replace(
                        /[\s_-]+/g,
                        ''
                    )
                    .toLowerCase();

            let keywordData =
                keywordCache.get(
                    normalizedKeyword
                );

            if (
                keywordData === undefined
            ) {
                for (
                    const file of scenarioFiles
                ) {
                    const scenarioTestData =
                        readJsonFile(
                            file
                        );

                    try {
                        keywordData =
                            resolveScenarioData(
                                scenarioTestData,
                                valueKeyword,
                                this.variables,
                                resolutionOptions
                            );

                        keywordCache.set(
                            normalizedKeyword,
                            keywordData
                        );

                        console.log(
                            'Test-data keyword resolved:',
                            {
                                keyword:
                                    valueKeyword,

                                file
                            }
                        );

                        break;

                    } catch {
                        keywordData =
                            undefined;
                    }
                }
            }

            if (
                keywordData === undefined
            ) {
                throw new Error(
                    `Test-data keyword "${valueKeyword}" ` +
                    `was not found under "${scenarioRoot}".`
                );
            }

            const value =
                getNestedValue(
                    keywordData,
                    field
                );

            const resolvedValue =
                resolveDynamicData(
                    cloneValue(value),
                    this.variables,
                    resolutionOptions
                );

            setNestedValue(
                requestBody,
                field,
                resolvedValue
            );
        }

        /* =====================================================
           9. REQUEST BUILDER
           ===================================================== */

        if (!this.apiRequestBuilder) {
            this.apiRequestBuilder =
                new ApiRequestBuilderUtils(
                    endpoints
                );
        }

        /* =====================================================
           10. HEADERS
           ===================================================== */

        this.requestHeaders =
            buildRequestHeaders(
                this,
                requestData.headers
            );

        /* =====================================================
           11. URL
           ===================================================== */

        this.requestUrl =
            buildRequestUrl(
                this,
                endpoint,
                this.pathParams,
                this.queryParams
            );

        /* =====================================================
           12. FINAL REQUEST DATA
           ===================================================== */

        this.requestMethod =
            configuredMethod;

        this.requestPayload =
            requestBody;

        this.apiData =
            apiData;

        this.testData =
            apiDataJson;

        this.scenarioData =
            scenarioData;

        this.resolutionOptions =
            resolutionOptions;

        /* =====================================================
           13. DEBUG
           ===================================================== */

        console.log(
            '[API Request Prepared]',
            {
                endpointKey:
                    this.endpointKey,

                apiData:
                    this.apiData,

                method:
                    this.requestMethod,

                version:
                    endpoint.version,

                url:
                    this.requestUrl
            }
        );

        console.log(
            '[API Request Headers]',
            this.requestHeaders
        );

        console.log(
            '[API Request Body]',
            JSON.stringify(
                this.requestPayload,
                null,
                2
            )
        );
    }
);

/* =========================================================
   SEND PREPARED API REQUEST
   Supports:
   GET / POST / PUT / PATCH / DELETE
   ========================================================= */

When(
    'the user sends a {word} request to API',
    async function (method) {

        if (!this.requestUrl) {
            throw new Error(
                'Request URL has not been created.'
            );
        }

        if (!this.apiRequestUtils) {
            this.apiRequestUtils =
                new ApiRequestUtils(
                    new ApiResponseUtils()
                );
        }

        // ----------------------------------------------------
        // Get Playwright APIRequestContext
        // ----------------------------------------------------

        const context =
            this.apiRequestContext ??
            this.requestContext ??
            this.apiContext;

        if (!context) {
            throw new Error(
                'Playwright APIRequestContext is not initialized.'
            );
        }

        // ----------------------------------------------------
        // Request method
        // ----------------------------------------------------

        const requestMethod =
            String(
                this.requestMethod ?? method
            ).toUpperCase();

        // ----------------------------------------------------
        // Request object
        // ----------------------------------------------------

        const request = {
            url: this.requestUrl,
            headers: this.requestHeaders ?? {}
        };

        // ----------------------------------------------------
        // POST / PUT / PATCH request body
        // ----------------------------------------------------

        if (
            ['POST', 'PUT', 'PATCH']
                .includes(requestMethod)
        ) {
            request.data =
                this.requestPayload;
        }

        console.log(
            `Sending ${requestMethod} request to: ${this.requestUrl}`
        );

        // ----------------------------------------------------
        // Use existing ApiRequestUtils.send()
        // ----------------------------------------------------

        this.apiResult =
            await this.apiRequestUtils.send(
                context,
                {
                    ...request,
                    method: requestMethod
                }
            );

        // ----------------------------------------------------
        // Preserve existing response objects
        // ----------------------------------------------------

        this.response =
            this.apiResult.response;

        this.apiResponseUtils =
            this.apiRequestUtils.responseUtils;

        this.responseBody =
            this.apiResult.body ??
            this.apiResult.responseBody ??
            this.apiResult.data;
    }

);

/* =========================================================
   RESPONSE STATUS
   ========================================================= */

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


// ============================================================
// CONTENT TYPE VALIDATION
// ============================================================

Then(
    'verify the content type in response header should be {string}',
    async function (expectedContentType) {

        if (!this.response) {

            throw new Error(
                'API response is not available.'
            );
        }


        const headers =
            this.response.headers();


        const actualContentType =
            headers['content-type'] ??
            headers['Content-Type'] ??
            '';


        const expected =
            String(
                expectedContentType
            ).toLowerCase();


        const actual =
            String(
                actualContentType
            ).toLowerCase();


        if (!actual.includes(expected)) {

            throw new Error(
                [
                    `Expected content type to contain "${expectedContentType}",`,
                    `but received "${actualContentType}".`
                ].join(' ')
            );
        }


        console.log(
            `Content-Type validated successfully: ${actualContentType}`
        );
    }
);

/* =========================================================
   RESPONSE SCHEMA
   ========================================================= */

Then(
    'verify the response schema should be matching {string}',

    async function (
        schemaName
    ) {

        let responseBody =
            this.responseBody;

        while (
            typeof responseBody === 'string'
        ) {

            try {

                responseBody =
                    JSON.parse(
                        responseBody
                    );

            } catch (e) {

                break;
            }
        }

        const schema =
            loadEndpointSchema(
                schemaName,
                this.endpoint
            );

        const ajv =
            new Ajv({
                allErrors: true,
                strict: false
            });

        const validate =
            ajv.compile(
                schema
            );

        const valid =
            validate(
                responseBody
            );

        if (!valid) {

            const errorDetails =
                JSON.stringify(
                    validate.errors,
                    null,
                    2
                );

            throw new Error(
                `Response body does not match schema "${schemaName}":\n${errorDetails}`
            );
        }
    }
);