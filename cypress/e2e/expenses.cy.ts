// Same format as the app's formatCurrency (browser locale, EUR).
const euro = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);

// Opens the Expenses tab and waits until its list (or empty state) has loaded.
function visitExpenseList() {
  cy.visit('/expenses');
  return cy.getBySel('expenses-screen').should(($screen) => {
    const loaded =
      $screen.find('[data-testid^="expense-row-"]').length > 0 ||
      $screen.text().includes('No personal expenses yet');
    expect(loaded, 'expense list loaded').to.equal(true);
  });
}

// Creates a personal expense from the Expenses tab; stores its id as `@expenseId`.
function createPersonalExpense(title: string, amount: string) {
  visitExpenseList();
  cy.getBySel('create-personal-expense-button').click();
  cy.getBySel('save-expense-button').should('be.visible');
  cy.getBySel('expense-title-input').fill(title);
  cy.getBySel('expense-amount-input').fill(amount);
  cy.getBySel('save-expense-button').click();

  cy.location('pathname')
    .should('match', /^\/expense\/[^/]+$/)
    .then((path) => path.split('/')[2])
    .as('expenseId');
}

// Deletes the open expense and checks it is gone from the Expenses tab.
// After an edit the stack holds two detail pages; act on the visible one.
function deleteOpenExpense(title: string) {
  cy.getBySel('delete-expense-row').filter(':visible').click();
  cy.getBySel('confirm-delete-expense')
    .should('be.visible')
    .and('contain', title);
  cy.getBySel('confirm-delete-expense-confirm')
    .filter(':visible')
    .should('not.have.attr', 'aria-disabled', 'true')
    .click();

  cy.getBySel('expenses-screen').should('be.visible');
  cy.location('pathname').should('eq', '/expenses');
  // The store drops the row locally; reload to check the server delete.
  cy.get<string>('@expenseId').then((expenseId) => {
    visitExpenseList();
    cy.getBySel(`expense-row-${expenseId}`).should('not.exist');
  });
}

// Deletes `cy-expense-` expenses that a failed earlier run left behind.
function deleteLeftoverExpenses() {
  visitExpenseList()
    .then(($screen) =>
      $screen
        .find('[data-testid^="expense-row-"]')
        .filter((_, row) => (row.textContent ?? '').includes('cy-expense-'))
        .map((_, row) => row.dataset.testid?.replace('expense-row-', ''))
        .get(),
    )
    .each((expenseId) => {
      cy.visit(`/expense/${expenseId}`);
      cy.getBySel('delete-expense-row').click();
      cy.getBySel('confirm-delete-expense-confirm')
        .should('not.have.attr', 'aria-disabled', 'true')
        .click();
      cy.getBySel('expenses-screen').should('be.visible');
    });
  // Reload to check the deletes reached the server.
  visitExpenseList().should(($screen) => {
    const left = $screen
      .find('[data-testid^="expense-row-"]')
      .filter((_, row) => (row.textContent ?? '').includes('cy-expense-'));
    expect(left.length, 'cy-expense- rows after cleanup').to.equal(0);
  });
}

describe('Personal expenses', () => {
  before(() => {
    cy.login();
    deleteLeftoverExpenses();
  });

  beforeEach(() => {
    cy.login();
  });

  it('starts the create form with only the current user in the split', () => {
    cy.visit('/expense/create');
    cy.getBySel('save-expense-button').should('be.visible');
    cy.getBySel('expense-amount-input').fill('10');
    cy.get('[data-testid^="expense-split-"]')
      .should('have.length', 1)
      .and('have.value', '10.00');
  });

  it('creates a personal expense and deletes it', () => {
    const title = `cy-expense-${Date.now()}`;
    createPersonalExpense(title, '12.34');

    cy.getBySel('expense-detail-summary')
      .should('be.visible')
      .and('contain', title)
      .and('contain', euro(12.34));
    deleteOpenExpense(title);
  });

  it('edits the expense title', () => {
    const title = `cy-expense-${Date.now()}`;
    const newTitle = `${title}-edited`;
    createPersonalExpense(title, '5.00');
    cy.getBySel('expense-detail-summary').should('contain', title);

    cy.getBySel('edit-expense-button').click();
    cy.getBySel('expense-title-input').should('have.value', title);
    cy.getBySel('expense-title-input').fill(newTitle);
    cy.getBySel('save-expense-button').click();

    cy.getBySel('expense-detail-summary')
      .filter(':visible')
      .should('contain', newTitle)
      .and('contain', euro(5));
    deleteOpenExpense(newTitle);
  });

  it('shows a validation error when the form is empty', () => {
    cy.visit('/expense/create');
    cy.getBySel('save-expense-button').should('be.visible').click();
    cy.getBySel('expense-form-error').should(
      'contain',
      'Expense title is required.',
    );
    cy.location('pathname').should('eq', '/expense/create');
  });
});
