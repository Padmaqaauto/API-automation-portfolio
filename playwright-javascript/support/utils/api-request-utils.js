export class ApiRequestUtils {
 constructor(responseUtils) {
 this.responseUtils = responseUtils;
 }
 async send(
 context,
 {
 method,
 url,
 headers = {},
 data
 }
 ) {
 if (!context) {
 throw new Error(
 'Playwright APIRequestContext is not initialized.'
 );
 }
 const options = {
 method,
 headers
 };
 if (data !== undefined && data !== null) {
 options.data = data;
 }
 const response =
 await context.fetch(
 url,
 options
 );
 const result =
 await this.responseUtils.capture(
 response
 );
 this.responseUtils.logResponse(
 result
 );
 return {
 response,
 ...result
 };
 }
get(context, request) {
 return this.send(
 context,
 {
 ...request,
 method: 'GET'
 }
 );
 }
 post(context, request) {
 return this.send(
 context,
 {
 ...request,
 method: 'POST'
 }
 );
 }
 put(context, request) {
 return this.send(
 context,
 {
 ...request,
 method: 'PUT'
 }
 );
 }
 delete(context, request) {
 return this.send(
 context,
 {
 ...request,
 method: 'DELETE'
 }
 );
 }
 patch(context, request) {
    return this.send(
 context,
 {
 ...request,
 method: 'PATCH'
 }
 );
 }
}