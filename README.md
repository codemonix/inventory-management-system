# Inventory Management System (IMS)

Multi-location stock control with two-phase transfers and built-in backup and restore.

🔗 **Live demo:** [ims.saeidmon.com](https://ims.saeidmon.com)
- **Demo login:** `demo@ims.com` / `demo123` (or use the "Auto-Fill Demo Account" button on the login page)

---

## Overview

IMS manages stock across several warehouses from one item catalog. Stock transfers go through a holding state, so stock is never counted in two places or lost in transit. Every stock movement is logged for auditing, and an admin console can back up and restore the whole system, all or nothing.

## Key features

### 1. Backup and restore
A **System Operations Console** for data safety:
- **Full system backup:** streams a compressed `.zip` with the MongoDB JSON dump and the uploaded images folder directly to the client, using `archiver`.
- **Transactional restore:** uses MongoDB sessions (`session.startTransaction()`) so a restore is all or nothing. If the database restore fails, the file system isn't touched, so nothing ends up half-restored.
- **Factory reset:** a secured reset that wipes all data and uploaded images but keeps admin accounts, used to reset the demo environment.

### 2. Multi-warehouse logic
- **Distributed inventory:** stock levels per location (for example Istanbul and Dubai) with a single item catalog.
- **Two-phase transfer engine:** items move from `Stock` → `In-Transit` → `Confirmed`, and the destination warehouse must acknowledge receipt. The holding state prevents stock discrepancies. Each user assembles their own draft transfer; stock reserved in a draft goes back to the shelf if the draft is replaced or cleared.

### 3. Audit and security
- **Audit log:** every stock adjustment (IN/OUT) and transfer is recorded in a read-only `Transaction` collection.
- **Role-based access control:** middleware-enforced roles protect every route:
  - **User:** stock in/out, and building and sending transfers
  - **Manager:** also confirms transfer arrivals, and manages items, locations and regular users
  - **Admin:** also cancels in-transit transfers, deletes items and locations, and runs system operations (backup, restore, reset, settings)
- **Authentication:** JWT for stateless sessions, bcrypt password hashing, rate-limited login, accounts that need approval, Helmet security headers, and input validation in the service layer.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19 (Vite), Redux Toolkit (items, transfers, auth and dashboard slices), Material UI with DataGrid, Recharts |
| Backend | Node.js, Express, MongoDB (Mongoose) with transactions, `archiver` and `adm-zip` for backup and restore |
| DevOps | Docker (backend, frontend, Nginx, MongoDB), GitHub Actions for testing, building and pushing images to GHCR, Nginx reverse proxy |

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

**Backend** (needs a local MongoDB replica set, because stock changes use transactions)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Frontend**

```bash
cd client
npm install
npm run dev
```

## Testing

- **Backend:** Vitest and Supertest against an in-memory MongoDB replica set, covering API endpoints, auth and role checks, and transfer logic

  ```bash
  cd server && npm test
  ```

- **Frontend:** Vitest for component rendering and state management

  ```bash
  cd client && npm test
  ```

## Project structure

```
├── client/                 # React 19 frontend
│   ├── src/redux/          # Global state (slices and thunks)
│   ├── src/components/     # Reusable UI components
│   └── src/pages/          # Application routes
├── server/                 # Express backend
│   ├── controllers/        # Business logic (inventory, system, auth)
│   ├── models/             # Mongoose schemas (transactions, items)
│   ├── middleware/         # RBAC and error handling
│   └── utils/              # Helpers (backup, logger)
├── .github/workflows/      # CI/CD pipelines
└── docker-compose.yml      # Orchestration
```

## Author

Saeid Monfared · [saeidmon.com](https://www.saeidmon.com) · [LinkedIn](https://www.linkedin.com/in/saeid-monfared/)
