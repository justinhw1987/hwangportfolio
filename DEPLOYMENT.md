# Deployment Guide

This guide will walk you through deploying your hwang portfolio to Railway.

## Prerequisites

- A GitHub account
- A Railway account (sign up at https://railway.app)
- Your project code ready to export

## Step 1: Export to GitHub

### From Replit:

1. **Initialize Git** (if not already done):
   - Open the Shell in Replit
   - Run these commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - hwang portfolio"
   ```

2. **Create a new GitHub repository**:
   - Go to https://github.com/new
   - Name it (e.g., "hwang-portfolio")
   - Make it private or public
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**:
   - Copy the commands from GitHub (they look like this):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/hwang-portfolio.git
   git branch -M main
   git push -u origin main
   ```
   - Run them in the Replit Shell

Your code is now on GitHub! 🎉

## Step 2: Deploy to Railway

### 1. Create a Railway Account
- Go to https://railway.app
- Sign up with your GitHub account

### 2. Create a New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your **hwang-portfolio** repository
4. Railway will detect it's a Node.js app

### 3. Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a database and set the `DATABASE_URL` environment variable

### 4. Set Environment Variables

Click on your web service, go to **"Variables"** tab, and add:

```bash
# Required Variables
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=your-random-secret-key-here

# These should be auto-set by Railway's PostgreSQL:
DATABASE_URL=postgresql://...  # Auto-set when you add PostgreSQL
PGHOST=...                      # Auto-set
PGPORT=...                      # Auto-set
PGUSER=...                      # Auto-set
PGPASSWORD=...                  # Auto-set
PGDATABASE=...                  # Auto-set
```

**Important**: For `SESSION_SECRET`, generate a random string:
```bash
# Run this in your terminal to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Add Object Storage (Google Cloud Storage)

You'll need to set up Google Cloud Storage separately:

1. Go to https://console.cloud.google.com
2. Create a new bucket or use an existing one
3. Set up service account credentials
4. Add these to Railway environment variables:
```bash
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
PUBLIC_OBJECT_SEARCH_PATHS=/objects/uploads
PRIVATE_OBJECT_DIR=.private
```

### 6. Configure Build & Start Commands

Railway should auto-detect, but verify in **Settings** → **Build & Deploy**:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 7. Deploy!

1. Click **"Deploy"** 
2. Railway will:
   - Install dependencies
   - Build your app
   - Run database migrations
   - Start the server

3. Once deployed, click **"View Deployment"** to see your live site!

## Step 3: Set Up Your Admin Account

1. Visit your Railway URL
2. Go to `/login`
3. Log in with:
   - Username: `admin`
   - Password: The `ADMIN_PASSWORD` you set in Railway

## Updating Your Deployment

Whenever you push to your GitHub repository's main branch, Railway will automatically redeploy:

```bash
git add .
git commit -m "Your update message"
git push
```

Railway will detect the push and redeploy automatically! 🚀

## Custom Domain (Optional)

1. In Railway, go to your service
2. Click **"Settings"** → **"Domains"**
3. Click **"Generate Domain"** for a free Railway domain
4. Or click **"Custom Domain"** to use your own domain

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check that PostgreSQL service is running in Railway

### Build Failures
- Check the build logs in Railway
- Ensure all dependencies are in `package.json`
- Verify build command is correct

### Environment Variables
- Make sure all required variables are set
- `ADMIN_PASSWORD` is required in production
- `SESSION_SECRET` should be a secure random string

### Object Storage Issues
- Verify Google Cloud Storage credentials
- Check bucket permissions
- Ensure bucket ID is correct

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository

---

**Your portfolio is now live! 🎉**

Share your Railway URL with others to showcase your work!
