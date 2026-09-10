Feature: Find pet by status
    As a user
    I want to retrieve pets by their status
    So that I can verify that the API returns pets matching the requested status.

    @API @Pet @petByStatus @GetPetByStatus @Regression @Positive
    Scenario Outline: Find Pet By Status request positive flow
        Given the user creates a GET request URL and headers with api data "<apiData>"
        Then the user sends a GET request to API
        Then verify the response status code should be "<status>"
        And verify the content type in response header should be "<contentType>"
        And verify the response schema should be matching "<schemaTemplate>"
        And verify all returned pets should have status "<petStatus>"

        Examples:
            | apiData                          | status | contentType      | schemaTemplate                    | petStatus |
            | pet-get-petStatus-test-data.json | 200    | application/json | pet-get-petStatus-api-schema.json | available |
            | pet-get-petStatus-test-data.json | 200    | application/json | pet-get-petStatus-api-schema.json | pending   |
            | pet-get-petStatus-test-data.json | 200    | application/json | pet-get-petStatus-api-schema.json | sold      |

    @API @Pet @petByStatus @GetPetByStatus @Regression @Negative
    Scenario Outline: Find Pet By Status request negative flow with invalid status
        Given the user creates a GET request URL and headers with api data "<apiData>"
        Then the user sends a GET request to API
        Then verify the response status code should be "<status>"

        Examples:
            | apiData                          | status | status |
            | pet-get-petStatus-test-data.json | 200    | 123    |