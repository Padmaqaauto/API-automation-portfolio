Feature: Create Pet

  As a user
  I want to create a pet
  So that I can verify the create pet API

  @API @Pet @PostPet @petCreate @Regression @Positive

  Scenario Outline: Create pet with valid pet details
    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
      | field         | value     |
      | id            | valid pet |
      | category.id   | valid pet |
      | category.name | valid pet |
      | name          | valid pet |
      | photoUrls     | valid pet |
      | status        | valid pet |
    Then the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<schemaTemplate>"

    Examples:
      | apiData                     | status | contentType      | schemaTemplate               |
      | pet-post-pet-test-data.json | 200    | application/json | pet-post-pet-api-schema.json |