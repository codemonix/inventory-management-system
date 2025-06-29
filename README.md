**Inventory Management System**

A robust, full-stack Inventory Management System to track items, locations, and transfers — built with Express, MongoDB, and React (Vite + MUI + Redux Toolkit). Developed for a real-world client to demonstrate practical, production-grade full-stack development skills.

---

## 🚀 Features

* **User Authentication & Authorization**: Secure login and role-based access (admin, manager, user).
* **Item CRUD**: Create, read, update, and delete items; unique codes ensure no filename conflicts for images.
* **Location Management**: Define and manage multiple storage locations with stock counts.
* **Inventory Operations**: Record stock in/out operations, with detailed transaction logs.
* **Transfers**: Create, preview, and confirm transfer packages between locations; shared `tempTransfer` for all users.
* **Admin Console**: Manage users via an admin dashboard using MUI DataGrid with actions (activate/deactivate, edit).
* **Pagination & Sorting**: Efficient fetching of items with query params reflected in the URL.
* **Tests**: Automated backend tests with Jest & Supertest; frontend tests with Vitest & React Testing Library.

---

## 🛠️ Tech Stack

* **Frontend**: React, Vite, MUI, Redux Toolkit (with slices for items, transfers, auth), React Router, shadcn/ui
* **Backend**: Node.js, Express, MongoDB (via Mongoose), MongoMemoryServer (for tests)
* **State Management**: Redux Toolkit (planned undo/redo support)
* **Testing**:

  * Backend: Jest, Supertest, MongoMemoryServer
  * Frontend: Vitest, React Testing Library
* **CI/CD**: (e.g., GitHub Actions)

---

## 📦 Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/inventory-management-system.git
   cd inventory-management-system
   ```
2. **Install dependencies**

   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

---

## ⚙️ Configuration

1. **Environment Variables**

   * Create a `.env` file in `server/`:

     ```env
     PORT=4000
     MONGO_URI=your_mongo_connection_string
     JWT_SECRET=your_jwt_secret
     ```
2. **MongoDB Setup**

   * Ensure MongoDB is running locally or adjust `MONGO_URI` to point to your cloud instance.

---

## 🚀 Running Locally

* **Start the server**

  ```bash
  cd server
  npm run dev
  ```
* **Start the client**

  ```bash
  cd ../client
  npm run dev
  ```
* **Access**: Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

* **Backend tests**

  ```bash
  cd server
  npm test
  ```
* **Frontend tests**

  ```bash
  cd client
  npm test
  ```

---

## 📄 API Endpoints

| Method | Path               | Description                     |
| ------ | ------------------ | ------------------------------- |
| POST   | `/api/auth/login`  | Authenticate user, return JWT   |
| POST   | `/api/auth/signup` | Create first admin or new users |
| GET    | `/api/items`       | List items (paginated)          |
| POST   | `/api/items`       | Create item                     |
| PUT    | `/api/items/:id`   | Update item                     |
| DELETE | `/api/items/:id`   | Delete item                     |
| ...    | ...                | ...                             |

* will be updated

---



## 💡 Future Roadmap

* Implement undo/redo functionality with Redux
* Add password reset via email support
