# 🛒 ApexStore — E-Commerce Platform

A full-stack e-commerce web application built with modern technologies, featuring a complete shopping experience with product management, cart functionality, secure payments via Razorpay, and an admin dashboard.

---

## 🚀 Features

### Customer Features
- 🔐 **Authentication** — JWT access + refresh tokens, secure httpOnly cookies, password reset flow
- 🛍️ **Product Browsing** — Search, filter by category/price/brand, sort by price/rating/newest
- 📦 **Product Details** — Image gallery, reviews, stock status, add-to-cart with quantity selector
- 🛒 **Shopping Cart** — Persistent cart (localStorage + backend sync), quantity steppers, real-time subtotal
- 📋 **Checkout Flow** — Multi-step checkout (shipping address → order review → payment)
- 💳 **Payments** — Razorpay integration with signature verification and webhook support
- 📜 **Order History** — View past orders with status tracking (pending → processing → shipped → delivered)
- ⭐ **Reviews** — Add and manage product reviews with ratings

### Admin Features
- 🎛️ **Dashboard** — Summary cards (revenue, orders, users, products), sales chart, top products
- 📦 **Product Management** — Create/edit/delete products with multi-image upload
- 📂 **Category Management** — Hierarchical categories with parent/child relationships
- 📋 **Order Management** — View all orders, filter by status, update order status
- 👥 **User Management** — View users, change roles, activate/deactivate accounts

### Security & Performance
- 🛡️ **Security** — Helmet, CORS, rate limiting, input validation with Zod
- 🔒 **Password Hashing** — bcrypt with salt rounds
- 🚦 **Rate Limiting** — 100 requests per 15 minutes
- ✅ **Input Validation** — Zod schemas on all routes
- 🔑 **Role-Based Access** — Admin-only routes with `authorize('admin')`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (Access + Refresh Tokens) + bcryptjs |
| **Payment** | Razorpay |
| **State** | Zustand (client-side cart/auth) |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Validation** | Zod (server + client) |
| **File Upload** | Multer + Cloudinary (with local fallback) |

---

## 📁 Project Structure

```
intern project/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── api/                     # Axios instance with interceptors
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components
│   │   │   └── admin/               # Admin dashboard pages
│   │   ├── store/                   # Zustand stores (auth, cart)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── utils/                   # Client utilities
│   │   ├── App.tsx                  # Router setup
│   │   └── main.tsx                 # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Express + TypeScript backend
│   ├── src/
│   │   ├── config/                  # Environment & DB config
│   │   ├── models/                  # Mongoose schemas & models
│   │   ├── routes/                  # Express route definitions
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/              # Auth, validation, upload, error handling
│   │   ├── services/                # Business logic (placeholder)
│   │   ├── utils/                   # Helpers (auth, cloudinary, slugify)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── docs/                    # OpenAPI spec
│   │   └── server.ts                # App entry point
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── DATABASE_SCHEMA.md               # ERD & collection docs
├── README.md
├── .gitignore
└── package.json                     # Root workspace config
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas/database))
- **Razorpay** account ([dashboard](https://dashboard.razorpay.com/app/keys))
- **Cloudinary** account ([console](https://cloudinary.com/console)) — optional, for production image uploads

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd intern project
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

```bash
# In the /server directory, copy the example env file
cp server/.env.example server/.env
```

Edit `server/.env` with your values:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-strong-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-strong-refresh-secret-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie
COOKIE_SECRET=your-cookie-signing-secret

# Razorpay (get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Ensure MongoDB is running

```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 5. Run development servers

```bash
# From the root directory, run both client and server:
npm run dev

# Or run them separately:
cd server && npm run dev      # Backend on http://localhost:5000
cd client && npm run dev      # Frontend on http://localhost:5173
```

---

## 🌐 API Documentation

- **Interactive Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **OpenAPI Spec**: [`server/src/docs/openapi.yaml`](./server/src/docs/openapi.yaml)

---

## 📸 Screenshots

> Add screenshots of your application here.

| Page | Description |
|------|-------------|
| Home | Hero section with navigation |
| Products | Product grid with filters |
| Product Detail | Image gallery, reviews, add-to-cart |
| Cart | Cart drawer with quantity controls |
| Checkout | Multi-step checkout flow |
| Admin Dashboard | Stats cards, sales chart, top products |
| Admin Orders | Order table with status management |
| Admin Users | User list with role/status controls |

---

## 🚀 Deployment Notes

### Backend (Render / Railway / Heroku)

1. Set all environment variables in your hosting platform's dashboard
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Build command: `cd server && npm install && npm run build`
4. Start command: `cd server && npm start`

### Frontend (Vercel / Netlify)

1. Set `VITE_API_URL` to your backend URL
2. Build command: `cd client && npm install && npm run build`
3. Output directory: `client/dist`

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong, unique secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Configure Razorpay webhook URL in dashboard: `https://your-domain.com/api/payments/webhook`
- Set `CLIENT_URL` to your deployed frontend URL
- Enable HTTPS in production (`secure: true` cookies)

---

## 📄 License

This project is licensed under the MIT License.
