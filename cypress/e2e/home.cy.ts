describe('Home', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('shows the personal balance summary', () => {
    cy.getBySel('home-balance-summary')
      .should('be.visible')
      .and('contain', 'You get back')
      .and('contain', 'You owe');
  });

  // The account's data is not fixed: accept content or the empty state.
  it('renders the groups section', () => {
    cy.getBySel('home-screen').should(($screen) => {
      const highlights = $screen.find('[data-testid="home-group-highlights"]');
      expect(
        highlights.length > 0 || $screen.text().includes('No groups yet'),
        'group highlights or empty state',
      ).to.equal(true);
    });
    cy.getBySel('home-groups-error').should('not.exist');
  });

  it('renders the recent expenses section', () => {
    cy.getBySel('home-screen').should(($screen) => {
      const rows = $screen.find('[data-testid^="expense-row-"]');
      expect(
        rows.length > 0 || $screen.text().includes('No personal expenses yet'),
        'expense rows or empty state',
      ).to.equal(true);
    });
    cy.getBySel('home-expenses-error').should('not.exist');
  });
});
