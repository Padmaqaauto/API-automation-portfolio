Feature: Find pet by ID

  As a user
  I want to retrieve a pet by its ID
  So that I can verify the pet details returned by the API

  @API @Pet @GetPetById @Regression @Positive
  Scenario: Create a valid status pet and then fetch it using the created pet ID

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value     |
      | id            | valid pet |
      | category.id   | valid pet |
      | category.name | valid pet |
      | name          | valid pet |
      | photoUrls     | valid pet |
      | status        | valid pet |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<schemaTemplate>"
    And verify the response pet details should match the requested pet details
      | field         | value     |
      | id            | valid pet |
      | category.id   | valid pet |
      | category.name | valid pet |
      | name          | valid pet |
      | photoUrls     | valid pet |
      | status        | valid pet |
    And save the created pet details for the following GET

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the pet ID to "created pet ID"
    When the user sends a GET request to API
    Then verify the response status code should be "<getStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchemaTemplate>"
    And verify the response pet ID should match the requested pet ID
    And verify the response pet name should be "created pet name"
    And verify the response pet status should be "created pet status"
    And verify the retrieved pet matches the created pet

    Examples:
      | postApiData                 | getApiData                   | status | contentType      | schemaTemplate               | getStatus | getSchemaTemplate             |
      | pet-post-pet-test-data.json | pet-get-petId-test-data.json | 200    | application/json | pet-post-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |

  @API @Pet @GetPetById @Regression @Positive
  Scenario: Create a pending status pet and then fetch it using the created pet ID

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value       |
      | id            | pending pet |
      | category.id   | pending pet |
      | category.name | pending pet |
      | name          | pending pet |
      | photoUrls     | pending pet |
      | status        | pending pet |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<schemaTemplate>"
    And verify the response pet details should match the requested pet details
      | field         | value       |
      | id            | pending pet |
      | category.id   | pending pet |
      | category.name | pending pet |
      | name          | pending pet |
      | photoUrls     | pending pet |
      | status        | pending pet |
    And save the created pet details for the following GET

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the pet ID to "created pet ID"
    When the user sends a GET request to API
    Then verify the response status code should be "<getStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchemaTemplate>"
    And verify the response pet ID should match the requested pet ID
    And verify the response pet name should be "created pet name"
    And verify the response pet status should be "created pet status"
    And verify the retrieved pet matches the created pet

    Examples:
      | postApiData                 | getApiData                   | status | contentType      | schemaTemplate               | getStatus | getSchemaTemplate             |
      | pet-post-pet-test-data.json | pet-get-petId-test-data.json | 200    | application/json | pet-post-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |

  @API @Pet @GetPetById @Regression @Positive
  Scenario: Create a sold status pet and then fetch it using the created pet ID

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value    |
      | id            | sold pet |
      | category.id   | sold pet |
      | category.name | sold pet |
      | name          | sold pet |
      | photoUrls     | sold pet |
      | status        | sold pet |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<schemaTemplate>"
    And verify the response pet details should match the requested pet details
      | field         | value    |
      | id            | sold pet |
      | category.id   | sold pet |
      | category.name | sold pet |
      | name          | sold pet |
      | photoUrls     | sold pet |
      | status        | sold pet |
    And save the created pet details for the following GET

    Given the user creates a GET request URL and headers with api data "<getApiData>"
    And the user sets the pet ID to "created pet ID"
    When the user sends a GET request to API
    Then verify the response status code should be "<getStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<getSchemaTemplate>"
    And verify the response pet ID should match the requested pet ID
    And verify the response pet name should be "created pet name"
    And verify the response pet status should be "created pet status"
    And verify the retrieved pet matches the created pet

    Examples:
      | postApiData                 | getApiData                   | status | contentType      | schemaTemplate               | getStatus | getSchemaTemplate             |
      | pet-post-pet-test-data.json | pet-get-petId-test-data.json | 200    | application/json | pet-post-pet-api-schema.json | 200       | pet-get-petId-api-schema.json |


  @API @Pet @petById @GetPetById @Regression @Negative
  Scenario Outline: Get Pet By ID request negative flow with invalid pet ID

    Given the user creates a GET request URL and headers with api data "<apiData>"
    And the user sets the pet ID to "<petId>"
    When the user sends a GET request to API
    Then verify the response status code should be "<status>"

    Examples:
      | apiData                      | petId               | status |
      | pet-get-petId-test-data.json | invalid pet ID      | 404    |
      | pet-get-petId-test-data.json | non-existing pet ID | 404    |
      | pet-get-petId-test-data.json | negative pet ID     | 404    |
      | pet-get-petId-test-data.json | non-numeric pet ID  | 404    |