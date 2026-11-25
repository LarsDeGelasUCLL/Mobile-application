const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    // Cypress's default command timeout; a route's cold first render after a
    // visit gets `firstRender` from cypress/support/timeouts.ts instead.
    setupNodeEvents(on, config) {},
  },
});
