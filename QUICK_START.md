# SPOMS Vercel Deployment - Complete Setup Guide

## What's Been Prepared ✅

I've configured your SPOMS system for Vercel deployment with the following files:

### Configuration Files Created:
1. **requirements.txt** - All Python dependencies for production
2. **vercel.json** - Vercel build and deployment configuration
3. **.env.example** - Template for environment variables
4. **.env.local** - Local development environment setup
5. **runtime.txt** - Python version specification (3.11)
6. **wsgi.py** - WSGI entry point for Vercel
7. **Procfile** - Process configuration for alternative deployment
8. **config.py** - Updated with Vercel environment support
9. **app.py** - Updated to use Config class
10. **.gitignore** - Prevents sensitive files from being committed

### Documentation Created:
- **DEPLOYMENT.md** - Step-by-step deployment instructions
- **VERCEL_CHECKLIST.md** - Pre-deployment and troubleshooting guide
- **setup.bat** - Windows development environment setup
- **setup.sh** - Linux/Mac development environment setup

## Quick Start - Deploying to Vercel

### Step 1: Initialize Git Repository
```bash
cd path/to/Spoms
git init
git add .
git commit -m "Prepare for Vercel deployment"
```

### Step 2: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/Spoms.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Paste your GitHub URL
5. Add environment variables:
   - `SECRET_KEY`: Generate with `python -c "import secrets; print(secrets.token_hex(32))"`
   - `FLASK_ENV`: `production`
6. Click "Deploy"

## 🎯 Current Status

| Feature | Status | Details |
|---------|--------|---------|
| Flask Configuration | ✅ Complete | Production-ready config |
| Dependencies | ✅ Complete | All packages specified |
| Environment Setup | ✅ Complete | Supports production & dev |
| Static Files | ✅ Ready | CSS, JS, images configured |
| Security | ✅ Good | HTTPS auto-enabled on Vercel |
| Database/Storage | ⚠️ IMPORTANT | See "Critical Consideration" below |

## ⚠️ CRITICAL CONSIDERATION: Data Persistence

**Your current setup uses JSON files for data storage**, which will NOT work permanently on Vercel because:
- Vercel has ephemeral storage (files deleted after request)
- Data will be lost on redeployment or cold starts

### ✅ Recommended Solution: Migrate to MongoDB (Easiest)

```bash
# 1. Install MongoDB driver
pip install pymongo

# 2. Sign up for MongoDB Atlas (free tier available)
#    https://www.mongodb.com/cloud/atlas

# 3. Create a free cluster and get connection string

# 4. In Vercel Dashboard, add environment variable:
#    MONGODB_URI = [your_connection_string]
```

### Alternative Options:
- **PostgreSQL/MySQL**: More traditional but more complex
- **AWS S3**: For file storage only
- **Supabase**: Firebase alternative
- **Firebase**: Google's serverless database

## 📋 Before You Deploy

- [ ] Create GitHub repository
- [ ] Test locally: `python app.py`
- [ ] Generate SECRET_KEY for production
- [ ] Decide on database solution
- [ ] Have Vercel account ready
- [ ] Have GitHub account with repository ready

## 🚀 Testing Locally First

### Windows:
```bash
# Run setup script
setup.bat

# Activate environment
venv\Scripts\activate

# Run app
python app.py

# Visit: http://localhost:5000
```

### Linux/Mac:
```bash
# Run setup script
bash setup.sh

# Activate environment
source venv/bin/activate

# Run app
python app.py

# Visit: http://localhost:5000
```

### Default Login Credentials:
- **Admin**: dennis / lopez
- **Purchasing Officer**: jani / jani
- **Finance Officer**: angel / angel
- **Store Owner**: jennifer / jennifer

## 🔒 Security Notes

1. **SECRET_KEY**: Currently using a placeholder. In Vercel, set a strong random key
2. **HTTPS**: Automatically enabled on Vercel
3. **Session Cookies**: Set to secure mode in production
4. **Database**: Will contain sensitive data - use SSL/TLS for MongoDB connections

## 📊 Files Modified

- `app.py` - Now imports Config class
- `config.py` - Added Vercel environment detection
- `requirements.txt` - Populated with all dependencies

## 📁 New Project Structure (After Setup)

```
Spoms/
├── app.py
├── config.py
├── wsgi.py
├── requirements.txt
├── runtime.txt
├── vercel.json
├── Procfile
├── .gitignore
├── .env.example
├── .env.local
├── DEPLOYMENT.md
├── VERCEL_CHECKLIST.md
├── setup.bat
├── setup.sh
├── README.MD
├── data/
│   ├── feedback.json
│   ├── orders.json
│   ├── payments.json
│   ├── settings.json
│   ├── suppliers.json
│   └── users.json
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── templates/
    └── [all HTML templates]
```

## ✨ Next Steps

1. **Immediate**: Follow Quick Start steps above
2. **Before Deploy**: Decide on database solution
3. **After Deploy**: Test all functionality
4. **Production**: Implement database migration

## 💡 Tips for Success

- Test locally thoroughly before pushing to Vercel
- Monitor Vercel logs after deployment
- Set up error tracking (optional: Sentry)
- Regular backups if using external database
- Test all forms and uploads on Vercel

## 🆘 Troubleshooting

See **VERCEL_CHECKLIST.md** for detailed troubleshooting guide.

### Quick Help
- **Build fails**: Check requirements.txt, ensure Python 3.11 compatible
- **App crashes**: Check Vercel function logs in dashboard
- **Missing data**: Expected on Vercel - migrate to database
- **Static files not loading**: Verify `static/` path is correct

## 📞 Getting Help

- Vercel Support: https://vercel.com/support
- Flask Docs: https://flask.palletsprojects.com/
- Python Documentation: https://docs.python.org/3/
- This repo's DEPLOYMENT.md and VERCEL_CHECKLIST.md

---

**Your system is now ready for Vercel deployment!** 🎉

Follow the Quick Start section to begin deployment.
