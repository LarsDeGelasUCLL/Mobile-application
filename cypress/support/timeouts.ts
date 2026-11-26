// The Expo dev server bundles each route on its first request, so a route's
// first render after `cy.visit` can take longer than Cypress's 4s default on a
// fresh server. Pass this to the first query after a visit, or after an
// in-app navigation to a route this server may not have bundled yet; every
// other command keeps the default timeout.
export const firstRender = { timeout: 20000 };
