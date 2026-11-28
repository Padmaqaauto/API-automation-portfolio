import { Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";

Then(
  "verify the response order ID should match the requested order ID",
  async function () {
    const body = this.responseBody;

    assert.ok(
      body !== null &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        Object.keys(body).length > 0,
      "Order response must be a non-empty JSON object.",
    );

    const requestedOrderId = this.pathParams?.orderId;

    assert.notEqual(
      requestedOrderId,
      undefined,
      "Requested order ID is not available in path parameters.",
    );
    assert.equal(
      body.id,
      Number(requestedOrderId),
      `Expected order ID "${requestedOrderId}" but received "${body.id}".`,
    );
  },
);

Then(
  "the retrieved order should match the order created in this scenario",
  function () {
    assert.ok(
      this.createdOrder !== null &&
        typeof this.createdOrder === "object" &&
        !Array.isArray(this.createdOrder),
      "No created order is available for response comparison.",
    );
    assert.deepEqual(
      this.responseBody,
      this.createdOrder,
      "GET order response should match the order created earlier in this scenario.",
    );
  },
);

Then(
  "verify the order response has pet ID {int}, quantity {int}, status {string}, and complete {word}",
  async function (petId, quantity, status, complete) {
    const body = this.responseBody;

    assert.equal(
      body.petId,
      petId,
      `Expected petId ${petId} but received ${body.petId}.`,
    );
    assert.equal(
      body.quantity,
      quantity,
      `Expected quantity ${quantity} but received ${body.quantity}.`,
    );
    assert.equal(
      body.status,
      status,
      `Expected status "${status}" but received "${body.status}".`,
    );
    assert.equal(
      body.complete,
      complete === "true",
      `Expected complete to be ${complete} but received ${body.complete}.`,
    );
  },
);

Then(
  "verify the optional order ship date is a valid date-time when present",
  async function () {
    const shipDate = this.responseBody?.shipDate;

    if (shipDate === undefined) {
      return;
    }

    assert.equal(
      typeof shipDate,
      "string",
      "Order shipDate must be a string when present.",
    );
    assert.match(
      shipDate,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/,
      "Order shipDate must use the date-time format.",
    );
    assert.ok(
      Number.isFinite(Date.parse(shipDate)),
      "Order shipDate must represent a valid date-time.",
    );
  },
);
