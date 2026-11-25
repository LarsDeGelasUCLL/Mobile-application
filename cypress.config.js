const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    // The Expo web dev server bundles routes on demand; first renders can pass 4s.
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {},
  },
});
