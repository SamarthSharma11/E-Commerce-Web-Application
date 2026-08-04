# 🛒 E-Commerce Platform

A full-stack e-commerce web application built with modern technologies, featuring a complete shopping experience with product management, cart functionality, secure payments, and an admin dashboard.

---

## 🚀 Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| **Frontend** | React 18 + TypeScript + Vite                   |
| **Backend**  | Node.js + Express + TypeScript                  |
| **Database** | MongoDB + Mongoose                              |
| **Auth**     | JWT (Access + Refresh Tokens) + bcryptjs        |
| **Payment**  | Stripe                                          |
| **State**    | Zustand + Redux Toolkit                         |
| **Styling**  | Vanilla CSS (Custom Design System)              |
| **Validation** | Zod (server + client)                        |

---

## 📁 Project Structure

```
ecommerce-app/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (routes)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state stores
│   │   ├── services/          # API service functions
│   │   ├── utils/             # Utility helpers
│   │   ├── types/             # TypeScript type definitions
│   │   └── assets/            # Static assets
│   ├── vite.config.ts
│   └── package.json
│
├── server/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # DB config, env config
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # Express route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── services/          # Business logic layer
│   │   ├── utils/             # Helper functions
│   │   ├── types/             # TypeScript interfaces
│   │   └── server.ts          # App entry point
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
├── package.json               # Root workspace config
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or MongoDB Atlas)
- **Stripe** account (for payment integration)

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ecommerce-app
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

```bash
# In the /server directory, copy .env.example to .env
cp server/.env.example server/.env
```

Then fill in your values in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-strong-secret-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLIENT_URL=http://localhost:5173
```

### 4. Start development servers

```bash
# Start both client and server concurrently from root
npm run dev

# Or start individually:
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # Vite React on http://localhost:5173
```

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description                  | Auth     |
|--------|-----------------------------|------------------------------|----------|
| GET    | `/api/health`               | Health check                 | Public   |
| POST   | `/api/auth/register`        | Register new user            | Public   |
| POST   | `/api/auth/login`           | Login user                   | Public   |
| POST   | `/api/auth/logout`          | Logout user                  | User     |
| POST   | `/api/auth/refresh`         | Refresh access token         | Public   |
| GET    | `/api/products`             | Get all products             | Public   |
| GET    | `/api/products/:id`         | Get product by ID            | Public   |
| POST   | `/api/products`             | Create product               | Admin    |
| PUT    | `/api/products/:id`         | Update product               | Admin    |
| DELETE | `/api/products/:id`         | Delete product               | Admin    |
| GET    | `/api/categories`           | Get all categories           | Public   |
| GET    | `/api/cart`                 | Get user cart                | User     |
| POST   | `/api/cart`                 | Add item to cart             | User     |
| PUT    | `/api/cart/:itemId`         | Update cart item             | User     |
| DELETE | `/api/cart/:itemId`         | Remove cart item             | User     |
| POST   | `/api/orders`               | Create order                 | User     |
| GET    | `/api/orders`               | Get user orders              | User     |
| GET    | `/api/orders/:id`           | Get order by ID              | User     |
| POST   | `/api/payments/intent`      | Create Stripe payment intent | User     |
| POST   | `/api/payments/webhook`     | Stripe webhook handler       | Public   |
| GET    | `/api/admin/dashboard`      | Admin dashboard stats        | Admin    |

> 📄 Full API documentation available in `API_DOCS.md`

---

## ✨ Key Features

- 🔐 **Authentication** — JWT access + refresh tokens, secure httpOnly cookies
- 🛍️ **Product Browsing** — Search, filter by category, price range, ratings
- 🛒 **Shopping Cart** — Persistent cart with real-time stock validation
- 📦 **Orders** — Full order lifecycle: pending → processing → shipped → delivered
- 💳 **Payments** — Stripe integration with webhooks for payment confirmation
- 🎛️ **Admin Dashboard** — Manage products, categories, orders, and users
- 🛡️ **Security** — Helmet, CORS, rate limiting, input validation with Zod

---

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the full entity relationship diagram and collection schemas.

---

## 📘 API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation with request/response examples.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
