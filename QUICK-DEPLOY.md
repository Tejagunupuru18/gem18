# Quick Deploy to Render

## 🚀 Fast Deployment Steps

### 1. Prepare Your Code
```bash
# Test your build locally
npm install
cd client && npm install && npm run build
cd ..
npm start
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 3. Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   **Basic Settings:**
   - Name: `career-mentorship-portal`
   - Environment: `Node`
   - Region: Choose closest to you
   - Branch: `main`

   **Build & Deploy:**
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `npm start`

### 4. Set Environment Variables

In Render dashboard → Environment tab, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `your_mongodb_atlas_connection_string` |
| `JWT_SECRET` | `your_super_secret_key` |
| `EMAIL_USER` | `your_email@gmail.com` |
| `EMAIL_PASS` | `your_app_password` |
| `CLIENT_URL` | `https://your-app-name.onrender.com` |

### 5. Deploy & Test

1. Click **"Create Web Service"**
2. Wait for build (5-10 minutes)
3. Test your app: `https://your-app-name.onrender.com`
4. Test health endpoint: `https://your-app-name.onrender.com/api/health`

## 🔧 Troubleshooting

**Build fails?**
- Check all dependencies are in `package.json`
- Verify Node.js version (>=16.0.0)
- Check build logs in Render dashboard

**App won't start?**
- Verify environment variables are set
- Check MongoDB connection string
- Review logs for specific errors

**CORS errors?**
- App is already configured for Render domains
- Check that `CLIENT_URL` is set correctly

## 📞 Need Help?

- Check `DEPLOYMENT.md` for detailed guide
- Review Render's [documentation](https://render.com/docs)
- Test locally with production environment variables

## 🎯 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] App accessible at Render URL
- [ ] Health endpoint working
- [ ] Frontend loads correctly
- [ ] Backend API responding

**Your app will be live at:** `https://your-app-name.onrender.com` 