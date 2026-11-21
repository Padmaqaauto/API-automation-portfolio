import { Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";

Then("the user registers the generated pet ID for cleanup", function () {
  const petId = this.variables?.petId;

  if (!this.response || petId === undefined || petId === null) {
    throw new Error(
      "A generated pet ID and pre-create response are required for cleanup.",
    );
  }

  this.petCrudCleanupId = petId;
});

Then(
  "verify the delete pet response body should confirm the requested pet ID",
  function () {
    const requestedPetId = this.pathParams?.petId;

    if (
      !this.response ||
      requestedPetId === undefined ||
      requestedPetId === null
    ) {
      throw new Error(
        "DELETE response and requested pet ID are required for body validation.",
      );
    }

    if (
      typeof this.responseBody !== "object" ||
      this.responseBody === null ||
      Array.isArray(this.responseBody)
    ) {
      throw new Error("DELETE response body must be a JSON object.");
    }

    assert.equal(
      this.responseBody.code,
      this.response.status(),
      "DELETE response body code should match the HTTP status.",
    );
    assert.equal(
      String(this.responseBody.message),
      String(requestedPetId),
      "DELETE response body message should contain the deleted pet ID.",
    );
  },
);
