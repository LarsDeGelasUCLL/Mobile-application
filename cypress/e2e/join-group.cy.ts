import { firstRender } from '../support/timeouts';

describe('Join group', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/groups');
    cy.getBySel('groups-add-button', firstRender).click();
    cy.getBySel('groups-menu-join').click();
    cy.getBySel('join-group-header').should('be.visible');
  });

  it('shows a validation error for an empty code', () => {
    cy.getBySel('join-group-button').click();
    cy.contains('Invite code is required.').should('be.visible');
    cy.getBySel('join-group-error').should('not.exist');
  });

  it('shows the server error for an unknown code', () => {
    cy.getBySel('join-group-code-input').fill(`cy-unknown-${Date.now()}`);
    cy.getBySel('join-group-button').click();
    cy.getBySel('join-group-error').should('contain', 'Invalid invite code');
    cy.getBySel('join-group-feedback').should('not.exist');
    cy.location('pathname').should('eq', '/group/join');
  });
});
