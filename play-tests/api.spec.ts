/* Responses Cheat Sheet:
200	OK - Success, no resource created	GET /api/museums returns list
201	Created - Success, new resource made	POST /api/authenticate creates token
400	Bad Request - Invalid data sent	Wrong email format
401	Unauthorized - Need authentication	Missing JWT token
404	Not Found - Resource doesn't exist	Museum ID doesn't exist
500	Server Error - Backend crashed	Database connection failed
*/

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
let token: string;

test('POST /api/authenticate - Login user', async ({ request }) => {
  // Make POST request with credentials
  const response = await request.post(`${BASE_URL}/api/authenticate`, {
    data: {
      email: 'homer@simpson.com',
      password: 'secret'
    }
  });

  // Check status (returns 201 for successful auth)
  expect(response.status()).toBe(201);

  const data = await response.json();

  // Check JWT token exists
  
  expect(data.token).toBeTruthy();
  console.log('✅ User authenticated, token:', data.token?.substring(0, 20) + '...');
  token = data.token;
});

test('GET /api/museums - Get all museums (with auth)', async ({ request }) => {

  // Make GET request with Bearer token
  const response = await request.get(`${BASE_URL}/api/museums`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  expect(response.status()).toBe(200);

  // Get response body
  const data = await response.json();

  // Verify response is an array
  expect(Array.isArray(data)).toBeTruthy();

  console.log('✅ Museums found:', data.length);
});

test('GET /api/museums/{id} - Get single museum (with auth)', async ({ request }) => {
  // First authenticate
  const authResponse = await request.post(`${BASE_URL}/api/authenticate`, {
    data: {
      email: 'homer@simpson.com',
      password: 'secret'
    }
  });

  const { token } = await authResponse.json();

  // Get all museums first
  const allResponse = await request.get(`${BASE_URL}/api/museums`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  expect(allResponse.status()).toBe(200);
  const museums = await allResponse.json();

  // If museums exist, test getting one by ID
  if (museums.length > 0) {
    const museumId = museums[0]._id;  // Use _id not id (MongoDB format)

    const singleResponse = await request.get(`${BASE_URL}/api/museums/${museumId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(singleResponse.status()).toBe(200);
    const museum = await singleResponse.json();
    expect(museum._id).toBe(museumId);
    console.log('✅ Museum retrieved:', museum.title);
  }
});
