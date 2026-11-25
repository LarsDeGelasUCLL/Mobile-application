import { testCredentials } from '../support/credentials';
import { firstRender } from '../support/timeouts';

describe('Login screen', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders the login form', () => {
    cy.getBySel('email-input', firstRender).should('exist');
    cy.getBySel('password-input').should('exist');
    cy.getBySel('login-button').should('exist');
  });

  it('logs in with valid credentials and navigates to home', () => {
    const { email, password } = testCredentials();
    cy.getBySel('email-input', firstRender).type(email);
    cy.getBySel('password-input').type(password, { log: false });
    cy.getBySel('login-button').click();

    cy.getBySel('home-screen', firstRender).should('be.visible');
  });
});

describe('Signed-out redirect', () => {
  it('sends a signed-out visit to a signed-in page to the login page', () => {
    cy.visit('/groups');
    cy.location('pathname', firstRender).should('eq', '/login');
    cy.getBySel('login-button').should('exist');
  });
});
