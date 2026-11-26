import './commands';
import { setDeviceLanguage } from './deviceLanguage';

// Specs assert English text: every page starts with an English browser,
// whatever the host's locale.
Cypress.on('window:before:load', (win) => setDeviceLanguage(win, 'en-GB'));
