import {
  World,
  setWorldConstructor
} from '@cucumber/cucumber';
import { ApiClient } from '../helpers/apiClient.js';
import { ApiResponseUtils } from './utils/api-response-utils.js';
import { ApiRequestUtils } from './utils/api-request-utils.js';
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.apiClient = new ApiClient();
    this.apiRequestUtils = new ApiRequestUtils(
      new ApiResponseUtils()
    );
    this.apiResponseUtils =
      this.apiRequestUtils.responseUtils;
    this.apiRequestBuilder = null;
    this.requestContext = null;
    this.response = null;
    this.responseBody = null;
    this.responseHeaders = null;
    this.requestResult = null;
    this.requestUrl = null;
    this.requestMethod = null;
    this.requestHeaders = {};
    this.requestPayload = null;
    this.pathParams = {};
    this.queryParams = {};
    this.endpoint = null;
    this.endpointKey = null;
    this.apiData = null;
    this.testData = null;
    this.scenarioData = null;
    this.variables = {};
    this.pickle = null;
  }
}
setWorldConstructor(CustomWorld);