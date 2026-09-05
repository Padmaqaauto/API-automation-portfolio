import Ajv from 'ajv';
import { redactSecrets } from './common-utils.js';

export class ApiResponseUtils {
  constructor() {
    this.ajv = new Ajv ({})
  }

  async readBody(response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async capture(response) {
    const body = await this.readBody(response);
    return {
      status: response.status(),
      headers: response.headers(),
      body
    }
  }

  asserStatus(actual, expected) {
    if (actual !== Number(expected)) {
      throw new Error(`Expected HTTP ${expected}, received HTTP ${actual}`);
    }
  }

  assertHeader(headers, name, expected) {
     const actual = headers[name.toLowerCase()];
    if (actual === undefined) 
      throw new Error(`Response header not found: ${name}`);
    if (expected !== undefined && actual !== expected) {
      throw new Error(`Expected header ${name}=${expected}, received ${actual}`);
    }  
  }

  assertJsonResponse(headers) {
    const contentType = headers['content-type'] ?? '';
    if (!/json/i.test(contentType)) {
      throw new Error(`Expected JSON content type, received: ${contentType}`);
    }
  }
  
  validateSchema(body, schema, schemaName = 'response schema') {
    const validate = this.ajv.compile(schema);
    const valid = validate(body);
    if (!valid) {
      throw new Error(`Schema validation failed for ${schemaName}: ${JSON.stringify(validate.errors)}`);
    }
    return true;
  }

  logResponse(result) { 
      console.log(
        `[ApiResponseUtils] Response: ${result.status}\n` +
        `Headers: ${JSON.stringify(result.headers)}\n` +
        `Body: ${JSON.stringify(redactSecrets(result.body))}`
      );
    }

}
