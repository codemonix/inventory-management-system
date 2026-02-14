
# Inventory Management System (IMS)
**Enterprise-grade multi-warehouse stock control solution with automated disaster recovery.**

### 🔗 [Live Demo: ims.saeidmon.com](https://ims.saeidmon.com)
* **Credentials**: `demo@ims.com` / `demo123`
*(Note: You can also use the "Auto-Fill Demo Account" button on the login page)*

---

## 🚀 Project Overview

This is a robust, full-stack Inventory Management System designed to handle complex stock operations across distributed geographies. Unlike standard CRUD applications, this system implements **transactional integrity**, **two-phase commitments** for stock transfers, and a **disaster recovery engine** capable of full system backups and restores.

It is built to demonstrate production-ready architecture, strict security standards (RBAC), and automated DevOps pipelines.

---

## ✨ Key Engineering Highlights

### 1. 🛡️ Enterprise Disaster Recovery
Includes a dedicated **System Operations Console** for data safety[cite: 1205, 1213]:
***Full System Backup**: Streams a compressed `.zip` containing both the MongoDB JSON dump and the raw image uploads folder directly to the client using `archiver`.
***Transactional Restore**: Implements MongoDB Sessions (`session.startTransaction()`) to ensure an "All-or-Nothing" restore process. If the database restore fails, the file system is not touched, preventing data corruption.
***Factory Reset**: A secured "Kill Switch" that wipes all transactional data while preserving admin accounts, useful for resetting demo environments.

### 2. 📦 Multi-Warehouse Logic
***Distributed Inventory**: Manages stock levels across specific locations (e.g., Istanbul, Dubai) with a unified item catalog.
* **Two-Phase Transfer Engine**: prevents stock discrepancies by using a "Temporary Transfer" holding state. [cite_start]Items move from `Stock` $\to$ `In-Transit` $\to$ `Confirmed`, requiring acknowledgement at the destination warehouse.

### 3. 📜 Audit & Security
***Immutable Logs**: Every stock adjustment (IN/OUT) and transfer is recorded in a read-only `Transaction` collection for auditing purposes.
* **RBAC Architecture**: Middleware-enforced roles (`Admin`, `Manager`, `User`) protect sensitive routes. [cite_start]For example, only Admins can trigger system restores or manage users.

---

## 🛠️ Technical Stack

### Frontend
* **Core**: React 19 (Vite)
***State Management**: Redux Toolkit (Slices for Items, Transfers, Auth, Dashboard)
***UI Framework**: Material UI (MUI) with DataGrid for advanced tables 
* **Visualization**: Recharts / Custom Dashboard Components

### Backend
* **Runtime**: Node.js & Express
***Database**: MongoDB (Mongoose) with Transaction Support 
***System Ops**: `archiver` (Zip streaming) & `adm-zip` (Restore logic) 
***Security**: JWT Authentication, BCrypt password hashing, Helmet security headers

### DevOps
***Containerization**: Fully Dockerized (Backend, Frontend, Nginx, MongoDB)
***CI/CD**: GitHub Actions pipelines for automated testing, building, and pushing to GHCR.
***Infrastructure**: Nginx Reverse Proxy for production routing.

---

## ⚡ Installation & Setup

### Option 1: Docker (Recommended)
The fastest way to run the full stack (Database + API + Client).

```bash
# 1. Clone the repository
git clone [https://github.com/saeidmon/inventory-management-system.git](https://github.com/saeidmon/inventory-management-system.git)
cd inventory-management-system

# 2. Configure Environment
# (Optional) Create a .env file if you want to override defaults
cp .env.example .env

# 3. Start the Application
docker-compose up -d

```

*Access the dashboard at `http://localhost:3000` (or your configured port).*

### Option 2: Manual Setup

**Backend**

```bash
cd server
npm install
# Ensure you have a local MongoDB instance running
npm run dev

```

**Frontend**

```bash
cd client
npm install
npm run dev

```

---

## 🧪 Testing

The project maintains reliability through a dual-testing strategy:

* 
**Backend Tests**: Uses `Jest` and `Supertest` to validate API endpoints, auth flows, and complex transfer logic.


```bash
cd server && npm test

```


* 
**Frontend Tests**: Uses `Vitest` for component rendering and state management checks.


```bash
cd client && npm test

```



---

## 📂 Project Structure

```
├── client/                 # React 19 Frontend
│   ├── src/redux/          # Global State (Slices & Thunks)
│   ├── src/components/     # Reusable UI Components
│   └── src/pages/          # Application Routes
├── server/                 # Express Backend
│   ├── controllers/        # Business Logic (Inventory, System, Auth)
│   ├── models/             # Mongoose Schemas (Transactions, Items)
│   ├── middleware/         # RBAC & Error Handling
│   └── utils/              # Helper functions (Backup, Logger)
├── .github/workflows/      # CI/CD Pipelines
└── docker-compose.yml      # Orchestration

```

---

## 🔒 Security Features

* **Role-Based Access Control**: Strict separation of `Admin` vs `Viewer` capabilities.
* **Sanitization**: Inputs validated via Mongoose schemas.
* 
**Session Management**: Secure JWT implementation for stateless authentication.



---

*© 2026 Codemonix. Built for production environments.*

```

```