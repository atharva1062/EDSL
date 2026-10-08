# 🏗️ Architecture

## System Architecture

```
                 CAMPUSSWAP
                     │
        ┌────────────┴────────────┐
        │                         │
     Frontend                  Backend
        │                         │
   React / JS              Node.js + Express
        │                         │
        │                  ┌──────┴──────┐
        │                  │             │
        │               REST API      JWT Auth
        │                  │
        └──────────────┬───┘
                       │
                    Prisma ORM
                       │
                  PostgreSQL
                       │
              ┌────────┴────────┐
              │                 │
           Users             Listings
              │                 │
        Transactions          Products
```

---

## Request Flow

```
Student (Browser)
      │
      ▼
  React Frontend
      │  (HTTP / REST API calls)
      ▼
Express.js Backend
      │
   JWT Middleware (Auth Check)
      │
      ▼
  Route Handlers
      │
      ▼
  Prisma ORM
      │
      ▼
  PostgreSQL Database
      │
      ▼
  JSON Response back to Frontend
```

---

## Layer Breakdown

### 🎨 Presentation Layer (Frontend)

- Built with **React.js**
- Communicates with backend via **REST API (HTTP)**
- Handles all UI/UX, routing, and state management
- Sends JWT token in headers for authenticated requests

### ⚙️ Application Layer (Backend)

- Built with **Node.js + Express.js**
- Exposes a **RESTful API**
- Handles business logic, validation, and authentication
- Uses **JWT middleware** to protect private routes

### 🗄️ Data Layer (Database)

- **PostgreSQL** as the primary relational database
- **Prisma ORM** for type-safe database queries
- Schema managed via Prisma migrations

---

## API Design

CampusSwap follows RESTful API conventions:

| Method | Pattern | Example |
|---|---|---|
| GET | Read resource(s) | `GET /api/listings` |
| POST | Create resource | `POST /api/listings` |
| PUT/PATCH | Update resource | `PUT /api/listings/:id` |
| DELETE | Delete resource | `DELETE /api/listings/:id` |

### Key API Endpoints

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login

Listings
  GET    /api/listings
  GET    /api/listings/:id
  POST   /api/listings
  PUT    /api/listings/:id
  DELETE /api/listings/:id

Users
  GET    /api/users/:id
  PUT    /api/users/:id

Messages
  GET    /api/messages/:listingId
  POST   /api/messages

Transactions
  GET    /api/transactions
  POST   /api/transactions
  PUT    /api/transactions/:id
```

---

## Security Architecture

```
Request
   │
   ▼
Rate Limiter (prevents abuse)
   │
   ▼
CORS Check (allowed origins)
   │
   ▼
JWT Verification (for protected routes)
   │
   ▼
Input Validation (sanitize data)
   │
   ▼
Route Handler (business logic)
   │
   ▼
Prisma (safe parameterized queries — prevents SQL injection)
   │
   ▼
Response
```
