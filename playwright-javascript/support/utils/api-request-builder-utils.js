import {ENV} from '../support/env/env.js';
import {resolveDynamicData} from './data-utils.js';
import {redactSecrets} from './common-utils.js';

export class ApiRequestBuilderUtils {
   constructor(endpointRegistry, versionRegistry) {
    this.endpointRegistry = endpointRegistry;
    this.versionRegistry = versionRegistry;
   }

   getEndpoint(endpointKey) {
     const endpoint = this.endpointRegistry[endpointKey];
     if (!endpoint) throw new Error(`Endpoint registry entry not found: ${endpointKey}`);
    return endpoint;
   }

   resolveVersion(endpointKey) {
        const endpoint = this.getEndpoint(endpointKey);
        return endpoint.version ?? ENV.API_VERSION;
   }

   resolvePath(endpointKey, pathParams = {}) {
      const endpoint = this.getEndpoint(endpointKey);
      const params = resolvedDynamicData(pathParams, pathParams);
      return endpoint.path.replace(/\{([^}]+)\}/g, (_, name) => {
        if (params[name] === undefined) throw new Error(`Missing path parameter: ${name}`);
        return encodeURIComponent(params[name]);
      });
   }

   buildQueryParams(endpointKey, queryParams = {}) {
        const endpoint = this.getEndpoint(endpointKey);
        const params = resolveDynamicData(queryParams, queryParams);
        const search = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if(Array.isArray(value)) {
                for(const item of value) search.append(key, item);
            } else if (value !== undefined && value !== null) {
                search.append(key, value);
            }  
        }
         return search.toString();
   }

   buildUrl(endpointKey, pathParams = {}, queryParams = {}) {
        const path = this.resolvePath(endpointKey, pathParams);
        const query = this.buildQueryParams(endpointKey, queryParams);
        const version = this.resolveVersion(endpointKey);

        return `/${version}${path}${query ? `?${query}` : ''}`;
   }

   buildHeaders({ contentType = 'application/json', apikey = ENV.API_KEY, headers = {} } = {}) {
        const result = { Accept: 'application/json', ...headers };
        if (contentType) result['Content-Type'] = contentType;
        if (apiKey) result.api_key = apiKey;
        return result;
   }

   buildJsonBody(payload, variables = {}) {
        return resolveDynamicData(payload, variables);     
   }

   buildFormBody(payload, variables = {}) {
        return resolveDynamicData(payload, variables);
   }

   buildMultipartBody(payload, variables = {}) {
        return resolveDynamicData(payload, variables);
   }

   logRequest(request) {
        console.log(
            `[API Request] ${request.method} ${request.url}\n` +
            `Headers: ${JSON.stringify(redactSecrets(request.headers))}\n` +
            `Body: ${JSON.stringify(redactSecrets(request.data ?? null))}`
        );
   }
}