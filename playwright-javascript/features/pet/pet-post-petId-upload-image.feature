Feature: Upload an image for a pet

  As a user
  I want to upload an image for an existing pet
  So that I can verify the pet image upload API

  @API @Pet @PostPetUploadImage @Regression @Positive
  Scenario Outline: Upload an image with additional metadata
    Given the user creates a POST request URL and headers with api data "<createApiData>" and request body
      | field         | value     |
      | id            | <petData> |
      | category.id   | <petData> |
      | category.name | <petData> |
      | name          | <petData> |
      | photoUrls     | <petData> |
      | status        | <petData> |
    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And save the created pet details for the following GET

    Given the user prepares a pet image upload with API data "<uploadApiData>" and scenario data "<uploadScenarioData>" for "<uploadScenario>"
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And verify the pet image upload response body

    Examples:
      | createApiData               | petData      | uploadApiData                              | uploadScenarioData                         | uploadScenario          | status | contentType      | responseSchema                                   |
      | pet-post-pet-test-data.json | availablePet | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | availablePetImageUpload | 200    | application/json | pet-post-petId-upload-image-response-schema.json |
      | pet-post-pet-test-data.json | pendingPet   | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | pendingPetImageUpload   | 200    | application/json | pet-post-petId-upload-image-response-schema.json |
      | pet-post-pet-test-data.json | soldPet      | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | soldPetImageUpload      | 200    | application/json | pet-post-petId-upload-image-response-schema.json |

  @API @Pet @PostPetUploadImage @Regression @Negative
  Scenario Outline: Reject an upload sent to an invalid URL
    Given the user creates a POST request URL and headers with api data "<createApiData>" and request body
      | field         | value     |
      | id            | <petData> |
      | category.id   | <petData> |
      | category.name | <petData> |
      | name          | <petData> |
      | photoUrls     | <petData> |
      | status        | <petData> |
    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And save the created pet details for the following GET

    Given the user prepares a pet image upload with API data "<uploadApiData>" and scenario data "<uploadScenarioData>" for "<uploadScenario>"
    When the user sends a POST request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the pet image upload response body

    Examples:
      | createApiData               | petData      | uploadApiData                              | uploadScenarioData                         | uploadScenario   | expectedStatus |
      | pet-post-pet-test-data.json | availablePet | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | invalidUrlUpload | 404            |

  @API @Pet @PostPetUploadImage @Regression @Negative
  Scenario Outline: Reject an upload with a missing or non-integer pet ID
    Given the user prepares a pet image upload with API data "<uploadApiData>" and scenario data "<uploadScenarioData>" for "<uploadScenario>"
    Then the image upload request should be rejected during preparation with "<expectedError>"

    Examples:
      | uploadApiData                              | uploadScenarioData                         | uploadScenario  | expectedError             |
      | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | missingPetId    | petId is required.        |
      | pet-post-petId-upload-image-test-data.json | pet-post-petId-upload-image-test-data.json | nonIntegerPetId | petId must be an integer. |
