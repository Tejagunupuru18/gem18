# 🚀 Career Mentorship Portal - Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

## 🔧 Step-by-Step Setup

### 1. Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://tejagunupuruiit:<gtejaiit18>@cluster0.xjo4byx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=career-mentorship-portal-super-secret-jwt-key-2024

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Important:** Replace `<your_password>` with your actual MongoDB Atlas password.

### 2. MongoDB Atlas Setup

1. **Whitelist Your IP:**
   - Go to MongoDB Atlas Dashboard
   - Navigate to Network Access
   - Add your current IP address or `0.0.0.0/0` for all IPs

2. **Create Database User:**
   - Go to Database Access
   - Create a new user with read/write permissions
   - Use the username and password in your connection string

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Test Database Connection

```bash
# Test MongoDB connection
node test-connection.js
```

You should see:
```
✅ Successfully connected to MongoDB!
✅ Successfully created test document
✅ Successfully cleaned up test document
✅ Disconnected from MongoDB
```

### 5. Start the Application

#### Option A: Using the startup script
```bash
node start-app.js
```

#### Option B: Manual startup
```bash
# Terminal 1 - Start backend
npm run dev

# Terminal 2 - Start frontend
cd client && npm start
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🧪 Testing the Application

### 1. Test Registration
1. Go to http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill in the registration form
4. Choose your role (Student/Mentor)
5. Complete the registration

### 2. Test Login
1. Go to http://localhost:3000/login
2. Enter your credentials
3. You should be redirected to your dashboard

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. **Authentication Error:**
   - Verify your password in the connection string
   - Check if the user has correct permissions

2. **Network Error:**
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check if the cluster is running

3. **Connection Timeout:**
   - Verify the connection string format
   - Check your internet connection

### Frontend Issues

1. **Port 3000 already in use:**
   ```bash
   # Kill the process using port 3000
   npx kill-port 3000
   ```

2. **Module not found errors:**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Backend Issues

1. **Port 5000 already in use:**
   ```bash
   # Kill the process using port 5000
   npx kill-port 5000
   ```

2. **Environment variables not loading:**
   - Ensure `.env` file is in the root directory
   - Check file permissions

## 📁 Project Structure

```
career-mentorship-portal/
├── models/                 # Database models
├── routes/                 # API routes
├── middleware/             # Authentication middleware
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── public/             # Static files
├── server.js              # Main server file
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── test-connection.js     # Database connection test
├── start-app.js          # Application startup script
└── README.md              # Project documentation
```

## 🔐 Security Notes

1. **Never commit your `.env` file**
2. **Use strong passwords for MongoDB**
3. **Change JWT_SECRET in production**
4. **Enable HTTPS in production**

## 🚀 Production Deployment

### Backend (Render/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the backend code
3. Ensure MongoDB Atlas is accessible

### Frontend (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `client/build` folder
3. Set the backend URL in environment variables

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is properly configured
4. Check the console for error messages

## 🎉 Success!

Once everything is working, you should see:
- Backend running on port 5000
- Frontend running on port 3000
- MongoDB connection established
- Registration and login working
- Role-based navigation functioning 