# Implementation Plan - HEART Student Feedback System

This plan outlines the development of the HEART Stony Hill Academy Anonymous Student Feedback & Reporting System.

## User Review Required

> [!IMPORTANT]
> **Firebase Configuration**: I will set up the frontend to use Firebase, but I will need the actual Firebase project configuration keys (API Key, Auth Domain, Project ID, etc.) to make it functional. I will use placeholder or mock data for initial development.

## Proposed Changes

### Frontend Infrastructure

#### [NEW] [package.json](file:///c:/myprojects/React/School Servey/package.json)

- Add dependencies: `react-router-dom`, `firebase`, `react-hook-form`, `zod`, `@hookform/resolvers/zod`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `framer-motion`, `date-fns`, `clsx`, `tailwind-merge`.

#### [NEW] [vite.config.ts](file:///c:/myprojects/React/School Servey/vite.config.ts)

- Configure path aliases (e.g., `@/` for `src/`).

#### [NEW] [tailwind.config.js](file:///c:/myprojects/React/School Servey/tailwind.config.js)

- Define custom colors (School brand colors), fonts, and use generated animations.

### Core Components (`src/components/ui`)

#### [NEW] [Button.tsx](file:///c:/myprojects/React/School Servey/src/components/ui/Button.tsx)

- Reusable button component with variants (primary, secondary, outline, ghost, destructive).

#### [NEW] [Input.tsx](file:///c:/myprojects/React/School Servey/src/components/ui/Input.tsx)

- Reusable input component with label and error handling.

#### [NEW] [Textarea.tsx](file:///c:/myprojects/React/School Servey/src/components/ui/Textarea.tsx)

- Reusable textarea component.

#### [NEW] [Select.tsx](file:///c:/myprojects/React/School Servey/src/components/ui/Select.tsx)

- Reusable select component.

#### [NEW] [Card.tsx](file:///c:/myprojects/React/School Servey/src/components/ui/Card.tsx)

- Container component for grouping content.

### Layouts (`src/layouts`)

#### [NEW] [MainLayout.tsx](file:///c:/myprojects/React/School Servey/src/layouts/MainLayout.tsx)

- Public layout for student access (Header, Footer).

#### [NEW] [AdminLayout.tsx](file:///c:/myprojects/React/School Servey/src/layouts/AdminLayout.tsx)

- Protected layout for admins (Sidebar, Header).

### Pages (`src/pages`)

#### [NEW] [Home.tsx](file:///c:/myprojects/React/School Servey/src/pages/Home.tsx)

- Landing page with role selection (Student vs Admin login).

#### [NEW] [StudentSelect.tsx](file:///c:/myprojects/React/School Servey/src/pages/student/StudentSelect.tsx)

- Selection between Residential and Non-Residential surveys.

#### [NEW] [ResidentialSurvey.tsx](file:///c:/myprojects/React/School Servey/src/pages/student/ResidentialSurvey.tsx)

- Key fields: Dorm conditions, Cleanliness, Food, Review.

#### [NEW] [NonResidentialSurvey.tsx](file:///c:/myprojects/React/School Servey/src/pages/student/NonResidentialSurvey.tsx)

- Key fields: Classroom, Teaching, Facilities, Review.

#### [NEW] [AdminLogin.tsx](file:///c:/myprojects/React/School Servey/src/pages/admin/Login.tsx)

- Email/Password login.

#### [NEW] [Dashboard.tsx](file:///c:/myprojects/React/School Servey/src/pages/admin/Dashboard.tsx)

- List of submissions with filtering and search.

### Context & Hooks (`src/context`, `src/hooks`)

#### [NEW] [AuthContext.tsx](file:///c:/myprojects/React/School Servey/src/context/AuthContext.tsx)

- Handle admin authentication state.

#### [NEW] [useSurvey.ts](file:///c:/myprojects/React/School Servey/src/hooks/useSurvey.ts)

- Hook to handle survey submission logic (mocked initially, then Firebase).

### Lib/Utils (`src/lib`)

#### [NEW] [firebase.ts](file:///c:/myprojects/React/School Servey/src/lib/firebase.ts)

- Firebase initialization.

#### [NEW] [utils.ts](file:///c:/myprojects/React/School Servey/src/lib/utils.ts)

- Helper functions (class merging, date formatting).

## Verification Plan

### Automated Tests

- Run `npm run dev` and verify no console errors.
- (Future) Jest/Vitest unit tests for utility functions.

### Manual Verification

1.  **Student Flow**:
    - Build: Navigate to `/`.
    - Click "I am a Student".
    - Select "Residential".
    - Fill out form and submit.
    - Verify success message.
2.  **Admin Flow**:
    - Navigate to `/admin/login`.
    - Enter credentials (mock).
    - Access Dashboard.
    - Verify list of surveys appears.
    - Test filtering (if implemented with mock data).
