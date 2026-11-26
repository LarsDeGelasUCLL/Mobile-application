// Sets the browser language the app reads when logged out
// (`navigator.languages`, through expo-localization). Configurable, so a spec
// can override e2e.ts's English default in `cy.visit`'s `onBeforeLoad`.
export function setDeviceLanguage(win: Window, locale: string) {
  Object.defineProperty(win.navigator, 'languages', {
    value: [locale],
    configurable: true,
  });
  Object.defineProperty(win.navigator, 'language', {
    value: locale,
    configurable: true,
  });
}
