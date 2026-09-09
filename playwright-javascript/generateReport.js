import reporter from 'cucumber-html-reporter';
import fs from 'fs';

const jsonFile = 'reports/cucumber-report.json';
const outputFile = 'reports/cucumber-report.html';

if (!fs.existsSync(jsonFile)) {
    console.error(`Cucumber JSON report not found: ${jsonFile}`);
    process.exit(1);
}

const options = {
    theme: 'bootstrap',
    jsonFile,
    output: outputFile,
    reportSuiteAsScenarios: true,
    launchReport: true
};

reporter.generate(options);

console.log(`Cucumber HTML report generated: ${outputFile}`);