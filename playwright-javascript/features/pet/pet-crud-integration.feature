Feature: Pet CRUD integration

  As an API client
  I want to manage a pet through its complete lifecycle
  So that I can verify create, read, update, and delete operations work together

  @API @Pet @PetCRUD @Regression @Positive
  Scenario Outline: Complete the CRUD lifecycle for a <petStatus> pet
    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the "petId" path parameter to a unique ID
    When the user sends a GET request to API
    Then verify the response status code should be "<preCreateStatus>"
    And the user registers the generated pet ID for cleanup

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value      |
      | id            | crudPetToCreate |
      | category.id   | crudPetToCreate |
      | category.name | crudPetToCreate |
      | name          | crudPetToCreate |
      | photoUrls     | crudPetToCreate |
      | tags          | crudPetToCreate |
      | status        | crudPetToCreate |
    When the user sends a POST request to API
    Then verify the response status code should be "<createStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<createSchema>"
    And verify the response pet details should match the requested pet details
      | field         | value      |
      | id            | crudPetToCreate |
      | category.id   | crudPetToCreate |
      | category.name | crudPetToCreate |
      | name          | crudPetToCreate |
      | photoUrls     | crudPetToCreate |
      | tags          | crudPetToCreate |
      | status        | crudPetToCreate |
    And save the created pet details for the following GET

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the pet ID to "created pet ID"
    When the user sends a GET request to API
    Then verify the response status code should be "<readStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchema>"
    And verify the response pet ID should match the requested pet ID
    And verify the response pet name should be "created pet name"
    And verify the response pet status should be "created pet status"
    And verify the retrieved pet matches the created pet

    Given the user creates a PUT request URL and headers with api data "<putApiData>" and request body
      | field         | value      |
      | id            | crudPetToUpdate |
      | category.id   | crudPetToUpdate |
      | category.name | crudPetToUpdate |
      | name          | crudPetToUpdate |
      | photoUrls     | crudPetToUpdate |
      | tags          | crudPetToUpdate |
      | status        | crudPetToUpdate |
    When the user sends a PUT request to API
    Then verify the response status code should be "<updateStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<updateSchema>"
    And verify the response pet details should match the requested pet details
      | field         | value       |
      | id            | crudPetToUpdate |
      | category.id   | crudPetToUpdate |
      | category.name | crudPetToUpdate |
      | name          | crudPetToUpdate |
      | photoUrls     | crudPetToUpdate |
      | tags          | crudPetToUpdate |
      | status        | crudPetToUpdate |
    And save the updated pet details for the following GET
    And the user retrieves the updated pet using GET request with the stored pet ID
    Then verify the response status code should be "<updatedReadStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchema>"
    And verify the retrieved pet matches the updated pet

    Given the user creates a DELETE request URL and headers with api data "<deleteApiData>"
    When the user sends a DELETE request to API
    Then verify the response status code should be "<deleteStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<deleteSchema>"
    And verify the delete pet response body should confirm the requested pet ID

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the pet ID to "created pet ID"
    When the user sends a GET request to API
    Then verify the response status code should be "<finalReadStatus>"

    Examples:
      | getApiData                   | postApiData                 | putApiData                 | deleteApiData                 | petStatus | updatedPetStatus | preCreateStatus | createStatus | createSchema                 | readStatus | getSchema                     | updateStatus | updateSchema                 | updatedReadStatus | deleteStatus | contentType      | deleteSchema                  | finalReadStatus |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-put-pet-test-data.json | pet-delete-pet-test-data.json | available | pending          | 404             | 200          | pet-post-pet-api-schema.json | 200        | pet-get-petId-api-schema.json | 200          | pet-put-pet-api-schema.json | 200               | 200          | application/json | pet-delete-pet-api-schema.json | 404             |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-put-pet-test-data.json | pet-delete-pet-test-data.json | pending   | sold             | 404             | 200          | pet-post-pet-api-schema.json | 200        | pet-get-petId-api-schema.json | 200          | pet-put-pet-api-schema.json | 200               | 200          | application/json | pet-delete-pet-api-schema.json | 404             |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-put-pet-test-data.json | pet-delete-pet-test-data.json | sold      | available        | 404             | 200          | pet-post-pet-api-schema.json | 200        | pet-get-petId-api-schema.json | 200          | pet-put-pet-api-schema.json | 200               | 200          | application/json | pet-delete-pet-api-schema.json | 404             |
