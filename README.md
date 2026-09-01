# Playwright + Cucumber BDD Test Framework (JavaScript)

An end-to-end test automation framework combining the speed and reliability of **Playwright** with the business-readable syntax of **Cucumber JS** (BDD), written in JavaScript.

## 🚀 Features

* **Behavior-Driven Development (BDD)**: Write tests in plain Gherkin syntax (`.feature` files).
* **Page Object Model (POM)**: Maintainable, scalable, and reusable code structure.
* **Parallel Execution**: Run scenarios concurrently for faster build execution.
* **Rich Reporting**: HTML and JSON reports generated after every run.
* **Automatic Screenshots & Traces**: Auto-captures screenshots and Playwright traces on test failure.
* **Cross-browser Testing**: Execute tests on Chromium, Firefox, and WebKit seamlessly.

---

## 🛠️ Project Structure

```text
├── features/
├── step_definitions/        # Step implementation files (.js)
├── page_objects/            # Page Object Model classes (.js)
├── cucumber.js              # Cucumber configuration profiles
├── playwright.config.js     # Playwright settings & browser launcher
├── reporter.js              # Custom HTML report generator script
└── package.json             # Dependencies and scripts
