Feature: Retrieve Store Order by ID

  As an API client
  I want to retrieve a store order by its ID
  So that I can inspect the order details

  @API @Store @GetStoreOrderById @PostStoreOrder @Regression @Positive
  Scenario Outline: Retrieve an order created in this scenario
    Given an order ID is generated for this request
    And the user creates a POST request URL and headers with api data "<createRequest>" and request body
      | field    | value         |
      | id       | <scenarioKey> |
      | petId    | <scenarioKey> |
      | quantity | <scenarioKey> |
      | shipDate | <scenarioKey> |
      | status   | <scenarioKey> |
      | complete | <scenarioKey> |
    And the submitted order is scheduled for cleanup
    When the user sends a POST request to API
    Then verify the response status code should be "<createStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And the response should match the submitted order
    And verify the optional order ship date is a valid date-time when present
    And the user creates a GET request URL and headers with api data "<lookupRequest>"
    When the user sends a GET request to API
    Then verify the response status code should be "<lookupStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And verify the response order ID should match the requested order ID
    And the retrieved order should match the order created in this scenario
    And verify the optional order ship date is a valid date-time when present

    Examples:
      | createRequest  | lookupRequest | scenarioKey      | createStatus | lookupStatus | contentType      | responseSchema              |
      | storeOrderPost | storeOrderById | placed_order     | 200          | 200          | application/json | store-order-api-schema.json |
      | storeOrderPost | storeOrderById | approved_order   | 200          | 200          | application/json | store-order-api-schema.json |
      | storeOrderPost | storeOrderById | delivered_order  | 200          | 200          | application/json | store-order-api-schema.json |

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
