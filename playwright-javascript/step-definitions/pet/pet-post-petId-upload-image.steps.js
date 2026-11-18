import assert from "node:assert/strict";
import { Then } from "@cucumber/cucumber";

Then("verify the pet image upload response body", function () {
  if (!this.response) {
    throw new Error("The image upload response is not available.");
  }

  const responseBody = this.responseBody;
  if (
    !responseBody ||
    typeof responseBody !== "object" ||
    Array.isArray(responseBody)
  ) {
    throw new Error("The image upload response body must be a JSON object.");
  }

  const responseStatus = this.response.status();
  assert.equal(
    responseBody.code,
    responseStatus,
    "The response body code should match the HTTP status.",
  );
  assert.equal(typeof responseBody.type, "string");
  assert.equal(typeof responseBody.message, "string");
  assert.ok(responseBody.message.trim().length > 0);

  if (responseStatus === 200) {
    const metadata = this.requestMultipart?.additionalMetadata;
    const fileName = this.requestMultipart?.file?.name;

    if (typeof metadata === "string") {
      assert.ok(
        responseBody.message.includes(metadata),
        "The success message should include the uploaded metadata.",
      );
    }

    if (typeof fileName === "string") {
      assert.ok(
        responseBody.message.includes(fileName),
        "The success message should include the uploaded file name.",
      );
    }
  }
});

Then(
  "the image upload request should be rejected during preparation with {string}",
  function (expectedError) {
    assert.equal(
      this.requestPreparationError,
      expectedError,
      "The upload request was not rejected with the expected path-parameter validation error.",
    );
    assert.equal(this.requestUrl, null);
    assert.equal(this.requestMultipart, null);
  },
);
