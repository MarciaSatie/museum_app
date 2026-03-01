# Models Architecture Guide

## How Models Work in Your Museum App

Your app uses a **hybrid storage architecture** - different data types are stored in different locations based on their purpose.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  (Controllers: dashboard, museum, accounts, admin)          │
└────────────────────────┬─────────────────────────────────────┘
                         │ import db
                         ↓
              ┌──────────────────────┐
              │      db.js           │
              │  (Store Manager)     │
              │                      │
              │ - userStore          │
              │ - museumStore        │
              │ - exhibitionStore    │
              │ - categoryStore      │
              └──┬─────────┬──────────┘
                 │         │
     ┌───────────┘         └──────────────┐
     │                                    │
     ↓                                    ↓
 MONGODB                              JSON FILES
 (Atlas Cloud)                        (Local Files)
```

---

## Database Distribution

### MongoDB (Cloud - Atlas)

**Location:** `mongodb+srv://<username>:<password>@<cluster>.mongodb.net`

**Stored Data:**
- `users` collection - User accounts (email, password, firstName, lastName, role)
- `categories` collection - Museum categories

**Why Mongo?**
- ✅ User authentication (secure, indexed by email)
- ✅ Categories are reference data (shared across users)
- ✅ Cloud backup (always available)
- ✅ Scales easily if app grows

### JSON Files (Local Storage)

**Location:** `src/models/json/db.json`

**Stored Data:**
```json
{
  "museums": [...],
  "exhibitions": [...]
}
```

**Why JSON?**
- ✅ Simple, no database setup needed
- ✅ Museums/Exhibitions are per-user data
- ✅ Easy to test locally
- ✅ Quick development iteration

---

## Data Flow Diagram

### When User Adds a Museum

```
┌─────────────────┐
│  User Form      │
│ (Add Museum)    │
└────────┬────────┘
         │ POST /dashboard
         ↓
┌─────────────────────────┐
│ dashboardController     │
│ .addMuseum              │
└────────┬────────────────┘
         │ Validates with Joi
         ↓
┌──────────────────────────┐
│ db.museumStore           │
│ .addMuseum(newMuseum)    │
└────────┬─────────────────┘
         │
         ↓ JSON Store
┌─────────────────────────────┐
│ src/models/json/db.json     │
│ {                           │
│   "museums": [              │
│     { _id, title, userid... │
│   ]                         │
│ }                           │
└─────────────────────────────┘
```

### When User Signs Up

```
┌────────────────┐
│ Sign Up Form   │
│ (User Details) │
└────────┬───────┘
         │ POST /signup
         ↓
┌──────────────────────────┐
│ accountsController       │
│ .register                │
└────────┬─────────────────┘
         │ Validates with Joi
         ↓
┌──────────────────────────┐
│ db.userStore             │
│ .addUser(newUser)        │
└────────┬─────────────────┘
         │
         ↓ MongoDB Connection
┌─────────────────────────────┐
│ MongoDB Atlas (Cloud)       │
│ Database: test              │
│ Collection: users           │
│ {                           │
│   _id: ObjectId,            │
│   email, password,          │
│   firstName, lastName, role │
│ }                           │
└─────────────────────────────┘
```

---

## File Structure

```
src/models/
│
├── db.js                          ← Central store manager
│
├── mongo/                         ← MongoDB Stores
│   ├── connect.js                 ← Connection setup
│   ├── user.js                    ← User schema
│   ├── category.js                ← Category schema
│   ├── user-mongo-store.js        ← User CRUD
│   └── category-mongo-store.js    ← Category CRUD
│
├── json/                          ← JSON Stores
│   ├── db.json                    ← Data file
│   ├── museum-json-store.js       ← Museum CRUD
│   └── exhibition-json-store.js   ← Exhibition CRUD
│
└── joi-schemas.js                 ← Validation schemas
```

---

## Store Methods (CRUD Operations)

All stores implement the same methods for consistency:

```js
// READ
await db.userStore.getAllUsers()
await db.userStore.getUserById(id)
await db.userStore.getUserByEmail(email)

// CREATE
await db.userStore.addUser(user)
await db.museumStore.addMuseum(museum)

// UPDATE
await db.museumStore.updateMuseum(museum)

// DELETE
await db.museumStore.deleteMuseumById(id)
await db.museumStore.deleteAllMuseums()
```

---

## How to Check Your Data

### MongoDB (Users & Categories)

Using **Studio 3T**:

1. Connect to MongoDB Atlas (see [Connection Guide](#))
2. Navigate to `test` database
3. View `users` and `categories` collections

Example query:
```js
db.users.find({ role: "admin" })
db.categories.find().limit(10)
```

### JSON Files (Museums & Exhibitions)

Using **VS Code**:

1. Open `src/models/json/db.json`
2. View the JSON structure directly
3. Edit manually if needed (for testing)

Example structure:
```json
{
  "museums": [
    {
      "_id": "uuid",
      "userid": "user-id",
      "title": "Museum Name",
      "description": "...",
      "categoryId": "category-id"
    }
  ],
  "exhibitions": [...]
}
```

---

## Current Configuration

In `src/server.js` (line 97):

```js
db.init();  // Default: Users in MongoDB, Museums/Exhibitions in JSON
```

### Alternative Mode:

```js
db.init("mongo");  // All data in MongoDB (not currently used)
```

---

## Data Persistence

| Storage | Persists After Restart? | Speed | Best For |
|---------|-------------------------|-------|----------|
| **MongoDB** | ✅ Yes (cloud) | ⚡ Fast (indexed) | Production data |
| **JSON** | ✅ Yes (local file) | Fast | Development |
| **Memory** | ❌ No (RAM only) | ⚡⚡ Fastest | Testing |

---

## Validation with Joi

Every data operation is validated **before** database storage:

```js
export const UserSpec = {
  firstName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const MuseumSpec = {
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  categoryId: Joi.string().allow("", null).optional(),
};
```

Invalid data → **Error page shown to user** → **Database untouched**

---

## Data Relationships

```
User (MongoDB)
├── Can create Museums (JSON)
│   └── Can have Exhibitions (JSON)
└── Can have assigned Categories (MongoDB)


Category (MongoDB)
└── Can be assigned to Museums (JSON)
```

---

## Environment Configuration

In `.env`:

```env
MONGO_URL=mongodb+srv://msatie_db_user:PASSWORD@cluster.mongodb.net/test?retryWrites=true&w=majority
```

This connects your app to **MongoDB Atlas** cloud database.

---

## Summary

| Component | Storage | Purpose |
|-----------|---------|---------|
| **Users** | MongoDB | Authentication, role management |
| **Categories** | MongoDB | Reference data, shared across app |
| **Museums** | JSON | User-created content |
| **Exhibitions** | JSON | Content within museums |

Your app demonstrates a **practical hybrid approach**:
- Secure user data in cloud database
- Simple content data in local files
- Easy to test, develop, and deploy
