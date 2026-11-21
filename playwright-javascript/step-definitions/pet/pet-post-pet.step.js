import { Then } from "@cucumber/cucumber";
import { PostPetPage } from "../../page-objects/pages/pet/pet-post-pet.page.js";

const postPetPage = new PostPetPage();

Then(
  "verify the response pet details should match the requested pet details",

  async function (dataTable) {
    const expectedFields = dataTable.hashes();

    postPetPage.verifyResponsePetDetails(
      this.requestPayload,
      this.responseBody,
      expectedFields,
    );
  },
);

Then("save the created pet details for the following GET", function () {
  const responseBody = this.responseBody;

  if (!responseBody || typeof responseBody !== "object") {
    throw new Error(
      "POST response body is not available or is not a JSON object.",
    );
  }

  if (responseBody.id === undefined || responseBody.id === null) {
    throw new Error("POST response did not contain a pet ID.");
  }

  this.createdPet = structuredClone(responseBody);
  this.createdPetId = responseBody.id;
  this.variables = {
    ...(this.variables ?? {}),
    createdPetId: responseBody.id,
    petId: responseBody.id,
  };

  console.log("[Created Pet Saved]", {
    id: this.createdPetId,
    name: this.createdPet.name,
    status: this.createdPet.status,
  });
});

Then("verify the retrieved pet matches the created pet", function () {
  if (!this.createdPet) {
    throw new Error(
      "No created pet is available to compare with the GET response.",
    );
  }

  const fieldsToVerify = [
    { field: "id", value: "created pet" },
    { field: "category.id", value: "created pet" },
    { field: "category.name", value: "created pet" },
    { field: "name", value: "created pet" },
    { field: "photoUrls", value: "created pet" },
    { field: "status", value: "created pet" },
  ];

  postPetPage.verifyResponsePetDetails(
    this.createdPet,
    this.responseBody,
    fieldsToVerify,
  );
});
