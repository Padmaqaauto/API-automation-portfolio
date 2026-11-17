
# API Automation Portfolio - Project Instructions

## 1. Project Overview

This repository contains an API automation portfolio.

Main automation project:
- playwright-javascript/

Technology stack:
- JavaScript (ES Modules)
- Node.js and npm
- Playwright APIRequestContext
- Cucumber-JS
- Gherkin BDD
- AJV JSON Schema validation
- ESLint
- Prettier
- GitHub Actions

API under test:
- Swagger Petstore
- https://petstore.swagger.io/v2

## 2. Repository Understanding

Before changing code:

1. Inspect the actual repository directory structure.
2. Read the relevant package.json.
3. Read cucumber.js and run-tests.js.
4. Inspect the existing feature files.
5. Inspect common and resource-specific step definitions.
6. Understand the API request builder and API client.
7. Inspect environment and endpoint configuration.
8. Inspect test-data and API operation data.
9. Review existing schema validation.
10. Identify reusable implementations before writing new code.

Important:
The actual source code takes precedence over assumptions
or potentially outdated README examples.

Do not assume a directory or helper exists without checking.

## 3. Architecture

Follow the existing architecture:

- features/: Gherkin feature files.
- step-definitions/: Cucumber step implementations.
- step-definitions/common/: Reusable common steps.
- page-objects/data/: API operation configuration and schemas.
- page-objects/pages/: Resource-specific API helpers.
- test-data/: Request payloads and test fixtures.
- helpers/: Shared helper functions.
- support/: Cucumber World, hooks, environment and utilities.
- config/: Framework and environment configuration.
- reports/: Generated test reports.

Do not create another framework or duplicate existing utilities.

## 4. Naming Conventions

Use consistent resource and operation names.

Example:

features/pet/pet-put-pet.feature

step-definitions/pet/pet-put-pet.steps.js

page-objects/data/pet/pet-put-pet-test-data.json

page-objects/data/pet/pet-put-pet-api-schema.json

Follow the existing naming convention in the actual project.

Use petId consistently for Pet ID identifiers.

## 5. Feature File Rules

- Use readable Gherkin syntax.
- Follow Given, When and Then conventions.
- Use Scenario Outline for data-driven scenarios where appropriate.
- Use meaningful tags.
- Separate positive and negative scenarios.
- Avoid duplicating existing scenarios.
- Reuse common keywords whenever possible.

## 6. Step Definition Rules

- Use JavaScript ES modules.
- Reuse existing common step definitions.
- Avoid duplicate Cucumber expressions.
- Do not hardcode API URLs.
- Do not hardcode credentials.
- Use generic request-building methods.
- Support reusable path parameters, query parameters,
  headers and request bodies.
- Keep feature files independent of implementation details.

## 7. API Test Design

Consider the following validation areas:

- HTTP status codes.
- Response headers.
- Response body.
- Required and optional fields.
- Data types.
- JSON Schema validation using AJV.
- Valid and invalid path parameters.
- Valid and invalid query parameters.
- Missing request fields.
- Invalid data types.
- Boundary conditions.
- Positive and negative scenarios.
- API integration flows.

Do not assume an API returns a particular status code.
Verify the existing API contract and expected behaviour.

## 8. Test Data Rules

- Keep request data outside feature files and step definitions.
- Reuse existing test-data loading utilities.
- Follow the existing JSON structure.
- Use descriptive test-data keywords.
- Keep test data separate from API endpoint configuration.
- Never put secrets in test-data files.

## 9. Coding Standards

- Use JavaScript only.
- Use async/await for asynchronous operations.
- Use meaningful names.
- Prefer reusable functions.
- Avoid unnecessary dependencies.
- Avoid duplicate code.
- Follow ESLint and Prettier configuration.
- Do not refactor unrelated code.

## 10. Test Execution

Run commands from playwright-javascript/.

Install dependencies:
npm ci

Run all tests:
npm test

Run lint:
npm run lint

Check formatting:
npm run format:check

Run a specific tag:
node run-tests.js --tags "@GetPetById"

Run regression:
node run-tests.js --tags "@Regression"

Use only commands and tags that exist in the current project.

## 11. Implementation Workflow

For every coding task:

1. Analyse the requirement.
2. Inspect existing implementation.
3. Identify reusable components.
4. List the files that need changes.
5. Explain the implementation plan.
6. Implement the requested functionality.
7. Add or update test data and schemas where necessary.
8. Execute the relevant tests.
9. Run lint and formatting checks.
10. Review the final changes.

## 12. Git Safety

- Never modify main directly.
- Do not discard existing user changes.
- Do not overwrite unrelated files.
- Do not commit or push without explicit permission.
- Do not modify GitHub Actions configuration unnecessarily.
- Do not expose environment variables or secrets.

## 13. Final Response

After completing a task, report:

1. Requirement implemented.
2. Files created.
3. Files modified.
4. Existing components reused.
5. Test scenarios added.
6. Commands executed.
7. Actual test results.
8. Remaining issues or limitations.

Never claim that tests passed unless they were
actually executed successfully.
