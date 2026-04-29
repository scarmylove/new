# SPOMS - Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] All files committed to git
- [ ] `.env` file NOT committed (added to .gitignore)
- [ ] `requirements.txt` contains all dependencies
- [ ] `vercel.json` is configured correctly
- [ ] `config.py` uses environment variables
- [ ] `app.py` imports config properly
- [ ] No hardcoded secrets in code
- [ ] All static files (CSS, JS, images) are in `static/` directory
- [ ] All templates are in `templates/` directory

## 🔧 Configuration Steps

### 1. Create Environment Variables

Before deploying, prepare these values:

```
SECRET_KEY = [Generate random key]
FLASK_ENV = production
```

### 2. Prepare GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Vercel deployment ready"
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

### 3. Deploy to Vercel

1. Visit https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Set environment variables
5. Click "Deploy"

## 📊 Current Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Flask App | ✅ Ready | Configured for Vercel |
| Requirements | ✅ Ready | All dependencies included |
| Configuration | ✅ Ready | Environment-aware config |
| Environment Variables | ⚠️ Needed | Add SECRET_KEY in Vercel |
| Database | ⚠️ Important | Currently using JSON files (ephemeral) |
| Static Files | ✅ Ready | CSS, JS, images configured |
| SSL/HTTPS | ✅ Auto | Vercel provides automatically |

## ⚠️ Critical Issues to Address

### 1. Data Persistence (HIGH PRIORITY)

**Problem**: JSON files are stored locally and will be lost on Vercel due to ephemeral storage.

**Solutions**:
- Migrate to MongoDB (recommended for quick setup)
- Use PostgreSQL/MySQL for relational data
- Use AWS S3 for file storage
- Use Vercel KV for cache/storage (Pro plan)

**Recommended**: MongoDB Atlas (free tier available)
- Sign up: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Update app.py to use pymongo instead of JSON files

### 2. File Uploads

**Current**: Images uploaded to `static/images/`
**Problem**: Will be lost after function execution

**Solutions**:
- Use AWS S3 or similar cloud storage
- Store file references in database
- Use MongoDB for file storage (GridFS)

## 🚀 Next Steps for Production

1. **Add Database**
   - Choose PostgreSQL or MongoDB
   - Update `app.py` to use database
   - Migrate existing JSON data

2. **Add File Storage**
   - Implement cloud storage for uploads
   - Update image handling in templates

3. **Security Hardening**
   - Change SECRET_KEY regularly
   - Implement CSRF protection
   - Add rate limiting
   - Enable HTTPS only (already done by Vercel)

4. **Monitoring & Logs**
   - Set up error tracking (Sentry)
   - Monitor Vercel logs
   - Set up alerts

5. **Backup Strategy**
   - Regular database backups
   - Test recovery procedures

## 📝 Deployment Commands

```bash
# Local testing before deployment
python app.py

# Deploy to Vercel
git push origin main

# View logs
vercel logs [PROJECT_NAME]

# Rollback deployment
vercel rollback
```

## 🆘 Common Issues & Solutions

### "ModuleNotFoundError: No module named 'flask'"
- Add missing dependencies to requirements.txt
- Reinstall: `pip install -r requirements.txt`

### "PermissionError: [Errno 13] Permission denied: 'data/...'"
- On Vercel, use database instead of file storage
- Migrate from JSON to database

### "Data files are empty after deployment"
- Expected behavior on Vercel (ephemeral storage)
- Implement database solution

### Cold Start Taking Too Long
- Optimize dependencies (remove unused packages)
- Use lightweight Python packages
- Consider lazy loading of modules

## 📞 Support Resources

- Vercel Docs: https://vercel.com/docs
- Flask Docs: https://flask.palletsprojects.com/
- Python Documentation: https://docs.python.org/3/
- Community: https://vercel.com/support/articles
