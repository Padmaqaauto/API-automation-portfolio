import { request } from '@playwright/test';
export class ApiClient {
  constructor() {
    this.requestContext = null;
  }
  async init() {
    if (this.requestContext) {
      return;
    }
    this.requestContext = await request.newContext({
      baseURL:
        process.env.API_BASE_URL ||
        process.env.BASE_URL ||
        'https://petstore.swagger.io/v2',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      ignoreHTTPSErrors: true
    });
  }
  async close() {
    if (!this.requestContext) {
      return;
    }
    await this.requestContext.dispose();
    this.requestContext = null;
  }
}