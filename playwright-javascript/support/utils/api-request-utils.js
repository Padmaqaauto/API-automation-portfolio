export class ApiRequestUtils {
    constructor(responseUtils) {
        this.responseUtils = responseUtils;
    }

    async send(context, {method, url, headers, data, form, multipart}) {
        const options = { headers };
        if ( data!== undefined) options.data = data;
        if (form !== undefined) options.form = form;
        if (multipart !== undefined) options.multipart = multipart;

        const response = await context.fetch(url, {
            method,
            ...options
        });

        const result = await this.responseUtils.capture(response);
        this.responseUtils.logResponse(result);
        return { response, ...result };
    }

    get(context, request) { return this.send(context, {...request, method: 'GET'});}
    post(context, request) { return this.send(context, {...request, method: 'POST'});}
    put(context, request) { return this.send(context, {...request, method: 'PUT'});}    
    delete(context, request) { return this.send(context, {...request, method: 'DELETE'});}
    patch(context, request) { return this.send(context, {...request, method: 'PATCH'});}    
}