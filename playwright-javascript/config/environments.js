import dotenv from 'dotenv';

dotenv.config();

export const environments = {
    baseUrl: process.env.API_BASE_URL || 'https://petstore.swagger.io/v2',
    apiVersion: process.env.API_VERSION || 'v2',
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 3000,
};