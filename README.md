# Inventory Management System (IMS)

[![CI](https://github.com/codemonix/inventory-management-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/codemonix/inventory-management-system/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Multi-location stock control with two-phase transfers, an audit log, and built-in backup and restore.

🔗 **Live demo:** [ims.saeidmon.com](https://ims.saeidmon.com)
- **Demo login:** `demo@ims.com` / `demo123` (or use the "Auto-Fill" button on the login page)

---

## Overview

IMS manages stock across several warehouses from one item catalog. Stock transfers go through a holding state, so stock is never counted in two places or lost in transit. Every stock movement is logged for auditing, and an admin console can back up and restore the whole system, all or nothing.

## Key features

### 1. Backup and restore
A **System Operations Console** for data safety:
- **Full system backup:** streams a compressed `.zip` with the MongoDB JSON dump and the uploaded images directly to the client, using `archiver`.
- **Transactional restore:** the database is restored inside a MongoDB transaction, so a restore is all or nothing. Images are staged first and only swapped in after the database commit, so a failed restore leaves nothing half-restored.
- **Factory reset:** wipes all data and uploaded images but keeps admin accounts; used to reset the demo environment.
- **Demo mode:** an admin switch that shows a one-click demo login on the login page.

### 2. Multi-warehouse logic
- **Distributed inventory:** stock levels per location (for example Istanbul and Dubai) with a single item catalog.
- **Two-phase transfer engine:** items move from `Stock` → `In-Transit` → `Confirmed`, and the destination must acknowledge receipt. Each user assembles their own draft; stock in a draft is reserved and goes back to the shelf if a line is removed or the draft is discarded. Admins can cancel an in-transit transfer, which returns its stock to the source.
- **Transfer history:** paged and lazy-loaded, with search and filters by status, route and date.

### 3. Audit and security
- **Audit log:** every stock movement (IN, OUT and TRANSFER) is recorded in a `Transaction` collection, in the same database transaction as the stock change.
- **Role-based access control:** middleware-enforced roles protect every route:
  - **User:** stock in/out, and building and sending transfers
  - **Manager:** also confirms transfer arrivals, and manages items, locations and regular users
  - **Admin:** also cancels in-transit transfers, deletes items and locations, and runs system operations (backup, restore, reset, settings)
- **Authentication:** JWT sessions, bcrypt password hashing, rate-limited login, accounts that need approval, Helmet security headers, and input validation in the service layer.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Redux Toolkit (items, locations, transfers and dashboard slices), Material UI with DataGrid, light and dark themes |
| Backend | Node.js, Express, TypeScript, MongoDB (Mongoose) with transactions, `archiver` and `adm-zip` for backup and restore, Winston logging |
| Testing | Vitest, Supertest and an in-memory MongoDB replica set (API); Vitest and Testing Library (UI) |
| DevOps | Docker (backend, frontend, Nginx, MongoDB), GitHub Actions for linting, testing, and publishing images to GHCR, Nginx reverse proxy |

API reference: [server/openapi.yaml](server/openapi.yaml) (OpenAPI 3).

## Installation

### Option 1: Docker (recommended)
Runs the full stack (database, API and client).

```bash
# 1. Clone the repository
git clone https://github.com/codemonix/inventory-management-system.git
cd inventory-management-system

# 2. Configure the environment (MongoDB credentials, JWT secret)
cp .env.example .env

# 3. Create the MongoDB replica-set keyfile
mkdir -p mongo && openssl rand -base64 756 > mongo/keyfile
sudo chown 999:999 mongo/keyfile && sudo chmod 400 mongo/keyfile

# 4. Start the application
docker compose up -d
```

The dashboard runs at `http://localhost`. On first visit, open `/setup` to create the first admin.
For production (and for migrating an existing database to authenticated MongoDB) see [docs/mongo-auth-runbook.md](docs/mongo-auth-runbook.md).

### Option 2: Manual setup

**Database:** stock changes use transactions, so MongoDB must run as a replica set. A single-node one in Docker is enough:

```bash
docker run -d --name ims-mongo -p 27017:27017 mongo:8 --replSet rs0
docker exec ims-mongo mongosh --quiet --eval "rs.initiate()"
```

**Backend**

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Frontend**

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints and go to `/setup` to create the first admin.

## Testing

```bash
cd server && npm run test:all   # API, auth/role checks, transfers, backup round trip
cd client && npm test -- --run  # components, hooks and pages
```

Both projects also have `npm run lint` and `npm run typecheck`; CI runs all of them on every push.

## Project structure

```
├── client/                  # React + TypeScript frontend
│   └── src/
│       ├── pages/           # Route-level screens (lazy loaded)
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Data fetching and UI logic
│       ├── redux/           # Slices, thunks and selectors
│       ├── services/        # API calls
│       └── types/           # Shared TypeScript types
├── server/                  # Express + TypeScript backend
│   ├── routes/              # Endpoints and their integration tests
│   ├── controllers/         # HTTP layer: parse requests, send responses
│   ├── services/            # Business logic and transactions
│   ├── models/              # Mongoose schemas
│   ├── middleware/          # Auth, roles, rate limiting, errors, uploads
│   └── utils/               # Validation, logging, uploads
├── docs/                    # Operations runbooks
├── mongo/                   # Replica-set and user initialisation
├── .github/workflows/       # CI/CD pipeline
├── docker-compose.yml       # Local full stack (built from source)
└── docker-compose.ims.yml   # Production stack (images from GHCR)
```

## License

[MIT](LICENSE)

## Author

Saeid Monfared · [saeidmon.com](https://www.saeidmon.com) · [LinkedIn](https://www.linkedin.com/in/saeid-monfared/)
