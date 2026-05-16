import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:3000';


test('get started link', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByRole('textbox', { name: 'Enter email' }).click();
  await page.getByRole('textbox', { name: 'Enter email' }).fill('homer@simpson.com');
  await page.getByRole('textbox', { name: 'Enter email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('secret');
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.getByRole('link', { name: 'My Museums POI' }).click();
  await page.getByText('Add New Museum').click();
  await page.getByRole('textbox', { name: 'Enter museum title' }).click();
  await page.getByRole('textbox', { name: 'Enter museum title' }).fill('My Museum Test');
  await page.getByRole('textbox', { name: 'Enter museum description' }).click();
  await page.getByRole('textbox', { name: 'Enter museum description' }).fill('Testing app');
  await page.locator('details select[name="categoryId"]').selectOption('c2d5125a-7cb7-402f-a0db-c9a4ef3a5f40');
  await page.getByPlaceholder('e.g., 53.2743').click();
  await page.getByPlaceholder('e.g., 53.2743').fill('52.6519');
  await page.getByPlaceholder('e.g., -').click();
  await page.getByPlaceholder('e.g., -').fill('-7.25333');
  await page.getByRole('button', { name: 'Add Museum' }).click();

  await page.locator('div:nth-child(7) > div > div:nth-child(2) > .buttons > .button.is-info').click();
  await page.locator('input[name="title"]').click();
  await page.locator('input[name="title"]').fill('My Museum Test2');
  await page.getByRole('button', { name: 'Update Museum' }).click();
  await page.getByRole('heading', { name: 'My Museum Test2' }).click();
  await page.locator('div:nth-child(7) > div > div:nth-child(2) > .buttons > a:nth-child(2)').click();
  await page.getByRole('textbox', { name: 'Enter Title' }).click();
  await page.getByRole('textbox', { name: 'Enter Title' }).fill('New Exhibition Test');
  await page.getByRole('textbox', { name: 'Enter Artist' }).click();
  await page.getByRole('textbox', { name: 'Enter Artist' }).fill('someone');
  await page.getByRole('textbox', { name: 'Enter duration' }).click();
  await page.getByRole('textbox', { name: 'Enter duration' }).fill('120');
  await page.getByRole('button', { name: 'Add Exhibition' }).click();
  await page.getByRole('link', { name: 'My Gallery' }).click();
  await page.locator('select[name="museumId"]').selectOption('9aeef0bf-cb1f-47a6-a03f-10717a0bd17a');
  await page.locator('select[name="exhibitionId"]').selectOption('2088fe66-79a3-4d8d-8ba6-7b3d02ae8eee');
  await page.getByRole('button', { name: 'Choose File' }).click();
});
