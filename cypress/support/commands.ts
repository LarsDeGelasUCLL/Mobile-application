// react-native-web renders `testID` as `data-testid`.
Cypress.Commands.add('getBySel', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

// Logs in through the UI once and caches the session across specs.
// Credentials come from cypress.env.json (see cypress.env.example.json).
Cypress.Commands.add('login', () => {
  const email: string = Cypress.env('TEST_EMAIL');
  const password: string = Cypress.env('TEST_PASSWORD');
  if (!email || !password) {
    throw new Error('Set TEST_EMAIL and TEST_PASSWORD in cypress.env.json.');
  }

  cy.session(
    email,
    () => {
      cy.visit('/login');
      cy.getBySel('email-input').type(email);
      cy.getBySel('password-input').type(password, { log: false });
      cy.getBySel('login-button').click();
      cy.getBySel('home-screen').should('exist');
    },
    {
      validate() {
        cy.visit('/');
        cy.getBySel('home-screen').should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      /** Gets an element by its React Native `testID`. */
      getBySel(id: string): Chainable<JQuery<HTMLElement>>;
      /** Logs in as the test account from cypress.env.json. */
      login(): Chainable<void>;
    }
  }
}

export {};
