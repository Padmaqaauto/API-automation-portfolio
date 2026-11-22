Feature: Place a Store Order

  As an API client
  I want to place an order for a pet
  So that I can verify order creation and input validation

  @API @Store @PostStoreOrder @Regression @Positive
  Scenario Outline: Place an order using each supported status
    Given an order ID is generated for this request
    And the user creates a POST request URL and headers with api data "<requestData>" and request body
      | field    | value         |
      | id       | <scenarioKey> |
      | petId    | <scenarioKey> |
      | quantity | <scenarioKey> |
      | shipDate | <scenarioKey> |
      | status   | <scenarioKey> |
      | complete | <scenarioKey> |
    And the submitted order is scheduled for cleanup
    When the user sends a POST request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And the response should match the submitted order
    And verify the optional order ship date is a valid date-time when present

    Examples:
      | requestData    | scenarioKey     | expectedStatus | contentType      | responseSchema              |
      | storeOrderPost | placed_order    | 200            | application/json | store-order-api-schema.json |
      | storeOrderPost | approved_order  | 200            | application/json | store-order-api-schema.json |
      | storeOrderPost | delivered_order | 200            | application/json | store-order-api-schema.json |

  @API @Store @PostStoreOrder @Regression @Boundary @Positive
  Scenario Outline: Check quantity boundaries when placing an order
    Given an order ID is generated for this request
    And the user creates a POST request URL and headers with api data "<requestData>" and request body
      | field    | value         |
      | id       | <scenarioKey> |
      | petId    | <scenarioKey> |
      | quantity | <scenarioKey> |
      | shipDate | <scenarioKey> |
      | status   | <scenarioKey> |
      | complete | <scenarioKey> |
    And the submitted order is scheduled for cleanup
    When the user sends a POST request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"
    And the response should match the submitted order

    Examples:
      | requestData    | scenarioKey            | expectedStatus | contentType      | responseSchema              |
      | storeOrderPost | zero_quantity_order    | 200            | application/json | store-order-api-schema.json |
      | storeOrderPost | maximum_quantity_order | 200            | application/json | store-order-api-schema.json |

  @API @Store @PostStoreOrder @Regression @Negative
  Scenario Outline: Check how invalid order details are handled
    Given an order ID is generated for this request
    And the user creates a POST request URL and headers with api data "<requestData>" and request body
      | field    | value         |
      | id       | <scenarioKey> |
      | petId    | <scenarioKey> |
      | quantity | <scenarioKey> |
      | shipDate | <scenarioKey> |
      | status   | <scenarioKey> |
      | complete | <scenarioKey> |
    And the submitted order is scheduled for cleanup
    When the user sends a POST request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"

    Examples:
      | requestData    | scenarioKey                  | expectedStatus | contentType      | responseSchema                    |
      | storeOrderPost | non_integer_quantity_order   | 500            | application/json | store-order-error-api-schema.json |
      | storeOrderPost | quantity_above_maximum_order | 500            | application/json | store-order-error-api-schema.json |

  @API @Store @PostStoreOrder @Regression @Negative
  Scenario Outline: Submit an order request without a body
    Given the user creates a POST request URL and headers with api data "<requestData>"
    When the user sends a POST request to API
    Then verify the response status code should be "<expectedStatus>"
    And verify the content type in response header should be "<contentType>"
    And verify the response schema should be matching "<responseSchema>"

    Examples:
      | requestData    | expectedStatus | contentType      | responseSchema                    |
      | storeOrderPost | 400            | application/json | store-order-error-api-schema.json |
