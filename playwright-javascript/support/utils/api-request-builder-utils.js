import { resolveDynamicData } from './data-utils.js';
import { redactSecrets } from './common-utils.js';

export class ApiRequestBuilderUtils {

  constructor(endpointRegistry = {}, versionRegistry = {}) {
    this.endpointRegistry = endpointRegistry;
    this.versionRegistry = versionRegistry;
  }

  getEndpoint(endpointKey) {
    const endpoints =
      this.endpointRegistry.endpoints ??
      this.endpointRegistry;

    const endpoint =
      endpoints[endpointKey];

    if (!endpoint) {
      throw new Error(
        `Endpoint registry entry not found: ${endpointKey}`
      );
    }

    return endpoint;
  }

  resolvePath(endpoint, pathParams = {}) {
    const configuredPath =
      endpoint.path ??
      endpoint.basePath;

    if (!configuredPath) {
      throw new Error(
        'Endpoint path/basePath is missing from endpoint metadata.'
      );
    }

    const params =
      resolveDynamicData(pathParams);

    return configuredPath.replace(
      /\{([^}]+)\}/g,
      (_, name) => {
        if (params[name] === undefined) {
          throw new Error(
            `Missing path parameter: ${name}`
          );
        }

        return encodeURIComponent(
          params[name]
        );
      }
    );
  }

  buildQueryParams(queryParams = {}) {
    const params =
      resolveDynamicData(queryParams);

    const search =
      new URLSearchParams();

    for (
      const [key, value]
      of Object.entries(params)
    ) {
      if (Array.isArray(value)) {

        for (const item of value) {
          search.append(
            key,
            String(item)
          );
        }

      } else if (
        value !== undefined &&
        value !== null
      ) {

        search.append(
          key,
          String(value)
        );
      }
    }

    return search.toString();
  }

  resolveBaseUrl(endpoint) {

    /*
     * Priority:
     *
     * 1. Endpoint-specific baseUrl
     * 2. Endpoint-specific baseURL
     * 3. Version registry
     * 4. API_BASE_URL from .env
     * 5. BASE_URL from .env
     */

    let baseUrl =
      endpoint.baseUrl ??
      endpoint.baseURL;

    if (!baseUrl) {

      const version =
        endpoint.version;

      const versionConfig =
        this.versionRegistry?.[version];

      if (
        versionConfig &&
        typeof versionConfig === 'object'
      ) {
        baseUrl =
          versionConfig.baseUrl ??
          versionConfig.baseURL;
      } else if (
        typeof versionConfig === 'string'
      ) {
        baseUrl =
          versionConfig;
      }
    }

    if (!baseUrl) {
      baseUrl =
        process.env.API_BASE_URL ??
        process.env.BASE_URL;
    }

    if (!baseUrl) {
      throw new Error(
        'API base URL is not configured. ' +
        'Set API_BASE_URL in .env or configure baseUrl in the endpoint registry.'
      );
    }

    return String(baseUrl)
      .trim()
      .replace(/\/+$/, '');
  }

  buildUrl(
    endpoint,
    pathParams = {},
    queryParams = {}
  ) {

    const path =
      this.resolvePath(
        endpoint,
        pathParams
      );

    const query =
      this.buildQueryParams(
        queryParams
      );

    const baseUrl =
      this.resolveBaseUrl(
        endpoint
      );

    /*
     * Remove leading slashes from path
     * so:
     *
     * https://petstore.swagger.io/v2
     * +
     * /pet/1
     *
     * becomes:
     *
     * https://petstore.swagger.io/v2/pet/1
     */
    const cleanPath =
      String(path)
        .replace(/^\/+/, '');

    const url =
      `${baseUrl}/${cleanPath}`;

    return query
      ? `${url}?${query}`
      : url;
  }

  buildHeaders({
    contentType = 'application/json',
    headers = {}
  } = {}) {

    const result = {
      Accept: 'application/json',
      ...resolveDynamicData(headers)
    };

    if (contentType) {
      result['Content-Type'] =
        contentType;
    }

    return result;
  }

  buildJsonBody(
    payload,
    variables = {}
  ) {

    return resolveDynamicData(
      payload,
      variables
    );
  }

  logRequest(request) {

    console.log(
      `[API Request] ${request.method} ${request.url}\n` +
      `Headers: ${JSON.stringify(
        redactSecrets(
          request.headers
        )
      )}\n` +
      `Body: ${JSON.stringify(
        redactSecrets(
          request.data ?? null
        )
      )}`
    );
  }
}