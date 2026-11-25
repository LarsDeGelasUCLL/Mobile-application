import { testCredentials } from './credentials';
import { firstRender } from './timeouts';

// react-native-web renders `testID` as `data-testid`.
Cypress.Commands.add(
  'getBySel',
  (id: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable>) => {
    return cy.get(`[data-testid="${id}"]`, options);
  },
);

// Replaces a visible field's text and asserts the value, so a field that
// ignores input fails. Each step re-queries the field by its testID: typing
// can re-render it and detach the element the chain started with.
Cypress.Commands.add(
  'fill',
  { prevSubject: 'element' },
  (subject, text: string, options?: Partial<Cypress.TypeOptions>) => {
    const testId = subject.attr('data-testid');
    const field = () =>
      testId
        ? cy.getBySel(testId, { log: false })
        : cy.wrap(subject, { log: false });
    field().should('be.visible');
    field().clear();
    field().type(text, options);
    return field().should('have.value', text);
  },
);

// Logs in through the UI once and caches the session across specs.
Cypress.Commands.add('login', () => {
  const { email, password } = testCredentials();

  cy.session(
    email,
    () => {
      cy.visit('/login');
      cy.getBySel('email-input', firstRender).type(email);
      cy.getBySel('password-input').type(password, { log: false });
      cy.getBySel('login-button').click();
      // Home's route is bundled on its first visit too.
      cy.getBySel('home-screen', firstRender).should('exist');
    },
    {
      validate() {
        cy.visit('/');
        cy.getBySel('home-screen', firstRender).should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      /** Gets an element by its React Native `testID`. */
      getBySel(
        id: string,
        options?: Partial<Loggable & Timeoutable>,
      ): Chainable<JQuery<HTMLElement>>;
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
