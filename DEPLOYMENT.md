# Deployment Guide for Render

This guide will help you deploy your Career Mentorship Portal to Render.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a MongoDB Atlas cluster (free tier available)

## Step 1: Prepare Your Repository

### 1.1 Environment Variables
Create a `.env` file in your root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL (for CORS)
CLIENT_URL=https://your-app-name.onrender.com

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Video Call Configuration
JITSI_DOMAIN=meet.jit.si

# Emergency Contact
EMERGENCY_PHONE=+91-1800-XXX-XXXX
EMERGENCY_EMAIL=emergency@mentorship-portal.com
```

### 1.2 Update CORS Settings
Make sure your server.js has the correct CORS settings for production:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://your-app-name.onrender.com'
  ],
  credentials: true
}));
```

## Step 2: Deploy to Render

### 2.1 Connect Your Repository
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your project

### 2.2 Configure the Service
Use these settings:

- **Name**: `career-mentorship-portal` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (if your code is in the root)
- **Build Command**: 
  ```
  npm install && cd client && npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

### 2.3 Set Environment Variables
In the Render dashboard, go to "Environment" tab and add these variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `MONGODB_URI` | `your_mongodb_connection_string` | MongoDB Atlas connection |
| `JWT_SECRET` | `your_super_secret_key` | JWT signing secret |
| `EMAIL_USER` | `your_email@gmail.com` | Email for notifications |
| `EMAIL_PASS` | `your_app_password` | Email app password |
| `CLIENT_URL` | `https://your-app-name.onrender.com` | Your Render app URL |

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 5-10 minutes)

## Step 3: Post-Deployment

### 3.1 Verify Deployment
1. Check the deployment logs for any errors
2. Visit your app URL: `https://your-app-name.onrender.com`
3. Test the health endpoint: `https://your-app-name.onrender.com/api/health`

### 3.2 Set Up Custom Domain (Optional)
1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

### 3.3 Monitor Your App
- Use Render's built-in monitoring
- Set up alerts for downtime
- Monitor logs for errors

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=16.0.0)
   - Verify build commands are correct

2. **App Won't Start**
   - Check environment variables are set correctly
   - Verify MongoDB connection string
   - Check logs for specific error messages

3. **CORS Errors**
   - Update CORS origins to include your Render URL
   - Ensure client is making requests to the correct backend URL

4. **File Upload Issues**
   - Render has ephemeral storage, consider using cloud storage (AWS S3, etc.)
   - Update upload paths for production

### Getting Help
- Check Render's [documentation](https://render.com/docs)
- Review deployment logs in Render dashboard
- Test locally with production environment variables

## Security Notes

1. **Never commit `.env` files** to your repository
2. **Use strong JWT secrets** in production
3. **Enable MongoDB Atlas IP whitelist** (or use 0.0.0.0/0 for Render)
4. **Use environment variables** for all sensitive data
5. **Enable HTTPS** (automatic with Render)

## Cost Optimization

- Render's free tier includes:
  - 750 hours/month of runtime
  - Automatic sleep after 15 minutes of inactivity
  - 512 MB RAM, 0.1 CPU
- Consider upgrading for:
  - Always-on service
  - More resources
  - Custom domains
  - Better performance 