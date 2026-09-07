import {
  Before,
  After,
  AfterStep
} from '@cucumber/cucumber';
Before(async function () {
  await this.apiClient.init();
  // Keep the Playwright APIRequestContext on the Cucumber World.
  this.requestContext = this.apiClient.requestContext;
});
AfterStep(async function ({ result }) {
  if (result?.status === 'FAILED') {
    console.error('Step failed:', result.message);
  }
});
After(async function () {
  await this.apiClient?.close();
  this.requestContext = null;
});