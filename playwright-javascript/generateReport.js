const reporter = require('cucumber-html-reporter');

const options = {
  theme: "bootstrap",
  jsonFile: "reports/cucumber_report.json",
  output: "reports/cucumber_report.html",
  reportSuiteAsScenarios: true,
  launchReport: true,
};

reporter.generate(options);
