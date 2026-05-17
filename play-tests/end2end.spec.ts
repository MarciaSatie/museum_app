import { test, expect,Page } from '@playwright/test';
const BASE_URL = 'http://localhost:3000';


test.describe.serial('E2E Test',() => {
  let page:Page;
 
  test('Login to App',async({browser}) =>{
    // Login
    page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.getByRole('textbox', { name: 'Enter email' }).click();
    await page.getByRole('textbox', { name: 'Enter email' }).fill('homer@simpson.com');
    await page.getByRole('textbox', { name: 'Enter email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Password' }).fill('secret');
    await page.getByRole('button', { name: 'Log in' }).click();
  
  });

  test('Create new Museum',async()=>{
    // Create new Museum
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
  });

  test('Edit new Museum title',async()=>{
    // Edit Museum title information
    const newMuseum = page.locator('div').filter({ hasText: 'My Museum Test Testing app' }).last();
    await newMuseum.focus();
    await expect(newMuseum).toBeVisible();
    
    await newMuseum.getByRole('link', { name: 'Edit' }).first().click();
      
    await page.locator('input[name="title"]').click();
    await page.locator('input[name="title"]').fill('My Museum Test2');
    await page.getByRole('button', { name: 'Update Museum' }).click();
    await page.getByRole('heading', { name: 'My Museum Test2' }).last().click();
  
    
    const updatedMuseum = page.locator('div').filter({ hasText: 'My Museum Test2 Testing app' }).last();
    await updatedMuseum.getByRole('link', { name: ' View' }).click();
  });

  test('Create exhibition and delete museum',async()=>{
    // Create a new exhibition
    await page.getByRole('textbox', { name: 'Enter Title' }).click();
    await page.getByRole('textbox', { name: 'Enter Title' }).fill('New Exhibition Test');
    await page.getByRole('textbox', { name: 'Enter Artist' }).click();
    await page.getByRole('textbox', { name: 'Enter Artist' }).fill('The Nice Guy');
    await page.getByRole('textbox', { name: 'Enter duration' }).click();
    await page.getByRole('textbox', { name: 'Enter duration' }).fill('120');
    await page.getByRole('button', { name: 'Add Exhibition' }).click();

    // Rerurn to My Musuem POI page
    await page.getByRole('link', { name: 'My Museums POI' }).click();

    // Delete My Museum Test2 
    const updatedMuseum = page.locator('div').filter({ hasText: 'My Museum Test2 Testing app' }).last();
    await updatedMuseum.focus();
    await updatedMuseum.getByRole('link', { name: 'Delete Museum' }).first().click();
    const modernArtRow = page.locator('.box-link-hover-shadow').filter({ hasText: 'My Museum Test2' });
    await expect(modernArtRow).toBeHidden();
  });
  test('Create a Review at your own Museum, and Delete at My Museum Page',async()=>{
    const reviewText = 'I liked the banana art';
    // Create Review
    await page.getByRole('link', { name: 'Social Galleries' }).click();
    await page.getByRole('button', { name: 'Rate 4 Stars' }).first().click();
    await page.getByRole('textbox', { name: 'Leave a Review...' }).first().click();
    await page.getByRole('textbox', { name: 'Leave a Review...' }).first().fill(reviewText);
    await page.getByRole('button', { name: 'Leave a Review' }).first().click();
    const myReview= page.getByText(reviewText).first();
    await expect(myReview).toBeVisible(); 

    await page.getByRole('link', { name: 'My Museums POI' }).click();
    const museumCard = page.locator('.box-link-hover-shadow').filter({
      has: page.getByRole('heading', { name: 'Modern Art Gallery' }),
    }).first();

    const lastReview = museumCard.getByLabel('museumReviewSwiper').first();

    await expect(lastReview).toContainText(reviewText);
    await expect(lastReview).toContainText('@Homer Simpson');
    
    await lastReview.getByRole('link', { name: 'deleteReview' }).first().click();
    await expect(lastReview).not.toContainText(reviewText);

  });

  //test('Test',async()=>{});

});
