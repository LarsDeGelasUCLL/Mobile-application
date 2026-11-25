// The Expo dev server bundles each route on its first request, so a route's
// first render after `cy.visit` can take longer than Cypress's 4s default on a
// fresh server. Pass this to the first query after a visit; every other
// command keeps the default timeout.
export const firstRender = { timeout: 20000 };
