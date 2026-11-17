Feature: Update a pet using the PUT endpoint

  As an API client
  I want to replace an existing pet using its ID in the request body
  So that I can verify the PUT Pet endpoint updates and returns the pet

  @API @Pet @PutPet @Regression @Positive
  Scenario Outline: Update the pet's <changedFields> and retrieve the updated details
    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value        |
      | id            | <createData> |
      | category.id   | <createData> |
      | category.name | <createData> |
      | name          | <createData> |
      | photoUrls     | <createData> |
      | tags          | <createData> |
      | status        | <createData> |
    When the user sends a POST request to API
    Then verify the response status code should be "<createStatus>"
    And save the created pet details for the following GET

    Given the user creates a PUT request URL and headers with api data "<putApiData>" and request body
      | field         | value         |
      | id            | <updatedData> |
      | category.id   | <updatedData> |
      | category.name | <updatedData> |
      | name          | <updatedData> |
      | photoUrls     | <updatedData> |
      | tags          | <updatedData> |
      | status        | <updatedData> |
    When the user sends a PUT request to API
    Then verify the response status code should be "<putStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<putSchema>"
    And verify the response pet details should match the requested pet details
      | field         | value         |
      | id            | <updatedData> |
      | category.id   | <updatedData> |
      | category.name | <updatedData> |
      | name          | <updatedData> |
      | photoUrls     | <updatedData> |
      | tags          | <updatedData> |
      | status        | <updatedData> |

    And save the updated pet details for the following GET
    And the user retrieves the updated pet using GET request with the stored pet ID
    Then verify the response status code should be "<getStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchema>"
    And verify the retrieved pet matches the updated pet

    Examples:
      | postApiData                 | createData  | createStatus | putApiData                 | updatedData      | putStatus | contentType      | putSchema                   | getStatus | getSchema                     |
      | pet-post-pet-test-data.json | petToUpdate | 200          | pet-put-pet-test-data.json | updateIdOnly     | 200       | application/json | pet-put-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | petToUpdate | 200          | pet-put-pet-test-data.json | updateNameOnly   | 200       | application/json | pet-put-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | petToUpdate | 200          | pet-put-pet-test-data.json | updateStatusOnly | 200       | application/json | pet-put-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | petToUpdate | 200          | pet-put-pet-test-data.json | updatedPet       | 200       | application/json | pet-put-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |

  @API @Pet @PutPet @Regression @Negative
  Scenario Outline: Reject a PUT request sent to an invalid URL
    Given the user creates a PUT request URL and headers with api data "<putApiData>" and request body
      | field         | value         |
      | id            | <requestData> |
      | category.id   | <requestData> |
      | category.name | <requestData> |
      | name          | <requestData> |
      | photoUrls     | <requestData> |
      | tags          | <requestData> |
      | status        | <requestData> |
    And the user switches to the invalid URL from the API data
    When the user sends a PUT request to API
    Then verify the response status code should be "<expectedStatus>"

    Examples:
      | putApiData                 | requestData | expectedStatus |
      | pet-put-pet-test-data.json | petToUpdate | 404            |
