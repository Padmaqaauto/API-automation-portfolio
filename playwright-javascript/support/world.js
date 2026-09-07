import {
  World,
  setWorldConstructor
} from '@cucumber/cucumber';
import { ApiClient } from '../helpers/apiClient.js';

class CustomWorld extends World {

  constructor(options) {

    super(options);

    // Attach ApiClient directly to 'this' context
    this.apiClient = new ApiClient();
    
    this.response = null;
    this.responseBody = null;
    this.responseHeaders = null;

    this.requestContext = null;

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
  }
}

setWorldConstructor(CustomWorld);