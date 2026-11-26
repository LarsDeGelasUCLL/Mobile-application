import {
  createGroup,
  deleteGroupFromSettings,
  deleteLeftoverGroups,
} from '../support/groups';
import { firstRender } from '../support/timeouts';

// One alias per visit, so `cy.wait` never matches an earlier page's request.
let expenseLoads = 0;

// Visits a group page and waits for this visit's group expenses request.
function visitGroupPage(groupId: string, path: string, screenTestId: string) {
  const alias = `groupExpenses${++expenseLoads}`;
  cy.intercept({
    method: 'GET',
    pathname: '/rest/v1/expenses',
    query: { group_id: `eq.${groupId}` },
  }).as(alias);
  cy.visit(path);
  cy.getBySel(screenTestId, firstRender);
  cy.wait(`@${alias}`);
}

// The signed-in user's id, from the session supabase-js keeps in localStorage.
function currentUserId() {
  return cy.window().then((win) => {
    const key = Object.keys(win.localStorage).find((name) =>
      /^sb-.+-auth-token$/.test(name),
    );
    const session: unknown = JSON.parse(
      (key && win.localStorage.getItem(key)) || 'null',
    );
    if (
      typeof session === 'object' &&
      session !== null &&
      'user' in session &&
      typeof session.user === 'object' &&
      session.user !== null &&
      'id' in session.user &&
      typeof session.user.id === 'string'
    ) {
      return session.user.id;
    }
    throw new Error('No signed-in user in localStorage.');
  });
}

describe('Group expenses', () => {
  before(() => {
    cy.login();
    deleteLeftoverGroups();
  });

  beforeEach(() => {
    cy.login();
  });

  it('adds an expense to a group and shows it with the balances', () => {
    const name = `cy-group-${Date.now()}`;
    const title = `cy-expense-${Date.now()}`;
    createGroup(name);

    cy.getBySel('create-group-expense-button').click();
    cy.getBySel('save-expense-button', firstRender).should('be.visible');
    cy.getBySel('expense-title-input').fill(title);
    cy.getBySel('expense-amount-input').fill('20.00');
    cy.getBySel('save-expense-button').click();
    // The create page is /expense/create: wait until the URL leaves it.
    cy.location('pathname')
      .should('match', /^\/expense\/(?!create$)[^/]+$/)
      .then((path) => path.split('/')[2])
      .as('expenseId');

    cy.get<string>('@groupId').then((groupId) => {
      cy.get<string>('@expenseId').then((expenseId) => {
        visitGroupPage(groupId, `/group/${groupId}`, 'group-detail-screen');
        cy.getBySel('group-recent-expenses')
          .find(`[data-testid="expense-row-${expenseId}"]`)
          .should('contain', title);
        currentUserId().then((userId) => {
          cy.getBySel(`group-balance-${userId}`).should('be.visible');
        });

        visitGroupPage(
          groupId,
          `/group/${groupId}/expenses`,
          'group-expenses-list',
        );
        cy.getBySel('group-expenses-list')
          .find(`[data-testid="expense-row-${expenseId}"]`)
          .should('contain', title);

        // Deleting the group also deletes its expenses.
        cy.visit(`/group/${groupId}/settings`);
        deleteGroupFromSettings(name);
      });
    });
  });
});
