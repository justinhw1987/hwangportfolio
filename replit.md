# Portfolio Web Application

## Overview

This is a modern portfolio web application designed for showcasing creative projects with before-and-after image transformations. The application follows a photography-first design approach inspired by platforms like Behance and Dribbble, emphasizing visual storytelling through generous whitespace, bold typography, and asymmetric layouts.

The application is built as a full-stack TypeScript monorepo with a React frontend and Express backend, featuring authentication, project management, and cloud-based image storage.

**Last Updated:** October 31, 2025
**Status:** Production-ready MVP with complete CRUD functionality, authentication, and object storage integration

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 31, 2025:**
1. Implemented ThemeProvider for dark mode support with localStorage persistence
2. Added ThemeToggle component to application header
3. Rebuilt admin project form to use react-hook-form with zodResolver for proper validation
4. Replaced Uppy file uploader with custom ObjectUploader component using native file input
5. Fixed nested anchor tag issues in landing page navigation
6. Ensured form validation uses insertProjectSchema from shared/schema.ts

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui component library (Radix UI primitives)
- Tailwind CSS for styling with custom design tokens
- Custom design system based on Inter (body) and Space Grotesk (display) fonts
- Theme system supporting light/dark modes with localStorage persistence

**State Management:**
- TanStack Query (React Query) for server state management
- React hooks for local component state
- Custom authentication hook (`useAuth`) for user session management

**Design System:**
- Photography-first layouts with asymmetric grids
- Spacing primitives using Tailwind's 4-unit scale (4, 6, 8, 12, 16, 20, 24)
- Custom color system using HSL values with CSS variables for theming
- Responsive breakpoints for mobile/desktop experiences

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Session-based authentication using express-session
- Middleware for request logging and JSON body parsing

**Authentication System:**
- Replit OAuth integration via OpenID Connect
- Passport.js strategy for authentication flow
- Session storage in PostgreSQL via connect-pg-simple
- 7-day session expiry with secure, httpOnly cookies

**API Design:**
- RESTful API endpoints under `/api/*` namespace
- Authentication middleware (`isAuthenticated`) protecting admin routes
- Structured response format with error handling
- Request logging with duration tracking

**Data Access Layer:**
- Storage abstraction interface (`IStorage`) for database operations
- `DatabaseStorage` implementation using Drizzle ORM
- Separation of concerns between routes, storage, and business logic

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket connection pooling for serverless environments

**Schema Design:**
- `users` table: OAuth user profiles (id, email, name, profile image)
- `sessions` table: Express session storage
- `projects` table: Portfolio projects with metadata (title, description, category, year, client, role, tools, status, featured flag)
- `projectImages` table: Project images with type (before/after), sort order, and cloud storage URLs

**Migrations:**
- Drizzle Kit for schema management
- Migration files stored in `/migrations` directory
- Push-based deployment via `db:push` script

### External Dependencies

**Cloud Storage:**
- Google Cloud Storage for image hosting
- Replit Object Storage integration via sidecar service (http://127.0.0.1:1106)
- Custom ACL (Access Control List) system for object permissions
- Public/private object visibility controls
- Owner-based access control with permission rules (READ/WRITE)

**File Uploads:**
- Custom file uploader component using native HTML file input
- Direct fetch-based uploads to Google Cloud Storage via presigned URLs
- Image-only restrictions with configurable file size limits (10MB default)
- Client-side validation and error handling

**Authentication Provider:**
- Replit OAuth (OpenID Connect)
- Issuer URL: https://replit.com/oidc
- Token refresh mechanism with access/refresh tokens
- Claims-based user identification

**UI Component Libraries:**
- Radix UI primitives for accessible components
- Lucide React for icons
- class-variance-authority for component variants
- tailwind-merge for className composition

**Development Tools:**
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- ESBuild for server bundle production builds
- tsx for TypeScript execution in development
- Zod for schema validation with drizzle-zod integration

**Type Safety:**
- Shared types between client/server via `@shared` path alias
- Drizzle schema inference for type-safe database operations
- Zod schemas for request/response validation