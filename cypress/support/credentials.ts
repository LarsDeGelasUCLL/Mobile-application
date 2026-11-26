// Test account from cypress.env.json (see cypress.env.example.json).
export function testCredentials(): { email: string; password: string } {
  const email: string = Cypress.env('TEST_EMAIL');
  const password: string = Cypress.env('TEST_PASSWORD');
  if (!email || !password) {
    throw new Error('Set TEST_EMAIL and TEST_PASSWORD in cypress.env.json.');
  }
  return { email, password };
}
