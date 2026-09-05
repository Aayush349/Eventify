# 🎟️ Event Management App

A full-stack **MERN** (MongoDB, Express, React, Node.js) ticket booking platform for events — concerts, sports, festivals, and more. Features JWT authentication, Google OAuth, real-time seat management, and an admin dashboard.

---

## ✨ Features

### 🔐 Authentication
- Email/Password registration & login
- Google OAuth 2.0 (one-click sign in)
- JWT access + refresh tokens (HTTP-only cookies)
- Role-based access control (User, Organizer, Admin)
- Default admin account auto-seeded on startup

### 🎪 Events
- Browse, search, and filter events by category
- Featured events on landing page
- Event details with multiple ticket tiers
- Organizer event management (CRUD)

### 🎫 Bookings
- Multi-tier ticket selection (VIP, Gold, General, etc.)
- Real-time seat availability tracking
- Booking history with QR codes
- PDF ticket generation

### 🛡️ Admin Dashboard
- User management (activate/deactivate accounts)
- Event approval & moderation
- Booking & revenue analytics
- CSV export capabilities

### ☁️ Cloud Integrations
- **MongoDB Atlas** — Cloud database
- **Cloudinary** — Image uploads (event banners, avatars)
- **Render** — One-click deployment

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Redux Toolkit, React Router 7, Framer Motion |
| **Backend** | Node.js, Express 4, Passport.js |
| **Database** | MongoDB Atlas + Mongoose 8 |
| **Auth** | JWT, Google OAuth 2.0, bcrypt |
| **Uploads** | Cloudinary, Multer |
| **Deployment** | Render (Web Service + Static Site) |

---

## 📁 Project Structure

```
Ticket-Booking-System/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Environment variables (not committed)
│   └── src/
│       ├── config/               # DB, Passport, Cloudinary config
│       ├── constants/            # App-wide enums & constants
│       ├── controllers/          # Route handlers
│       ├── middleware/            # Auth, error handling, rate limiting
│       ├── models/               # Mongoose schemas (User, Event, Booking, Payment)
│       ├── routes/               # Express routers (/api/v1/*)
│       ├── services/             # Business logic layer
│       ├── utils/                # JWT, QR, PDF, seed helpers
│       └── validators/           # Joi request validation
│
├── frontend/
│   ├── index.html                # Entry HTML with SEO meta tags
│   ├── vite.config.js            # Vite config with path aliases
│   ├── .env                      # Frontend env variables (not committed)
│   └── src/
│       ├── api/                  # Axios instances & API modules
│       ├── app/                  # Redux store
│       ├── assets/               # Static assets
│       ├── components/           # Reusable UI (layout, events, ui)
│       ├── features/             # Redux slices (auth, events, bookings, payments)
│       ├── hooks/                # Custom React hooks
│       ├── pages/                # Route pages (auth, events, bookings, admin)
│       └── routes/               # Route configuration
│
├── render.yaml                   # Render deployment blueprint
└── README.md
```

---

## ⚙️ Backend Architecture & Analysis

The backend is built with **Node.js** and **Express.js**, following a robust, scalable **Layered Architecture (Controller-Service-Model)**. This separation of concerns ensures that business logic is decoupled from HTTP transport layers.

### 1. Core Architecture Pattern
*   **Routes (`/src/routes`)**: Defines API endpoints and maps them to controllers. Middleware for authentication and validation is applied here.
*   **Controllers (`/src/controllers`)**: Handles HTTP requests and responses. It parses input, passes data to services, and formats the output using a standardized `apiResponse` utility.
*   **Services (`/src/services`)**: Contains the core business logic (`authService`, `eventService`, `bookingService`, `paymentService`). This keeps controllers thin and makes logic reusable and testable.
*   **Models (`/src/models`)**: Defines the data schema using **Mongoose**. Enforces data integrity at the database level.
*   **Utils/Middleware (`/src/utils`, `/src/middleware`)**: Cross-cutting concerns like global error handling, JWT management, async wrappers (`catchAsync`), and custom error classes (`AppError`).

### 2. Database Schema (MongoDB / Mongoose)
The data layer consists of highly normalized interconnected collections:
*   **User**: Supports Role-Based Access Control (RBAC) with `admin`, `organizer`, and `user` roles. Uses `bcrypt` for secure password hashing.
*   **Event**: Stores event metadata, venue details, dates, and nested arrays for **multi-tier ticketing** (e.g., VIP, General) tracking available vs. booked capacity in real-time.
*   **Booking**: Relates a `User` to an `Event`. Tracks the specific ticket tier selected, total amount, and booking status.
*   **Payment**: Manages payment lifecycle and transaction IDs.
*   **RefreshToken**: Whitelists active refresh tokens to manage user sessions securely and allow remote logouts.

### 3. Authentication & Security Workflow
Security is a first-class citizen in this API:
*   **Dual Token System**: Implements short-lived JWT Access Tokens (for API authorization) and long-lived Refresh Tokens (stored in HTTP-only, secure cookies to prevent XSS).
*   **OAuth Integration**: `Passport.js` handles Google OAuth 2.0, automatically provisioning accounts and linking them to existing emails.
*   **API Defenses**: 
    *   `helmet`: Secures HTTP headers.
    *   `express-mongo-sanitize`: Prevents NoSQL injection attacks.
    *   `xss-clean`: Sanitizes user input to prevent Cross-Site Scripting.
    *   `cors`: Strictly configured to allow only trusted frontend origins.

### 4. Key Business Logic
*   **Concurrency Handling**: The `bookingService` ensures that ticket availability is accurately checked and decremented when a booking is created, preventing overselling.
*   **Standardized Responses**: Every API endpoint responds with a uniform JSON structure (success flag, message, data payload) managed by `apiResponse.js`.
*   **Centralized Error Handling**: Any thrown `AppError` or unhandled promise is intercepted by a global error middleware, ensuring the server doesn't crash and the client receives a formatted, predictable error message.

---

## 🚀 Setup Guide

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB Atlas** account ([mongodb.com/atlas](https://www.mongodb.com/atlas))
- **Google Cloud Console** project with OAuth 2.0 credentials ([console.cloud.google.com](https://console.cloud.google.com))
- **Cloudinary** account ([cloudinary.com](https://cloudinary.com)) — optional, for image uploads

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Ticket-Booking-System.git
cd Ticket-Booking-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ticket-booking

# JWT
JWT_ACCESS_SECRET=<your-strong-random-secret-key>
JWT_ACCESS_EXPIRES_IN=15m

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173

# Google OAuth 2.0
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### 3. Seed the Database

```bash
node src/utils/seedEvents.js
```

This creates:
- 🛡️ Default admin account (`admin@admin.com` / `admin123`)
- 🎪 3 sample events (Coldplay concert, IPL finale, Sunburn festival)

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_LOCAL_API_URL=http://localhost:5000/api/v1
VITE_API_URL=http://localhost:5000/api/v1
```

### 5. Run the Application

**Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

The app will be running at:

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| 🚀 Backend API | http://localhost:5000/api/v1 |
| 🏥 Health Check | http://localhost:5000/api/v1/health |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/health` | Server health check | ❌ |
| `POST` | `/api/v1/auth/register` | Register new user | ❌ |
| `POST` | `/api/v1/auth/login` | Login with email/password | ❌ |
| `GET` | `/api/v1/auth/google` | Google OAuth login | ❌ |
| `POST` | `/api/v1/auth/refresh-token` | Refresh access token | 🍪 |
| `GET` | `/api/v1/auth/me` | Get current user profile | ✅ |
| `POST` | `/api/v1/auth/logout` | Logout & clear cookies | ✅ |
| `GET` | `/api/v1/events` | List all published events | ❌ |
| `GET` | `/api/v1/events/:id` | Get event details | ❌ |
| `POST` | `/api/v1/events` | Create event (organizer) | ✅ |
| `POST` | `/api/v1/bookings` | Book tickets | ✅ |
| `GET` | `/api/v1/bookings/my` | User's booking history | ✅ |
| `GET` | `/api/v1/admin/users` | List all users (admin) | ✅🛡️ |
| `GET` | `/api/v1/admin/stats` | Dashboard stats (admin) | ✅🛡️ |

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@admin.com` | `admin123` |

> ⚠️ Change the admin password after first login in production!

---

## 🌐 Deployment (Render)

This project includes a `render.yaml` blueprint for one-click deployment:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your repo and select the `render.yaml`
4. Set the required environment variables in Render's dashboard
5. Deploy!

---

## 📄 License

ISC

---

<p align="center">Built with ❤️ using the MERN Stack</p>
