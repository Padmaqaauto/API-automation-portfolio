Feature: Retrieve Store Inventory

  As an API client
  I want to retrieve inventory grouped by status
  So that I can inspect current inventory counts

  @API @Store @GetStoreInventory @Regression @Positive
  Scenario Outline: Retrieve store inventory successfully
    Given the user creates a GET request URL and headers with api data "<apiData>"
    When the user sends a GET request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"

    Examples:
      | apiData                        | expectedStatus | contentType      | responseSchema                  |
      | store-inventory-test-data.json | 200            | application/json | store-inventory-api-schema.json |

  @API @Store @GetStoreInventory @Regression @Positive
  Scenario Outline: Validate returned inventory status counts
    Given the user creates a GET request URL and headers with api data "<apiData>"
    When the user sends a GET request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the inventory response contains valid status counts

    Examples:
      | apiData                        | expectedStatus |
      | store-inventory-test-data.json | 200            |
