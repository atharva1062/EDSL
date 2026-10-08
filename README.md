# 🎓 EDSL
### Entrepreneurship Development Student Lab

> EDSL is a college-focused marketplace that allows students to **buy, sell, exchange and donate** used items such as books, calculators, electronics, hostel items and other useful products.

---

## 📋 Table of Contents

- [A. Project Overview](#a-project-overview)
- [B. Problem Statement](#b-problem-statement)
- [C. Our Vision](#c-our-vision)
- [D. Key Features](#d-key-features)
- [E. Core Modules](#e-core-modules)
- [F. Future Scope](#f-future-scope)
- [G. Tech Stack](#g-tech-stack)
- [H. Authentication & Security](#h-authentication--security)
- [I. Project Architecture](#i-project-architecture)
- [J. Database Design](#j-database-design)

---

## A. Project Overview

**EDSL (Entrepreneurship Development Student Lab)** is a dedicated student marketplace platform built for college communities. It bridges the gap between students who have items they no longer need and students who need those items — creating a sustainable, affordable, and trustworthy campus economy.

Whether it's textbooks from last semester, a calculator no longer in use, or hostel essentials, EDSL makes it easy to list, discover, and transact — all within a verified student community.

---

## B. Problem Statement

Students often have items they no longer need after completing a semester or graduating.

At the same time, other students need the same items but may not want to purchase them at full price.

Currently, students mainly depend on:

- 📱 WhatsApp groups
- 👥 Friends
- 📌 College notice boards
- 🌐 Random social-media groups
- 🗣️ Offline communication

This makes buying and selling items **slow, unorganized and less trustworthy**.

---

## C. Our Vision

> 🎯 To create a **safe and affordable student marketplace** where college students can easily buy, sell, exchange and donate items within their campus community.

We envision EDSL becoming the go-to platform for every college student — reducing waste, saving money, and building a connected campus community.

---

## D. Key Features

### 👤 User Management
- Student registration
- Login / Logout
- Student profile
- College verification

### 🛒 Marketplace
- Create listings
- Upload product images
- Search products
- Filter by category
- View product details

### 💬 Communication
- Contact seller
- Chat between students
- Seller information

### 🔄 Transactions
- Buy / sell requests
- Exchange items
- Donation option
- Transaction history

### 🛡️ Safety
- User verification
- Report listing
- Report user
- Admin moderation

---

## E. Core Modules

| Module | Purpose |
|---|---|
| 🏠 Dashboard | Overview of marketplace |
| 👥 Users | Manage student accounts |
| 📦 Listings | Buy/sell products |
| 🗂️ Categories | Organize products |
| 🔍 Search | Find required items |
| 💬 Chat | Buyer-seller communication |
| 💳 Transactions | Manage purchases/exchanges |
| 🔔 Notifications | Important updates |
| ⚙️ Admin | Manage platform |

---

## F. Future Scope

EDSL can later be expanded with:

- 🤖 **AI-based product recommendations**
- 📍 **Campus-based location filtering**
- 💳 **Online payments**
- ⭐ **Seller ratings & reviews**
- 🔔 **Smart notifications**
- 📊 **Marketplace analytics**
- 📱 **Mobile application**
- 🔐 **College ID verification**
- 🤖 **AI chatbot for marketplace assistance**

---

## G. Tech Stack

```
Frontend
├── HTML
├── CSS
├── JavaScript
└── React

Backend
├── Node.js
├── Express.js
└── JWT Authentication

Database
├── PostgreSQL
└── Prisma ORM

Deployment
├── Vercel (Frontend)
└── Render / Railway (Backend)
```

---

## H. Authentication & Security

EDSL uses a robust, multi-layered security approach:

| Layer | Technology | Purpose |
|---|---|---|
| Authentication | JWT (JSON Web Tokens) | Secure session management |
| Password Security | bcrypt hashing | Protect user credentials |
| College Verification | Email domain check | Ensure only students join |
| Authorization | Role-based access control | Separate user & admin powers |
| Data Validation | Server-side validation | Prevent malicious input |
| Report System | Admin moderation queue | Handle abuse/spam listings |

---

## I. Project Architecture

```
                    EDSL
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

### Request Flow

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
```

---

## J. Database Design

### Core Tables

```
┌─────────────────┐      ┌─────────────────┐
│     USERS        │      │    LISTINGS      │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │──┐   │ id (PK)         │
│ name            │  │   │ title           │
│ email           │  │   │ description     │
│ password_hash   │  │   │ price           │
│ college         │  │   │ category        │
│ is_verified     │  └──▶│ seller_id (FK)  │
│ role            │      │ type            │
│ created_at      │      │ status          │
└─────────────────┘      │ images          │
                          │ created_at      │
                          └─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  TRANSACTIONS   │      │    MESSAGES      │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ listing_id (FK) │      │ sender_id (FK)  │
│ buyer_id (FK)   │      │ receiver_id(FK) │
│ seller_id (FK)  │      │ listing_id (FK) │
│ type            │      │ content         │
│ status          │      │ created_at      │
│ created_at      │      └─────────────────┘
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│   CATEGORIES    │      │  NOTIFICATIONS  │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ name            │      │ user_id (FK)    │
│ description     │      │ message         │
│ icon            │      │ is_read         │
└─────────────────┘      │ created_at      │
                          └─────────────────┘
```

### Listing Types
- **Sell** — Student wants to sell the item
- **Buy** — Student is looking to buy an item
- **Exchange** — Student wants to swap items
- **Donate** — Student wants to give away for free

---

## 📁 Project Structure

```
EDSL/
│
├── README.md
├── docs/
│   ├── project-overview.md
│   ├── problem-statement.md
│   ├── features.md
│   ├── modules.md
│   ├── future-scope.md
│   ├── tech-stack.md
│   └── architecture.md
│
├── frontend/          ← React + JS (UI)
├── backend/           ← Node.js + Express (API)
└── database/          ← Schema & migrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/atharva1062/campus-swap.git
cd campus-swap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/edsl"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

### Run the App

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm start
```

---

<div align="center">

**Made with ❤️ for students, by students**

*EDSL — Entrepreneurship Development Student Lab*

</div>
