# OAuth Setup Guide

This document explains how to configure GitHub and Auth0 OAuth applications for the Museum App.

## Environment Variables

### Required on Render (and local for Auth0)

Set these in your Render service environment or in `.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Auth0
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Session & Cookie
cookie_password=your_32_character_password_here

# Render deployment (recommended)
APP_URL=https://museum-app-2-bo7c.onrender.com
```

---

## GitHub OAuth Setup

### 1. Create/Update GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Museum App
   - **Homepage URL**: `https://museum-app-2-bo7c.onrender.com` (or `http://localhost:3000` for local)
   - **Authorization callback URL**: (see below)

### 2. Add Allowed Callback URLs

In your GitHub app settings, set **Authorization callback URL** to:

```
http://localhost:3000/callback
https://museum-app-2-bo7c.onrender.com/callback
```

(Note: GitHub allows only one callback URL in the form, but you can manage multiple via the app settings.)

### 3. Copy Credentials

- Copy **Client ID** → `GITHUB_CLIENT_ID`
- Copy **Client Secret** → `GITHUB_CLIENT_SECRET`

---

## Auth0 Setup

### 1. Create/Update Auth0 Application

1. Go to https://manage.auth0.com/dashboard
2. Applications → Create Application → Single Page Application (or Regular Web Application)
3. Fill in:
   - **Name**: Museum App
   - **Application type**: Regular Web Application

### 2. Add Allowed Callback URLs

In your Auth0 app settings, find **Allowed Callback URLs** and add:

```
http://localhost:3000/login-auth0
https://museum-app-2-bo7c.onrender.com/login-auth0
```

**Important**: Auth0 accepts multiple URLs separated by commas.

### 3. Add Allowed Logout URLs (optional but recommended)

```
http://localhost:3000/
https://museum-app-2-bo7c.onrender.com/
```

### 4. Copy Credentials

- Copy **Domain** → `AUTH0_DOMAIN` (e.g., `your_username.auth0.com`)
- Copy **Client ID** → `AUTH0_CLIENT_ID`
- Copy **Client Secret** → `AUTH0_CLIENT_SECRET`

---

## Local Testing (localhost:3000)

No Render deployment needed. Just ensure:

1. `.env` has `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
2. GitHub app **Authorization callback URL** includes `http://localhost:3000/callback`
3. Auth0 **Allowed Callback URLs** includes `http://localhost:3000/login-auth0`
4. Run `npm run dev` to start the server
5. Visit `http://localhost:3000/login` and click GitHub or Auth0 sign-in buttons

---

## Deployment to Render

1. In Render dashboard → Service Settings → Environment:
   - Add all env vars from the **Required on Render** section above
2. Redeploy / restart the service
3. Ensure GitHub and Auth0 apps include the production callback URLs (see above)

---

## Troubleshooting

### Callback URL Mismatch

If you see **"Callback URL mismatch"** or **"The provided redirect_uri is not associated with this application"**:

1. Check the browser Network tab for the OAuth provider's authorize request
2. Look for the `redirect_uri` parameter in the URL
3. Ensure that exact `redirect_uri` is registered in the provider's allowed callback URLs
4. Common issue: localhost vs production URL mismatch — verify both are registered

### Debug Routes (Temporary)

The app includes temporary debug routes to help diagnose OAuth issues:

- `GET /auth-debug` — Shows computed public URL and headers
- `GET /debug/auth0-callback` — Raw Auth0 credentials after callback
- `GET /debug/github-callback` — Raw GitHub credentials after callback

**Remove these routes in production** (located in `src/server.ts`).

---

## App Routes

- **GitHub OAuth**: Button at `/login` → redirects to `/callback`
- **Auth0 OAuth**: Button at `/login` → redirects to `/login-auth0`
- **Session validation**: Uses cookie-based session strategy after callback

---

## Support

For issues:

1. Check `.env` is correctly loaded (run `npm run dev` and inspect startup logs)
2. Verify provider credentials and allowed callback URLs match exactly
3. Use debug routes to inspect raw provider responses
4. Check browser Network tab for authorize request and `redirect_uri` value
