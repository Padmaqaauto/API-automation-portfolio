import { cloneJson } from './json-helper-utils.js';
import { generateValue } from './random-utils.js';

const PLACEHOLDER = /\{\{([^}]+)\}\}/g;

export function resolveDynamicData(value, variables = {}) {
  if (typeof value === 'string') {
    return value.replace(PLACEHOLDER, (_, key) => {
      if (variables[key] !== undefined) return String(variables[key]);
      const generated = generateValue(key);
      if (generated === undefined) {
        throw new Error(`No runtime value or generator exists for placeholder {{${key}}}`);
      }
      variables[key] = generated;
      return String(generated);
    });
  }

  if (Array.isArray(value)) return value.map(item => resolveDynamicData(item, variables));

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveDynamicData(child, variables)])
    );
  }

  return value;
}

export function resolveTestData(testData, variables = {}) {
  return cloneJson(resolveDynamicData(testData, variables));
}

export function mergeVariables(...sources) {
  return Object.assign({}, ...sources);
}
