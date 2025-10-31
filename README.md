# hwang portfolio

A modern portfolio web application showcasing design and build projects with before/after photo galleries and an admin management system.

## Features

- 📸 Project showcase with before/after photo galleries
- 🎨 Photography-first portfolio aesthetic
- 🔐 Secure admin portal with username/password authentication
- 🖼️ Drag-and-drop photo alignment for before/after comparisons
- 📤 Unlimited file uploads via object storage
- 🎯 Featured project highlighting
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Storage**: Google Cloud Storage
- **Authentication**: Passport.js (username/password)
- **ORM**: Drizzle ORM

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud Storage bucket (or compatible object storage)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database (PostgreSQL - Neon or other provider)
DATABASE_URL=postgresql://username:password@host/database

# Session Secret
SESSION_SECRET=your-random-session-secret-here

# Admin Password (required in production)
ADMIN_PASSWORD=your-secure-admin-password

# Object Storage (Google Cloud Storage)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
PUBLIC_OBJECT_SEARCH_PATHS=/objects/uploads
PRIVATE_OBJECT_DIR=.private
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hwang-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Default Admin Credentials

**Development only:**
- Username: `admin`
- Password: `admin123`

**Production:** You must set the `ADMIN_PASSWORD` environment variable. The default credentials will not work.

## Deployment

### Railway Deployment

1. **Create a PostgreSQL database** on Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy from GitHub** - Railway will automatically detect and deploy

See deployment instructions below for detailed steps.

## Project Structure

```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/           # Backend Express application
│   ├── auth.ts       # Authentication logic
│   ├── routes.ts     # API routes
│   └── storage.ts    # Database operations
├── shared/           # Shared types and schemas
└── attached_assets/  # Static assets

```

## Admin Features

- Create, edit, and delete projects
- Upload multiple before/after/gallery images
- Drag-and-drop to align before/after photos
- Set featured projects
- Upload hero background image
- Manage project status (draft/published)

## License

All rights reserved © 2025
