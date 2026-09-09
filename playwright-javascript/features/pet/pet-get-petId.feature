Feature: Find pet by ID

  As a user
  I want to retrieve a pet by its ID
  So that I can verify the pet details returned by the API.

  @API @Pet @petById @GetPetById @Regression @Positive
  Scenario: Get Pet By ID request positive flow with valid pet ID
    Given the user creates a GET request URL and headers with api data "<apiData>"
    Then the user sends a GET request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<schemaTemplate>"
    And verify the response pet ID should match the requested pet ID
    And verify the response pet name should be "<petName>"
    
    Examples:
      | apiData                      | status | contentType      | schemaTemplate                | petName |
      | pet-get-petId-test-data.json | 200    | application/json | pet-get-petId-api-schema.json | doggie  |