export default {
    default: {
        import:[
            'support/**/*.js',
            'step-definitions/**/*.js'
        ],

        paths: [
            'features/**/*.feature'
        ],

        format: [
            'progress',
            'html:reports/cucumber-report.html',
            'json:reports/cucumber-report.json'
        ], 
        publishQuiet: true,

        worldParameters: {
            baseUrl: process.env.API_BASE_URL || 'https://petstore.swagger.io/v2',
        }
    }
};