import { Given, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";

import { generateUniqueId } from "../../support/utils/random-utils.js";

Given("an order ID is generated for this request", function () {
  this.variables = {
    ...(this.variables ?? {}),
    orderId: generateUniqueId(),
  };
});

Given("the submitted order is scheduled for cleanup", function () {
  const orderId = this.requestPayload?.id;

  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error(
      "The submitted order must have a positive integer ID for cleanup.",
    );
  }

  this.storeOrderCleanupId = orderId;
});

Then("the response should match the submitted order", function () {
  const request = this.requestPayload;
  const response = this.responseBody;

  assert.ok(
    response !== null &&
      typeof response === "object" &&
      !Array.isArray(response),
    "POST order response must be a JSON object.",
  );

  for (const field of ["id", "petId", "quantity", "status", "complete"]) {
    assert.deepEqual(
      response[field],
      request[field],
      `Expected order response "${field}" to match the submitted value.`,
    );
  }

  if (request.shipDate !== undefined) {
    assert.equal(
      typeof response.shipDate,
      "string",
      "Order response shipDate must be a string when it was submitted.",
    );

    const expectedShipDate = Date.parse(request.shipDate);
    const actualShipDate = Date.parse(response.shipDate);

    assert.ok(
      Number.isFinite(expectedShipDate),
      "Submitted order shipDate must be a valid date-time.",
    );
    assert.ok(
      Number.isFinite(actualShipDate),
      "Response order shipDate must be a valid date-time.",
    );
    assert.equal(
      actualShipDate,
      expectedShipDate,
      "Order response shipDate must match the submitted date-time.",
    );
  }

  this.createdOrder = structuredClone(response);
});
