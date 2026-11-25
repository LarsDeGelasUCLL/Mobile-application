import { firstRender } from '../support/timeouts';

interface Theme {
  label: string;
  value: string;
}

const themes: Theme[] = [
  { label: 'System', value: 'SYSTEM' },
  { label: 'Light', value: 'LIGHT' },
  { label: 'Dark', value: 'DARK' },
];

// Picks a theme on the settings page and waits for the server save.
// Needs a `@saveSettings` intercept on the settings PATCH.
function chooseTheme({ value, label }: Theme) {
  cy.getBySel('settings-theme-select').click();
  cy.getBySel(`settings-theme-select-option-${value}`).click();
  cy.wait('@saveSettings').its('response.statusCode').should('eq', 200);
  cy.getBySel('settings-success').should('contain', 'Settings saved.');
  cy.getBySel('settings-theme-select').should(
    'have.attr',
    'aria-label',
    `Theme, ${label}`,
  );
}

// Blocks account writes: a validation test must never change the account.
// A stubbed request still counts, so `@x.all` proves nothing was sent.
function stubAccountWrites() {
  cy.intercept('PUT', '**/auth/v1/user*', { statusCode: 500, body: {} }).as(
    'updateAuthUser',
  );
  cy.intercept('POST', '**/rest/v1/rpc/update_my_user_profile*', {
    statusCode: 500,
    body: {},
  }).as('updateProfile');
}

function expectNoAccountWrites() {
  cy.get('@updateAuthUser.all').should('have.length', 0);
  cy.get('@updateProfile.all').should('have.length', 0);
}

describe('Profile and settings', () => {
  beforeEach(() => {
    cy.login();
  });

  it('shows the display name on the profile tab', () => {
    cy.visit('/settings/profile');
    cy.getBySel('profile-name-input', firstRender)
      .invoke('val')
      .should('be.a', 'string')
      .and('not.be.empty')
      .then((name) => {
        cy.visit('/profile');
        cy.getBySel('profile-screen', firstRender)
          .should('be.visible')
          .and('contain', String(name));
      });
  });

  // Set by the theme test; afterEach puts it back even when the test fails.
  let originalTheme: Theme | undefined;

  afterEach(() => {
    const theme = originalTheme;
    originalTheme = undefined;
    if (!theme) return;
    cy.intercept('PATCH', '**/rest/v1/user_settings*').as('saveSettings');
    cy.visit('/settings');
    cy.getBySel('settings-theme-select', firstRender)
      .invoke('attr', 'aria-label')
      .then((ariaLabel) => {
        if (ariaLabel !== `Theme, ${theme.label}`) chooseTheme(theme);
      });
  });

  it('changes the theme', () => {
    cy.intercept('PATCH', '**/rest/v1/user_settings*').as('saveSettings');
    cy.visit('/settings');

    cy.getBySel('settings-theme-select', firstRender)
      .invoke('attr', 'aria-label')
      .then((ariaLabel) => {
        const original = themes.find((t) => ariaLabel === `Theme, ${t.label}`);
        if (!original) throw new Error(`Unknown theme label: ${ariaLabel}`);
        originalTheme = original;
        const next = themes.find((t) => t.value !== original.value) ?? original;

        chooseTheme(next);
      });
  });

  it('rejects an invalid phone number and IBAN without saving', () => {
    stubAccountWrites();
    cy.visit('/settings/profile');
    cy.getBySel('profile-name-input', firstRender)
      .invoke('val')
      .should('not.be.empty');

    cy.getBySel('profile-phone-input').fill('abc');
    cy.getBySel('profile-iban-input').fill('NL00BANK0123456789');
    cy.getBySel('save-profile-button').click();

    cy.contains('Enter a valid phone number.').should('be.visible');
    cy.contains('Enter a valid IBAN.').should('be.visible');
    cy.getBySel('profile-saved-message').should('not.exist');
    expectNoAccountWrites();
  });

  it('rejects an invalid new email', () => {
    stubAccountWrites();
    cy.visit('/settings/email');
    cy.getBySel('profile-new-email-input', firstRender).fill('not-an-email');
    cy.getBySel('change-email-button').click();

    cy.contains('Enter a valid email address.').should('be.visible');
    cy.getBySel('change-email-success').should('not.exist');
    expectNoAccountWrites();
  });

  it('rejects mismatched passwords', () => {
    stubAccountWrites();
    cy.visit('/settings/password');
    cy.getBySel('settings-new-password-input', firstRender).fill(
      'cy-password-1',
      {
        log: false,
      },
    );
    cy.getBySel('settings-confirm-password-input').fill('cy-password-2', {
      log: false,
    });
    cy.getBySel('change-password-button').click();

    cy.contains('Passwords must match.').should('be.visible');
    cy.getBySel('change-password-success').should('not.exist');
    expectNoAccountWrites();
  });
});
