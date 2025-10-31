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
2. Wait for PostgreSQL to provision (this takes a few seconds)

### 4. Link Database to Your Application

**IMPORTANT**: You must link the database to your application service:

1. Click on your **application service** (not the database)
2. Go to the **"Variables"** tab
3. Click **"New Variable"** → **"Add Reference"**
4. Select your **PostgreSQL** database
5. Choose **"DATABASE_URL"** from the dropdown
6. Click **"Add"**

This automatically sets the `DATABASE_URL` environment variable to point to your Railway database.

### 5. Set Other Environment Variables

While still in the **"Variables"** tab of your application service, add these additional variables:

**Click "New Variable" and add each one:**

```bash
# Security (REQUIRED)
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=your-random-secret-key-here

# Environment
NODE_ENV=production
```

**Important**: 
- For `ADMIN_PASSWORD`: Choose a strong password (minimum 12 characters, mix of letters, numbers, symbols)
- For `SESSION_SECRET`: Generate a secure random string using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 6. Push Database Schema to Railway

Now you need to create the database tables on Railway. From your **Replit Shell** (or local terminal):

1. **Set the Railway DATABASE_URL**:
   ```bash
   # Get this from Railway: Click PostgreSQL service → Connect tab → Copy "Postgres Connection URL"
   export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@shinkansen.proxy.rlwy.net:PORT/railway"
   ```

2. **Push the schema**:
   ```bash
   npm run db:push
   ```

   This creates all necessary tables in your Railway database (users, projects, project_images, uploaded_files, sessions, site_settings).

3. **Verify tables were created**:
   ```bash
   # Connect to Railway database
   psql "$DATABASE_URL"
   
   # List tables
   \dt
   
   # You should see: users, projects, project_images, uploaded_files, sessions, site_settings
   
   # Exit
   \q
   ```

### 7. Configure Build & Start Commands (Optional)

Railway should auto-detect these, but you can verify in **Settings** → **Build & Deploy**:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 8. Deploy!

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

### "ADMIN_PASSWORD must be set" Error
**Error**: `SECURITY ERROR: ADMIN_PASSWORD environment variable must be set to a strong password in production`

**Solution**: 
1. Go to your Railway app service → Variables tab
2. Add `ADMIN_PASSWORD` with a strong password
3. Wait for automatic redeployment

### Database Connection Issues

**Error**: `Error initializing admin user: ErrorEvent` or `ECONNREFUSED`

**Cause**: This happens when `DATABASE_URL` is not properly linked to your application.

**Solution**:
1. Make sure you **linked** the PostgreSQL database to your app (see Step 4 above)
2. Verify in Variables tab that `DATABASE_URL` shows a reference to PostgreSQL
3. If manually set, ensure the URL format is: `postgresql://user:password@host:port/database`
4. Check that SSL is enabled for production connections

**Error**: `DATABASE_URL must be set. Did you forget to provision a database?`

**Solution**: 
1. Add PostgreSQL database: Click "New" → "Database" → "Add PostgreSQL"
2. Link it to your app using "Add Reference" in Variables tab

### Schema/Table Missing

**Error**: Tables don't exist or queries fail

**Solution**:
1. Push your schema: `export DATABASE_URL="..." && npm run db:push`
2. Verify tables exist: Connect with `psql` and run `\dt`
3. Expected tables: users, projects, project_images, uploaded_files, sessions, site_settings

### Build Failures
- Check the build logs in Railway deployment tab
- Ensure all dependencies are in `package.json`
- Verify build command is: `npm install && npm run build`
- Make sure Node.js version is compatible (v18 or higher)

### Environment Variables
- Required in production: `ADMIN_PASSWORD`, `SESSION_SECRET`, `DATABASE_URL`, `NODE_ENV`
- `ADMIN_PASSWORD` must NOT be "admin123"
- `SESSION_SECRET` should be a 32+ character random string
- All variables must be set in Railway's Variables tab

### Image Upload Failures

**Error**: "Upload failed" when trying to upload images in the admin panel

**Causes & Solutions**:

1. **Not Logged In / Session Lost**
   - **Symptom**: Can access admin pages but uploads fail
   - **Check**: Open browser DevTools → Network tab → Try upload → Look for 401 Unauthorized on `/api/upload`
   - **Solution**: Log out and log back in
   - **Prevention**: Make sure `SESSION_SECRET` is set in Railway and redeploy

2. **Session Cookie Not Persisting**
   - **Symptom**: Keep getting logged out, uploads fail intermittently  
   - **Check**: Browser DevTools → Application tab → Cookies → Look for `connect.sid` cookie
   - **Solutions**:
     - Verify `NODE_ENV=production` is set in Railway
     - Verify `SESSION_SECRET` is a strong 32+ character string
     - Check that Railway URL uses HTTPS (not HTTP)
     - Try clearing browser cookies and logging in again

3. **Database Connection Issues**
   - **Symptom**: Login works but uploads fail with no error message
   - **Check**: Railway deployment logs for database errors
   - **Solution**: Verify `DATABASE_URL` is properly linked (see "Link Database to Your Application" section)

4. **File Size Too Large**
   - **Symptom**: Upload fails only for large images
   - **Limit**: Maximum 10MB per image
   - **Solution**: Compress images before uploading or resize them

5. **Sessions Table Missing**
   - **Symptom**: Can't log in or stay logged in
   - **Check**: Connect to database and verify `sessions` table exists
   - **Solution**: 
     ```bash
     # Push schema again
     export DATABASE_URL="your_railway_db_url"
     npm run db:push
     ```

**Debugging Steps**:

1. **Check Railway Logs**: Go to Railway → Your App → Deployments → Click latest → View logs
2. Look for these log messages:
   - `Uploading file: filename.png (image/png, 12345 bytes)` ← Upload started
   - `File uploaded successfully: <uuid>` ← Upload succeeded  
   - `Error uploading file:` ← Upload failed (check error details)
3. **Test Authentication**: Try accessing `/api/auth/user` - should return user data, not 401
4. **Test Locally**: If it works on Replit but not Railway, it's a deployment configuration issue

**Working Correctly When**:
- You can log in and stay logged in
- Browser has `connect.sid` cookie after login
- Uploads show success toast notification
- Images appear in project preview

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository

---

**Your portfolio is now live! 🎉**

Share your Railway URL with others to showcase your work!
