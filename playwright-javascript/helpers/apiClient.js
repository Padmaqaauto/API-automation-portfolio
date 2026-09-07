import { request } from '@playwright/test';

export class ApiClient {
  constructor() {
    this.requestContext = null;
  }

  // Initialize Playwright's API request context
  async init() {
    this.requestContext = await request.newContext({
      baseURL: process.env.BASE_URL || 'https://petstore.swagger.io/v2',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Helper method for GET requests
  async get(endpoint, options = {}) {
    if (!this.requestContext) {
      throw new Error('ApiClient is not initialized. Call init() first.');
    }
    return await this.requestContext.get(endpoint, options);
  }

  // Helper method for POST requests
  async post(endpoint, data, options = {}) {
    if (!this.requestContext) {
      throw new Error('ApiClient is not initialized. Call init() first.');
    }
    return await this.requestContext.post(endpoint, {
      data,
      ...options
    });
  }

  // Clean up context after scenario completes
  async close() {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }
}