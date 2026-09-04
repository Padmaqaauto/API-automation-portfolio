import {
    Before,
    After,
    AfterStep,
} from "@cucumber/cucumber";

Before(async function () {
   await this.apiClient.init();

   this.variables = {};
   this.response = null;
   this.responseBody = null;
});

AfterStep(async function ({result}) {
    if(result?.status === 'FAILED') {
        console.error('Step failed:',result.message);
    }
});

After(async function () {
    await this.apiClient.close();
});