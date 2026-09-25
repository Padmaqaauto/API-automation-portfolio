# 🚀 API Automation Portfolio

A professional **API test automation portfolio** demonstrating REST API testing using **Playwright APIRequestContext, JavaScript, Cucumber BDD, OpenAPI/Swagger, JSON Schema validation, and reusable automation components**.

This repository demonstrates practical QA automation skills including functional testing, positive and negative testing, request and response validation, data-driven testing, API contract validation, and maintainable automation framework design.

---

## 📑 Table of Contents

* [📌 Project Overview](#-project-overview)
* [🛠️ Technology Stack](#️-technology-stack)
* [🧪 API Testing Coverage](#-api-testing-coverage)
* [🌐 API Under Test](#-api-under-test)
* [🥒 BDD Test Design](#-bdd-test-design)
* [🏗️ Framework Architecture](#️-framework-architecture)
* [📂 Project Structure](#-project-structure)
* [📊 Test Data Management](#-test-data-management)
* [🔍 Response Validation](#-response-validation)
* [🐞 Negative Testing & Defect Investigation](#-negative-testing--defect-investigation)
* [▶️ Running the Tests](#️-running-the-tests)
* [⚙️ Environment Configuration](#️-environment-configuration)
* [📈 Test Reporting](#-test-reporting)
* [🗺️ Roadmap](#️-roadmap)
* [💼 QA Engineering Skills Demonstrated](#-qa-engineering-skills-demonstrated)
* [🎯 Project Goals](#-project-goals)
* [👩‍💻 About](#-about)

---

## 📌 Project Overview

This project focuses on building a **maintainable and scalable API automation framework** for testing RESTful APIs.

The framework uses **Cucumber BDD** for readable test scenarios, **Playwright APIRequestContext** for API communication, externalized JSON test data, centralized endpoint configuration, and **JSON Schema validation** for response verification.

### ✨ Key Highlights

* 🌐 REST API automation
* 🥒 Cucumber BDD with Gherkin
* 🎭 Playwright APIRequestContext
* 🟨 JavaScript / Node.js
* 📊 Data-driven testing
* ✅ Positive testing
* ❌ Negative testing
* 📤 Request validation
* 📥 Response validation
* 📋 JSON Schema validation
* 📖 OpenAPI / Swagger integration
* ♻️ Reusable common API steps
* 🔗 Centralized endpoint configuration
* ⚙️ Environment-based configuration
* 📈 Test reporting

---

## 🛠️ Technology Stack

| 🧰 Technology                   | 🎯 Purpose                       |
| ------------------------------- | -------------------------------- |
| 🟨 JavaScript                   | Test automation development      |
| 🟢 Node.js                      | Runtime environment              |
| 🎭 Playwright                   | API automation                   |
| 🔌 Playwright APIRequestContext | HTTP/API requests                |
| 🥒 Cucumber JS                  | BDD test execution               |
| 📝 Gherkin                      | Business-readable test scenarios |
| 📖 OpenAPI / Swagger            | API specification                |
| 🔎 AJV                          | JSON Schema validation           |
| 📄 JSON                         | Test data and configuration      |
| 🔧 Git                          | Version control                  |
| 🐙 GitHub                       | Source code management           |

---

## 🧪 API Testing Coverage

The framework is designed to cover different aspects of API testing.

### 🔹 Functional Testing

* Endpoint validation
* HTTP method validation
* Request payload validation
* Response validation
* HTTP status-code validation

### ✅ Positive Testing

* Valid request data
* Expected successful responses
* Valid response structure
* Expected business data

### ❌ Negative Testing

* Missing required fields
* Invalid field values
* Invalid data types
* Invalid request payloads
* Unexpected API responses

### 📊 Data-Driven Testing

* External JSON test data
* Scenario Outlines
* Multiple test-data variations
* Reusable test scenarios

### 📋 Contract / Schema Testing

* JSON Schema validation
* Response structure validation
* Data-type validation
* Required-field validation

---

## 🌐 API Under Test

The current automation uses the **Swagger Petstore API** as the system under test.

### 🔗 Base URL

```text
https://petstore.swagger.io/v2
```

### 📍 Current API Areas

| 🔧 HTTP Method | 🌐 API Area        | 🧪 Testing Focus                |
| -------------- | ------------------ | ------------------------------- |
| `GET`          | Pet by ID          | Request and response validation |
| `GET`          | Find Pet by Status | Query parameter testing         |
| `POST`         | Create Pet         | Positive and negative testing   |

> 🚧 API coverage will be expanded as the project progresses.

---

## 🥒 BDD Test Design

Test scenarios are written using **Gherkin syntax** to make API behavior easy to understand and maintain.

### 📝 Example

```gherkin
Feature: Create Pet

  @API @Pet @PostPet @Regression @Positive
  Scenario Outline: Create a pet using test data

    Given I prepare the request using "<testData>"
    When I send a POST request to the pet endpoint
    Then the response status should be successful
    And the response should match the expected pet details

    Examples:
      | testData    |
      | valid pet   |
      | pending pet |
      | sold pet    |
```

The framework separates **test logic from test data**, keeping feature files readable and reusable.

---

## 🏗️ Framework Architecture

```text
📄 Feature File
      │
      ▼
🥒 Cucumber Scenario
      │
      ▼
🔹 Step Definitions
      │
      ▼
♻️ Common API Steps
      │
      ▼
🔧 Request Builder / API Client
      │
      ├── 🔗 Endpoint Registry
      ├── 📊 Test Data
      ├── 📍 Path Parameters
      ├── 🔎 Query Parameters
      └── ⚙️ Environment Configuration
      │
      ▼
🎭 Playwright APIRequestContext
      │
      ▼
🌐 REST API
      │
      ▼
🔍 Response Validation
      │
      ├── HTTP Status Code
      ├── Response Body
      ├── Expected Data
      └── 📋 JSON Schema
      │
      ▼
📈 Test Report
```

---

## 📂 Project Structure

```text
API-automation-portfolio/
│
├── 🎭 playwright-javascript/
│   │
│   ├── 📄 features/
│   │   └── 🐾 pet/
│   │
│   ├── 🔹 step-definitions/
│   │
│   ├── 📦 page-objects/
│   │   └── 📊 data/
│   │
│   ├── 📊 test-data/
│   │   └── 🐾 pet/
│   │
│   ├── 📋 schemas/
│   │
│   ├── 🔧 helpers/
│   │   └── apiClient.js
│   │
│   ├── 🛠️ utils/
│   │   └── api-request-builder-utils.js
│   │
│   ├── ⚙️ cucumber.js
│   ├── 📦 package.json
│   └── ▶️ run-tests.js
│
├── 🟨 playwright-typescript/
│   └── 🚧 Planned
│
├── ☕ selenium-java/
│   └── 🚧 Planned
│
└── 📱 appium-mobile/
    └── 🚧 Planned
```

---

## 📊 Test Data Management

Test data is maintained separately from the Gherkin feature files.

### ✨ Benefits

* ♻️ Reusable test data
* 🚫 Reduced hardcoded values
* 📊 Supports data-driven testing
* 📝 Cleaner feature files
* 🔄 Easier maintenance
* 🔀 Separation of test logic and test data

### 📁 Example Test Data

```text
valid pet
pending pet
sold pet
missing id pet
missing name pet
invalid status pet
invalid type pet
```

---

## 🔍 Response Validation

The framework validates API responses at multiple levels.

### 🌐 HTTP Validation

* HTTP status code
* HTTP method
* Response headers

### 📥 Response Body Validation

* Expected field values
* Required fields
* Data types
* Nested objects
* Arrays
* Expected API data

### 📋 JSON Schema Validation

**AJV** is used for JSON Schema validation to verify that API responses follow the expected structure and data types.

This provides an additional layer of API contract validation beyond simple status-code assertions.

---

## 🐞 Negative Testing & Defect Investigation

Negative testing is included to verify how the API behaves when invalid, incomplete, or unexpected data is submitted.

### 🔎 Examples

* Missing required fields
* Invalid field values
* Invalid data types
* Unsupported values
* Invalid request payloads

Unexpected behavior can be captured and documented as part of the QA investigation.

### 🔄 QA Validation Approach

```text
📝 Test Scenario
      ↓
▶️ Test Execution
      ↓
🔍 Expected vs Actual Comparison
      ↓
🐞 Issue Identification
      ↓
📋 Defect Documentation
      ↓
🔄 Regression Test
```

---

## ▶️ Running the Tests

### 📦 Install Dependencies

```bash
npm install
```

### ▶️ Run the Test Suite

```bash
npm test
```

### 🏷️ Run Tests Using a Cucumber Tag

```bash
node run-tests.js --tags "@PostPet"
```

### 🔄 Run Regression Tests

```bash
node run-tests.js --tags "@Regression"
```

---

## ⚙️ Environment Configuration

Environment-specific configuration is managed using environment variables.

### 🔐 Example

```text
API_BASE_URL=
API_ENDPOINT_REGISTRY_FILE=
API_TEST_DATA_ROOT=
API_SCHEMA_ROOT=
```

Sensitive credentials and environment-specific values should not be committed to the repository.

A `.env.example` file can be used to document the required configuration without exposing sensitive information.

---

## 📈 Test Reporting

The framework supports test execution reporting to provide visibility into:

* ✅ Passed scenarios
* ❌ Failed scenarios
* 📋 Scenario execution details
* 🔍 Validation failures
* 🌐 API test results

### 🚧 Future Reporting Improvements

* GitHub Actions execution
* Automated report publishing
* CI regression reports
* Test execution history

---

## 🗺️ Roadmap

### ✅ Completed

* [x] 🎭 Playwright APIRequestContext
* [x] 🟨 JavaScript API automation
* [x] 🥒 Cucumber BDD
* [x] 📝 Gherkin feature files
* [x] 📊 External test data
* [x] 🔗 Endpoint registry
* [x] ♻️ Common API steps
* [x] ✅ Positive testing
* [x] ❌ Negative testing
* [x] 🔍 Response validation
* [x] 📋 JSON Schema validation
* [x] 📖 OpenAPI / Swagger-based API testing

### 🔄 In Progress

* [ ] 🐾 Expand Pet API coverage
* [ ] 📈 Improve test reporting
* [ ] 📊 Add API coverage documentation
* [ ] 🐞 Add documented defect examples
* [ ] ⚙️ Add GitHub Actions CI execution

### 🚧 Planned

* [ ] 🔄 Complete CRUD API coverage
* [ ] ✏️ PUT API automation
* [ ] 🗑️ DELETE API automation
* [ ] 🔐 Authentication testing
* [ ] 📋 Contract testing
* [ ] ⚡ API performance testing
* [ ] 🐳 Docker-based execution
* [ ] 🔄 CI/CD regression pipeline
* [ ] 🟨 TypeScript API automation
* [ ] ☕ Selenium Java automation
* [ ] 📱 Appium mobile automation

---

## 💼 QA Engineering Skills Demonstrated

### 🌐 API Testing

* REST API testing
* Functional API testing
* Positive and negative testing
* Request/response validation
* HTTP status-code validation
* Path parameter testing
* Query parameter testing
* JSON Schema validation
* API contract validation

### 🤖 Automation Engineering

* Playwright APIRequestContext
* JavaScript
* Node.js
* Cucumber BDD
* Gherkin
* Data-driven testing
* Scenario Outlines
* Reusable common steps
* Centralized endpoint configuration
* Externalized test data

### 🧪 QA Engineering

* Test scenario design
* Negative testing
* Expected vs actual analysis
* Defect identification
* Regression testing
* Test coverage analysis
* Test reporting

### 🔧 Engineering Practices

* Git
* GitHub
* Branching
* Pull Requests
* Environment configuration
* Reusable automation components
* Maintainable framework design

---

## 🎯 Project Goals

The goal of this portfolio is to demonstrate practical experience in **API test automation and QA engineering**, with a focus on creating reliable, maintainable, and reusable automation.

### 🔄 Testing Workflow

```text
📖 API Specification
        ↓
📝 Test Scenario Design
        ↓
📊 Test Data
        ↓
🤖 API Automation
        ↓
🔍 Response Validation
        ↓
🐞 Defect Identification
        ↓
🔄 Regression Testing
        ↓
📈 Reporting
        ↓
⚙️ CI/CD
```

---

## 👩‍💻 About

This repository is part of my **QA Automation Portfolio** and is continuously being enhanced with additional API coverage, automation improvements, testing techniques, and CI/CD practices.

### 🎯 Focus Areas

`QA Automation` · `API Testing` · `Playwright` · `JavaScript` · `Cucumber BDD` · `REST API` · `OpenAPI` · `JSON Schema` · `Test Automation`
