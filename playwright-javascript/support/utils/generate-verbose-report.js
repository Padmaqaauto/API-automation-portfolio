import fs from 'node:fs/promises';

const input = 'reports/cucumber-report.json';
const output = 'reports/verbose-report.html';

try {
  const data = JSON.parse(await fs.readFile(input, 'utf8'));
  const rows = [];
  for (const feature of data) {
    for (const scenario of feature.elements ?? []) {
      for (const step of scenario.steps ?? []) {
        rows.push(`<tr><td>${feature.name}</td><td>${scenario.name}</td><td>${step.name}</td><td>${step.result?.status ?? ''}</td><td>${step.result?.duration ?? 0}</td></tr>`);
      }
    }
  }
  await fs.writeFile(output, `<!doctype html><html><body><h1>Verbose Cucumber Report</h1><table border="1"><tr><th>Feature</th><th>Scenario</th><th>Step</th><th>Status</th><th>Duration</th></tr>${rows.join('')}</table></body></html>`);
  console.log(`Verbose report generated: ${output}`);
} catch (error) {
  console.error(`Unable to generate verbose report. ${error.message}`);
  process.exitCode = 1;
}
