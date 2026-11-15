import { randomInt, randomUUID } from "node:crypto";

const suffix = () => `${Date.now()}-${randomInt(0, 100000)}`;

export const generateUniqueId = () => randomInt(100000000, 1000000000);

export const generatePetName = () => `pet-${suffix()}`;

export const generateUsername = () => `user-${suffix()}`;

export const generateEmail = () => `${generateUsername()}@example.com`;

export const generateOrderId = () => randomInt(1, 11);

export const generateTimestamp = () => new Date().toISOString();

export const generateCorrelationId = () => randomUUID();

export const generateValue = (type) =>
  ({
    id: generateUniqueId(),
    petId: generateUniqueId(),
    orderId: generateOrderId(),
    petName: generatePetName(),
    username: generateUsername(),
    email: generateEmail(),
    timestamp: generateTimestamp(),
    correlationId: generateCorrelationId(),
    apiKey: "special-key",
  })[type] ?? `${type}-${suffix()}`;
