import { resolveDynamicData } from './data-utils.js';
import { redactSecrets } from './common-utils.js';
export class ApiRequestBuilderUtils {
     constructor(endpointRegistry = {}, versionRegistry = {}) {
          this.endpointRegistry = endpointRegistry;
          this.versionRegistry = versionRegistry;
     }
     getEndpoint(endpointKey) {
          const endpoint = this.endpointRegistry[endpointKey];
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
          return query
               ? `${path}?${query}`
               : path;
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
                    redactSecrets(request.headers)
               )}\n` +
               `Body: ${JSON.stringify(
                    redactSecrets(
                         request.data ?? null
                    )
               )}`
          );
     }
}