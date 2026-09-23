# Backend Foundation

NestJS + PostgreSQL + Prisma backend for the UK Transport Platform.

## Working directory

All commands below are run from `backend/`.

## 1. Start PostgreSQL (Docker)

```
docker compose up -d
```

## 2. Create your local environment file

```
cp .env.example .env
```

Set your own Stripe test-mode keys, a `JWT_SECRET`, and optionally
`ADMIN_EMAIL`/`ADMIN_PASSWORD` to bootstrap the first Master Admin.

## 3. Install dependencies

```
npm install
```

## 4. Generate the Prisma client and apply migrations

```
npx prisma generate
npx prisma migrate dev
```

## 5. Seed the first Master Admin (optional, one-time)

```
npx prisma db seed
```

## 6. Start the backend

```
npm run start:dev
```

## Endpoints implemented so far

* `GET /health`, `GET /health/db`
* `POST /fare/calculate`, `POST /discount/calculate`
* `POST /bookings`
* `POST /payments`, `POST /payments/webhook`
* `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
* **Admin foundation (B9)**, all requiring a valid JWT for a `role: ADMIN` user:

  * `GET /admin/users` — list users (permission: `MANAGE_ADMINS`)
  * `POST /admin/users` — create an ADMIN/DRIVER account (Master Admin only)
  * `PATCH /admin/users/:id/permissions` — grant/revoke permissions or Master status (Master Admin only)
  * `GET /admin/bookings`, `GET /admin/bookings/:reference`, `PATCH /admin/bookings/:reference/status` (permission: `MANAGE_BOOKINGS`)
  * `GET /admin/discounts`, `GET /admin/discounts/:id`, `POST /admin/discounts`, `PATCH /admin/discounts/:id` (permission: `MANAGE_DISCOUNTS`)
  * `GET /admin/fare/config` — read-only view of the current fare pricing configuration (permission: `VIEW_FARE_CONFIG`)
  * `GET /admin/audit-log` (permission: `VIEW_AUDIT_LOG`)
* **Content (B10.2)**:

  * Public (no auth, published/active only):

    * `GET /content/blogs`
    * `GET /content/blogs/:slug`
    * `GET /content/service-content/type/:type`
    * `GET /content/service-content/slug/:slug`
    * `GET /content/vehicles`
  * Admin (permission: `MANAGE_CONTENT`):

    * `GET/POST /admin/content/blogs`
    * `GET/PATCH/DELETE /admin/content/blogs/:id`
    * `PATCH /admin/content/blogs/:id/status`
    * Equivalent endpoints under `/admin/content/service-content`
    * Equivalent endpoints under `/admin/content/vehicles`

## Admin authorization model

`role: ADMIN` alone grants nothing. A subordinate admin only gets access to
the specific `adminPermissions` granted on their `User` row. `isMasterAdmin`
bypasses all permission checks and is the only way to create new admin/driver
accounts or grant/revoke another admin's permissions. Authorization is
re-checked against the database on every request (not baked into the JWT),
so a revoked permission takes effect immediately.

## Tests

```
npm test
```
- **Settings (B10.4)**: `GET /content/settings` (public, no auth); `GET /admin/settings`, `PATCH /admin/settings` (permission: `MANAGE_SETTINGS`) — singleton business/contact info: company name, phone, WhatsApp number, contact email, logo URL, ticker message. No secrets are stored here.
- **Media (B10.5)**: `GET /admin/media`, `POST /admin/media`, `DELETE /admin/media/:id` (permission: `MANAGE_CONTENT`). External URL registry only — no binary upload/storage. URLs must be `https://` and match the declared media type's file extension. Content records (Blog/ServiceContent/VehicleContent) continue to store URL strings directly, not a foreign key to this table, so removing a library entry never breaks existing content.
- **Driver Operational Management (B13, permission: `MANAGE_DRIVERS`)**: `GET /admin/drivers`, `GET /admin/drivers/assignable?vehicleCategory=`, `GET /admin/drivers/:id`, `POST /admin/drivers`, `PATCH /admin/drivers/:id/status`, `PATCH /admin/drivers/:id`. `DriverProfile` is one row per existing DRIVER-role User (no second identity system). `status: ON_RIDE` is system-managed only — set/cleared automatically by Ride assignment and completion; cannot be set directly via the API.
- **Availability (B12, permission: `MANAGE_AVAILABILITY`)**: `GET /admin/availability/blocks`, `POST /admin/availability/blocks`, `DELETE /admin/availability/blocks/:id`, `POST /admin/availability/check`. Conflict detection covers admin-defined blackout windows (real start/end overlap) and exact date+time+vehicle-category collisions against existing non-cancelled Bookings. Booking has no stored journey duration, so true time-range overlap against other bookings is not yet implemented — a known, deliberate limitation pending a future duration field.
- **Driver Operational Management (B13, permission: `MANAGE_DRIVERS`)**: `GET /admin/drivers`, `GET /admin/drivers/assignable?vehicleCategory=`, `GET /admin/drivers/:id`, `POST /admin/drivers`, `PATCH /admin/drivers/:id/status`, `PATCH /admin/drivers/:id`. `DriverProfile` is one row per existing DRIVER-role User (no second identity system). `status: ON_RIDE` is system-managed only — set/cleared automatically by Ride assignment and completion; cannot be set directly via the API.

## Notifications (B14)

**Permission:** `VIEW_NOTIFICATIONS`

Admin notification endpoints:

- `GET /admin/notifications?unread=true`
- `PATCH /admin/notifications/:id/read`

This is an internal, persisted notification log. No external email, SMS, or WhatsApp provider is integrated anywhere in this project, so notification records do not claim that a message was actually delivered externally.

Real events that generate notifications:

- `BOOKING_CREATED` — `BookingService`
- `PAYMENT_SUCCEEDED` / `PAYMENT_FAILED` — `PaymentService` verified Stripe webhook handler only
- `RIDE_STATUS_CHANGED` — `RideService`
- `DRIVER_ASSIGNED` — `RideService`, only on a genuine new driver assignment

Notification persistence failures are logged and never propagate back into the triggering booking, payment, or ride transaction.
