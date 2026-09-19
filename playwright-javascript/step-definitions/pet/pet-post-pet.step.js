import { Then } from '@cucumber/cucumber';
import { PostPetPage } from '../../page-objects/pages/pet/pet-post-pet.page.js';

const postPetPage =
    new PostPetPage();

Then(
    'verify the response pet details should match the requested pet details',

    async function (dataTable) {

        const expectedFields =
            dataTable.hashes();

        postPetPage.verifyResponsePetDetails(
            this.requestPayload,
            this.responseBody,
            expectedFields
        );
    }
);