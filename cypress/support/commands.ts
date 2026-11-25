import { testCredentials } from './credentials';

// react-native-web renders `testID` as `data-testid`.
Cypress.Commands.add('getBySel', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

// Replaces a field's text and checks the result. On web a clicked input can
// lose focus again right away (Screen's ScrollView blurs it on any scroll
// event, keyboardDismissMode "on-drag"; a blur ~60ms after the click was also
// seen while pages load), and cy.type() then fails with "targeted a disabled
// element". So: require the field to be visible, type with `force` (skips that
// focus check) and assert the value, so a field that ignores input still fails.
Cypress.Commands.add(
  'fill',
  { prevSubject: 'element' },
  (subject, text: string, options?: Partial<Cypress.TypeOptions>) => {
    cy.wrap(subject, { log: false }).should('be.visible');
    return cy
      .wrap(subject, { log: false })
      .clear({ force: true })
      .type(text, { ...options, force: true })
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
