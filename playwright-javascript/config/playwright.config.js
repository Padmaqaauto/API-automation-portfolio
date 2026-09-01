import { defineConfig } from '@playwright/test';
import { environments } from './environments.js';

export default defineConfig({
    testDir: './features',
    timeout: environments.timeout,
    use: {
        baseURL: environments.baseUrl,
        ignoreHTTPSErrors: true,
    },

    reporter: [
        ['list'],
        ['html',{outputFolder: '../reports/playwright-report'}],
    ]
});