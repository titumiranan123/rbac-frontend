# RBAC Frontend

Role-Based Access Control System with Next.js 16 + TypeScript + Tailwind CSS

## Tech Stack

- **Framework:** Next.js ^14.2.35 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Context
- **HTTP Client:** Axios (with interceptors)
- **Forms:** React Hook Form + Zod

## Features

### Authentication

- JWT Access Token (stored in memory, cookie for middleware)
- Refresh Token (httpOnly cookie)
- No localStorage (secure)
- Auto-refresh on 401

### Permission System

- Dynamic Routing (permission atom based)
- Permission Atoms: 21 predefined
- Route → Permission mapping
- Middleware permission check

### Dynamic Sidebar

- Runtime permission check
- Shows/hides menu items based on user permissions
- Auto-refresh permissions on mount

### Permission Editor

- Visual toggle editor
- Grant Ceiling respect (disabled if no permission)
- User-based permission management

### Modules

- Dashboard (view_dashboard)
- Users (view_users + CRUD)
- Leads (view_leads) - stub
- Tasks (view_tasks) - stub
- Reports (view_reports) - stub
- Audit Log (view_audit_log)
- Customer Portal (view_customer_portal)
- Permissions Management (edit_user)

## Routes

| Route            | Permission           | Description       |
| ---------------- | -------------------- | ----------------- |
| /login           | Public               | Login page        |
| /register        | Public               | Registration page |
| /dashboard       | view_dashboard       | Dashboard         |
| /users           | view_users           | User management   |
| /leads           | view_leads           | Leads (stub)      |
| /tasks           | view_tasks           | Tasks (stub)      |
| /reports         | view_reports         | Reports (stub)    |
| /audit           | view_audit_log       | Audit logs        |
| /settings        | view_settings        | Settings (stub)   |
| /permissions     | edit_user            | Permission editor |
| /customer-portal | view_customer_portal | Customer portal   |
| /403             | -                    | Forbidden access  |

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Run Development Server

```bash
npm run dev
# Opens http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
npm run start
```

## Architecture

### File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── audit/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── permissions/page.tsx
│   │   └── customer-portal/page.tsx
│   ├── 403/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   ├── sidebar/
│   │   └── DynamicSidebar.tsx
│   └── PermissionEditor.tsx
├── context/
│   ├── AuthContext.tsx
│   └── PermissionContext.tsx
├── lib/
│   ├── api-client.ts
│   ├── permissions.ts
│   └── schemas.ts
├── types/
│   └── index.ts
└── middleware.ts
```

### Context Providers

```typescript
// app/layout.tsx
<AuthProvider>
  <PermissionProvider>
    {children}
  </PermissionProvider>
</AuthProvider>
```

### Auth Flow

```
1. User enters credentials
2. AuthContext.login() → POST /api/auth/login
3. Token stored in:
   - apiClient (memory)
   - Cookie (for middleware)
4. setAccessToken(token) updates apiClient
```

### API Client

```typescript
// Auto-attaches token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token
      // Retry request
    }
  },
);
```

### Middleware

```typescript
// middleware.ts
// 1. Check token validity
// 2. Check route permission
// 3. Redirect if unauthorized
```

### Dynamic Sidebar

```typescript
// Fetches user permissions on mount
// Filters menu items based on hasPermission()
// Only shows permitted routes
```

## Permission Atoms

```typescript
const PERMISSION_ATOMS = [
  "view_dashboard",
  "view_users",
  "create_user",
  "edit_user",
  "delete_user",
  "suspend_user",
  "ban_user",
  "view_leads",
  "create_lead",
  "edit_lead",
  "delete_lead",
  "view_tasks",
  "create_task",
  "edit_task",
  "delete_task",
  "view_reports",
  "view_audit_log",
  "view_settings",
  "view_customer_portal",
  "view_orders",
  "view_tickets",
];
```

### Route Permission Mapping

```typescript
const ROUTE_PERMISSION_MAP = {
  "/dashboard": "view_dashboard",
  "/users": "view_users",
  "/leads": "view_leads",
  "/tasks": "view_tasks",
  "/reports": "view_reports",
  "/audit": "view_audit_log",
  "/settings": "view_settings",
  "/customer-portal": "view_customer_portal",
};
```

## Authentication State

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  register: (email, password, firstName, lastName) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

## Default Test Account

- **Email:** admin@system.com
- **Password:** Admin@123

## Color Scheme

| Color         | Hex     | Usage                  |
| ------------- | ------- | ---------------------- |
| Primary       | #FD5E2B | Buttons, active states |
| Primary Hover | #E5531F | Button hover           |
| Gray 900      | #111827 | Text, headers          |
| Gray 100      | #F3F4F6 | Backgrounds            |

## Dependencies

```json
{
  "next": "^16.2.6",
  "react": "^19.0.0",
  "axios": "^1.6.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  "react-hook-form": "^7.50.0",
  "tailwindcss": "^4.0.0"
}
```

## License

MIT
