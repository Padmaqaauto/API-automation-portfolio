import { Before, After, AfterStep } from '@cucumber/cucumber';

Before(async function () {
  // this.apiClient is already instantiated via CustomWorld
  await this.apiClient.init();
});

AfterStep(async function ({ result }) {
  if (result?.status === 'FAILED') {
    console.error('Step failed:', result.message);
  }
});

After(async function () {
  // Clean up Playwright request context safely
  await this.apiClient?.close();
});