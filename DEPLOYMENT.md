# SPOMS - Vercel Deployment Guide

## Prerequisites

- A Vercel account (https://vercel.com)
- Git installed
- GitHub account (to host your repository)

## Deployment Steps

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Prepare for Vercel deployment"
```

### Step 2: Push to GitHub

```bash
# Create a new repository on GitHub (without README, .gitignore, license)
# Then push your code:

git remote add origin https://github.com/YOUR_USERNAME/Spoms.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for beginners)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Paste your GitHub repository URL
5. Select Project settings:
   - Framework: Other (Python)
   - Root Directory: ./ (default)
6. Click "Environment Variables" and add:
   - KEY: `SECRET_KEY`
   - VALUE: Generate a secure random key (use: `python -c "import secrets; print(secrets.token_hex(32))"`)
7. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project or create new one
# - Set environment variables
# - Confirm deployment
```

### Step 4: Configure Environment Variables

After deployment, add environment variables in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add the following:
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: Generate a secure key
   - `PYTHONUNBUFFERED`: `1`

### Step 5: Test Your Deployment

- Visit your Vercel project URL
- Test login with credentials:
  - Admin: dennis / lopez
  - Purchasing Officer: jani / jani
  - Finance Officer: angel / angel
  - Store Owner: jennifer / jennifer

## Important Notes

### Data Persistence

⚠️ **IMPORTANT**: Vercel uses ephemeral storage. JSON files (data/*.json) will be lost after each deployment/function execution.

**Solutions:**
1. **Option A: Use a Database (Recommended)**
   - Migrate from JSON to MongoDB, PostgreSQL, or MySQL
   - Update app.py to use database instead of file storage

2. **Option B: Use External Storage**
   - Use AWS S3, Google Cloud Storage, or similar
   - Store data in cloud storage instead of local files

3. **Option C: Use Vercel KV (Redis)**
   - Vercel offers KV storage in the pro plan
   - Migrate JSON data to KV

### SSL/HTTPS

- Vercel automatically provides SSL certificates
- Your app will be served over HTTPS

### Performance Optimization

1. Minimize cold start time by keeping dependencies lean
2. Consider caching frequently accessed data
3. Optimize image sizes in static/images/

## Troubleshooting

### Build Failures

- Check logs in Vercel Dashboard → Deployments → Logs
- Ensure all dependencies in requirements.txt are available for Python 3.11
- Make sure no environment-specific packages are included

### Application Errors

- View function logs: Vercel Dashboard → Functions
- Check for file permission issues
- Verify environment variables are set correctly

### File Not Found Errors

- This is expected due to ephemeral storage
- Migrate to a persistent storage solution (database)

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically redeploy on push to main branch.

## Database Migration Guide

To properly persist data, consider migrating to a database:

1. **Choose a Database**: PostgreSQL, MongoDB, or MySQL
2. **Install Database Package**: `pip install psycopg2` (PostgreSQL) or `pymongo` (MongoDB)
3. **Update app.py**: Replace JSON file operations with database queries
4. **Add Database URL to Environment Variables**: In Vercel Dashboard

## Support and Resources

- Vercel Python Documentation: https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python
- Flask Documentation: https://flask.palletsprojects.com/
- Vercel Support: https://vercel.com/support
