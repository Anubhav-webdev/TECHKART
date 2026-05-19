# TechKart E-Commerce Website

A full-stack e-commerce website built with a React + Vite frontend and an Express + MongoDB backend. The application offers product browsing, category collections, user authentication, cart/wishlist management, admin product management, and a modern responsive UI.

## 🚀 Project Overview

TechKart is designed as a technology e-commerce store featuring:
- Hero landing and promotional sections
- Product carousels for mobile, laptop, gadget, book, and t-shirt categories
- Lazy-loaded homepage sections for performance
- News, testimonials, blog, and brand showcase sections
- Backend REST API for auth, product data, billing, feedback, and more
- Image/file upload support via `multer`
- MongoDB database integration

## 📁 Repository Structure

- `Backend/` - Express API server
  - `Server.js` - main backend server entry point
  - `connect.js` - MongoDB connection helper
  - `server/routes/` - route definitions for products, auth, billing, blogs, books, electronics, tshirts, news, geocode, users, feedback
  - `scripts/createAdmin.js` - admin creation helper script
  - `uploads/` - static upload directory for avatars and assets
- `E-frontend/` - React frontend application
  - `src/` - React source files
  - `src/components/` - shared UI components
  - `src/MainComponents/` - page-level components and route pages
  - `public/` - static assets and images

## 🧰 Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth & utilities: `bcrypt`, `dotenv`, `cors`, `multer`, `axios`

## 🔧 Prerequisites

- Node.js 18+ installed
- npm or yarn
- MongoDB database instance or MongoDB Atlas URI

## ⚙️ Environment Variables

Create a `.env` file in `Backend/` with the following values:

```env
MONGODB_URI=<your-mongodb-connection-uri>
DB_NAME=<your-database-name>
PORT=7000
```

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net
DB_NAME=techkart
PORT=7000
```

## 🏃‍♂️ Run Locally

### Backend

```bash
cd Backend
npm install
npm run start
```

The backend server starts on `http://localhost:7000` by default.

### Frontend

```bash
cd E-frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, typically `http://localhost:5173`.

## 📦 Build for Production

### Build Frontend

```bash
cd E-frontend
npm run build
```

### Preview Frontend Build

```bash
npm run preview
```

## 🧪 Admin Setup

To create an admin user, run the admin script from the backend:

```bash
cd Backend
npm run create-admin
```

## 🌐 API Endpoints

The backend exposes endpoints under `/api` for the following resources:

- `/api/products`
- `/api/auth`
- `/api/billing`
- `/api/blogs`
- `/api/books`
- `/api/electronics`
- `/api/tshirts`
- `/api/news`
- `/api/geocode`
- `/api/users`
- `/api/feedback`

Also available:
- `GET /` health check route

## ✅ Features

- Category-based product listings
- Homepage promotions and content sections
- Admin routes for product/blog/book/tshirt management
- User registration and login flow
- Billing and order support routes
- Feedback and contact handling
- Static asset serving for uploads and product images

## 📌 Notes

- The frontend is configured as a private Vite project.
- The backend uses ES modules (`type: module`).
- Make sure MongoDB connection values are correct in `Backend/.env`.

## 📚 Useful Commands

```bash
# Start backend
cd Backend && npm run start

# Start frontend dev server
cd E-frontend && npm run dev

# Build frontend
cd E-frontend && npm run build
```

## 🙌 Contribution

Feel free to extend the site with:
- complete cart and checkout flows
- payment gateway integration
- user profile pages
- admin dashboard UI
- search, filtering, and sorting

---

Built as a modern full-stack e-commerce demo for TechKart.
