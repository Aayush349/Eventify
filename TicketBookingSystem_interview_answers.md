# Ticket Booking System – Interview Questions & Answers

> All answers are based on the actual **Ticket Booking System** project codebase — a full-stack MERN application (MongoDB Atlas, Express 4, React 19, Node.js) with JWT + Google OAuth authentication, Redux Toolkit state management, Cloudinary image uploads, and Render deployment.

---

## Table of Contents

1. [Full-Stack Questions](#1-full-stack-questions)
2. [Database Questions](#2-database-questions)
3. [Frontend Questions](#3-frontend-questions)
4. [Technology Comparisons](#4-technology-comparisons)
5. [System Design](#5-system-design)
6. [Security](#6-security)
7. [Deployment](#7-deployment)

---

## 1. Full-Stack Questions

### 1.1 Why Node.js + Express instead of Django or Spring Boot?

| Factor | Node.js + Express | Django | Spring Boot |
|---|---|---|---|
| Language | JavaScript (same as frontend) | Python | Java |
| I/O Model | Non-blocking, event-driven | Synchronous (default) | Thread-per-request |
| Ecosystem | npm — largest package registry | pip | Maven/Gradle |
| JSON Handling | Native (JS objects = JSON) | Serializers required | Jackson mapping |
| Real-time | First-class Socket.io support | Channels (add-on) | STOMP (add-on) |
| Learning Curve | Low (one language end-to-end) | Moderate | Steep |

**In our project:** We chose Node.js + Express because:
- **One language everywhere** — JavaScript on both React frontend and Express backend reduces context-switching.
- **Non-blocking I/O** — ideal for a booking platform with concurrent searches, bookings, and seat availability checks.
- **Native JSON** — MongoDB returns JSON documents and React consumes JSON, so there is zero serialization overhead.
- The Express app is initialized in [server.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L23) with a layered architecture (Controller -> Service -> Model).

---

### 1.2 Explain the Event Loop / Concurrency Model of Node.js

Node.js runs on a **single-threaded event loop** powered by the **V8 engine** + **libuv** library:

1. **Call Stack** — Executes synchronous code one frame at a time.
2. **Node APIs** — Offloads async operations (file I/O, network, DB queries) to libuv's thread pool.
3. **Callback Queue** — Completed operations queue their callbacks here.
4. **Event Loop** — Continuously checks if the call stack is empty, then dequeues and executes callbacks.

**Phases of the Event Loop:**
- **Timers** -> `setTimeout`, `setInterval`
- **Pending Callbacks** -> deferred I/O callbacks
- **Poll** -> retrieve new I/O events
- **Check** -> `setImmediate`
- **Close** -> `socket.on('close')`

**In our project:** The keep-alive ping uses `setInterval` (timers phase) to prevent Render free-tier sleep — see [keepAlive.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/keepAlive.js#L6-L29):

```js
const startKeepAlive = () => {
  pingBackend();
  const interval = setInterval(pingBackend, 300000); // Every 5 min
};
```

All database queries like `await User.findOne(...)` are non-blocking — Mongoose returns Promises that resolve via the event loop without blocking the main thread.

---

### 1.3 What is Express Middleware?

Middleware functions have access to `req`, `res`, and `next`. They execute sequentially in the order they are registered, and each can:
- Modify `req` / `res` objects
- End the request-response cycle
- Call `next()` to pass control forward

**In our project**, middleware is applied in a specific order in [server.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L29-L88):

```
Request
  |
  +-- helmet()               -> Secure HTTP headers
  +-- mongoSanitize()        -> Prevent NoSQL injection
  +-- xss()                  -> Sanitize XSS
  +-- cors()                 -> Cross-origin policy
  +-- express.json()         -> Parse JSON body
  +-- cookieParser()         -> Parse cookies
  +-- passport.initialize()  -> OAuth setup
  +-- morgan()               -> Request logging
  |
  +-- /api/v1 Routes         -> Business logic
  |     +-- authenticate     -> JWT verification
  |     +-- authorize        -> Role check
  |     +-- validate         -> Joi schema validation
  |
  +-- notFound               -> 404 handler
  +-- errorHandler           -> Global error handler
```

Our custom middleware files:

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | [authenticate.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/authenticate.js) | Verifies JWT from HTTP-only cookie |
| `authorize` | [authorize.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/authorize.js) | Role-based access (`admin`, `organizer`) |
| `errorHandler` | [errorHandler.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/errorHandler.js) | Centralized error handling |
| `rateLimiter` | [rateLimiter.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/rateLimiter.js) | Rate limiting (10 req/15min on auth) |
| `multer` | [multer.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/multer.js) | File upload (5 MB, JPEG/PNG/WebP only) |
| `notFound` | [notFound.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/notFound.js) | 404 catch-all |

---

### 1.4 What is JWT Authentication?

**JWT (JSON Web Token)** is a stateless authentication mechanism. A signed token is issued on login and sent with every subsequent request to prove identity.

**Structure:** `header.payload.signature` (Base64-encoded, dot-separated)
- **Header** — algorithm (`HS256`) + token type (`JWT`)
- **Payload** — claims: `{ id, role, iat, exp }`
- **Signature** — `HMAC-SHA256(header + payload, secret)`

**In our project**, we implement a **dual-token system**:

| Token | Type | Storage | Lifetime | Purpose |
|---|---|---|---|---|
| Access Token | JWT (signed) | HTTP-only cookie | 15 minutes | API authorization |
| Refresh Token | Crypto random | HTTP-only cookie + DB (hashed) | 7 days | Silently renew access token |

Token generation from [generateTokens.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/generateTokens.js#L9-L15):

```js
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};
```

Token verification from [authenticate.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/authenticate.js#L8-L24):

```js
const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next(new AppError('Not logged in', 401));

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  req.user = { id: decoded.id, role: decoded.role };
  next();
};
```

**Refresh token rotation** — when the access token expires, the client calls `/auth/refresh-token`. The server verifies the hashed refresh token, deletes the old one, and issues a new pair. See [authService.js L106-L136](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/authService.js#L106-L136).

---

### 1.5 Why use bcrypt for password hashing?

**bcrypt** is a one-way hashing algorithm designed specifically for passwords:
- **Salted** — adds a unique random salt per hash, preventing rainbow table attacks
- **Adaptive cost factor** — work factor (rounds) can be increased as hardware improves
- **Slow by design** — computationally expensive, making brute-force attacks infeasible

**In our project**, we use `bcryptjs` (pure JS implementation) with **12 salt rounds**.

From [User.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L62-L66):

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

Password comparison from [User.js L69-L71](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L69-L71):

```js
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

The `password` field is excluded from queries by default (`select: false` at [User.js L25](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L25)), so it must be explicitly selected: `User.findOne({ email }).select('+password')`.

---

### 1.6 Difference between Hashing and Encryption

| Property | Hashing | Encryption |
|---|---|---|
| Direction | One-way (irreversible) | Two-way (reversible) |
| Key Required | No (uses salt) | Yes (symmetric or asymmetric key) |
| Output Length | Fixed (bcrypt = 60 chars) | Variable (depends on input) |
| Purpose | Verify integrity, store passwords | Protect data in transit/at rest |
| Examples | bcrypt, SHA-256, Argon2 | AES-256, RSA, TLS |
| Can Recover Original? | No | Yes (with the correct key) |

**In our project**, we use **both**:
- **Hashing (bcrypt)** — user passwords in MongoDB. See [User.js L64](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L64).
- **Hashing (SHA-256)** — refresh tokens and password-reset tokens before storing in DB. See [hashToken.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/hashToken.js#L9-L11):

```js
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

- **Encryption (TLS/HTTPS)** — all data in transit between client and Render servers is encrypted. JWT uses HMAC-SHA256 *signing* (not encryption — payload is readable but tamper-proof).

---

### 1.7 Sessions vs JWT — Tradeoffs

| Property | Session-based | JWT (our choice) |
|---|---|---|
| Storage | Server-side (Redis/memory) | Client-side (cookie/localStorage) |
| Stateful? | Yes — server tracks sessions | No — token is self-contained |
| Scalability | Sticky sessions or shared store required | Stateless — any server can verify |
| Revocation | Easy (delete session from store) | Hard (must use blocklist or short expiry) |
| Size | Small session ID (~32 bytes) | Larger token (~500+ bytes) |
| CSRF Risk | High (auto-sent cookies) | Lower (if using Authorization header) |

**In our project**, we chose JWT in **HTTP-only cookies** for a balanced approach:
- **Stateless scaling** — no server-side session store needed.
- **XSS protection** — cookies are `httpOnly: true`, so JavaScript cannot read them.
- **Short-lived access tokens** (15 min) + refresh token rotation mitigate revocation problems.
- **Refresh tokens are tracked in DB** ([RefreshToken.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/RefreshToken.js)) — enabling server-side invalidation for logout and password changes.

Cookie settings from [generateTokens.js L47-L63](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/generateTokens.js#L47-L63):

```js
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

---

### 1.8 REST APIs

**REST (Representational State Transfer)** is an architectural style using standard HTTP methods on resources:

| Method | Purpose | Idempotent? |
|---|---|---|
| `GET` | Read resource(s) | Yes |
| `POST` | Create resource | No |
| `PUT` | Full replace | Yes |
| `PATCH` | Partial update | Yes |
| `DELETE` | Remove resource | Yes |

**In our project**, all API routes follow REST conventions under `/api/v1/`:

| Method | Endpoint | Action | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create user | Public |
| `POST` | `/auth/login` | Login | Public |
| `GET` | `/events` | List published events | Public |
| `GET` | `/events/:id` | Single event details | Public |
| `POST` | `/events` | Create event | Organizer |
| `PATCH` | `/events/:id` | Update event | Organizer |
| `DELETE` | `/events/:id` | Cancel event | Organizer |
| `POST` | `/bookings` | Create booking | Customer |
| `GET` | `/bookings/my` | My bookings | Customer |
| `GET` | `/admin/stats` | Dashboard analytics | Admin |

Routes are centralized in [routes/index.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/routes/index.js) and versioned under `/api/v1` at [server.js L71](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L71).

**Standardized response format** from [apiResponse.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/apiResponse.js#L14-L23):

```js
const sendSuccess = (res, statusCode = 200, message, data = null, pagination = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};
```

---

### 1.9 API Validation

We use **Joi** for declarative request body validation, applied as middleware through a reusable `validate()` factory.

From [authValidator.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/authValidator.js#L3-L22):

```js
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  role: Joi.string().valid('customer', 'organizer', 'admin').optional(),
});
```

The `validate()` middleware factory from [authValidator.js L74-L87](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/authValidator.js#L74-L87):

```js
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = value; // Replace with sanitized value
  next();
};
```

Applied in routes at [authRoutes.js L24](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/routes/authRoutes.js#L24):

```js
router.post('/register', validate(registerSchema), authController.register);
```

Additional validators exist for events ([eventValidator.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/eventValidator.js)) and bookings ([bookingValidator.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/bookingValidator.js)).

---

### 1.10 Error Handling

We use a **three-layer error handling strategy**:

**Layer 1 — Custom `AppError` class** ([AppError.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/AppError.js)):

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Layer 2 — `catchAsync` wrapper** ([catchAsync.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/catchAsync.js)):

```js
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

Every controller uses `catchAsync`, eliminating try/catch blocks. See [authController.js L7](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/controllers/authController.js#L7):

```js
const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(...);
  setTokenCookies(res, accessToken, refreshToken);
  sendSuccess(res, 201, 'Account created successfully', { user });
});
```

**Layer 3 — Global `errorHandler` middleware** ([errorHandler.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/errorHandler.js#L81-L97)):

```js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);  // Full stack trace
  } else {
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res); // Clean, safe message only
  }
};
```

**Process-level** handlers for unhandled rejections and uncaught exceptions live in [server.js L114-L131](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L114-L131) for graceful shutdown.

---

## 2. Database Questions

### 2.1 Which database did you use and why?

We use **MongoDB Atlas** (cloud-hosted) with **Mongoose** ODM (v8).

**Why MongoDB for this project:**
- **Flexible schema** — Event documents contain nested arrays of ticket types, venue sub-documents, and tags — a natural fit for the document model.
- **Horizontal scalability** — MongoDB Atlas handles sharding and replication automatically.
- **JSON-native** — data flows from MongoDB -> Express -> React with zero transformation.
- **Rich queries** — full-text search for events, aggregation pipelines for admin analytics.
- **Atlas free tier** — ideal for demo/portfolio projects.

**In our project:** Database connection is in [config/db.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/config/db.js#L35-L49):

```js
const connectDB = async () => {
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  await ensureDefaultAdmin();
};
```

---

### 2.2 Why NoSQL (MongoDB) vs SQL for this project?

| Factor | MongoDB (our choice) | SQL (PostgreSQL) |
|---|---|---|
| Schema | Flexible — nested objects, arrays | Rigid — fixed columns, requires migrations |
| Ticket Tiers | Embedded array in Event document | Separate `ticket_types` table + JOINs |
| Venue Info | Nested sub-document | Separate `venues` table |
| Joins | `$lookup` / `populate()` | Native `JOIN` (faster for complex relations) |
| Transactions | Supported (multi-document) | Native ACID |
| Scalability | Horizontal (sharding) | Vertical (scale up) |
| Best For | Hierarchical data, rapid iteration | Complex relational data |

**In our project**, the Event model has deeply nested structures that map naturally to documents:

```js
// Embedded in a single Event document:
ticketTypes: [{ name, price, totalSeats, availableSeats }]  // Array of sub-docs
venue: { name, address, city, state, coordinates: { lat, lng } }  // Nested object
tags: ['music', 'outdoor']  // Array of strings
```

See [Event.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L10-L30). With SQL, this would require 3+ separate tables and JOINs.

---

### 2.3 Why is a database required?

A database provides **persistent, structured storage** that survives server restarts. Without one:
- User accounts would be lost on restart
- Booking records would vanish
- No data integrity or concurrent-access control

**In our project**, the database stores 5 collections:

| Collection | Purpose | File |
|---|---|---|
| `users` | Accounts, roles, password hashes | [User.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js) |
| `events` | Event metadata, ticket tiers, venue | [Event.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js) |
| `bookings` | Ticket purchases, attendee info | [Booking.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Booking.js) |
| `payments` | Transaction records, demo sandbox | [Payment.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Payment.js) |
| `refreshtokens` | Active session tokens (hashed) | [RefreshToken.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/RefreshToken.js) |

---

### 2.4 What are Primary and Foreign Keys? (MongoDB equivalents)

In MongoDB, the **primary key** is `_id` (auto-generated ObjectId). **Foreign keys** are simulated using `ObjectId` references with Mongoose's `ref`.

**In our project** — from [Booking.js L17-L28](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Booking.js#L17-L28):

```js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',       // "Foreign key" to users collection
  required: true,
  index: true,
},
event: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Event',      // "Foreign key" to events collection
  required: true,
  index: true,
},
```

**Entity Relationships:**

```
User (1) ------< Booking (many)
Event (1) -----< Booking (many)
User (1) ------< Event (many)       [as organizer]
User (1) ------< Payment (many)
Booking (1) ---< Payment (many)
User (1) ------< RefreshToken (many)
```

Mongoose `populate()` resolves these references at query time, similar to a SQL JOIN. Example from [bookingService.js L105](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/bookingService.js#L105):

```js
await booking.populate('event', 'title slug bannerImage date venue category');
```

---

### 2.5 What is Normalization? (and Denormalization in MongoDB)

- **Normalization** — splitting data into separate tables/collections to eliminate redundancy (SQL approach).
- **Denormalization** — embedding related data within a single document for read performance (MongoDB approach).

**In our project**, we use a **hybrid approach:**

| Strategy | Example | Rationale |
|---|---|---|
| **Embedded** (denormalized) | `ticketTypes[]` inside Event | Always read together; avoids extra queries |
| **Embedded** (denormalized) | `venue{}` inside Event | 1:1 relationship; always needed with event |
| **Embedded** (denormalized) | `attendeeDetails{}` inside Booking | Snapshot at booking time |
| **Referenced** (normalized) | `user` ObjectId in Booking | User data changes independently |
| **Referenced** (normalized) | `organizer` ObjectId in Event | Avoids duplicating user profile |

See embedded ticket types in [Event.js L10-L17](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L10-L17) and referenced organizer at [Event.js L65-L69](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L65-L69).

---

### 2.6 What are Indexes?

Indexes are data structures that speed up queries by allowing MongoDB to find documents without scanning the entire collection. Trade-off: faster reads, slightly slower writes, more storage.

**In our project**, we define explicit indexes.

From [Event.js L103-L107](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L103-L107):

```js
eventSchema.index({ category: 1, status: 1 });         // Filter by category + status
eventSchema.index({ 'date.start': 1 });                 // Sort by event date
eventSchema.index({ organizer: 1 });                     // Organizer's events lookup
eventSchema.index({ isFeatured: 1, status: 1 });         // Landing page featured query
eventSchema.index({ title: 'text', description: 'text', 'venue.city': 'text' }); // Full-text search
```

From [RefreshToken.js L34-L37](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/RefreshToken.js#L34-L37):

```js
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete
refreshTokenSchema.index({ userId: 1 });                                // Fast user lookup
```

Additional indexes via `index: true` on Booking fields: `user`, `event`, `bookingReference`, `bookingStatus`, `checkedIn` — see [Booking.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Booking.js#L21-L86).

---

### 2.7 What are Transactions?

A **transaction** groups multiple database operations into an atomic unit — either all succeed or all roll back.

**In our project**, we do not use formal MongoDB multi-document transactions. Instead, we handle atomicity through **application-level sequencing** in [bookingService.js L8-L106](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/bookingService.js#L8-L106):

```js
// 1. Read event and validate availability
const event = await Event.findById(eventId);

// 2. Deduct seats from each ticket tier
for (const item of tickets) {
  ticketTier.availableSeats -= item.quantity;
}

// 3. Save event with updated seat counts
await event.save();

// 4. Create the booking record
const booking = await Booking.create({ ... });
```

> For true atomic guarantees under high concurrency, we would wrap this in a MongoDB session transaction with `session.startTransaction()` and `session.commitTransaction()`. See [System Design Q2](#52-how-to-prevent-double-booking--race-conditions) for production-grade solutions.

Cancellation also restores seats — see [bookingService.js L167-L208](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/bookingService.js#L167-L208).

---

### 2.8 What is ORM/ODM and why Mongoose?

An **ORM (Object-Relational Mapper)** / **ODM (Object-Document Mapper)** maps database records to language objects. Mongoose is an ODM for MongoDB.

**Why Mongoose:**
- **Schema enforcement** on schemaless MongoDB — field types, required, min/max, enum, defaults
- **Middleware hooks** — `pre('save')` for password hashing, slug generation
- **Virtual fields** — computed properties like `minPrice`, `isSoldOut`
- **Population** — automatic reference resolution (like SQL JOINs)
- **Built-in + custom validation**
- **Instance methods** — `comparePassword()`, `toSafeObject()`

**In our project** — pre-save hook for slug generation from [Event.js L110-L132](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L110-L132):

```js
eventSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    const base = this.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  if (this.isModified('ticketTypes')) {
    this.ticketTypes.forEach((t) => {
      if (t.availableSeats == null) t.availableSeats = t.totalSeats;
    });
    this.totalCapacity = this.ticketTypes.reduce((sum, t) => sum + t.totalSeats, 0);
  }
  next();
});
```

Virtual field from [Event.js L135-L138](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L135-L138):

```js
eventSchema.virtual('minPrice').get(function () {
  if (!this.ticketTypes?.length) return 0;
  return Math.min(...this.ticketTypes.map((t) => t.price));
});
```

---

### 2.9 What are Migrations?

**Migrations** are version-controlled database schema changes that can be applied forward or rolled back.

**In our project:** MongoDB is schemaless, so traditional SQL-style `ALTER TABLE` migrations are not needed. Mongoose schemas act as the "living migration" — adding a new field with a `default` value is automatically handled for new and existing documents.

We use a **seeder script** for initial data — [seedEvents.js](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/seedEvents.js) creates sample events and the default admin. The admin is also auto-seeded on every startup in [db.js L5-L33](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/config/db.js#L5-L33):

```js
const ensureDefaultAdmin = async () => {
  let admin = await User.findOne({ email: 'admin@admin.com' }).select('+password');
  if (!admin) {
    await User.create({ name: 'Master System Admin', email: 'admin@admin.com',
      password: 'admin123', role: 'admin' });
  }
};
```

---

## 3. Frontend Questions

### 3.1 Why React?

| Factor | React | Angular | Vue |
|---|---|---|---|
| Type | Library (UI only) | Full framework | Progressive framework |
| Language | JSX (JavaScript) | TypeScript (mandatory) | Template-based |
| Learning Curve | Moderate | Steep | Gentle |
| Ecosystem | Choose your own (Router, State) | Batteries-included | Middle ground |
| Community | Largest | Enterprise-focused | Growing |
| Performance | Virtual DOM + Fiber | Zone.js change detection | Reactive proxies |

**In our project:** React 19 was chosen because:
- **Component reusability** — shared `EventCard`, `Layout`, `ProtectedRoute` components.
- **Hooks-based architecture** — modern functional components with `useState`, `useEffect`, `useSelector`.
- **Redux Toolkit integration** — predictable state for auth, events, bookings, payments, admin.
- **Rich ecosystem** — React Router v7, Framer Motion, react-hot-toast, qrcode.react.

See the full route tree in [App.jsx](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/App.jsx).

---

### 3.2 Why not Angular or Vue?

- **Angular** — overkill for our project. Mandatory TypeScript, complex DI system, heavier bundle. Our MERN stack benefits from JavaScript everywhere.
- **Vue** — a great alternative, but React has a larger ecosystem for the specific libraries we need (Redux Toolkit, Framer Motion). Team familiarity with React was the deciding factor.

---

### 3.3 What is Virtual DOM?

The **Virtual DOM** is an in-memory JavaScript representation of the real DOM. When state changes:

1. React creates a **new Virtual DOM tree**
2. **Diffing algorithm** (reconciliation) compares it with the previous tree
3. **Only the changed nodes** are patched into the real DOM (batched updates)

**React 18+ Fiber Architecture** enhances this with:
- **Concurrent rendering** — can pause, abort, or resume rendering
- **Priority-based updates** — user interactions get higher priority
- **Automatic batching** — multiple state updates in one render cycle

**In our project**, this matters on pages like `EventsListPage` where filtering, sorting, and pagination trigger frequent re-renders — only changed `EventCard` components are updated.

---

### 3.4 Explain Hooks with examples from your code

**Hooks** let functional components use React features like state and side effects.

| Hook | Purpose |
|---|---|
| `useState` | Local component state |
| `useEffect` | Side effects (API calls, subscriptions) |
| `useSelector` | Read from Redux store |
| `useDispatch` | Dispatch Redux actions |

**In our project** — from [App.jsx L51-L58](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/App.jsx#L51-L58):

```jsx
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());              // Restore auth session on load
    dispatch(fetchFeaturedEvents(6)); // Load featured events for landing
  }, [dispatch]);
}
```

Custom hook — [useAuth.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/hooks/useAuth.js#L20-L43):

```jsx
const useAuth = () => {
  const dispatch = useDispatch();
  return {
    user: useSelector(selectUser),
    isAuthenticated: useSelector(selectIsAuthenticated),
    isLoading: useSelector(selectIsLoading),
    login: (data) => dispatch(loginUser(data)),
    register: (data) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
    googleLogin: initiateGoogleLogin,
  };
};
```

Usage: `const { user, isAuthenticated, login } = useAuth();`

---

### 3.5 State vs Props

| Feature | State | Props |
|---|---|---|
| Ownership | Owned by the component | Passed from parent |
| Mutable? | Yes (via `setState` / `dispatch`) | Read-only (immutable) |
| Scope | Local to component (or global via Redux) | Flows top-down (unidirectional) |
| Triggers re-render? | Yes (when changed) | Yes (when parent re-renders with new values) |

**In our project:**
- **State (Redux):** `auth.user`, `events.list`, `bookings.items` — global, shared across pages.
- **Props:** `<RoleRoute roles={['organizer', 'admin']}>` — config passed from route setup in [App.jsx L88](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/App.jsx#L88).
- **Props:** `<LoginPage defaultPortal="admin" />` — passed to a reusable page component at [App.jsx L72](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/App.jsx#L72).

---

### 3.6 Context API vs Redux — State Management Choice

| Feature | Context API | Redux Toolkit (our choice) |
|---|---|---|
| Complexity | Simple | More setup (slices, store, thunks) |
| Best For | Theme, locale (low-frequency changes) | Complex state with many consumers |
| DevTools | None | Redux DevTools (time-travel debugging) |
| Middleware | None | Thunks, listeners, RTK Query |
| Performance | Re-renders all consumers on any change | Selector-based (granular re-renders) |
| Async | Manual | `createAsyncThunk` built-in |

**In our project**, we chose **Redux Toolkit** because:
- **5 independent state slices** — auth, events, bookings, payments, admin
- **Async API calls** via `createAsyncThunk` for login, event fetching, booking creation
- **DevTools** for debugging state during development

Redux store from [store.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/app/store.js#L8-L15):

```js
const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    bookings: bookingReducer,
    payments: paymentReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
```

Slice files: [authSlice.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/features/auth/authSlice.js), [eventSlice.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/features/events/eventSlice.js), [bookingSlice.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/features/bookings/bookingSlice.js).

---

### 3.7 Router library used

We use **React Router v7** (`react-router-dom`).

**Key patterns:**

1. **Nested layouts** — `<Route element={<Layout />}>` wraps pages with shared header/footer.
2. **Protected routes** — [ProtectedRoute.jsx](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/routes/ProtectedRoute.jsx) checks `isAuthenticated`:

```jsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  if (isInitializing) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return children;
};
```

3. **Role-based routes** — [RoleRoute.jsx](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/routes/RoleRoute.jsx):

```jsx
const RoleRoute = ({ children, roles = [] }) => {
  const user = useSelector(selectUser);
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};
```

4. **Route grouping** in [App.jsx](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/App.jsx#L60-L117): Public -> Auth -> Customer -> Organizer -> Admin -> Booking/Payment -> 404.

---

### 3.8 Axios vs Fetch

| Feature | Axios (our choice) | Fetch API |
|---|---|---|
| Interceptors | Built-in request/response interceptors | Manual wrapper required |
| JSON Parsing | Automatic (`response.data`) | Manual (`response.json()`) |
| Timeout | Built-in `timeout` config | Needs `AbortController` |
| Progress Events | Upload/download tracking | ReadableStream (complex) |
| Cookies | `withCredentials: true` | `credentials: 'include'` |

**In our project**, we use **two Axios instances** from [axiosInstance.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/axiosInstance.js):

```js
const axiosPublic = axios.create({ baseURL: BASE_URL, withCredentials: true });
const axiosPrivate = axios.create({ baseURL: BASE_URL, withCredentials: true });
```

**Response interceptor** for silent token refresh — [axiosInstance.js L45-L70](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/axiosInstance.js#L45-L70):

```js
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && !prevRequest?.sent && !isAuthEndpoint) {
      prevRequest.sent = true;
      await axiosPublic.post('/auth/refresh-token'); // Silent refresh
      return axiosPrivate(prevRequest);              // Retry original request
    }
    return Promise.reject(error);
  }
);
```

Separate API modules: [authAPI.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/authAPI.js), [eventAPI.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/eventAPI.js), [bookingAPI.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/bookingAPI.js), [paymentAPI.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/paymentAPI.js), [adminAPI.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/adminAPI.js).

---

### 3.9 What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that blocks requests from a different origin (protocol + domain + port) unless the server explicitly allows it.

**In our project**, the frontend (`localhost:5173` / Render static site) and backend (`localhost:5000` / Render web service) run on different origins. CORS is configured in [server.js L39-L52](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L39-L52):

```js
const allowedOrigins = [
  'http://localhost:5173',
  'https://ticket-booking-frontend-ur2r.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,               // Allow cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

`credentials: true` on both server CORS config and Axios (`withCredentials: true`) is required for HTTP-only cookies to work cross-origin.

---

### 3.10 Why Vanilla CSS with CSS Custom Properties?

We use **Vanilla CSS** with a comprehensive **design token system** instead of Tailwind or CSS-in-JS.

**Why:**
- **Zero runtime overhead** — no JS-based styling engine
- **Full control** — no fighting framework conventions
- **Design tokens** — centralized CSS custom properties for consistency
- **Dark mode ready** — token swap via `[data-theme="dark"]`

**In our project**, the design system is in [index.css](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/index.css#L4-L71):

```css
:root {
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.35);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

Reusable component classes (`.btn-primary`, `.card`, `.card-glass`, `.badge-*`, `.skeleton`, `.input-field`) are in [index.css L164-L318](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/index.css#L164-L318). Dark mode tokens at [index.css L74-L83](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/index.css#L74-L83).

---

### 3.11 Flexbox vs Grid

| Feature | Flexbox | Grid |
|---|---|---|
| Dimension | **One-dimensional** (row OR column) | **Two-dimensional** (rows AND columns) |
| Use Case | Navbars, buttons, centering, inline layouts | Page layouts, card grids, dashboards |
| Alignment | `justify-content`, `align-items` | `grid-template-columns`, `grid-gap` |
| Best For | Content-driven, flexible sizing | Structure-driven, explicit placement |

**In our project**, we use both:
- **Flexbox** — button groups (`.btn` with `display: inline-flex`), spinner centering in `ProtectedRoute`, badge alignment.
- **Grid** — event card grids on listing pages, admin dashboard stat cards, checkout form layouts.

---

### 3.12 Why Vite?

**Vite** is a next-generation build tool providing:
- **Instant dev server** — native ES modules, no bundling during development
- **Lightning-fast HMR** — updates reflected in <50ms
- **Optimized production builds** — Rollup-based with tree-shaking
- **First-class React support** via `@vitejs/plugin-react`

**In our project**, Vite 8 is configured in [vite.config.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/vite.config.js):

```js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@pages': './src/pages',
      '@features': './src/features',
      '@hooks': './src/hooks',
      '@api': './src/api',
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
```

**Key features used:** path aliases for clean imports, dev proxy to avoid CORS locally, `import.meta.env.VITE_API_URL` for environment variables.

---

### 3.13 Vite vs Alternatives

| Feature | Vite (ours) | Create React App | Webpack | Next.js |
|---|---|---|---|---|
| Dev Server | Instant (ESM) | Slow (full bundle) | Slow (full bundle) | Fast |
| HMR Speed | <50ms | 1-3s | 1-3s | Fast |
| Config | Minimal | Zero (ejectable) | Verbose | Convention-based |
| SSR | Plugin-based | No | Manual | Built-in |
| Bundle | Optimized (Rollup) | Moderate | Configurable | Optimized |

We chose Vite because we don't need SSR (deployed as a static site) and wanted the fastest possible DX.

---

### 3.14 Performance optimization techniques

| Technique | Where Used |
|---|---|
| **Image optimization** | Cloudinary auto-format + resize — [uploadToCloudinary.js L16-L18](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/uploadToCloudinary.js#L16-L18) |
| **Selective populate** | Only needed fields: `populate('organizer', 'name avatar')` — [eventService.js L116](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/eventService.js#L116) |
| **Field exclusion** | `-description` on list queries — [eventService.js L117](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/eventService.js#L117) |
| **Pagination** | All list endpoints paginated — [eventService.js L109-L131](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/eventService.js#L109-L131) |
| **Database indexes** | Compound indexes on hot queries — [Event.js L103-L107](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/Event.js#L103-L107) |
| **Skeleton loading** | CSS shimmer animation — [index.css L308-L318](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/index.css#L308-L318) |
| **Font preconnect** | Google Fonts preload — [index.html L20-L21](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/index.html#L20-L21) |
| **Fire-and-forget** | View counter doesn't `await` — [eventService.js L152](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/eventService.js#L152) |
| **TTL auto-cleanup** | Expired refresh tokens auto-deleted — [RefreshToken.js L34](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/RefreshToken.js#L34) |

---

### 3.15 Memoization APIs

React provides:
- **`useMemo`** — memoize expensive computed values
- **`useCallback`** — memoize function references
- **`React.memo`** — skip re-rendering if props are unchanged

**In our project**, we rely on **Redux selectors** (inherently memoized via `useSelector`'s reference equality check):

```js
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
```

Used in [useAuth.js](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/hooks/useAuth.js#L25-L29). Components only re-render when their specific slice of state changes.

---

## 4. Technology Comparisons

### 4.1 React vs Next.js vs Angular vs Vue

| Feature | React (ours) | Next.js | Angular | Vue |
|---|---|---|---|---|
| Type | UI library | React meta-framework | Full framework | Progressive framework |
| Rendering | CSR | SSR + SSG + CSR | CSR | CSR (Nuxt for SSR) |
| Routing | React Router (manual) | File-based (built-in) | Built-in | Vue Router |
| State | Redux / Context (manual) | Any (+ Server Components) | RxJS / NgRx | Pinia / Vuex |
| Build Tool | Vite / Webpack | Built-in (Turbopack) | Angular CLI | Vite |
| Learning Curve | Moderate | Low (on top of React) | Steep | Gentle |

**In our project:** React was chosen for maximum flexibility. We deploy as a **static SPA** on Render — no SSR needed. Next.js would add server-component complexity without clear benefit.

---

### 4.2 Node.js vs Python vs Go vs Java

| Factor | Node.js (ours) | Python | Go | Java |
|---|---|---|---|---|
| Speed | Fast (V8 + async I/O) | Moderate | Very fast | Fast (JVM JIT) |
| Concurrency | Event loop (single-thread) | GIL limitation | Goroutines | Threads |
| Typing | Dynamic | Dynamic | Static | Static |
| JSON | Native | Dict -> JSON | Structs -> JSON | POJO -> JSON |
| Best For | Real-time, I/O-heavy | Data science, ML | Microservices, CLI | Enterprise |

Node.js suits our I/O-heavy workload (DB queries, API calls, file uploads) where the event loop excels.

---

### 4.3 Express vs Fastify vs Koa vs NestJS

| Feature | Express (ours) | Fastify | Koa | NestJS |
|---|---|---|---|---|
| Maturity | Most mature (2010) | Newer, fast-growing | Minimal, by Express team | Enterprise-ready |
| Performance | Good | ~2x Express | Similar | Built on Express/Fastify |
| Middleware | Built-in pattern | Plugin system | `async/await` native | Decorators + DI |
| Ecosystem | Largest | Growing | Small | TypeScript-first |

We chose Express for its massive middleware ecosystem (`helmet`, `cors`, `multer`, `passport`, `morgan`, `express-rate-limit`).

---

### 4.4 SQL vs NoSQL in context of our project

| Scenario | SQL (PostgreSQL) | MongoDB (ours) |
|---|---|---|
| Event with 5 ticket tiers | 5 rows in `ticket_types` + JOINs | Single document with embedded array |
| Venue with coordinates | Separate `venues` table | Nested sub-document |
| Full-text event search | `tsvector` + GIN index | Built-in `$text` index |
| Admin revenue report | `GROUP BY` + `SUM` | `$group` + `$sum` aggregation |
| Schema changes | `ALTER TABLE` + migration file | Add field with `default` (no migration) |

MongoDB was the right fit because our data is naturally document-oriented with hierarchical nesting.

---

### 4.5 Vanilla CSS vs Tailwind vs Bootstrap vs CSS-in-JS

| Feature | Vanilla CSS (ours) | Tailwind | Bootstrap | Styled-Components |
|---|---|---|---|---|
| Approach | Custom properties + utility classes | Utility-first | Pre-built components | JS-based |
| Bundle Size | Minimal (only what we write) | Purged (small) | Large | Runtime cost |
| Customization | Full control | Config-based | Override defaults | Full control |
| Dark Mode | CSS custom property swap | `dark:` prefix | SCSS variables | ThemeProvider |

We chose Vanilla CSS for maximum control and zero runtime overhead. See [index.css](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/index.css).

---

### 4.6 REST vs GraphQL

| Feature | REST (ours) | GraphQL |
|---|---|---|
| Endpoints | Multiple per resource | Single `/graphql` |
| Response Shape | Fixed by server | Client specifies exact fields |
| Over-fetching | Possible (mitigated by `select()`) | Eliminated by design |
| File Upload | Native multipart | Requires extensions |
| Caching | HTTP caching (built-in) | Custom caching needed |
| Learning Curve | Low | Medium |

REST is sufficient because we control both client and server, use Mongoose `select()` / `populate()` to tailor responses, and handle file uploads simply with Multer.

---

### 4.7 CSR vs SSR

| Feature | CSR (ours) | SSR |
|---|---|---|
| Rendering | Browser (JavaScript) | Server (pre-rendered HTML) |
| First Paint | Slower (download JS first) | Faster (HTML arrives ready) |
| SEO | Requires meta tags | Excellent (full HTML for crawlers) |
| Server Load | Low (static files) | Higher (renders per request) |
| Hosting | Static CDN (cheap/free) | Node.js server required |

We use **CSR** deployed as a static site on Render. SEO is handled via meta tags in [index.html](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/index.html#L8-L17). For a public event platform at scale, we would consider SSR with Next.js.

---

## 5. System Design

### 5.1 How to scale this app to 1 million users?

```
                    +-------------+
                    |     CDN     |  <-- Static assets (Vite build output)
                    | (CloudFront)|
                    +------+------+
                           |
                    +------+------+
                    |Load Balancer|  <-- Distribute traffic
                    +------+------+
                           |
              +------------+------------+
              |            |            |
        +-----+--+  +-----+--+  +-----+--+
        | Node 1 |  | Node 2 |  | Node 3 |  <-- Horizontal scaling
        +----+---+  +----+---+  +----+---+
             |           |           |
        +----+-----------+-----------+----+
        |         Redis Cluster           |  <-- Cache, rate limiting, pub/sub
        +--------------+--+--------------+
                       |
        +--------------+--+--------------+
        |     MongoDB Atlas Replica Set  |  <-- Primary + Secondaries
        +--------------------------------+
```

| Layer | Current | At Scale |
|---|---|---|
| Frontend | Render Static Site | CDN (CloudFront / Vercel Edge) |
| Backend | Single Render instance | Auto-scaling behind load balancer |
| Database | MongoDB Atlas free tier | Dedicated cluster with sharding |
| Cache | None | Redis for sessions, rate limits, hot data |
| Queue | None | Bull/BullMQ for email, PDF generation |
| Search | MongoDB `$text` | Elasticsearch / Atlas Search |
| Files | Cloudinary | Cloudinary (already CDN-backed) |

Our JWT auth is **already stateless** — any server instance can verify tokens. The only stateful piece is the refresh token in MongoDB, which would move to Redis for speed.

---

### 5.2 How to prevent double booking / race conditions?

**The Problem:** Two users simultaneously book the last VIP seat.

**Current approach** (demo-level) in [bookingService.js L33-L68](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/bookingService.js#L33-L68):

```js
// Read-then-write pattern (NOT atomic under concurrency)
if (ticketTier.availableSeats < item.quantity) throw error;
ticketTier.availableSeats -= item.quantity;
await event.save();
```

**Production-grade solutions:**

**1. MongoDB Atomic `findOneAndUpdate` with conditions:**

```js
const result = await Event.findOneAndUpdate(
  { _id: eventId, 'ticketTypes._id': tierId,
    'ticketTypes.availableSeats': { $gte: quantity } },
  { $inc: { 'ticketTypes.$.availableSeats': -quantity } },
  { new: true }
);
if (!result) throw new AppError('Seats no longer available', 409);
```

**2. MongoDB Multi-document Transaction:**

```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Event.findOneAndUpdate(filter, update, { session });
  await Booking.create([bookingData], { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
}
```

**3. Distributed Lock (Redis Redlock):**

```js
const lock = await redlock.acquire([`lock:event:${eventId}`], 5000);
try { /* booking logic */ } finally { await lock.release(); }
```

---

### 5.3 Use of Redis?

**Redis is not currently used.** Planned for:

| Use Case | Current | With Redis |
|---|---|---|
| Rate Limiting | In-memory (`express-rate-limit`) | Redis store (shared across instances) |
| Session Tokens | MongoDB (`RefreshToken` model) | Redis (faster lookups, built-in TTL) |
| Event Cache | Direct DB query every time | Cache hot events (5 min TTL) |
| Real-time Pub/Sub | Socket.io in-memory adapter | Redis adapter for multi-node |
| Queue | None | BullMQ for email/PDF jobs |

---

### 5.4 Use of WebSockets?

**Socket.io is installed** (`socket.io` v4.8.3 in [package.json L42](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/package.json#L42)) and the HTTP server is created for it in [server.js L24](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L24):

```js
const server = http.createServer(app);
```

**Planned use cases:**
- **Real-time seat availability** — broadcast when bookings reduce available seats
- **Live booking feed** — organizer dashboard shows new bookings instantly
- **Admin activity stream** — real-time platform monitoring

Currently the frontend polls via REST.

---

### 5.5 Load Balancing

**Not currently implemented** (single Render instance). At scale:

| Strategy | Description | Best For |
|---|---|---|
| Round Robin | Sequential distribution | General traffic |
| Least Connections | Route to least busy server | Variable request duration |
| IP Hash | Same client -> same server | Sticky sessions (not needed with JWT) |

Our JWT auth is stateless, so **Round Robin** or **Least Connections** work without sticky sessions.

---

### 5.6 Database Failure Handling

**In our project**, failures are handled at multiple levels:

1. **Connection failure** — exit process in [db.js L46-L49](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/config/db.js#L46-L49):

```js
} catch (error) {
  console.error(`MongoDB Connection Error: ${error.message}`);
  process.exit(1);
}
```

2. **Auto-reconnection** — Mongoose event listeners in [db.js L53-L63](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/config/db.js#L53-L63):

```js
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected. Reconnecting...'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected.'));
```

3. **Connection timeouts** — `serverSelectionTimeoutMS: 5000` prevents indefinite hanging.

4. **Process-level handlers** — graceful shutdown in [server.js L114-L131](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L114-L131).

**At scale:** MongoDB Atlas replica sets provide automatic failover, and we would add circuit breakers and a `/api/v1/health` endpoint (already exists) for monitoring.

---

## 6. Security

### 6.1 How do you prevent NoSQL Injection and XSS?

**NoSQL Injection:**
- `express-mongo-sanitize` strips `$` and `.` from inputs, blocking operators like `$gt`, `$ne`.
- Applied globally in [server.js L35](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L35): `app.use(mongoSanitize())`

**XSS Prevention:**
- `xss-clean` sanitizes inputs to strip HTML/script tags — [server.js L36](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L36): `app.use(xss())`
- `helmet` sets security headers (`X-XSS-Protection`, `Content-Security-Policy`) — [server.js L30-L34](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L30-L34)
- **HTTP-only cookies** prevent JavaScript from reading auth tokens (eliminates XSS token theft)
- **Joi validation** rejects malformed input before it reaches the database

---

### 6.2 CSRF Protection

**CSRF (Cross-Site Request Forgery)** tricks a logged-in user's browser into making unintended requests.

**Our defenses:**
- **`sameSite` cookie attribute** — `lax` in dev (blocks most cross-site), `none` + `secure` in production (HTTPS only). See [generateTokens.js L53](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/generateTokens.js#L53).
- **CORS origin whitelist** — only our frontend can make requests. See [server.js L39-L43](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L39-L43).
- **State-changing operations use POST/PATCH/DELETE** — not vulnerable to GET-based CSRF via `<img>` tags.

---

### 6.3 Why HTTPS?

HTTPS encrypts all data in transit using TLS, preventing:
- **Eavesdropping** — attackers cannot read tokens, passwords, or booking data
- **Man-in-the-middle** — cannot modify requests/responses
- **Cookie theft** — `secure: true` cookies are only sent over HTTPS

**In our project:**
- Render provides **automatic HTTPS** with managed TLS certificates.
- Cookies use `secure: true` in production — [generateTokens.js L52](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/generateTokens.js#L52).
- `trust proxy` is set in [server.js L27](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L27) for correct `X-Forwarded-Proto` detection behind Render's reverse proxy.

---

### 6.4 Password Security

| Measure | Implementation | File |
|---|---|---|
| **bcrypt hashing** (12 rounds) | Pre-save hook | [User.js L62-L66](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L62-L66) |
| **Password hidden from queries** | `select: false` | [User.js L25](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L25) |
| **Safe user serialization** | `toSafeObject()` strips sensitive fields | [User.js L74-L85](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/models/User.js#L74-L85) |
| **Minimum length validation** | Joi: `min(6).max(128)` | [authValidator.js L13](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/authValidator.js#L13) |
| **Confirm password match** | Joi: `valid(Joi.ref('password'))` | [authValidator.js L17](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/validators/authValidator.js#L17) |
| **Auth rate limiting** | 10 req / 15 min per IP | [rateLimiter.js L7-L18](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/rateLimiter.js#L7-L18) |
| **Reset tokens hashed** | SHA-256, 1hr expiry | [authService.js L150-L156](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/authService.js#L150-L156) |
| **Sessions invalidated on pw change** | Delete all refresh tokens | [authService.js L210](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/authService.js#L210) |
| **No email enumeration** | Same response for found/not-found | [authService.js L147](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/services/authService.js#L147) |

---

## 7. Deployment

### 7.1 Why Render?

| Feature | Render (ours) | Vercel | Railway | Heroku |
|---|---|---|---|---|
| Free Tier | Web service + static site | Frontend only | Limited | Removed |
| Backend | Node.js web service | Serverless only | Full | Full |
| Static Sites | Yes (SPA rewrites) | Yes | No | No |
| Auto Deploy | Git push -> build | Git push -> build | Git push -> build | Git push -> build |
| Blueprint | `render.yaml` (IaC) | `vercel.json` | `railway.toml` | `Procfile` |
| HTTPS | Automatic | Automatic | Automatic | Automatic |

**In our project**, [render.yaml](file:///d:/Ticket-Booking/Ticket-Booking-System/render.yaml) defines two services:
- **Backend** — Node.js web service (`npm start`)
- **Frontend** — Static site (`npm run build` -> `dist/`)

SPA routing via catch-all rewrite at [render.yaml L48-L51](file:///d:/Ticket-Booking/Ticket-Booking-System/render.yaml#L48-L51):

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

---

### 7.2 How environment variables work

Environment variables store sensitive configuration outside the codebase.

**Backend `.env` structure** (from [README.md](file:///d:/Ticket-Booking/Ticket-Booking-System/README.md#L153-L177)):

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | HMAC key for signing JWTs |
| `JWT_ACCESS_EXPIRES_IN` | Token lifetime (`15m`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 secret |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI |
| `CLOUDINARY_CLOUD_NAME` | Image CDN account |
| `CLOUDINARY_API_KEY` | Cloudinary auth |
| `CLOUDINARY_API_SECRET` | Cloudinary auth |

**Frontend `.env`:**

| Variable | Purpose |
|---|---|
| `VITE_LOCAL_API_URL` | Backend URL for local dev |
| `VITE_API_URL` | Backend URL for production |

Loaded via `dotenv` on backend ([server.js L1](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L1)) and `import.meta.env` on frontend ([axiosInstance.js L7](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/src/api/axiosInstance.js#L7)).

In production, secrets are set in Render's dashboard. Sensitive keys use `sync: false` in [render.yaml L17](file:///d:/Ticket-Booking/Ticket-Booking-System/render.yaml#L17), meaning they must be set manually.

---

### 7.3 What is CI/CD?

**CI/CD (Continuous Integration / Continuous Deployment)** automates testing, building, and deploying on every push.

**In our project**, we use **Render's auto-deploy** (Git-based):

```
Developer pushes to GitHub
        |
        v
Render detects push (webhook)
        |
        +-- Backend: npm install -> node server.js
        +-- Frontend: npm install -> vite build -> serve dist/
```

Configured via [render.yaml](file:///d:/Ticket-Booking/Ticket-Booking-System/render.yaml):

```yaml
services:
  - type: web
    name: ticket-booking-backend
    buildCommand: npm install
    startCommand: npm start
```

**No formal CI pipeline** (Jest, ESLint CI) exists yet. Linting uses `oxlint` locally — [frontend/package.json L9](file:///d:/Ticket-Booking/Ticket-Booking-System/frontend/package.json#L9).

---

### 7.4 Production vs Development

| Setting | Development | Production |
|---|---|---|
| **Backend URL** | `http://localhost:5000/api/v1` | `https://ticket-booking-backend-pdjz.onrender.com/api/v1` |
| **Frontend URL** | `http://localhost:5173` | `https://ticket-booking-frontend-ur2r.onrender.com` |
| **NODE_ENV** | `development` | `production` |
| **Logging** | `morgan('dev')` (colored, concise) | `morgan('combined')` (full Apache format) |
| **Error Details** | Full stack trace to client | Generic message only |
| **Cookie Secure** | `false` (HTTP ok) | `true` (HTTPS only) |
| **Cookie SameSite** | `lax` | `none` (cross-origin required) |
| **Rate Limiting** | Skipped | Active (10 req/15 min on auth) |
| **CORS Origins** | `localhost:5173` | Render frontend URL |
| **Redux DevTools** | Enabled | Disabled |
| **Keep-Alive Ping** | Active | Active |

Config references: logging in [server.js L64-L68](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/server.js#L64-L68), error detail toggle in [errorHandler.js L85-L97](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/middleware/errorHandler.js#L85-L97), cookie toggle in [generateTokens.js L48](file:///d:/Ticket-Booking/Ticket-Booking-System/backend/src/utils/generateTokens.js#L48).

---

## Quick Reference: Architecture Diagram

```
+------------------------------------------------------------------+
|                     FRONTEND (React 19 + Vite 8)                 |
|                                                                  |
|  +----------+  +--------------+  +-----------+  +------------+  |
|  |  Pages   |  |  Components  |  |  Redux    |  |  API Layer |  |
|  | (auth,   |  | (Layout,     |  | (5 slices |  | (Axios +   |  |
|  |  events, |--| EventCard,   |--| + thunks) |--| interceptor|  |
|  |  admin)  |  |  UI)         |  |           |  |           )|  |
|  +----------+  +--------------+  +-----------+  +-----+------+  |
|                                                        |         |
+--------------------------------------------------------+---------+
                                                         | HTTP
                                                    (JWT cookies)
                                                         |
+--------------------------------------------------------+---------+
|                     BACKEND (Express 4 + Node.js)      |         |
|                                                        v         |
|  +----------+  +--------------+  +-----------+  +----------+    |
|  | Security |  |   Routes     |  |Controllers|  | Services |    |
|  |(helmet,  |->| (auth,       |->|(thin HTTP |->|(business |    |
|  | cors,    |  |  events,     |  | handlers) |  |  logic)  |    |
|  | xss,     |  |  bookings,   |  +-----------+  +----+-----+    |
|  | sanitize)|  |  admin)      |                       |          |
|  +----------+  +--------------+                       v          |
|                                                 +----------+    |
|  +----------+  +--------------+                 |  Models  |    |
|  |Middleware|  | Validators   |                 | (Mongoose |    |
|  |(auth,    |  | (Joi schemas)|                 |  schemas) |    |
|  | roles,   |  +--------------+                 +-----+----+    |
|  | errors)  |                                         |          |
|  +----------+                                         v          |
|                                              +--------------+    |
|                                              | MongoDB Atlas|    |
|                                              | (5 collections)  |
|                                              +--------------+    |
|                                              +--------------+    |
|                                              |  Cloudinary  |    |
|                                              |  (Image CDN) |    |
|                                              +--------------+    |
+------------------------------------------------------------------+
```

---

> **Document generated from the actual Ticket Booking System codebase.** Every code snippet and file path references real files in the repository.
