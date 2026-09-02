# 🏢 Enterprise Role-Based Access Control (RBAC) Task Management System

A production-grade, enterprise-standard **Task & Assignment Management System** built with **Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, and React (Vite + Tailwind CSS)**.

Designed with clean MVC + Services architecture, robust authorization guards, MongoDB aggregation pipelines, immutable audit logging, and a modern, role-tailored dashboard.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **Dual-Token JWT Authentication**: Short-lived Access Token (`15m`/`1h`) and long-lived Refresh Token (`7d`).
- **Account Email Verification Workflow**: New registrations dispatch a secure, expiring (24h) verification link via `nodemailer`. Unverified logins are blocked with a 403 status and direct resend options.
- **Automatic Refresh Token Rotation**: Seamless background token refresh via Axios interceptors without logging the user out.
- **Bcrypt Password Hashing**: Passwords salted & hashed via Mongoose pre-save hooks (`select: false`).
- **Security Middlewares**: `helmet` security headers, `cors` domain whitelisting, `express-rate-limit` brute-force protection.
- **Soft Deletion**: Preserves historical foreign keys and audit integrity by marking `isDeleted: true`.

### 👥 2. Role-Based Access Control (RBAC)
- **Admin**:
  - Full control over user accounts (create, activate/deactivate, soft delete).
  - Global task visibility and system-wide deletion privileges.
  - High-level productivity analytics and live audit stream.
- **Manager**:
  - Create and delegate tasks to team members.
  - Update deadlines, priority levels, and reassign tasks.
  - Monitor team workload distribution and task completion rates.
- **Employee / User**:
  - Isolated access strictly to assigned tasks.
  - Update task progress (`Pending` &rarr; `In Progress` &rarr; `Completed` / `Rejected`).
  - Upload task deliverables/attachments and participate in task discussion threads.

### 📋 3. Task Management & Workflows
- **Dynamic Task Board & Table Views**: Switchable grid cards and responsive tabular view.
- **Rich Filtering & Search**: Filter by status, priority, due date, overdue state, and full-text search.
- **Assignment Audit Trail (`AssignmentHistory`)**: Tracks every state transition, assignee change, and note into an immutable timeline.
- **Discussion Threads**: Real-time style commenting for assignees and managers on individual tasks.
- **File Attachments**: Upload attachments using `multer` with `cloudinary` integration (and graceful local storage fallback).
- **Email Notifications**: Responsive HTML email templates via `nodemailer` for task assignments and status completions.

### 📊 4. Database Aggregations & Analytics
- **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$lookup`, `$sort`, `$limit`) calculating:
  - User role distributions.
  - Task completion rates and overdue counts.
  - Active employee workloads.
  - Leaderboard rankings.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Node.js (v20+), Express.js (v4), MongoDB, Mongoose |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit` |
| **File Storage** | `multer`, `cloudinary` |
| **Notifications** | `nodemailer` |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Orchestration** | `concurrently` (unified one-command startup) |

---

## 📁 Project Folder Structure

```
Management_System/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection & events
│   │   └── cloudinary.js         # Cloudinary configuration & fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, login, refresh, logout
│   │   ├── userController.js     # User CRUD, role update, status toggle
│   │   ├── taskController.js     # Task CRUD, status, assign, comments
│   │   └── analyticsController.js# MongoDB Aggregation dashboard metrics
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification & active user guard
│   │   ├── roleMiddleware.js     # RBAC role authorization (authorizeRoles)
│   │   ├── errorMiddleware.js    # Centralized Express error handler
│   │   └── uploadMiddleware.js   # Multer file upload validation
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   ├── Task.js               # Task schema with comments & attachments
│   │   └── AssignmentHistory.js  # Immutable audit trail schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── taskRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   ├── auditService.js       # Audit log creator & retriever
│   │   └── mailService.js        # Nodemailer email dispatcher
│   ├── utils/
│   │   ├── generateTokens.js     # Access & Refresh token generators
│   │   ├── apiResponse.js        # Standardized API response format
│   │   └── pagination.js         # Pagination helper
│   ├── seeds/
│   │   └── seedData.js           # Automated database seeder
│   ├── uploads/                  # Local storage fallback directory
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance with Refresh Interceptor
│   │   ├── context/              # AuthContext (user, login, logout)
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, StatCard, Badge, Modal
│   │   │   ├── tasks/            # TaskCard, TaskTable, TaskModal, HistoryModal
│   │   │   └── users/            # UserModal, UserTable
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login with 1-Click Demo Fill buttons
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx     # Role-aware analytics overview
│   │   │   ├── Tasks.jsx         # Task management board
│   │   │   ├── TaskDetails.jsx   # Task details, comments, and attachments
│   │   │   ├── Users.jsx         # User directory & administration
│   │   │   └── Profile.jsx
│   │   ├── routes/               # ProtectedRoute & AppRoutes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── INTERVIEW_GUIDE.md            # Comprehensive interview defense & Q&A
├── package.json                  # Root orchestration script
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: `v18+` or `v20+` installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Install All Dependencies
From the root directory:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/`:
```bash
# In backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rbac_assignment_system
JWT_SECRET=production_super_secret_jwt_access_key_2026
JWT_REFRESH_SECRET=production_super_secret_jwt_refresh_key_2026
CLIENT_URL=http://localhost:5173
```
*(Cloudinary and SMTP fields are optional; if left blank, the app will safely fall back to local file storage and console email logs).*

### 3. Seed the Database
Populate realistic dummy data (Admins, Managers, Employees, Tasks, and Audit logs):
```bash
npm run seed
```

### 4. Run Full-Stack Development Servers
Start both backend (Port `5000`) and frontend (Port `5173`) concurrently:
```bash
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Indian Test Credentials

For live interview demos, you can also use the **1-Click Quick Demo Login** buttons on the login screen:

| Role | Name | Email | Password | Phone | Privileges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **👑 Admin** | Vikram Malhotra | `admin@example.com` | `Admin@123456` | `+91 98201 11223` | User CRUD, role management, global tasks, system analytics |
| **💼 Manager 1** | Sneha Mukherjee | `manager.sneha@example.com` | `Manager@123456` | `+91 98301 44556` | Create tasks, assign employees, view team metrics |
| **💼 Manager 2** | Amit Verma | `manager.amit@example.com` | `Manager@123456` | `+91 98112 77889` | Create tasks, assign employees, view team metrics |
| **👨‍💻 Employee 1** | Rahul Sharma | `employee.rahul@example.com` | `Employee@123456` | `+91 98765 43210` | View assigned tasks, progress transitions, file uploads |
| **👨‍💻 Employee 2** | Rohan Das | `employee.rohan@example.com` | `Employee@123456` | `+91 97481 23654` | View assigned tasks, progress transitions, file uploads |
| **🎨 Employee 3** | Priya Patel | `employee.priya@example.com` | `Employee@123456` | `+91 99033 88776` | View assigned tasks, progress transitions, file uploads |
| **🧪 Employee 4** | Ananya Sen | `employee.ananya@example.com` | `Employee@123456` | `+91 98310 99887` | View assigned tasks, progress transitions, file uploads |

---

## 📡 REST API Documentation

### Auth Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue tokens |
| `POST` | `/api/auth/refresh-token` | Public | Obtain new access token via refresh token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/auth/logout` | Authenticated | Clear refresh token cookie |

### User Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin, Manager | List users with search, role filter, pagination |
| `GET` | `/api/users/employees` | Admin, Manager | List active employees for task assignment |
| `GET` | `/api/users/:id` | Authenticated | Get user profile and assigned task stats |
| `POST` | `/api/users` | Admin | Create a new user with role assignment |
| `PUT` | `/api/users/:id` | Admin, Self | Update user details |
| `PATCH` | `/api/users/status/:id` | Admin | Toggle user status (Active / Inactive) |
| `DELETE` | `/api/users/:id` | Admin | Soft delete user (`isDeleted: true`) |

### Task Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Authenticated | Get tasks with role scoping, search & filters |
| `GET` | `/api/tasks/:id` | Authenticated | Get task by ID with full audit trail |
| `POST` | `/api/tasks` | Admin, Manager | Create task, assign employee, log audit entry |
| `PUT` | `/api/tasks/:id` | Admin, Manager | Update task title, description, priority, due date |
| `PATCH` | `/api/tasks/status/:id` | Assignee, Admin, Manager | Transition task status & log audit entry |
| `PATCH` | `/api/tasks/assign/:id` | Admin, Manager | Reassign task to a different employee |
| `POST` | `/api/tasks/:id/comments` | Authenticated | Post comment in discussion thread |
| `POST` | `/api/tasks/:id/attachments`| Authenticated | Upload file attachment (Cloudinary/Local) |
| `DELETE` | `/api/tasks/:id` | Admin | Soft delete task |

### Analytics Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Authenticated | Role-tailored aggregation metrics |

---

## 🎯 Interview Preparation

See **[`INTERVIEW_GUIDE.md`](./INTERVIEW_GUIDE.md)** for:
- 60-second project pitch.
- Deep architectural justification (Dual JWT, soft deletes, MongoDB aggregation pipelines).
- Top 10 technical interview Q&A with senior-level answers.
- 5-step live interview walkthrough script.
