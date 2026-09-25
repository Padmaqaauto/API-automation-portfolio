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
♻️ Common API Step
```
