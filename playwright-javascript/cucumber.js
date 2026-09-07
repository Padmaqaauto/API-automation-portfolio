export default {
  paths: [
    'features/**/*.feature'
  ],
  import: [
    'support/world.js',
    'support/hook.js',
    'step-definitions/**/*.js'
  ],
  format: [
    'progress',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json'
  ],
  publishQuiet: true,
  worldParameters: {
    baseUrl:
      process.env.API_BASE_URL ||
      'https://petstore.swagger.io/v2'
  }
};