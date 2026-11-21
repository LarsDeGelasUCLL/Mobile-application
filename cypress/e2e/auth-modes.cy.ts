describe('Auth modes', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('opens signup and reset modes with field validation', () => {
    cy.get('[data-testid="signup-button"]').click();
    cy.get('[data-testid="display-name-input"]').should('exist');
    cy.get('[data-testid="signup-submit-button"]').click();
    cy.contains('Display name is required.').should('be.visible');
    cy.contains('Email is required.').should('be.visible');
    cy.contains('Password is required.').should('be.visible');

    cy.contains('Back to log in').click();
    cy.contains('Forgot password?').click();
    cy.get('[data-testid="password-reset-button"]').should('exist').click();
    cy.contains('Email is required.').should('be.visible');
  });

  it('offers a retry instead of a submit action for an expired reset link', () => {
    cy.visit('/login?mode=set-password');
    cy.get('[data-testid="expired-reset-button"]').should('be.visible');
    cy.get('[data-testid="set-password-button"]').should('not.exist');
    cy.get('[data-testid="expired-reset-button"]').click();
    cy.get('[data-testid="password-reset-button"]').should('be.visible');
  });
});
