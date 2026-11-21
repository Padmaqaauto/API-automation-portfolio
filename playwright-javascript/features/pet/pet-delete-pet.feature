Feature: Delete a pet

  As an API client
  I want to delete a pet by its ID
  So that I can verify the pet is no longer available

  @API @Pet @DeletePet @Regression @Positive
  Scenario Outline: Delete a pet created with a unique ID
    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the "petId" path parameter to a unique ID
    When the user sends a GET request to API
    Then verify the response status code should be "<getBeforeCreateStatus>"

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value       |
      | id            | petToDelete |
      | category.id   | petToDelete |
      | category.name | petToDelete |
      | name          | petToDelete |
      | photoUrls     | petToDelete |
      | tags          | petToDelete |
      | status        | petToDelete |
    When the user sends a POST request to API
    Then verify the response status code should be "<createStatus>"
    And verify the response schema should be matching "<createSchema>"
    And verify the response pet details should match the requested pet details
      | field  | value       |
      | id     | petToDelete |
      | status | petToDelete |
    And save the created pet details for the following GET

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the "petId" path parameter to a unique ID
    When the user sends a GET request to API
    Then verify the response status code should be "<getCreatedPetStatus>"
    And verify the response pet status should be "created pet status"

    Given the user creates a DELETE request URL and headers with api data "<deleteApiData>"
    When the user sends a DELETE request to API
    Then verify the response status code should be "<deleteStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<deleteSchema>"
    And verify the delete pet response body should confirm the requested pet ID

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the "petId" path parameter to a unique ID
    When the user sends a GET request to API
    Then verify the response status code should be "<getAfterDeleteStatus>"

    Examples:
      | getApiData                   | postApiData                 | deleteApiData                 | getBeforeCreateStatus | createStatus | createSchema                 | getCreatedPetStatus | deleteStatus | contentType      | deleteSchema                   | getAfterDeleteStatus | petStatus |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-delete-pet-test-data.json | 404                   | 200          | pet-post-pet-api-schema.json | 200                 | 200          | application/json | pet-delete-pet-api-schema.json | 404                  | available |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-delete-pet-test-data.json | 404                   | 200          | pet-post-pet-api-schema.json | 200                 | 200          | application/json | pet-delete-pet-api-schema.json | 404                  | pending   |
      | pet-get-petId-test-data.json | pet-post-pet-test-data.json | pet-delete-pet-test-data.json | 404                   | 200          | pet-post-pet-api-schema.json | 200                 | 200          | application/json | pet-delete-pet-api-schema.json | 404                  | sold      |

  @API @Pet @DeletePet @Regression @Negative
  Scenario Outline: Delete a pet ID that does not exist
    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the "petId" path parameter to a unique ID
    When the user sends a GET request to API
    Then verify the response status code should be "<getStatus>"

    Given the user creates a DELETE request URL and headers with api data "<deleteApiData>"
    When the user sends a DELETE request to API
    Then verify the response status code should be "<deleteStatus>"

    Examples:
      | getApiData                   | getStatus | deleteApiData                 | deleteStatus |
      | pet-get-petId-test-data.json | 404       | pet-delete-pet-test-data.json | 404          |

  @API @Pet @DeletePet @Regression @Negative
  Scenario Outline: Reject a non-numeric pet ID
    Given the user creates a DELETE request URL and headers with api data "<deleteApiData>"
    When the user sends a DELETE request to API
    Then verify the response status code should be "<deleteStatus>"
    And verify the content type in response header should be "<contentType>"

    Examples:
      | deleteApiData                 | petId        | deleteStatus | contentType      |
      | pet-delete-pet-test-data.json | not-a-number | 404          | application/json |
