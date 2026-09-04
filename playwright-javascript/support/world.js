import {world, setWorldConstructor} from '@cucumber/cucumber';
import {ApiClient} from '../api-client.js';

class CustomWorld extends world {
    constructor(options) {
        super(options);
        this.apiClient = new ApiClient();
        this.response = null;
        this.responseBody = null;
        this.variables = {};
        this.requestPayload = null;
    }
}

setWorldConstructor(CustomWorld);