# Museum App

A full-stack web application built with Hapi.js that allows users to create, manage, and explore museums, categories, and exhibitions. This application features user authentication, persistent MongoDB storage, a responsive web interface, and a comprehensive REST API with Swagger documentation.

## 🔗 Links

- **GitHub Repository**: https://github.com/MarciaSatie/museum_app.git
- **Live Deployment**: https://museum-app-2-bo7c.onrender.com
- **API Documentation (Swagger)**: http://localhost:3000/documentation *(when running locally)*

## 📚 API Documentation

Access interactive API documentation with Swagger UI:
- **Local**: http://localhost:3000/documentation
- **Production**: https://museum-app-2-bo7c.onrender.com/documentation

The Swagger documentation provides:
- Complete API endpoint reference
- Request/response schemas
- Interactive "Try it out" functionality
- Joi validation details

## Run MongoDB Locally
```bash
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\SETU\Semester3\FullStack1\Assigment\museum_app\data\db"
```


## Overview

Museum App is a Node.js web application that enables users to:
- Register and authenticate with secure session-based authentication
- Create and manage multiple museums with geographic locations
- Organize museums into categories
- Add and manage exhibitions within museums
- Access a comprehensive REST API for all resources
- View interactive API documentation via Swagger
- Admin user management and analytics

## Technology Stack

### Backend
- **Framework**: Hapi.js 21.4.3
- **Runtime**: Node.js with ES modules
- **Authentication**: Cookie-based (web) + JWT-ready (API)
- **Templating**: Handlebars (hbs)
- **Validation**: Joi schema validation
- **API Documentation**: Swagger/OpenAPI (hapi-swagger)

### Database
- **Primary**: MongoDB with Mongoose ODM
- **Users & Categories**: MongoDB (persistent, scalable)
- **Museums & Exhibitions**: JSON file-based (Lowdb) with MongoDB migration path
- **Development**: In-memory stores available for testing (MEM)

### REST API
- **Museums**: Full CRUD (GET, POST, PUT, DELETE)
- **Categories**: Full CRUD (GET, POST, PUT, DELETE)
- **Exhibitions**: Full CRUD (GET, POST, PUT, DELETE)
- **Documentation**: Swagger UI at `/documentation`
- **Total Endpoints**: 16 REST API endpoints

### Development Tools
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Testing**: Mocha and Chai
- **Environment**: dotenv for configuration

## Project Structure

```
museum_app/
├── src/
│   ├── server.js                 # Hapi server with Swagger config
│   ├── web-routes.js             # Web route configuration
│   ├── api-routes.js             # REST API route configuration
│   ├── api/                      # REST API handlers
│   │   ├── museum-api.js         # Museum API endpoints
│   │   ├── category-api.js       # Category API endpoints
│   │   └── exhibition-api.js     # Exhibition API endpoints
│   ├── controllers/              # Web request handlers
│   │   ├── accounts-controller.js
│   │   ├── dashboard-controller.js
│   │   ├── museum-controller.js
│   │   ├── category-controller.js
│   │   ├── admin-controller.js
│   │   └── imageGallery-controller.js
│   ├── models/
│   │   ├── db.js                 # Database initialization
│   │   ├── joi-schemas.js        # Validation schemas
│   │   ├── json/                 # JSON data stores
│   │   │   ├── user-json-store.js
│   │   │   ├── museum-json-store.js
│   │   │   └── exhibition-json-store.js
│   │   ├── mongo/                # MongoDB stores
│   │   │   ├── connect.js        # MongoDB connection
│   │   │   ├── user-mongo-store.js
│   │   │   ├── user.js           # User schema
│   │   │   ├── category-mongo-store.js
│   │   │   └── category.js       # Category schema
│   │   └── mem/                  # In-memory stores (testing)
│   │       ├── user-mem-store.js
│   │       ├── museum-mem-store.js
│   │       └── exhibition-mem-store.js
│   └── views/
│       ├── layouts/
│       │   └── layout.hbs        # Main layout template
│       ├── partials/             # Reusable template components
│       ├── login-view.hbs
│       ├── signup-view.hbs
│       ├── imageGallery-view.hbs
│       ├── dashboard-view.hbs
│       ├── museum-view.hbs
│       ├── category-list-view.hbs
│       └── admin-users.hbs
├── test/                         # Test files
│   ├── fixtures.js
│   ├── users-model-test.js
│   ├── museum-model-test.js
│   └── exhibition-model-test.js
├── data/db/                      # MongoDB local database
├── package.json
├── README.md
├── CHANGELOG.md
└── ASSIGNMENT_REQUIREMENTS.md
```

## Features

### User Management
- **Sign Up**: New users can create an account with email and password
- **Login**: Existing users can authenticate using credentials
- **Sessions**: Secure cookie-based session management
- **Logout**: Users can securely end their session
- **User Profile**: Users can view and update their profile information (name, email)
- **Admin Role**: Admin users can manage other users

### Museum Management
- **Create Museum**: Add new museums with names, descriptions, and geographic locations
- **View Dashboard**: See all museums associated with your account
- **Update Museum**: Edit museum information
- **Delete Museum**: Remove museums no longer needed
- **Location Data**: Store latitude and longitude coordinates for each museum
- **Categorization**: Assign museums to categories for organization

### Category Management
- **Create Category**: Add new categories to organize museums
- **View Categories**: See all available categories
- **Update Category**: Edit category information
- **Delete Category**: Remove unused categories
- **Category Assignment**: Link museums to categories

### Exhibition Management
- **Add Exhibition**: Add exhibitions to specific museums with title, artist, and duration
- **View Exhibitions**: See all exhibitions within a museum
- **Update Exhibition**: Edit exhibition details
- **Delete Exhibition**: Remove exhibitions from museums

### REST API
- **Museum API**: 5 endpoints (GET all, GET one, POST, PUT, DELETE)
- **Category API**: 5 endpoints (GET all, GET one, POST, PUT, DELETE)
- **Exhibition API**: 6 endpoints (GET all, GET one, GET by museum, POST, PUT, DELETE)
- **Swagger Documentation**: Interactive API documentation at `/documentation`
- **Joi Validation**: All endpoints have request validation
- **Error Handling**: Comprehensive error responses

### Pages
- **Home/Index**: Welcome page with authentication options
- **Dashboard**: Main user hub showing all personal museums
- **Museum Details**: View and manage exhibitions for a specific museum
- **Categories**: Manage and view museum categories
- **User Profile**: Update personal information (name, email)
- **Admin Panel**: User management interface (admin only)
- **imageGallery**: Information imageGallery the application
- **Login/Signup**: Authentication pages
- **API Documentation**: Swagger UI for API exploration

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd museum_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   cookie_name=app_museum-cookie
   cookie_password=your-secret-password-here
   ```

4. **Initialize the database**
   The application will automatically create JSON data stores on first run.

## Running the Application

### Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Run linting
```bash
npm run lint
```

### Run tests
```bash
npm test
```

## API Routes

### Web Routes (Authentication Required)

#### Authentication Routes
- `GET /` - Home page / redirect to dashboard if authenticated
- `GET /signup` - Show signup form
- `POST /register` - Register new user
- `GET /login` - Show login form
- `POST /authenticate` - Authenticate user
- `GET /logout` - Logout user
- `GET /profile` - View and edit user profile
- `POST /profile` - Update user profile

#### Dashboard Routes
- `GET /dashboard` - View all museums
- `POST /dashboard/addmuseum` - Add new museum
- `GET /dashboard/deletemuseum/{id}` - Delete a museum

#### Museum Routes
- `GET /museum/{id}` - View museum details and exhibitions
- `POST /museum/{id}/addexhibition` - Add exhibition to museum
- `GET /museum/{id}/deleteexhibition/{exhibitionid}` - Delete exhibition

#### Category Routes
- `GET /categories` - View all categories
- `POST /categories/add` - Add new category
- `GET /categories/delete/{id}` - Delete category

#### Admin Routes (Admin Only)
- `GET /admin/users` - View all users
- `GET /admin/deleteuser/{id}` - Delete user
- `GET /admin/toggleadmin/{id}` - Toggle admin role

#### General Routes
- `GET /imageGallery` - imageGallery page

---

### REST API Routes (No Authentication)

Access interactive documentation at: **http://localhost:3000/documentation**

#### Museum Endpoints
- `GET /api/museums` - Get all museums
- `GET /api/museums/{id}` - Get single museum by ID
- `POST /api/museums` - Create new museum
  - Body: `{ title, description, latitude, longitude }`
- `PUT /api/museums/{id}` - Update museum
  - Body: `{ title, description, latitude, longitude }`
- `DELETE /api/museums/{id}` - Delete museum

#### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get single category by ID
- `POST /api/categories` - Create new category
  - Body: `{ name, description? }`
- `PUT /api/categories/{id}` - Update category
  - Body: `{ name, description? }`
- `DELETE /api/categories/{id}` - Delete category

#### Exhibition Endpoints
- `GET /api/exhibitions` - Get all exhibitions
- `GET /api/exhibitions/{id}` - Get single exhibition by ID
- `GET /api/museums/{museumId}/exhibitions` - Get exhibitions for a museum
- `POST /api/museums/{museumId}/exhibitions` - Create exhibition for museum
  - Body: `{ title, artist, duration }`
- `PUT /api/exhibitions/{id}` - Update exhibition
  - Body: `{ title, artist, duration }`
- `DELETE /api/exhibitions/{id}` - Delete exhibition

## Data Storage

### Current Implementation
The application uses a hybrid storage approach:
- **Users & Categories**: MongoDB (persistent, scalable, cloud-ready)
- **Museums & Exhibitions**: JSON file-based (Lowdb) with MongoDB migration path
- **Development/Testing**: In-memory stores available

### MongoDB Connection
- Local: `mongodb://127.0.0.1:27017/museum`
- Cloud: MongoDB Atlas (configured via environment variables)

### Data Models

**User** (MongoDB)
```javascript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: string ("admin" or null)
}
```

**Category** (MongoDB)
```javascript
{
  _id: string (UUID),
  name: string,
  description: string (optional),
  location: string (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Museum** (JSON/Lowdb)
```javascript
{
  _id: string (UUID),
  userid: string,
  title: string,
  description: string,
  latitude: number,
  longitude: number,
  categoryId: string (optional),
  exhibitions: array
}
```

**Exhibition** (JSON/Lowdb)
```javascript
{
  _id: string (UUID),
  museumid: string,
  title: string,
  artist: string,
  duration: number (days)
}
```

## Validation

The application uses Joi for comprehensive input validation:
- Email format validation
- Password requirements
- Required fields validation
- Data type validation
- Custom business logic validation

See `src/models/joi-schemas.js` for complete validation rules.

## Testing

The project includes comprehensive test suites for all model operations:

```bash
npm test
```

### Test Coverage
- **Users Model**: Create, retrieve, update, and delete user operations
- **Museums Model**: Create, retrieve, and delete museum operations with location data
- **Exhibitions Model**: Create, retrieve, update, and delete exhibition operations

Tests use:
- **Mocha**: Test runner
- **Chai**: Assertion library
- **Fixtures**: Sample test data (users, museums, exhibitions)

## Code Quality

### ESLint Configuration
Uses Airbnb ESLint configuration with custom rules for code consistency:
```bash
npm run lint
```

### Code Formatting
Prettier is configured for automatic code formatting.








## Current Status (Level 3)

✅ **Completed Features**
- Full REST API with 16 endpoints (Museums, Categories, Exhibitions)
- Swagger/OpenAPI documentation at `/documentation`
- MongoDB integration for Users and Categories
- Category management system
- Admin user management interface
- Comprehensive Joi validation for all API endpoints
- Error handling with Boom
- Model testing with Mocha/Chai
- Cloud deployment on Render.com

## Future Enhancements (Level 4+)

- JWT authentication for API endpoints
- Image upload and storage for museums
- Advanced analytics dashboard
- User behavior tracking
- Full MongoDB migration (museums + exhibitions)
- API endpoint testing suite
- Docker containerization
- Real-time updates with WebSockets
- Museum sharing and reviews
- Geolocation features with maps integration

