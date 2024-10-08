// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  BaseUrl: 'https://localhost:5001/',

  AD_CONFIG: {
    tenantId: "5717c0ff-6c4f-48f0-9762-9d002e280d3b",
    clientId: 'd5d00583-f53c-410a-aaf8-cc1ff31abbf3',
    clientSecret: 'jfy8Q~dbeLH2LhZlzw9yYB2GTj6Iy.j5vh.EobFW',
    authorize: {
      endpoint: 'https://login.microsoftonline.com/5717c0ff-6c4f-48f0-9762-9d002e280d3b/oauth2/v2.0/authorize',
      responseType: 'token',
      scope: "api://d5d00583-f53c-410a-aaf8-cc1ff31abbf3/access_as_user",
      redirectUri: 'http://localhost:4200/auth/callback',
    }
  }
}