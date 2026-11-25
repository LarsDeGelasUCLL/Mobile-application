import { testCredentials } from './credentials';

// react-native-web renders `testID` as `data-testid`.
Cypress.Commands.add('getBySel', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

// Replaces a visible field's text and asserts the value, so a field that
// ignores input fails.
Cypress.Commands.add(
  'fill',
  { prevSubject: 'element' },
  (subject, text: string, options?: Partial<Cypress.TypeOptions>) => {
    cy.wrap(subject, { log: false }).should('be.visible');
    return cy
      .wrap(subject, { log: false })
      .clear()
      .type(text, options)
      .should('have.value', text);
  },
);

// Logs in through the UI once and caches the session across specs.
Cypress.Commands.add('login', () => {
  const { email, password } = testCredentials();

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
      /** Clears a visible text field, types `text` and asserts the value. */
      fill(
        text: string,
        options?: Partial<TypeOptions>,
      ): Chainable<JQuery<HTMLElement>>;
      /** Logs in as the test account from cypress.env.json. */
      login(): Chainable<void>;
    }
  }
}

export {};
