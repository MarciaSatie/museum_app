# Like Button Implementation Flow

## Overview
This document explains how the "Like" feature works in the Museum App, from the user clicking the button all the way to saving in MongoDB.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User clicks ❤️ like button                                      │
│     └─> JavaScript event listener triggers                         │
│                                                                     │
│  2. Frontend JavaScript (galleries-view.hbs / imageGallery-view)   │
│     ├─> Gets imageId and userId                                    │
│     ├─> Calls fetch('/api/images/{publicId}/like')                │
│     ├─> Sends POST request with JWT token                         │
│     └─> Updates UI: like count +1, button color changes           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ⬇️  HTTP POST
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Backend)                         │
├─────────────────────────────────────────────────────────────────────┤
│  (src/api/image-api.ts)                                            │
│                                                                     │
│  3. Express/Hapi route handler receives request                    │
│     ├─> Extracts publicId from URL                                 │
│     ├─> Extracts userId from JWT token (request.auth.credentials)  │
│     ├─> Validates user is authenticated                           │
│     └─> Calls db.imageStore.likeImage(publicId, userId)           │
│                                                                     │
│  4. Returns JSON response:                                         │
│     └─> { success: true, likeCount: 42 }                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ⬇️  Method Call
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                         │
├─────────────────────────────────────────────────────────────────────┤
│  (src/models/mongo/image-mongo-store.ts)                           │
│                                                                     │
│  5. likeImage(publicId, userId) method:                            │
│     ├─> Find image by publicId                                     │
│     ├─> Check if userId already in likedBy[] array                │
│     ├─> If not, add userId to likedBy[]                           │
│     ├─> Recalculate likeCount = likedBy.length                    │
│     ├─> Call image.save() to persist to MongoDB                   │
│     └─> Return updated image object                               │
│                                                                     │
│  6. MongoDB Document Updated:                                      │
│     Before: { likeCount: 41, likedBy: [user1, user2, ...] }       │
│     After:  { likeCount: 42, likedBy: [user1, user2, ..., user3] }│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ⬇️  Response JSON
┌─────────────────────────────────────────────────────────────────────┐
│                    BACK TO BROWSER & UI UPDATE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  7. JavaScript fetch receives response                             │
│     ├─> Parses JSON: { success: true, likeCount: 42 }            │
│     ├─> Updates DOM: changes like count display to "42"           │
│     ├─> Changes heart color from gray to red (#ff3860)            │
│     └─> User sees instant feedback (no page reload needed!)       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation Breakdown

### **Layer 1: DATABASE SCHEMA (MongoDB)**
**File:** `src/models/mongo/image.ts`

```typescript
likeCount: { type: Number, default: 0 },      // How many likes total
likedBy: { type: [String], default: [] },     // Array of user IDs who liked
```

**Purpose:** Define where like data is stored in MongoDB documents.

---

### **Layer 2: DATABASE METHODS (Data Layer)**
**File:** `src/models/mongo/image-mongo-store.ts`

Three methods handle all like operations:

#### **2a. Add Like**
```typescript
async likeImage(publicId: string, userId: string)
```
- Finds image
- Checks if user already liked (prevent duplicates)
- Adds userId to `likedBy` array
- Updates `likeCount`
- Saves to MongoDB

#### **2b. Remove Like**
```typescript
async unlikeImage(publicId: string, userId: string)
```
- Finds image
- Removes userId from `likedBy` array
- Updates `likeCount`
- Saves to MongoDB

#### **2c. Check Status**
```typescript
async isLikedByUser(publicId: string, userId: string)
```
- Returns `true/false` if user has liked this image
- Used to show/hide "already liked" UI state

---

### **Layer 3: API ENDPOINTS (REST Layer)**
**File:** `src/api/image-api.ts`

Creates HTTP endpoints that accept requests:

```typescript
POST /api/images/{publicId}/like
```
- Receives: publicId in URL, userId from JWT token
- Calls: `db.imageStore.likeImage(publicId, userId)`
- Returns: `{ success: true, likeCount: 42 }`

```typescript
POST /api/images/{publicId}/unlike
```
- Similar to above, but calls `unlikeImage()` instead

```typescript
GET /api/images/{publicId}/isLiked
```
- Checks if current user liked this image
- Returns: `{ isLiked: true }` or `{ isLiked: false }`

---

### **Layer 4: ROUTE REGISTRATION**
**File:** `src/api-routes.ts`

Register the endpoints so they're accessible:

```typescript
import { imageApi } from "./api/image-api.js";

export const apiRoutes = [
  { method: "POST", path: "/api/images/{publicId}/like", config: imageApi.likeImage },
  { method: "POST", path: "/api/images/{publicId}/unlike", config: imageApi.unlikeImage },
  { method: "GET", path: "/api/images/{publicId}/isLiked", config: imageApi.isLiked },
  // ... other routes
];
```

---

### **Layer 5: FRONTEND - VIEW TEMPLATE**
**File:** `src/views/partials/image-card-view.hbs`

Display the like button in HTML:

```handlebars
<button class="like-btn" data-public-id="{{id}}">
  <i class="fas fa-heart"></i>
  <span class="like-count">{{likeCount}}</span>
</button>
```

---

### **Layer 6: FRONTEND - JAVASCRIPT EVENT HANDLER**
**File:** `src/views/galleries-view.hbs` or `imageGallery-view.hbs`

Add click handler:

```javascript
document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const publicId = btn.dataset.publicId;
    
    // Call API
    const response = await fetch(`/api/images/${publicId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
    });
    
    const data = await response.json();
    
    // Update UI
    btn.querySelector('.like-count').textContent = data.likeCount;
    btn.style.color = '#ff3860';  // Change to red
  });
});
```

---

## Data Flow Summary

```
USER ACTION
    ⬇️
Frontend JavaScript (event listener)
    ⬇️
HTTP POST /api/images/{publicId}/like
    ⬇️
Backend API Handler (image-api.ts)
    ⬇️
Database Method (image-mongo-store.ts)
    ⬇️
MongoDB Query & Save
    ⬇️
Return Updated Image Data
    ⬇️
HTTP Response { likeCount: 42 }
    ⬇️
Frontend Updates DOM (no page reload!)
    ⬇️
USER SEES: ❤️ count changed from 41 to 42
```

---

## Key Concepts

| Component | Purpose | File |
|-----------|---------|------|
| **Schema** | Defines fields in MongoDB | `image.ts` |
| **Store Methods** | Business logic for database operations | `image-mongo-store.ts` |
| **API Handlers** | HTTP endpoint logic | `image-api.ts` |
| **Routes** | Register API endpoints | `api-routes.ts` |
| **View (Template)** | HTML for like button | `image-card-view.hbs` |
| **Event Handlers** | JavaScript to handle clicks | `galleries-view.hbs` |

---

## Security Features Included

1. **JWT Authentication** - Only logged-in users can like (token in header)
2. **User ID from Token** - Backend extracts userId from JWT, not from user input
3. **Duplicate Prevention** - likeImage() checks if user already liked (no double-counting)
4. **Error Handling** - Try-catch blocks in all methods

---

## Real-World Example

### User: Homer clicks like on dinosaur image

```json
// 1. Request sent
POST /api/images/museum/dinosaur-skeleton/like
Header: Authorization: Bearer eyJhbGc...
Body: (empty, all data in URL)

// 2. Backend finds image in MongoDB
{
  publicId: "museum/dinosaur-skeleton",
  likeCount: 41,
  likedBy: ["user-1", "user-2", "user-3"],
  museumTitle: "Natural History Museum",
  ...
}

// 3. Backend adds Homer's ID
likedBy: ["user-1", "user-2", "user-3", "homer-123"]
likeCount: 42

// 4. Save to MongoDB

// 5. Return response to browser
{
  success: true,
  likeCount: 42
}

// 6. Browser updates UI
❤️ 42  (was 41)

// 7. Heart icon turns red
```

---

## What Happens With Unlike

Same flow, but:
- API endpoint: `POST /api/images/{publicId}/unlike`
- Database method: `unlikeImage()` 
- Removes userId from `likedBy` array
- Decrements `likeCount`
- Result: ❤️ becomes gray again, count decreases

---

## Testing the Feature

```bash
# 1. User logs in (gets JWT token)
POST /api/authenticate

# 2. User likes an image
POST /api/images/{publicId}/like
Authorization: Bearer {token}

# 3. Check if user liked it
GET /api/images/{publicId}/isLiked
Authorization: Bearer {token}
Response: { isLiked: true }

# 4. User unlikes
POST /api/images/{publicId}/unlike
Authorization: Bearer {token}

# 5. Check again
GET /api/images/{publicId}/isLiked
Authorization: Bearer {token}
Response: { isLiked: false }
```

