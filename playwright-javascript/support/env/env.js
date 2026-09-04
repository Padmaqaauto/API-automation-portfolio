import dotenv from 'dotenv';
dotenv.config();

export const ENV = Object.freeze({

    BASE_URL: process.env.BASE_URL ?? 'https://petstore.swagger.io',
    API_VERSION: process.env.API_VERSION ?? 'v2',
    API_TIMEOUT: Number(process.env.API_TIMEOUT ?? 30000),
    API_KEY: process.env.API_KEY ?? '',
    CREDENTIAL_USERNAME: process.env.CREDENTIAL_USERNAME ?? 'test',
    CREDENTIAL_PASSWORD: process.env.CREDENTIAL_PASSWORD ?? 'abc123'
});