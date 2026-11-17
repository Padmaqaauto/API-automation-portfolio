import { Given, Then } from "@cucumber/cucumber";
import { PostPetPage } from "../../page-objects/pages/pet/pet-post-pet.page.js";

const postPetPage = new PostPetPage();

Given("the user switches to the invalid URL from the API data", function () {
  const invalidUrl = this.scenarioData?.invalidUrl;

  if (typeof invalidUrl !== "string" || invalidUrl.trim() === "") {
    throw new Error('The API data does not define a valid "invalidUrl" path.');
  }

  if (!this.endpoint || !this.apiRequestBuilder || !this.requestUrl) {
    throw new Error(
      "Prepare the PUT request before switching to its invalid URL.",
    );
  }

  this.requestUrl = this.apiRequestBuilder.buildUrl(
    {
      ...this.endpoint,
      path: invalidUrl,
    },
    this.pathParams,
    this.queryParams,
  );
});

Then("save the updated pet details for the following GET", function () {
  const responseBody = this.responseBody;

  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("PUT response body is not available as a JSON object.");
  }

  if (responseBody.id === undefined || responseBody.id === null) {
    throw new Error("PUT response did not contain a pet ID.");
  }

  this.updatedPet = structuredClone(responseBody);
  this.createdPetId = responseBody.id;
});

Then("verify the retrieved pet matches the updated pet", function () {
  if (!this.updatedPet) {
    throw new Error(
      'No updated pet is available. Run "save the updated pet details for the following GET" first.',
    );
  }

  const fieldsToVerify = [
    "id",
    "category.id",
    "category.name",
    "name",
    "photoUrls",
    "tags",
    "status",
  ].map((field) => ({ field, value: "updated pet" }));

  postPetPage.verifyResponsePetDetails(
    this.updatedPet,
    this.responseBody,
    fieldsToVerify,
  );
});
