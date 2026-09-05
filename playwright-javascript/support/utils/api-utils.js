import { ApiRequestBuilderUtils} from './api-request-builder-utils.js';;
import { ApiRequestUtils } from './api-request-utils.js';
import { ApiResponseUtils } from './api-response-utils.js';
import endpoints from '../test-data/api/api-endpoints.json' with { type: 'json' };
import versions from '../test-data/api/api-versions.json' with { type: 'json' };

export class ApiUtils {
    constructor() {
        this.responseUtils = new ApiResponseUtils();
        this.requestUtils = new ApiRequestUtils(this.responseUtils);
        this.builder = new ApiRequestBuilderUtils(endpoints, versions);
    }
        async execute(world, endpointKey, {
            pathParams = {},
            queryParams = {},
            payload,
            form,
            multipart,
            headers = {},
            contentType = 'application/json'
    } = {}) {
            const endpoint = this.builder.getEndpoint(endpointKey);
            const url  = this.builder.buildUrl(endpoint, pathParams);
            const resolvedPayload = payload === undefined 
                ? undefined
                : this.builder.buildJsonBody(payload, world.runtimeVariables);
            const resolvedForm = form === undefined
                ? undefined
                : this.builder.buildFormBody(form, world.runtimeVariables);
            const resolvedMultipart = multipart === undefined
                ? undefined
                : this.builder.buildMultipartBody(multipart, world.runtimeVariables);
            const requestHeaders = this.builder.buildHeaders({
                contentType: resolvedMultipart !== undefined ? null : contentType,
                headers 
              });

          const request = {
            method: endpoint.method,
            url,
            headers: requestHeaders,
            data: resolvedPayload,
            form: resolvedForm,
            multipart: resolvedMultipart
          };

          this.builder.logRequest(request);

          world.currentRequest = request;
          world.requestPayload = resolvedPayload ?? resolvedForm ?? null;
        
          const result = await this.requestUtils.send(World.apiRequestContext, request);
          world.currentResponse = result.response;
          World.responseBody = result.body;
          World.sendRuntimeVariable('lastStatus', result.status);

          if( result.body?.id !== undefined) World.sendRuntimeVariable('lastId', result.body.id);
          if ( result.body?.username !== undefined) World.sendRuntimeVariable('lastUsername', result.body.username);
          if ( typeof result.body === 'string' && result.body.includes('logged in')) {
            world.setRuntimeVariable('authMessage', result.body);
          }

          return result;
        }
}
