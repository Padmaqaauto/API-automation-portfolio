import { Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";

Then("verify the inventory response contains valid status counts", function () {
  const inventory = this.responseBody;

  assert.ok(
    inventory !== null &&
      typeof inventory === "object" &&
      !Array.isArray(inventory),
    "Inventory response must be a JSON object.",
  );

  for (const [status, count] of Object.entries(inventory)) {
    assert.ok(
      status.trim().length > 0,
      "Inventory status keys must not be empty.",
    );
    assert.ok(
      Number.isInteger(count),
      `Inventory count for "${status}" must be an integer.`,
    );
    assert.ok(
      count >= 0,
      `Inventory count for "${status}" must be non-negative.`,
    );
  }
});
