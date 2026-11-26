import { firstRender } from './timeouts';

// Group helpers shared by groups.cy.ts and group-expenses.cy.ts.

// One alias per visit, so `cy.wait` never matches an earlier page's request.
let listLoads = 0;

// Opens the Groups tab and waits until its list (or empty state) has loaded.
// The store starts with no groups and `isLoading: false`, so the empty state
// shows before the fetch: wait for this visit's list request first.
export function visitGroupsList() {
  const alias = `groupsList${++listLoads}`;
  cy.intercept({
    method: 'GET',
    pathname: '/rest/v1/memberships',
    query: { status: 'eq.ACTIVE' },
  }).as(alias);
  cy.visit('/groups');
  cy.getBySel('groups-screen', firstRender);
  cy.wait(`@${alias}`);
  return cy.getBySel('groups-screen').should(($screen) => {
    const loaded =
      $screen.find('[data-testid^="group-row-"]').length > 0 ||
      $screen.text().includes('No groups yet');
    expect(loaded, 'groups list loaded').to.equal(true);
  });
}

// Creates a group through the Groups tab and stores its id as `@groupId`.
export function createGroup(name: string) {
  visitGroupsList();
  cy.getBySel('groups-add-button').click();
  cy.getBySel('groups-menu-create').click();
  cy.getBySel('create-group-name-input', firstRender).fill(name);
  cy.getBySel('create-group-button').click();

  cy.getBySel('group-detail-screen', firstRender).should('be.visible');
  cy.getBySel('group-detail-header').should('contain', name);
  cy.location('pathname')
    .should('match', /^\/group\/[^/]+$/)
    .then((path) => path.split('/')[2])
    .as('groupId');
}

// Deletes the open group from its settings page and checks the Groups list.
export function deleteGroupFromSettings(name: string) {
  cy.getBySel('group-settings-screen', firstRender).should('be.visible');
  cy.getBySel('delete-group-button').click();
  cy.getBySel('delete-group-dialog').should('be.visible').and('contain', name);
  cy.getBySel('delete-group-dialog-confirm')
    .should('not.have.attr', 'aria-disabled', 'true')
    .click();

  cy.getBySel('groups-screen').should('be.visible');
  cy.location('pathname').should('eq', '/groups');
  // The store drops the row locally; reload to check the server delete.
  cy.get<string>('@groupId').then((groupId) => {
    visitGroupsList();
    cy.getBySel(`group-row-${groupId}`).should('not.exist');
  });
}

// Deletes `cy-group-` groups that a failed earlier run left behind.
export function deleteLeftoverGroups() {
  visitGroupsList()
    .then(($screen) =>
      $screen
        .find('[data-testid^="group-row-"]')
        .filter((_, row) => (row.textContent ?? '').includes('cy-group-'))
        .map((_, row) => row.dataset.testid?.replace('group-row-', ''))
        .get(),
    )
    .each((groupId) => {
      cy.visit(`/group/${groupId}/settings`);
      cy.getBySel('delete-group-button', firstRender).click();
      cy.getBySel('delete-group-dialog-confirm')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
      cy.getBySel('groups-screen').should('be.visible');
    });
  // Reload to check the deletes reached the server.
  visitGroupsList().should(($screen) => {
    const left = $screen
      .find('[data-testid^="group-row-"]')
      .filter((_, row) => (row.textContent ?? '').includes('cy-group-'));
    expect(left.length, 'cy-group- rows after cleanup').to.equal(0);
  });
}
