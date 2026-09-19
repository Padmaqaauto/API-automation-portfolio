Feature: Create Pet

  As a user
  I want to create a pet
  So that I can verify the create pet API

  @API @Pet @PostPet @petCreate @Regression @Positive
  Scenario Outline: Create pet with available status pet details

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
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

    Examples:
      | apiData                     | status | contentType      | schemaTemplate               |
      | pet-post-pet-test-data.json | 200    | application/json | pet-post-pet-api-schema.json |

  @API @Pet @PostPet @petCreate @Regression @Positive
  Scenario Outline: Create pet with pending status pet details

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
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

    Examples:
      | apiData                     | status | contentType      | schemaTemplate               |
      | pet-post-pet-test-data.json | 200    | application/json | pet-post-pet-api-schema.json |

  @API @Pet @PostPet @petCreate @Regression @Positive
  Scenario Outline: Create pet with sold status pet details

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
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

    Examples:
      | apiData                     | status | contentType      | schemaTemplate               |
      | pet-post-pet-test-data.json | 200    | application/json | pet-post-pet-api-schema.json |

  @API @Pet @PostPet @petCreate @Regression @Negative
  Scenario Outline: Create pet with missing required field

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
      | field         | value         |
      | id            | <testDataKey> |
      | category.id   | <testDataKey> |
      | category.name | <testDataKey> |
      | name          | <testDataKey> |
      | photoUrls     | <testDataKey> |
      | status        | <testDataKey> |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"

    Examples:
      | apiData                     | testDataKey      | status | contentType      |
      | pet-post-pet-test-data.json | missing id pet   | 200    | application/json |
      | pet-post-pet-test-data.json | missing name pet | 200    | application/json |

  @API @Pet @PostPet @petCreate @Regression @Negative
  Scenario Outline: Create pet with invalid status

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
      | field         | value              |
      | id            | invalid status pet |
      | category.id   | invalid status pet |
      | category.name | invalid status pet |
      | name          | invalid status pet |
      | photoUrls     | invalid status pet |
      | status        | invalid status pet |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"

    Examples:
      | apiData                     | status | contentType      |
      | pet-post-pet-test-data.json | 200    | application/json |

  @API @Pet @PostPet @petCreate @Regression @Negative
  Scenario Outline: Create pet with invalid data types

    Given the user creates a POST request URL and headers with api data "<apiData>" and request body
      | field         | value            |
      | id            | invalid type pet |
      | category.id   | invalid type pet |
      | category.name | invalid type pet |
      | name          | invalid type pet |
      | photoUrls     | invalid type pet |
      | status        | invalid type pet |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"

    Examples:
      | apiData                     | status | contentType      |
      | pet-post-pet-test-data.json | 500    | application/json |