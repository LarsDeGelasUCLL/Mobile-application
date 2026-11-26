const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    // No timeout override: Cypress's default applies. A route's cold first
    // render gets `firstRender` from cypress/support/timeouts.ts instead.
    setupNodeEvents(on, config) {},
  },
});
