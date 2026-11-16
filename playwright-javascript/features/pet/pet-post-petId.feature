
Feature: Update Pet details by ID

  As a user
  I want to update an existing pet details using its ID
  So that I can verify the update pet API


  @API @Pet @PostPetByID @Regression @Positive
  Scenario Outline: Update existing pet status by ID

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value           |
      | id            | <createPetData> |
      | category.id   | <createPetData> |
      | category.name | <createPetData> |
      | name          | <createPetData> |
      | photoUrls     | <createPetData> |
      | status        | <createPetData> |
    When the user sends a POST request to API
    Then verify the response status code should be "<status>"
    And save the created pet details for the following GET
    And the user creates a POST request URL and headers with api data "<apiData>" and the stored pet ID and form data
      | field  | value            |
      | name   | <updatedPetName> |
      | status | <updatedStatus>  |

    When the user sends a POST request to API

    Then verify the response status code should be "<status>"
    And verify the content type in response header should be "<contentType>"
    And the user retrieves the updated pet using GET request with the stored pet ID
    And verify the response schema should be matching "<schemaTemplate>"
    And verify the response pet name should be "<updatedPetName>"
    And verify the response pet status should be "<updatedStatus>"

    Examples:
      | postApiData                 | createPetData | apiData                       | updatedPetName            | updatedStatus             | status | contentType      | schemaTemplate                |
      | pet-post-pet-test-data.json | availablePet  | pet-post-petId-test-data.json | updatedAvailableToPending | updatedAvailableToPending | 200    | application/json | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | pendingPet    | pet-post-petId-test-data.json | updatedPendingToAvailable | updatedPendingToAvailable | 200    | application/json | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | pendingPet    | pet-post-petId-test-data.json | updatedPendingToSold      | updatedPendingToSold      | 200    | application/json | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | soldPet       | pet-post-petId-test-data.json | updatedSoldToAvailable    | updatedSoldToAvailable    | 200    | application/json | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | soldPet       | pet-post-petId-test-data.json | updatedSoldToPending      | updatedSoldToPending      | 200    | application/json | pet-get-petId-api-schema.json |
      | pet-post-pet-test-data.json | availablePet  | pet-post-petId-test-data.json | updatedAvailableToSold    | updatedAvailableToSold    | 200    | application/json | pet-get-petId-api-schema.json |

  @API @Pet @PostPetByID @Regression @Positive
  Scenario: Update existing pet name without changing its status

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value           |
      | id            | <createPetData> |
      | category.id   | <createPetData> |
      | category.name | <createPetData> |
      | name          | <createPetData> |
      | photoUrls     | <createPetData> |
      | status        | <createPetData> |

    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And save the created pet details for the following GET

    And the user creates a POST request URL and headers with api data "<apiData>" and the stored pet ID and form data
      | field | value            |
      | name  | <updatedPetName> |

    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And the user retrieves the updated pet using GET request with the stored pet ID
    And verify the response pet name should be "<updatedPetName>"
    And verify the response pet status should match the original created pet status

    Examples:
      | postApiData                 | createPetData | apiData                       | updatedPetName  | status | contentType      | schemaTemplate                |
      | pet-post-pet-test-data.json | availablePet  | pet-post-petId-test-data.json | updatedNameOnly | 200    | application/json | pet-get-petId-api-schema.json |

  @API @Pet @PostPetByID @Regression @Positive
  Scenario: Update existing pet status without changing its name

    Given the user creates a POST request URL and headers with api data "<postApiData>" and request body
      | field         | value           |
      | id            | <createPetData> |
      | category.id   | <createPetData> |
      | category.name | <createPetData> |
      | name          | <createPetData> |
      | photoUrls     | <createPetData> |
      | status        | <createPetData> |

    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And save the created pet details for the following GET

    And the user creates a POST request URL and headers with api data "<apiData>" and the stored pet ID and form data
      | field  | value           |
      | status | <updatedStatus> |

    When the user sends a POST request to API
    Then verify the response status code should be "200"
    And the user retrieves the updated pet using GET request with the stored pet ID
    And verify the response pet status should be "<updatedStatus>"
    And verify the response pet name should match the original created pet name

    Examples:
      | postApiData                 | createPetData | apiData                       | updatedStatus     | status | contentType      | schemaTemplate                |
      | pet-post-pet-test-data.json | availablePet  | pet-post-petId-test-data.json | updatedStatusOnly | 200    | application/json | pet-get-petId-api-schema.json |