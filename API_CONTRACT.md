# 📋 CampusSwap API Contract

This document serves as the formal interface contract between Frontend (Student 1) and Backend (Students 2, 3, & 4).

## Base URL
```
http://localhost:5000/api
```

## Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (for protected endpoints)

---

## 1. Authentication & Users (Student 4)

### `POST /auth/register`
**Body:**
```json
{
  "name": "Atharva Patil",
  "email": "atharva@college.edu",
  "password": "password123",
  "collegeId": "CS-2024-042",
  "campus": "Main Engineering Campus",
  "phone": "+91 9876543210"
}
```

### `POST /auth/login`
**Body:**
```json
{
  "email": "atharva@college.edu",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "Atharva Patil",
    "email": "atharva@college.edu",
    "role": "STUDENT"
  }
}
```

### `GET /auth/me`
Returns the current authenticated user profile, listing count, average star rating, and unread notification count.

---

## 2. Marketplace & Listings (Student 2)

### `GET /listings`
**Query Parameters:**
- `search`: string
- `category`: slug or id
- `type`: `SELL` | `RENT` | `SWAP` | `ALL`
- `condition`: `BRAND_NEW` | `LIKE_NEW` | `GOOD` | `FAIR` | `ALL`
- `minPrice`: number
- `maxPrice`: number
- `sortBy`: `newest` | `price_asc` | `price_desc` | `popular`

### `POST /listings` *(Auth Required)*
**Body:**
```json
{
  "title": "Casio fx-991EX Scientific Calculator",
  "description": "Used 2 semesters, perfect condition.",
  "categoryId": 2,
  "type": "SELL",
  "price": 650,
  "originalPrice": 1450,
  "condition": "LIKE_NEW",
  "imageUrl": "https://...",
  "pickupLocation": "Main Library Ground Floor"
}
```

---

## 3. Transactions, Deals & Swaps (Student 3)

### `POST /transactions` *(Auth Required)*
**Body:**
```json
{
  "listingId": 1,
  "type": "SWAP",
  "swapItemDetails": "Offering Operating Systems 10th Edition in exchange.",
  "meetLocation": "Main Library 2nd Floor",
  "note": "Let's meet tomorrow at 2 PM!"
}
```

### `PUT /transactions/:id/status` *(Auth Required)*
**Body:**
```json
{
  "status": "ACCEPTED" // "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED"
}
```

---

## 4. Reviews & Ratings (Student 3 & 4)

### `POST /reviews` *(Auth Required)*
**Body:**
```json
{
  "transactionId": 1,
  "rating": 5,
  "comment": "Super prompt, calculator works perfectly!"
}
```
