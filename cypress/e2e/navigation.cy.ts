import { firstRender } from '../support/timeouts';

describe('Navigation', () => {
  // Each route bundles on its first request, and no earlier spec may have
  // opened it on this server: the first query per screen gets firstRender.
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.getBySel('home-screen', firstRender).should('be.visible');
  });

  it('opens each tab screen from the tab bar', () => {
    cy.getBySel('tab-groups').click();
    cy.getBySel('groups-screen', firstRender).should('be.visible');
    cy.location('pathname').should('eq', '/groups');

    cy.getBySel('tab-expenses').click();
    cy.getBySel('expenses-screen', firstRender).should('be.visible');
    cy.location('pathname').should('eq', '/expenses');

    cy.getBySel('tab-profile').click();
    cy.getBySel('profile-screen', firstRender).should('be.visible');
    cy.location('pathname').should('eq', '/profile');

    cy.getBySel('tab-home').click();
    cy.getBySel('home-screen').should('be.visible');
    cy.location('pathname').should('eq', '/');
  });

  it('opens settings from the profile header', () => {
    cy.getBySel('tab-profile').click();
    cy.getBySel('open-settings-button').click();
    cy.getBySel('settings-screen', firstRender).should('be.visible');
    cy.location('pathname').should('eq', '/settings');
  });
});
