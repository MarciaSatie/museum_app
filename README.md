# Museum App

A full-stack web application built with Hapi.js that allows users to create, manage, and explore museums and their exhibitions. This application features user authentication, persistent data storage, and a responsive web interface.

## github project
https://github.com/MarciaSatie/museum_app.git

## Deployment
### [Render.com Deployment](https://museum-app-2-gt46.onrender.com)


## Overview

Museum App is a Node.js web application that enables users to:
- Register and authenticate with secure session-based authentication
- Create and manage multiple museums
- Add exhibitions to museums
- View and delete museums and exhibitions
- Access information about the application

## Technology Stack

### Backend
- **Framework**: Hapi.js 21.4.3
- **Server**: Node.js with ES modules
- **Authentication**: Hapi Cookie authentication strategy
- **Templating**: Handlebars (hbs)
- **Validation**: Joi schema validation
- **Data Storage**: JSON-based persistence with Lowdb

### Database Options
- **Current**: JSON file-based storage (Lowdb)
- **Available**: MongoDB (Mongoose support included)
- **Alternative**: In-memory stores available for testing

### Development Tools
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Testing**: Mocha and Chai
- **Environment**: dotenv for configuration

## Project Structure

```
museum_app/
├── src/
│   ├── server.js                 # Hapi server initialization
│   ├── web-routes.js             # Route configuration
│   ├── controllers/              # Request handlers
│   │   ├── accounts-controller.js
│   │   ├── dashboard-controller.js
│   │   ├── museum-controller.js
│   │   └── about-controller.js
│   ├── models/
│   │   ├── db.js                 # Database initialization
│   │   ├── joi-schemas.js        # Validation schemas
│   │   ├── json/                 # JSON data stores
│   │   │   ├── user-json-store.js
│   │   │   ├── museum-json-store.js
│   │   │   ├── exhibition-json-store.js
│   │   │   └── store-utils.js
│   │   └── mem/                  # In-memory stores (testing)
│   │       ├── user-mem-store.js
│   │       ├── museum-mem-store.js
│   │       └── exhibition-mem-store.js
│   └── views/
│       ├── layouts/
│       │   └── layout.hbs        # Main layout template
│       ├── partials/             # Reusable template components
│       │   ├── menu.hbs
│       │   ├── museum-brand.hbs
│       │   ├── error.hbs
│       │   ├── add-museum.hbs
│       │   ├── list-museums.hbs
│       │   ├── add-exhibitions.hbs
│       │   └── list-exhibitions.hbs
│       ├── login-view.hbs
│       ├── signup-view.hbs
│       ├── about-view.hbs
│       ├── dashboard-view.hbs
│       └── museum-view.hbs
├── test/                         # Test files
│   ├── fixtures.js
│   └── users-model-test.js
├── package.json
├── README.md
└── CHANGELOG.md
```

## Features

### User Management
- **Sign Up**: New users can create an account with email and password
- **Login**: Existing users can authenticate using credentials
- **Sessions**: Secure cookie-based session management
- **Logout**: Users can securely end their session
- **User Profile**: Users can view and update their profile information (name, email)

### Museum Management
- **Create Museum**: Add new museums with names, descriptions, and geographic locations
- **View Dashboard**: See all museums associated with your account
- **Delete Museum**: Remove museums no longer needed
- **Location Data**: Store latitude and longitude coordinates for each museum

### Exhibition Management
- **Add Exhibition**: Add exhibitions to specific museums with title, artist, and duration
- **View Exhibitions**: See all exhibitions within a museum
- **Delete Exhibition**: Remove exhibitions from museums

### Pages
- **Home/Index**: Welcome page with authentication options
- **Dashboard**: Main user hub showing all personal museums
- **Museum Details**: View and manage exhibitions for a specific museum
- **User Profile**: Update personal information (name, email)
- **About**: Information about the application
- **Login/Signup**: Authentication pages

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
npm start
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

### Authentication Routes
- `GET /` - Home page / redirect to dashboard if authenticated
- `GET /signup` - Show signup form
- `POST /register` - Register new user
- `GET /login` - Show login form
- `POST /authenticate` - Authenticate user
- `GET /logout` - Logout user
- `GET /profile` - View and edit user profile
- `POST /profile` - Update user profile

### Dashboard Routes
- `GET /dashboard` - View all museums
- `POST /dashboard/addmuseum` - Add new museum
- `GET /dashboard/deletemuseum/{id}` - Delete a museum

### Museum Routes
- `GET /museum/{id}` - View museum details and exhibitions
- `POST /museum/{id}/addexhibition` - Add exhibition to museum
- `GET /museum/{id}/deleteexhibition/{exhibitionid}` - Delete exhibition

### General Routes
- `GET /about` - About page

## Data Storage

### Current Implementation (JSON)
The application uses Lowdb for JSON file-based persistent storage. Data is stored in:
- `db.json` - Contains all users, museums, and exhibitions

### Data Models

**User**
```javascript
{
  id: string (uuid),
  email: string,
  password: string,
  firstName: string,
  lastName: string
}
```

**Museum**
```javascript
{
  title: string,
  description: string,
  latitude: number (optional),
  longitude: number (optional)
}
```

**Exhibition**
```javascript
{
  id: string (uuid),
  museumid: string (museum id),
  title: string,
  artist: string,
  duration: number (months)useum id),
  title: string,
  description: string
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








## Future Enhancements

- MongoDB integration for scalable data storage
- Advanced search and filtering capabilities
- User roles and permissions
- Metrics and analytics
- API-based architecture
- Docker containerization
