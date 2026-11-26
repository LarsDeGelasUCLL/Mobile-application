import {
  createGroup,
  deleteGroupFromSettings,
  deleteLeftoverGroups,
} from '../support/groups';
import { firstRender } from '../support/timeouts';

describe('Groups', () => {
  before(() => {
    cy.login();
    deleteLeftoverGroups();
  });

  beforeEach(() => {
    cy.login();
  });

  it('creates a group and deletes it', () => {
    const name = `cy-group-${Date.now()}`;
    createGroup(name);

    cy.getBySel('group-settings-button').click();
    deleteGroupFromSettings(name);
  });

  it('reveals the invite code in a sheet', () => {
    const name = `cy-group-${Date.now()}`;
    createGroup(name);

    cy.getBySel('group-invite-code-button').click();
    cy.getBySel('group-invite-code-sheet').should('be.visible');
    cy.getBySel('group-invite-code-value').should('contain', '••••••••');
    cy.getBySel('group-invite-code-reveal').click();
    cy.getBySel('group-invite-code-value')
      .invoke('text')
      .should((code) => {
        expect(code.trim()).not.to.equal('');
        expect(code).not.to.contain('•');
      });

    // Close the sheet, then clean up.
    cy.get('[aria-label="Close"]').filter(':visible').click();
    cy.getBySel('group-invite-code-sheet').should('not.exist');
    cy.getBySel('group-settings-button').click();
    deleteGroupFromSettings(name);
  });

  it('renames the group in group settings', () => {
    const name = `cy-group-${Date.now()}`;
    const newName = `${name}-renamed`;
    createGroup(name);

    cy.getBySel('group-settings-button').click();
    cy.getBySel('group-info-section-toggle').click();
    cy.getBySel('group-name-input').should('have.value', name);
    cy.getBySel('group-name-input').fill(newName);
    // The button is disabled while the page still loads the group.
    cy.getBySel('update-group-button').should(
      'not.have.attr',
      'aria-disabled',
      'true',
    );
    cy.getBySel('update-group-button').click();

    cy.getBySel('group-feedback').should('contain', 'Group details updated.');
    cy.getBySel('group-settings-header').should('contain', newName);
    deleteGroupFromSettings(newName);
  });

  it('shows a validation error for an empty group name', () => {
    cy.visit('/group/create');
    cy.getBySel('create-group-button', firstRender).click();
    cy.contains('Group name is required.').should('be.visible');
    cy.location('pathname').should('eq', '/group/create');
  });
});
