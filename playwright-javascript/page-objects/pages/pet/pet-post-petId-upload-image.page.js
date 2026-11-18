import fs from "node:fs";
import path from "node:path";

import { resolveDynamicData } from "../../../support/utils/data-utils.js";

const INT64_MIN = -(1n << 63n);
const INT64_MAX = (1n << 63n) - 1n;

function validatePetId(petId) {
  if (petId === undefined || petId === null || String(petId).trim() === "") {
    return "petId is required.";
  }

  const value = String(petId).trim();
  if (!/^-?\d+$/.test(value)) {
    return "petId must be an integer.";
  }

  const integer = BigInt(value);
  if (integer < INT64_MIN || integer > INT64_MAX) {
    return "petId must be an integer in the int64 range.";
  }

  return null;
}

export class PostPetIdUploadImagePage {
  prepareUpload(
    world,
    { operation, scenario, apiDataPath, scenarioDataRoot, endpoint, builder },
  ) {
    world.requestUrl = null;
    world.requestMultipart = null;

    const petId =
      scenario.petId === "createdPetId" ? world.createdPetId : scenario.petId;
    const validationError = validatePetId(petId);
    if (validationError) {
      return { error: validationError };
    }

    if (
      endpoint.method !== operation.method ||
      endpoint.path !== operation.path ||
      endpoint.version !== operation.version
    ) {
      throw new Error(
        `Upload operation config in "${apiDataPath}" does not match endpoint registry entry "${operation.endpointKey}".`,
      );
    }

    const variables = {
      ...(world.variables ?? {}),
      ...scenario,
    };
    const configuredHeaders = resolveDynamicData(
      operation.headers ?? {},
      variables,
    );
    if (
      Object.keys(configuredHeaders).some(
        (name) => name.toLowerCase() === "content-type",
      )
    ) {
      throw new Error(
        "Do not set Content-Type for multipart requests; Playwright must add the boundary.",
      );
    }

    const requestBody = resolveDynamicData(operation.requestBody, variables);
    if (
      !requestBody ||
      typeof requestBody !== "object" ||
      Array.isArray(requestBody)
    ) {
      throw new Error(
        `A multipart requestBody must be defined in "${apiDataPath}".`,
      );
    }

    const multipart = {};
    if (requestBody.additionalMetadata !== undefined) {
      if (typeof requestBody.additionalMetadata !== "string") {
        throw new Error("additionalMetadata must be a string when provided.");
      }
      multipart.additionalMetadata = requestBody.additionalMetadata;
    }

    if (requestBody.file !== undefined) {
      const { path: filePath, name, mimeType } = requestBody.file;
      if (
        typeof filePath !== "string" ||
        typeof name !== "string" ||
        typeof mimeType !== "string"
      ) {
        throw new Error(
          "The upload file must define string path, name, and mimeType values.",
        );
      }

      const scenarioPetDirectory = path.resolve(scenarioDataRoot, "pet");
      const resolvedFilePath = path.resolve(scenarioPetDirectory, filePath);
      const relativeFilePath = path.relative(
        scenarioPetDirectory,
        resolvedFilePath,
      );
      if (
        relativeFilePath.startsWith("..") ||
        path.isAbsolute(relativeFilePath)
      ) {
        throw new Error("The upload file path must stay under test-data/pet.");
      }

      multipart.file = {
        name,
        mimeType,
        buffer: fs.readFileSync(resolvedFilePath),
      };
    }

    if (Object.keys(multipart).length === 0) {
      throw new Error(
        "The multipart upload must include a file or additionalMetadata.",
      );
    }

    const requestPath = scenario.useInvalidUrl
      ? operation.invalidUrl
      : endpoint.path;
    if (typeof requestPath !== "string" || requestPath.trim() === "") {
      throw new Error(
        scenario.useInvalidUrl
          ? `A valid invalidUrl must be defined in "${apiDataPath}".`
          : `A valid endpoint path must be defined for "${operation.endpointKey}".`,
      );
    }

    world.apiRequestBuilder = builder;
    world.endpointKey = operation.endpointKey;
    world.endpoint = endpoint;
    world.pathParams = { petId };
    world.queryParams = {};
    world.requestUrl = builder.buildUrl(
      { ...endpoint, path: requestPath },
      world.pathParams,
    );
    world.requestMethod = operation.method;
    world.requestHeaders = builder.buildHeaders({
      contentType: null,
      headers: configuredHeaders,
    });
    world.requestPayload = null;
    world.requestMultipart = multipart;

    console.log("[Pet Image Upload Prepared]", {
      endpointKey: world.endpointKey,
      method: world.requestMethod,
      url: world.requestUrl,
      multipartFields: Object.keys(multipart),
      fileName: multipart.file?.name,
    });

    return { error: null };
  }
}
