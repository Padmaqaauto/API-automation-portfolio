Feature: Retrieve Store Order by ID

  As an API client
  I want to retrieve a store order by its ID
  So that I can inspect the order details

  @API @Store @GetStoreOrderById @Regression @Positive
  Scenario Outline: Retrieve an existing order and validate its data
    Given the user creates a GET request URL and headers with api data "<apiData>"
    When the user sends a GET request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And verify the response order ID should match the requested order ID
    And verify the order response has pet ID <petId>, quantity <quantity>, status "<status>", and complete <complete>
    And verify the optional order ship date is a valid date-time when present

    Examples:
      | apiData        | orderId | expectedStatus | contentType      | responseSchema              | petId  | quantity  | status | complete |
      | storeOrderById | 3       | 200            | application/json | store-order-api-schema.json | 416373 | 1         | placed | false    |
      | storeOrderById | 4       | 200            | application/json | store-order-api-schema.json | 470    | 185818946 | placed | true     |
      | storeOrderById | 8       | 200            | application/json | store-order-api-schema.json | 127369 | 1         | placed | false    |

  @API @Store @GetStoreOrderById @Regression @Negative
  Scenario Outline: Retrieve a non-existing order
    Given the user creates a GET request URL and headers with api data "<apiData>"
    When the user sends a GET request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"

    Examples:
      | apiData        | orderId | expectedStatus | contentType      | responseSchema                    |
      | storeOrderById | 1       | 404            | application/json | store-order-error-api-schema.json |
      | storeOrderById | 2       | 404            | application/json | store-order-error-api-schema.json |

  @API @Store @GetStoreOrderById @Regression @Negative
  Scenario Outline: Reject an invalid order ID
    Given the user creates a GET request URL and headers with api data "<apiData>"
    When the user sends a GET request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"

    Examples:
      | apiData        | orderId      | expectedStatus | contentType      | responseSchema                    |
      | storeOrderById | not-a-number | 404            | application/json | store-order-error-api-schema.json |
      | storeOrderById | invalid      | 404            | application/json | store-order-error-api-schema.json |
