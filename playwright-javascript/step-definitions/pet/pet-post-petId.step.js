import { Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";

Then(
  "verify the response pet status should match the original created pet status",
  function () {
    if (!this.createdPet || typeof this.createdPet !== "object") {
      throw new Error(
        'Original pet details are unavailable. Run "save the created pet details for the following GET" after creating the pet.',
      );
    }

    const expectedStatus = this.createdPet.status;

    if (expectedStatus === undefined || expectedStatus === null) {
      throw new Error("The original created pet status is unavailable.");
    }

    let responseBody = this.responseBody;

    while (typeof responseBody === "string") {
      try {
        responseBody = JSON.parse(responseBody);
      } catch {
        break;
      }
    }

    if (!responseBody || typeof responseBody !== "object") {
      throw new Error(
        "GET response body is unavailable for pet status validation.",
      );
    }

    assert.equal(
      responseBody.status,
      expectedStatus,
      `Expected pet status to remain "${expectedStatus}", but received "${responseBody.status}".`,
    );
  },
);

Then(
  "verify the response pet name should match the original created pet name",
  function () {
    if (!this.createdPet || typeof this.createdPet !== "object") {
      throw new Error(
        'Original pet details are unavailable. Run "save the created pet details for the following GET" after creating the pet.',
      );
    }

    const expectedName = this.createdPet.name;

    if (expectedName === undefined || expectedName === null) {
      throw new Error("The original created pet name is unavailable.");
    }

    let responseBody = this.responseBody;

    while (typeof responseBody === "string") {
      try {
        responseBody = JSON.parse(responseBody);
      } catch {
        break;
      }
    }

    if (!responseBody || typeof responseBody !== "object") {
      throw new Error("Response body is unavailable for pet name validation.");
    }

    assert.equal(
      responseBody.name,
      expectedName,
      `Expected pet name to remain "${expectedName}", but received "${responseBody.name}".`,
    );
  },
);
