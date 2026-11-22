import { Before, After, AfterStep } from "@cucumber/cucumber";

async function cleanupPetCrudIntegration(world) {
  const petId = world.petCrudCleanupId;

  if (petId === undefined || petId === null) {
    return;
  }

  if (
    !world.apiRequestBuilder ||
    !world.apiRequestUtils ||
    !world.requestContext
  ) {
    throw new Error(
      "Pet CRUD cleanup cannot run without an initialized API request.",
    );
  }

  const endpoint = world.apiRequestBuilder.getEndpoint("petByIdDelete");
  const url = world.apiRequestBuilder.buildUrl(endpoint, { petId });
  const result = await world.apiRequestUtils.delete(world.requestContext, {
    url,
    headers: {
      Accept: "application/json",
    },
  });

  if (result.status !== 200 && result.status !== 404) {
    throw new Error(
      `Pet CRUD cleanup failed for pet ID "${petId}" with HTTP ${result.status}.`,
    );
  }
}

async function cleanupStoreOrder(world) {
  const requestedOrderId = world.storeOrderCleanupId;

  if (requestedOrderId === undefined || requestedOrderId === null) {
    return;
  }

  if (
    !world.apiRequestBuilder ||
    !world.apiRequestUtils ||
    !world.requestContext
  ) {
    throw new Error(
      "Store order cleanup cannot run without an initialized API request.",
    );
  }

  const orderIds = new Set([requestedOrderId, world.responseBody?.id]);
  const endpoint = world.apiRequestBuilder.getEndpoint("storeOrderByIdDelete");

  for (const orderId of orderIds) {
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      continue;
    }

    const url = world.apiRequestBuilder.buildUrl(endpoint, { orderId });
    const result = await world.apiRequestUtils.delete(world.requestContext, {
      url,
      headers: {
        Accept: "application/json",
      },
    });

    if (result.status !== 200 && result.status !== 404) {
      throw new Error(
        `Store order cleanup failed for order ID "${orderId}" ` +
          `with HTTP ${result.status}.`,
      );
    }
  }
}

Before(async function () {
  await this.apiClient.init();
  // Keep the Playwright APIRequestContext on the Cucumber World.
  this.requestContext = this.apiClient.requestContext;
});
AfterStep(async function ({ result }) {
  if (result?.status === "FAILED") {
    console.error("Step failed:", result.message);
  }
});
After(async function () {
  try {
    await cleanupPetCrudIntegration(this);
    await cleanupStoreOrder(this);
  } finally {
    await this.apiClient?.close();
    this.requestContext = null;
  }
});
