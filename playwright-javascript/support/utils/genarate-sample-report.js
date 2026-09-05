import fs from 'node:fs/promises';

const input = 'reports/cucumber-report.json';
const output = 'reports/cucumber-report.html';

try {
  const data = JSON.parse(await fs.readFile(input, 'utf8'));
  const features = data.length;
  const scenarios = data.flatMap(f => f.elements ?? []).length;
  const failed = data.flatMap(f => f.elements ?? []).filter(s => s.steps?.some(x => x.result?.status === 'failed')).length;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Petstore API Report</title>
<style>body{font-family:Arial,sans-serif;margin:40px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style>
</head><body><h1>Swagger Petstore API Test Report</h1>
<p>Features: ${features} | Scenarios: ${scenarios} | Failed: ${failed}</p>
<table><tr><th>Feature</th><th>Scenario</th><th>Status</th></tr>
${data.flatMap(f => (f.elements ?? []).map(s => {
  const status = s.steps?.some(x => x.result?.status === 'failed') ? 'FAILED' : 'PASSED';
  return `<tr><td>${f.name}</td><td>${s.name}</td><td>${status}</td></tr>`;
})).join('\n')}
</table></body></html>`;
  await fs.writeFile(output, html);
  console.log(`HTML report generated: ${output}`);
} catch (error) {
  console.error(`Unable to generate report. Run npm test first. ${error.message}`);
  process.exitCode = 1;
}
