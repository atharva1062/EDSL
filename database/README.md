# 🗄️ Database — Schema & Migrations

This folder contains the database schema, migration files, and seed data for EDSL.

## Structure

```
database/
├── README.md          ← This file
├── schema.prisma      ← Prisma schema (source of truth)
└── seed.js            ← Sample seed data for development
```

## Setup

1. Make sure PostgreSQL is running
2. Create a database named `edsl`
3. Add `DATABASE_URL` to your `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/edsl"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. (Optional) Seed the database:
   ```bash
   node database/seed.js
   ```

## Core Tables

| Table | Description |
|---|---|
| `users` | Student accounts |
| `listings` | All marketplace listings |
| `categories` | Product categories |
| `messages` | Chat messages between users |
| `transactions` | Buy/sell/exchange records |
| `notifications` | User notifications |
| `reports` | Reported users and listings |
