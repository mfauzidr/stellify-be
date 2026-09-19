# Stellify Backend

## 1. Project Overview

Stellify Backend is an Express + TypeScript API for managing idol-event ticketing and cheki package flows. The current implementation covers catalog management, event lifecycle operations, order creation, payment processing, admin dashboard reporting, and admin check-in for paid orders.

The backend is structured around a layered architecture and uses PostgreSQL as the primary data store. Authentication is implemented with JWT and role-based access checks for admin and user flows.

## 2. Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Knex.js
- JWT (jsonwebtoken)
- Midtrans Snap/Core API
- Cloudinary upload integration
- Multer for multipart file upload
- CORS, Morgan, Pino logging
- Node Cron scheduler

## 3. Architecture

Router
↓
Handler
↓
Service
↓
Repository
↓
PostgreSQL

Current responsibility by layer:

- Router: registers HTTP endpoints and binds middleware such as authentication and upload handling.
- Handler: receives Express requests and validates request-specific conditions before delegating to services.
- Service: contains business logic for transactions, validations, and cross-entity operations such as order creation and payment synchronization.
- Repository: executes database queries through Knex/PostgreSQL accessors.
- PostgreSQL: stores core application data for users, events, members, cheki packages, orders, and payments.

The server boots in `server.ts`, loads environment variables, configures middleware, mounts the main API router, and starts the scheduler.

## 4. Project Structure

```text
src/
  jobs/
  middlewares/
  modules/
    auth/
    cheki/
    chekiEvent/
    dashboard/
    events/
    idol_groups/
    members/
    order_item_members/
    order_items/
    orders/
    payments/
    products/
    users/
  scheduler/
  shared/
    config/
    database/
    helper/
    logger/
    models/
    routes/
api/
  index.ts
server.ts
```

Key application-level entry points:

- `server.ts`: Express app bootstrap and startup
- `src/shared/routes/index.ts`: central API router registration
- `src/shared/config/pg.ts`: PostgreSQL pool configuration
- `src/middlewares/auth.middleware.ts`: JWT authentication and role checks
- `src/modules/*`: domain modules for each backend feature

## 5. Core Modules

### Authentication

The current auth implementation is email/password-based and returns a JWT token on successful login.

Implemented behavior:

- `POST /auth/register` creates a new user with email validation and password checks.
- `POST /auth/login` verifies the email/password pair with bcrypt and returns a signed JWT.
- JWT payload contains `id`, `uuid`, and `role`.
- `authMiddleware` validates Bearer tokens and enforces allowed roles.
- `optionalAuthMiddleware` allows order creation for guest or logged-in users without failing if no token is supplied.
- The current codebase does not include an active Google OAuth flow.

### Events

Event management supports catalog and lifecycle operations.

Implemented behavior:

- List all active events and fetch a single event by UUID.
- Create and update events with optional banner image upload.
- Delete, deactivate, and restore events.
- Event images are uploaded through the shared upload middleware and Cloudinary helper.

### Cheki Packages

Cheki package management is implemented as admin CRUD over package definitions tied to an event.

Implemented behavior:

- List all cheki packages and fetch by UUID.
- Create, update, delete, deactivate, and restore cheki packages.
- Package pricing is defined for pre-order and on-the-spot phases, with single/group pricing and `allow_single` / `allow_group` toggles.

### Cheki Events

Cheki-event creation is a combined event + package + member assignment flow.

Implemented behavior:

- Fetch a cheki event payload by UUID, including the event and attached packages.
- Create a cheki event with event data, member UUIDs, and package data in one transaction.
- Update the event, replace assigned members, and update or insert packages while preserving transactional integrity.

### Orders

Orders are the main transactional flow for event booking.

Implemented behavior:

- `GET /orders` returns all orders; regular users only see their own orders.
- `GET /orders/:uuid` returns details for a single order.
- `POST /orders` creates an order with validation for event timing, pricing, member selection, and payment method compatibility.
- Orders are created with a generated order number and linked payment record.
- `PATCH /orders/:uuid/check-in` marks an order as checked in after payment is verified.

Order creation rules implemented in the service layer:

- all order items must belong to the same event
- order period must be within the event lifecycle
- cash payment is rejected during pre-order (PO) period
- quantities must be positive
- at least one member must be selected
- duplicate member UUIDs are rejected
- single-member package validation follows `allow_single`
- group package validation follows `allow_group`
- price is computed based on the order phase and package pricing fields

### Payments

Payments are handled through a dedicated module and support both Midtrans and manual updates.

Implemented behavior:

- Midtrans transaction creation occurs when an order is created with `payment_method: "midtrans"`.
- Payment records are stored with provider, order id, gross amount, status, and optional snap metadata.
- Midtrans notification is processed at `POST /payments/midtrans/notification` and validated by signature.
- Admins can synchronize payment status, cancel a Midtrans payment, or expire a payment.
- Manual payment status updates are allowed only for `paid` and `cancelled`.

### Check-in

Check-in is an admin workflow tied to paid orders.

Implemented behavior:

- A payment must be in `paid` status before check-in is allowed.
- An order can be checked in only once.
- `checked_in_at` is updated when the admin calls the check-in route.

### Dashboard

The dashboard module exposes summary and category-based reports for admin monitoring.

Implemented reports:

- Summary
- Payment overview
- Check-in overview
- Order phase overview
- Event overview

The dashboard metrics are computed directly from PostgreSQL queries in the repository layer.

## 6. Database

The backend uses PostgreSQL with a `pg` Pool connection configured from environment variables.

Core persisted domains currently used by the codebase include:

- users
- idol groups
- members
- events
- cheki packages
- cheki event associations
- products
- orders
- order items
- order item members
- payments

The database configuration is defined in:

- `src/shared/config/pg.ts`
- `src/shared/config/knexfile.ts`

## 7. Authentication

Authentication is JWT-based and enforced with role-aware middleware.

Behavior in the current codebase:

- Login request: `POST /auth/login`
- Registration request: `POST /auth/register`
- JWT secret and issuer come from environment variables
- Authorization header format: `Authorization: Bearer <token>`
- Admin-only routes are protected with `authMiddleware(["admin"])`
- User/admin mixed routes are protected with `authMiddleware(["admin", "user"])`
- `optionalAuthMiddleware` allows public order submission without requiring a token

Password handling:

- registration hashes the password with bcrypt
- login compares the submitted password with the stored hash
- token payload includes `id`, `uuid`, and `role`

## 8. Payment Flow

The actual payment flow implemented in the backend is:

1. A client submits an order with a payment method.
2. The order service validates the event, item pricing, member selection, and payment method compatibility.
3. The order and initial payment record are created in a transaction.
4. When `payment_method` is `midtrans`, the backend calls Midtrans Snap to create a payment transaction and stores `snap_token` and `redirect_url`.
5. Midtrans sends a notification to `POST /payments/midtrans/notification`.
6. The notification is verified, mapped to the internal payment status, and stored.
7. Admins can synchronize, cancel, or expire the payment via the payment routes.
8. Manual payment status changes are limited to `paid` and `cancelled`.

## 9. API Overview

### Root

- `GET /` — health check endpoint returning backend status and environment

### Authentication

- `POST /auth/login`
- `POST /auth/register`

### Idol Groups

- `GET /idol-groups/`
- `GET /idol-groups/:uuid`
- `POST /idol-groups/`
- `PATCH /idol-groups/:uuid`
- `DELETE /idol-groups/:uuid`
- `PATCH /idol-groups/deactivate/:uuid`
- `PATCH /idol-groups/restore/:uuid`

### Members

- `GET /members/`
- `GET /members/:uuid`
- `POST /members/`
- `PATCH /members/:uuid`
- `DELETE /members/:uuid`
- `PATCH /members/deactivate/:uuid`
- `PATCH /members/restore/:uuid`

### Events

- `GET /events/`
- `GET /events/:uuid`
- `POST /events/`
- `PATCH /events/:uuid`
- `DELETE /events/:uuid`
- `PATCH /events/deactivate/:uuid`
- `PATCH /events/restore/:uuid`

### Cheki Packages

- `GET /cheki-packages/`
- `GET /cheki-packages/:uuid`
- `POST /cheki-packages/`
- `PATCH /cheki-packages/:uuid`
- `DELETE /cheki-packages/:uuid`
- `PATCH /cheki-packages/deactivate/:uuid`
- `PATCH /cheki-packages/restore/:uuid`

### Products

- `GET /products/`
- `GET /products/:uuid`
- `POST /products/`
- `PATCH /products/:uuid`
- `DELETE /products/:uuid`
- `PATCH /products/deactivate/:uuid`
- `PATCH /products/restore/:uuid`

### Users

- `GET /users/`
- `GET /users/:uuid`
- `POST /users/`
- `PATCH /users/:uuid`
- `PATCH /users/deactivate/:uuid`
- `PATCH /users/restore/:uuid`

### Cheki Events

- `GET /cheki-events/:uuid`
- `POST /cheki-events/`
- `PATCH /cheki-events/:uuid`

### Orders

- `GET /orders/`
- `GET /orders/:uuid`
- `POST /orders/`
- `PATCH /orders/:uuid/check-in`

### Payments

- `PATCH /payments/:uuid`
- `POST /payments/midtrans/notification`
- `PATCH /payments/:uuid/sync`
- `POST /payments/:uuid/cancel`
- `POST /payments/:uuid/expire`

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/payment-overview`
- `GET /dashboard/check-in-overview`
- `GET /dashboard/order-phase-overview`
- `GET /dashboard/event-overview`

## 10. Environment Variables

The current backend reads the following environment variable names from the runtime environment and configuration files:

```text
PORT
NODE_ENV
DB_HOST
DB_USER
DB_PASS
DB_NAME
DB_PORT
JWT_SECRET
JWT_ISSUER
MIDTRANS_IS_PRODUCTION
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
CLOUD_NAME
CLOUD_KEY
CLOUD_SECRET
```

These names are used directly by the source code. Actual secret values are not documented here.

## 11. Installation

1. Ensure PostgreSQL is available and the required database is created.
2. Configure the environment variables listed above for your runtime.
3. Install dependencies:

```bash
npm install
```

4. Run database migrations if needed:

```bash
npm run migrate
```

5. Start the backend in development mode:

```bash
npm run dev:local
```

Production mode:

```bash
npm run dev:prod
```

Production build:

```bash
npm run build
```

## 12. Development

Available scripts from the project configuration:

```bash
npm run dev:local
npm run dev:prod
npm run migrate
npm run seed
npm run build
```

Development notes:

- The app loads environment variables based on `NODE_ENV`.
- For local development, the server defaults to the local environment config and runs with `ts-node-dev`.
- Image uploads are handled by the upload middleware and Cloudinary integration.
- The scheduler is started when the server boots.

## Dashboard Details

The implemented dashboard reports are mapped as follows:

- Summary: `GET /dashboard/summary`
  - total orders
  - total revenue from paid payments
  - paid orders count
  - upcoming events count

- Payment Overview: `GET /dashboard/payment-overview`
  - count of pending, paid, expired, failed, and cancelled payments

- Check-in Overview: `GET /dashboard/check-in-overview`
  - count of paid orders that have been checked in
  - count of paid orders not yet checked in

- Order Phase Overview: `GET /dashboard/order-phase-overview`
  - count of orders in PO phase
  - count of orders in OTS phase

- Event Overview: `GET /dashboard/event-overview`
  - events are grouped into `ended`, `current`, and `upcoming` based on `event_date`
  - `ended` when `event_date < CURRENT_DATE`
  - `current` when `event_date = CURRENT_DATE`
  - `upcoming` otherwise
  - each event entry includes `uuid`, `title`, `event_date`, `status`, `order_count`, and `revenue`
  - revenue is summed from paid payments linked to orders for that event

This README reflects the current backend implementation only and intentionally excludes unimplemented or future features.
