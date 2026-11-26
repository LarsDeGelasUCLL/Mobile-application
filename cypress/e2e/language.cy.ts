import { setDeviceLanguage } from '../support/deviceLanguage';
import { firstRender } from '../support/timeouts';

interface Language {
  code: string;
  /** The language select's aria label once this language is active. */
  selectLabel: string;
  saved: string;
}

const english: Language = {
  code: 'en',
  selectLabel: 'Language, English',
  saved: 'Settings saved.',
};
const dutch: Language = {
  code: 'nl',
  selectLabel: 'Taal, Nederlands',
  saved: 'Instellingen opgeslagen.',
};

// Picks a language on the settings page and waits for the server save.
// Needs a `@saveSettings` intercept on the settings PATCH.
function chooseLanguage({ code, selectLabel, saved }: Language) {
  cy.getBySel('settings-language-select').click();
  cy.getBySel(`settings-language-select-option-${code}`).click();
  cy.wait('@saveSettings').its('response.statusCode').should('eq', 200);
  cy.getBySel('settings-success').should('contain', saved);
  cy.getBySel('settings-language-select').should(
    'have.attr',
    'aria-label',
    selectLabel,
  );
}

// Opens settings and switches to `language` unless it is already active.
function ensureLanguage(language: Language) {
  cy.intercept('PATCH', '**/rest/v1/user_settings*').as('saveSettings');
  cy.visit('/settings');
  cy.getBySel('settings-language-select', firstRender)
    .invoke('attr', 'aria-label')
    .then((ariaLabel) => {
      if (ariaLabel !== language.selectLabel) chooseLanguage(language);
    });
}

describe('Language', () => {
  beforeEach(() => {
    cy.login();
  });

  // Other specs assert English text: always leave the account in English.
  afterEach(() => {
    ensureLanguage(english);
  });

  it('switches the whole app to Dutch without a reload', () => {
    ensureLanguage(english);
    cy.getBySel('settings-header').should('contain', 'Settings');
    cy.get('html').should('have.attr', 'lang', 'en');

    chooseLanguage(dutch);
    cy.getBySel('settings-header').should('contain', 'Instellingen');
    cy.get('html').should('have.attr', 'lang', 'nl');

    // In-app navigation keeps the page; the tab bar follows the language too.
    cy.getBySel('settings-header-back').click();
    cy.getBySel('tab-groups', firstRender).should('contain', 'Groepen');
    cy.getBySel('tab-expenses').should('contain', 'Uitgaven');
    cy.getBySel('tab-groups').click();
    cy.getBySel('groups-screen', firstRender).should('be.visible');
    cy.contains('JOUW GROEPEN').should('be.visible');
  });
});

describe('Language when logged out', () => {
  it('follows the device language', () => {
    cy.visit('/login', {
      onBeforeLoad: (win) => setDeviceLanguage(win, 'nl-BE'),
    });
    cy.getBySel('login-screen', firstRender).should('contain', 'Welkom terug');
    cy.get('html').should('have.attr', 'lang', 'nl');
  });
});
