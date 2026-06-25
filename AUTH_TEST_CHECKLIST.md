# Authentication & Authorization Test Checklist

Manual verification checklist for Phase 1 auth. Run against a live stack (`docker-compose up`).

---

## 1. Login

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 1.1 | POST `/api/auth/login` with valid worker credentials | `200` + JWT token returned | |
| 1.2 | POST `/api/auth/login` with valid admin credentials | `200` + JWT token returned | |
| 1.3 | POST `/api/auth/login` with wrong password | `401` + `"Invalid email or password"` | |
| 1.4 | POST `/api/auth/login` with unknown email | `401` + `"Invalid email or password"` | |
| 1.5 | POST `/api/auth/login` with missing email field | `400` + `"Email and password are required"` | |
| 1.6 | POST `/api/auth/login` with missing password field | `400` + `"Email and password are required"` | |
| 1.7 | POST `/api/auth/login` for inactive account (`is_active = false`) | `401` | |

---

## 2. JWT Verification

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 2.1 | Request protected route with valid token | `200` OK | |
| 2.2 | Request protected route with no Authorization header | `401` + `"No token provided"` | |
| 2.3 | Request protected route with malformed token (`Bearer abc123`) | `401` + `"Invalid or expired token"` | |
| 2.4 | Request protected route with expired token | `401` + `"Token expired"` | |
| 2.5 | Request protected route with `Bearer null` or `Bearer undefined` | `401` | |
| 2.6 | Request protected route with `Bearer mock-token` | `401` (no mock fallback) | |

---

## 3. Authorization — Role Access

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 3.1 | Worker token → `GET /api/youth` | `200` | |
| 3.2 | Worker token → `GET /api/youth/:id` | `200` | |
| 3.3 | Worker token → `POST /api/youth` | `201` | |
| 3.4 | Admin token → `GET /api/youth` | `200` | |
| 3.5 | Admin token → `GET /api/youth/:id` | `200` | |
| 3.6 | Admin token → `POST /api/youth` | `201` | |
| 3.7 | Youth token → `GET /api/youth` | `403` Forbidden | |
| 3.8 | Youth token → `GET /api/youth/:id` | `403` Forbidden | |
| 3.9 | Youth token → `POST /api/youth` | `403` Forbidden | |
| 3.10 | No token → `GET /api/youth` | `401` Unauthorized | |
| 3.11 | No token → `POST /api/youth` | `401` Unauthorized | |

---

## 4. Worker Creation API

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 4.1 | Admin token → `POST /api/users/worker` with valid payload | `201` + worker object (no password) | |
| 4.2 | Admin token → duplicate email | `409` Conflict | |
| 4.3 | Admin token → password under 8 chars | `400` | |
| 4.4 | Worker token → `POST /api/users/worker` | `403` Forbidden | |
| 4.5 | No token → `POST /api/users/worker` | `401` Unauthorized | |
| 4.6 | Newly created worker can log in immediately | `200` + JWT | |

---

## 5. Youth API — Data Protection

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 5.1 | Unauthenticated `GET /api/youth` | `401` | |
| 5.2 | Unauthenticated `GET /api/youth/:id` | `401` | |
| 5.3 | Authenticated worker `GET /api/youth` returns array | `200` + `data: [...]` | |
| 5.4 | `POST /api/youth` without `full_name` | `400` validation error | |
| 5.5 | Response never includes `password_hash` | Confirmed absent in all responses | |

---

## 6. Frontend — Login Page

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 6.1 | Visit `/login` when already logged in | Redirect to `/youth` | |
| 6.2 | Submit valid credentials | Token stored in `localStorage`, redirect to `/youth` | |
| 6.3 | Submit invalid credentials | Error message shown, no redirect | |
| 6.4 | Leave email blank and submit | Client-side error message | |

---

## 7. Frontend — Protected Routes

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 7.1 | Visit `/youth` without token | Redirect to `/login` | |
| 7.2 | Visit `/youth/create` without token | Redirect to `/login` | |
| 7.3 | Visit `/youth` with valid token | Page loads normally | |
| 7.4 | Visit `/youth/create` with valid token | Form loads normally | |

---

## 8. Logout & Session Expiry

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 8.1 | Click Logout on catalogue | `localStorage` cleared, redirect to `/login` | |
| 8.2 | Manually delete token from `localStorage`, then access `/youth` | Redirect to `/login` | |
| 8.3 | Backend returns `401` mid-session (expired token) | Frontend clears storage, shows "Your session has expired. Please log in again." | |
| 8.4 | Backend returns `403` | Frontend clears storage, shows permission error, redirect to `/login` | |

---

## 9. Security Hygiene

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 9.1 | Start backend without `JWT_SECRET` | Process exits immediately with fatal error | |
| 9.2 | `password_hash` never appears in any API response | Confirmed | |
| 9.3 | All SQL queries use parameterised form (`$1`, `$2`) | Code review confirmed | |
| 9.4 | `auth.js` mock middleware is not used on any route | Code review confirmed | |
