# API & Service Communication Contracts

The service exposes 13 REST endpoints under `/api` using JSON request and response bodies. Requests are handled synchronously by Express controllers, which read and write MongoDB through Mongoose; protected endpoints require a JWT bearer token.

## Service Catalog

| Service | Port | Category | Purpose |
|---|---:|---|---|
| expense-tracker-backend | `PORT` or `5000` | API Layer | Authentication, category, transaction, and analytics APIs |

## API Endpoints Inventory

`Content-Type: application/json` applies to endpoints with a request body. For protected endpoints, send the JWT as a bearer token in the `Authorization` header. The `:id` path parameter is a MongoDB ObjectId.

| Service | Method | Path | Request Type | Response Type |
|---|---|---|---|---|
| expense-tracker-backend | POST | `/api/auth/register` | JSON body: `username`, `email`, `password` | `201`: `{ success }` |
| expense-tracker-backend | POST | `/api/auth/login` | JSON body: `email`, `password` | `200`: `{ success, token }` |
| expense-tracker-backend | GET | `/api/categories` | Optional query: `type` (`INCOME` or `EXPENSE`) | `200`: `{ success, count, data: Category[] }` |
| expense-tracker-backend | POST | `/api/categories` | JSON body: `name`, `type`; optional `color`, `icon` | `201`: `{ success, data: Category }` |
| expense-tracker-backend | PUT | `/api/categories/:id` | JSON body with category fields to update | `200`: `{ success, data: Category }` |
| expense-tracker-backend | DELETE | `/api/categories/:id` | Path parameter: `id` | `200`: `{ success, message }` |
| expense-tracker-backend | GET | `/api/transactions` | Optional query: `type`, `category`, `startDate`, `endDate` | `200`: `{ success, count, data: Transaction[] }` |
| expense-tracker-backend | POST | `/api/transactions` | JSON body: `type`, `amount`, `category`; optional `date`, `description` | `201`: `{ success, data: Transaction }` |
| expense-tracker-backend | GET | `/api/transactions/:id` | Path parameter: `id` | `200`: `{ success, data: Transaction }` |
| expense-tracker-backend | PUT | `/api/transactions/:id` | Path parameter: `id`; JSON body with transaction fields to update | `200`: `{ success, data: Transaction }` |
| expense-tracker-backend | DELETE | `/api/transactions/:id` | Path parameter: `id` | `200`: `{ success, message }` |
| expense-tracker-backend | GET | `/api/analytics/category-breakdown` | Optional query: `type`, `startDate`, `endDate` | `200`: `{ success, data: CategoryBreakdown[] }` |
| expense-tracker-backend | GET | `/api/analytics/monthly-trend` | Optional query: `type` | `200`: `{ success, data: MonthlyTrend[] }` |

## Management & Observability Endpoints

No management, health-check, or metrics endpoints are defined in the application routes.

## DTOs & Contracts

There are no separate DTO classes; request handling uses Express `req.body`/`req.query` and Mongoose models. JSON responses use these shapes:

- **Register request:** `{ "username": "Alex", "email": "alex@example.com", "password": "your-password" }`. On success, the API returns `{ "success": true }`; it does not return a token.
- **Login request:** `{ "email": "alex@example.com", "password": "your-password" }`. On success, the API returns `{ "success": true, "token": "JWT value" }`. The JWT expires after seven days.
- **Category create/update request:** `{ "name": "Food", "type": "EXPENSE", "color": "#3b82f6", "icon": "tag" }`. `color` and `icon` are optional; model defaults are `#3b82f6` and `tag`. `type` is `INCOME` or `EXPENSE`.
- **Transaction create/update request:** `{ "type": "EXPENSE", "amount": 24.5, "category": "Food", "date": "2026-10-31T00:00:00.000Z", "description": "Lunch" }`. `date` defaults to the current time; `description` is optional. `type` is `INCOME` or `EXPENSE`.
- **Category response object:** `{ "_id": "...", "name": "...", "type": "INCOME|EXPENSE", "userId": "...|null", "color": "...", "icon": "...", "createdAt": "...", "updatedAt": "...", "__v": 0 }`. Global categories have a null `userId`.
- **Transaction response object:** `{ "_id": "...", "userId": "...", "type": "INCOME|EXPENSE", "amount": 0, "category": "...", "date": "...", "description": "...", "createdAt": "...", "updatedAt": "...", "__v": 0 }`. Optional `description` may be absent.
- **Category breakdown item:** `{ "category": "...", "totalAmount": 0, "count": 0 }`.
- **Monthly trend item:** `{ "year": 2026, "month": 10, "totalAmount": 0, "count": 0 }`, with `month` numbered from 1 to 12.

List endpoints return arrays in `data`; an empty result is an empty array with `count: 0` where a count is included. Update endpoints accept a partial set of fields; model validation runs on updates.

## Communication Patterns

- **Synchronous communication:** Express routes call controllers, which call Mongoose and MongoDB. No other internal services, message brokers, retries, circuit breakers, service discovery, or gateway aggregation are configured.
- **Authentication:** Category, transaction, and analytics routes require a JWT bearer token in the `Authorization` header. Registration and login are public. The token is signed with the configured JWT secret and expires in seven days.
- **Transport security:** The application does not configure TLS; HTTPS must be provided by the deployment/proxy layer if required.
- **Startup:** The server starts the database connection and calls `app.listen` without waiting for the connection promise to resolve.
- **Error responses:** In development, the error middleware returns `{ "success": false, "status": "fail|error", "message": "...", "stack": "..." }`. In production, operational errors return `{ "success": false, "status": "fail|error", "message": "..." }`; unexpected errors return HTTP 500 with `{ "success": false, "status": "error", "message": "Something went very wrong!" }`.
- **Authentication errors:** The auth middleware returns `{ "message": "Not authorized, no token" }` if a token is absent, or `{ "message": "Not authorized, token failed" }` if token verification fails. These responses do not include the `success` field.

## Service Technology Matrix

| Service | Web | Data Access | Discovery | Gateway | Actuator | Cache | Metrics |
|---|---|---|---|---|---|---|---|
| expense-tracker-backend | Express | Mongoose / MongoDB | None | None | None | None | None |

## Service Communication Sequence

<!-- mermaid-checked: every participant uses `participant Id as "Label"`, no \n in aliases/messages/notes, every alt/opt/loop closed by end, no `:` inside any alias -->
~~~mermaid
sequenceDiagram
    participant Client as "Client"
    participant API as "Express API"
    participant Auth as "Auth Middleware"
    participant Controller as "Controller"
    participant DB as "MongoDB"

    Client->>API: POST /api/auth/login with email and password
    API->>Controller: Find user and verify password
    Controller->>DB: Find user by email
    DB-->>Controller: User record
    Controller-->>API: 200 success and JWT
    API-->>Client: Login response
    Client->>API: GET /api/transactions with JWT Authorization header
    API->>Auth: Verify JWT
    alt Token is valid
        Auth-->>API: Attach user ID
        API->>Controller: Get transactions for user
        Controller->>DB: Query user transactions
        DB-->>Controller: Transaction records
        Controller-->>API: 200 success, count, data
        API-->>Client: Transaction list
    else Token is invalid or missing
        Auth-->>Client: 401 message
    end
~~~
