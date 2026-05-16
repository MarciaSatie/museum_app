import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
let token: string;

test.beforeAll(async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/authenticate`, {
    data: {
      email: 'homer@simpson.com',
      password: 'secret',
    },
  });

  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.token).toBeTruthy();
  token = data.token;
  console.log(`Token from API Auth: ${token?.slice(0,20)}...`);
});

test.describe('Museums API Test',() => {

  test('GET /api/museums - Get all museums (with auth)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/museums`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    console.log(await response.text());

  });
  
  // test('GET /api/museums/{id} - Get single museum (with auth)', async ({ request }) => {
  //   const allResponse = await request.get(`${BASE_URL}/api/museums`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  
  //   expect(allResponse.status()).toBe(200);
  //   const museums = await allResponse.json();
  
  //   if (museums.length > 0) {
  //     const museumId = museums[0]._id;
  //     const singleResponse = await request.get(`${BASE_URL}/api/museums/${museumId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  
  //     expect(singleResponse.status()).toBe(200);
  //     const museum = await singleResponse.json();
  //     expect(museum._id).toBe(museumId);
  //   }
  // });
  
  
  // test('DELETE /api/museum/{id} - Delete ALL Museums',async({request})=>{

  // });
});