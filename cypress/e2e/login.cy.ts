describe('Login screen', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders the login form', () => {
    cy.getBySel('email-input').should('exist');
    cy.getBySel('password-input').should('exist');
    cy.getBySel('login-button').should('exist');
  });

  it('logs in with valid credentials and navigates to home', () => {
    cy.getBySel('email-input').type(Cypress.env('TEST_EMAIL'));
    cy.getBySel('password-input').type(Cypress.env('TEST_PASSWORD'), {
      log: false,
    });
    cy.getBySel('login-button').click();

    cy.getBySel('home-screen').should('be.visible');
  });
});
