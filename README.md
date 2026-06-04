# SPTC - Smart Project & Task Collaboration Dashboard

SPTC (Smart Project & Task Collaboration) is a premium, high-fidelity project management and task assignment dashboard built using **Next.js 16 (App Router)** and **Redux Toolkit Query (RTK Query)**. It connects to a live backend service to offer real-time synchronization, team management, and granular permission controls.

- **Live Frontend**: [https://sptc-frontend.vercel.app](https://sptc-frontend.vercel.app)
- **Live Backend API**: `https://sptc-system-backend.vercel.app/api/v1`

---

## 🎨 Design System & Aesthetics

SPTC is designed with a premium, state-of-the-art visual style featuring:
- **Harmonious Dark Theme**: Sleek dark backgrounds with customized monochrome/gray layouts.
- **Glassmorphism & Micro-animations**: Soft shadows, responsive layouts, hover state highlights, and smooth state transitions.
- **Visual Status Tags**: Custom indicators representing Task Priorities (`High`, `Medium`, `Low`) and Statuses (`Todo`, `In Progress`, `Completed`).
- **Interactive Custom Modals**: Clean confirmation overlays for critical actions like deletion and user removal instead of generic browser prompt alerts.

---

## 🔑 Role-Based Access Control (RBAC)

The dashboard enforces three clear scopes of permissions:
1. **Admin**:
   - Full management of projects (Create, Edit, Delete).
   - Full management of tasks (Create, Edit, Delete, Reassign).
   - Complete access to the **User Management Panel** (`/users`) to change system roles (Admin, Project Manager, Team Member) and delete user accounts.
2. **Project Manager**:
   - Create and edit projects.
   - Manage team membership within projects (Add/Remove members on details page).
   - Create, edit, and delete project tasks, and reassign them to team members.
3. **Team Member**:
   - View assigned projects and task boards.
   - Quick-toggle task progress (Todo, In Progress, Completed) for tasks assigned to them.

---

## 📁 System Architecture & Directories

```
src/
├── app/                      # Next.js App Router (16.x)
│   ├── (dashboard)/          # Dashboard Route Groups
│   │   ├── page.tsx          # Home Overview (dynamic metrics & workload charts)
│   │   ├── projects/         # Projects directory & details views
│   │   ├── tasks/            # Global tasks listing table
│   │   ├── users/            # Admin User Management table
│   │   └── activity-log/     # System events activity stream log
│   │   login/                # User login page
│   │   register/             # User registration page
│   └── globals.css           # Global custom stylesheet & dark mode variables
├── components/               # Resilient, shared component hierarchy
│   ├── DashboardLayout.tsx   # Sidebar navigation and view shell
│   ├── ProjectTable.tsx      # Clickable project list table
│   ├── CreateProjectModal.tsx# Date-safe project creator modal
│   └── CreateTaskModal.tsx   # Dynamic task creation and assignment modal
├── context/                  # Authentication context provider
│   └── AuthContext.tsx       # Auth status, user credentials, and users list caching
├── redux/                    # Redux Toolkit global state store
│   ├── api/                  # RTK Query API endpoints
│   │   ├── baseApi.ts        # API configuration with JWT Bearer Token injector
│   │   ├── authApi.ts        # Authentication & users database mutations
│   │   ├── projectApi.ts     # Project queries & member assignment mutations
│   │   └── taskApi.ts        # Task queries & CRUD mutations with converters
│   └── slices/               # Local auth credentials slice
└── utils/                    # Loggers & static helper functions
```

---

## ⚡ Key Technical Features

### 1. RTK Query Sync & Cache Invalidation
The application uses a centralized API slice (`baseApi.ts`) that manages tag invalidations (`User`, `Project`, `Task`, `Activity`) for live updates. Mutating a task or adding a project member automatically triggers a refetch of related queries.

### 2. Bidirectional Enum Mappers
Automatic converters bridge differences between backend database enums (`TODO`, `IN_PROGRESS`, `COMPLETED` / `HIGH`, `MEDIUM`, `LOW`) and frontend display states (`Todo`, `In Progress`, `Completed` / `High`, `Medium`, `Low`).

### 3. Date Overflow Protection
Form inputs validate date deadlines to ensure no year beyond `2100` is submitted, preventing MongoDB/Prisma database datetime overflow crashes.

### 4. Interactive Row Actions
Directory tables (projects and tasks) feature fully clickable rows for quick navigation, with child action buttons equipped with `event.stopPropagation()` to prevent nested event triggers.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory to customize the backend endpoint:

```env
NEXT_PUBLIC_BASE_API=https://sptc-system-backend.vercel.app/api/v1
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will build inside the `.next` directory.
