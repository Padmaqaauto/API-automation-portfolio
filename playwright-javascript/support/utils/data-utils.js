import { cloneJson } from './json-helper-utils.js';
import { generateValue } from './random-utils.js';
const PLACEHOLDER =
  /\{\{([^}]+)\}\}/g;
function resolveSpecialValue(
  value,
  variables
) {
  if (
    typeof value !== 'string'
  ) {
    return value;
  }
  if (value.startsWith('env:')) {
    const name =
      value.slice(4).trim();
    const envValue =
      process.env[name];
    if (envValue === undefined) {
      throw new Error(
        `Environment variable "${name}" is not defined.`
      );
    }
    return envValue;
  }
  if (value.startsWith('static:')) {
    return value.slice(7);
  }
  if (value.startsWith('context:')) {
    const key =
      value.slice(8).split('|')[0].trim();
    if (
      variables[key] !== undefined
    ) {
      return variables[key];
    }
    throw new Error(
      `Runtime context value "${key}" is not available.`
    );
  }
  return value.replace(
    PLACEHOLDER,
    (_, key) => {
      const normalized =
        key.trim();
      if (
        variables[normalized] !==
        undefined
      ) {
        return String(
          variables[normalized]
        );
      }
      const generated =
        generateValue(
          normalized
        );
      if (
        generated === undefined
      ) {
        throw new Error(
          `No runtime value or generator exists for placeholder ` +
          `{{${normalized}}}`
        );
      }
      variables[normalized] =
        generated;
      return String(generated);
    }
  );
}
export function resolveDynamicData(
  value,
  variables = {}
) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }
  if (
    typeof value === 'string'
  ) {
    return resolveSpecialValue(
      value,
      variables
    );
  }
  if (Array.isArray(value)) {
    return value.map(
      item =>
        resolveDynamicData(
          item,
          variables
        )
    );
  }
  if (
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, child]) => [
          key,
          resolveDynamicData(
            child,
            variables
          )
        ]
      )
    );
  }
  return value;
}
export function resolveTestData(
  testData,
  variables = {}
) {
  return cloneJson(
    resolveDynamicData(
      testData,
      variables
    )
  );
}
export function mergeVariables(
  ...sources
) {
  return Object.assign(
    {},
    ...sources
  );
}