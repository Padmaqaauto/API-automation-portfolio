import { randomUUID } from 'node:crypto';

const suffix = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const generateUniqueId = () => Number(String(Date.now()).slice(-9));
export const generatePetName = () => `pet-${suffix()}`;
export const generateUsername = () => `user-${suffix()}`;
export const generateEmail = () => `${generateUsername()}@example.com`;
export const generateOrderId = () => Math.max(1, Number(String(Date.now()).slice(-8)) % 10);
export const generateTimestamp = () => new Date().toISOString();
export const generateCorrelationId = () => randomUUID();

export const generateValue = (type) => ({
  id: generateUniqueId(),
  petId: generateUniqueId(),
  orderId: generateOrderId(),
  petName: generatePetName(),
  username: generateUsername(),
  email: generateEmail(),
  timestamp: generateTimestamp(),
  correlationId: generateCorrelationId(),
  apiKey: 'special-key'
}[type] ?? `${type}-${suffix()}`);
