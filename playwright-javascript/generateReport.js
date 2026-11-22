import reporter from "cucumber-html-reporter";
import fs from "fs";
import path from "path";

const jsonFile = "reports/cucumber-report.json";
const outputFile = "reports/cucumber-report.html";

if (!fs.existsSync(jsonFile)) {
  console.error(`Cucumber JSON report not found: ${jsonFile}`);
  process.exit(1);
}

const cucumberReport = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
let scenarios = { passed: 0, failed: 0, skipped: 0 };
let steps = { passed: 0, failed: 0, skipped: 0 };

for (const feature of cucumberReport) {
  for (const element of feature.elements ?? []) {
    if (!["scenario", "scenario_outline"].includes(element.type)) continue;

    const scenarioStatuses = (element.steps ?? []).map(
      (step) => step.result?.status,
    );
    if (scenarioStatuses.includes("failed")) {
      scenarios.failed += 1;
    } else if (scenarioStatuses.some((status) => status === "skipped")) {
      scenarios.skipped += 1;
    } else {
      scenarios.passed += 1;
    }

    for (const step of element.steps ?? []) {
      const status = step.result?.status ?? "skipped";
      if (status === "passed") steps.passed += 1;
      else if (status === "failed") steps.failed += 1;
      else steps.skipped += 1;
    }
  }
}

const summary = [
  "# Cucumber API Test Report",
  "",
  `- Scenarios: ${scenarios.passed} passed, ${scenarios.failed} failed, ${scenarios.skipped} skipped`,
  `- Steps: ${steps.passed} passed, ${steps.failed} failed, ${steps.skipped} skipped`,
  "",
  "Open `cucumber-report.html` for scenario-level execution details.",
].join("\n");

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync("reports/report-summary.md", `${summary}\n`, "utf8");

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, "utf8");
}

const options = {
  theme: "bootstrap",
  jsonFile,
  output: outputFile,
  reportSuiteAsScenarios: true,
  launchReport: false,
};

reporter.generate(options);

console.log(`Cucumber HTML report generated: ${outputFile}`);
