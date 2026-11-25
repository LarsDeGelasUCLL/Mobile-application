const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    // The Expo web dev server bundles routes on demand; on a fresh server the
    // first render of a route (plus the live Supabase calls) can pass 10s.
    defaultCommandTimeout: 20000,
    setupNodeEvents(on, config) {},
  },
});
