import { randomUUID } from 'node:crypto';
import en from '../src/dictionaries/en.json' with { type: 'json' };
import {
  deleteTestAccount,
  emailSignInLink,
  firebaseAdmin
} from './firebaseAuth.ts';
import { expect, test } from './fixtures.ts';

const MISSING_CREDENTIALS =
  'signing in against the dev API needs E2E_FIREBASE_ACCESS_TOKEN and NEXT_PUBLIC_FIREBASE_PROJECT_ID';

const admin = firebaseAdmin();

test.skip(!admin, MISSING_CREDENTIALS);

test('signs in, edits the profile and deletes the account', async ({
  page,
  baseURL
}) => {
  if (!admin) {
    throw new Error(MISSING_CREDENTIALS);
  }

  const email = `e2e-${randomUUID()}@example.com`;
  const home = new URL('/en', baseURL);
  let deleted = false;

  try {
    await page.goto(home.href);
    await page.evaluate(
      (address) => window.localStorage.setItem('emailForSignIn', address),
      email
    );

    const link = await emailSignInLink(admin, email, home.href);
    const signIn = new URL(home);

    link.searchParams.forEach((value, key) => {
      signIn.searchParams.set(key, value);
    });

    await page.goto(signIn.href);
    await expect(page.getByText(en['sign in success'])).toBeVisible();

    await page.getByRole('button', { name: en.account }).click();
    await page.getByRole('link').filter({ hasText: email }).click();
    await page.getByRole('button', { name: en['edit profile'] }).click();

    const editProfile = page.getByRole('dialog', { name: en['edit profile'] });
    const biography = `E2E ${randomUUID()}`;

    await editProfile.getByLabel(en.biography).fill(biography);
    await editProfile.getByRole('button', { name: en.save }).click();
    await expect(page.getByText(en['edit profile success'])).toBeVisible();
    await expect(page.getByText(biography)).toBeVisible();

    await page.goto(new URL('/en/settings', baseURL).href);
    await page
      .locator('.MuiCard-root', { hasText: en['delete account'] })
      .getByRole('button', { name: en.delete })
      .click();

    const confirm = page.getByRole('dialog', {
      name: en['sure to delete account']
    });

    await confirm.getByLabel(en['understand this cannot be undone']).check();
    await confirm.getByRole('button', { name: en.delete }).click();
    await expect(page.getByText(en['delete account success'])).toBeVisible();
    deleted = true;

    await expect(
      page.getByRole('button', { name: en.login, exact: true })
    ).toBeVisible();
  } finally {
    if (!deleted) {
      await deleteTestAccount(admin, email, home.href).catch(
        (error: unknown) => {
          console.error(`could not delete ${email}:`, error);
        }
      );
    }
  }
});
