# Career Guide & Mentorship Portal for Government School Students

A comprehensive full-stack web application that connects government school students with verified mentors, provides curated resources, and helps them make informed career decisions.

## 🎯 Project Overview

This portal addresses the lack of career guidance and mentorship opportunities for students in Tier 2 and Tier 3 towns by providing:

- **Student-Mentor Matching**: Connect students with verified professionals
- **Career Assessment**: Interactive quiz to suggest suitable career paths
- **Resource Hub**: Curated scholarship info, exam guides, and career articles
- **Session Management**: Book and manage 1:1 mentorship sessions
- **Real-time Communication**: Video calls and chat functionality
- **Progress Tracking**: Visual dashboard showing student journey

## 🚀 Features

### For Students
- Registration and profile creation
- Career interest assessment quiz
- Browse and filter mentors by expertise
- Book mentorship sessions
- Access educational resources and scholarships
- Submit feedback and ratings
- Progress tracking and achievements

### For Mentors
- Professional profile creation with verification
- Manage availability and schedule
- Conduct video sessions
- Track mentoring statistics
- Earn badges and recognition
- Respond to student queries

### For Admins
- User verification and management
- Content moderation
- Analytics and insights
- System oversight

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Frontend
- **React.js** with modern hooks
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time features
- **Jitsi Meet** for video calls

### Deployment
- **Render** for hosting
- **MongoDB Atlas** for database
- **Cloudinary** for file storage (optional)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd career-mentorship-portal
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```
Edit `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mentorship-portal
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### 4. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 5. Start Development Servers

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm run client
```

**Both (in separate terminals):**
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run client
```

## 📁 Project Structure

```
career-mentorship-portal/
├── models/                 # Database models
│   ├── User.js
│   ├── Student.js
│   ├── Mentor.js
│   ├── Session.js
│   └── Resource.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── students.js
│   ├── mentors.js
│   ├── admin.js
│   ├── sessions.js
│   ├── resources.js
│   └── quiz.js
├── middleware/             # Custom middleware
│   └── auth.js
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── uploads/                # File uploads
├── server.js              # Main server file
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Students
- `GET /api/students/mentors` - Browse mentors
- `POST /api/students/sessions` - Book session
- `GET /api/students/sessions` - Get sessions
- `GET /api/students/resources` - Get resources

### Mentors
- `GET /api/mentors/profile` - Get mentor profile
- `PUT /api/mentors/availability` - Update availability
- `GET /api/mentors/sessions` - Get sessions
- `GET /api/mentors/stats` - Get statistics

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/mentors/:id/verify` - Verify mentor

## 🎨 Key Features Implementation

### Real-time Video Calls
- Integrated Jitsi Meet for secure video sessions
- WebRTC for peer-to-peer communication
- Session recording capabilities

### Career Assessment Quiz
- Interactive 5-question assessment
- Weighted scoring system
- Personalized career recommendations

### Session Management
- Calendar integration
- Automated reminders
- Session notes and feedback

### Resource Management
- Scholarship database
- Exam guides and study materials
- Rating and review system

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Password hashing with bcrypt

## 📊 Database Schema

### User Model
- Basic user information
- Role-based access (student/mentor/admin)
- Authentication details

### Student Model
- Educational background
- Career interests and goals
- Quiz results and progress

### Mentor Model
- Professional information
- Expertise and availability
- Verification status and ratings

### Session Model
- Session details and scheduling
- Video call information
- Feedback and notes

### Resource Model
- Educational content
- Scholarship information
- Ratings and reviews

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to your preferred hosting service

### Database Setup
1. Create MongoDB Atlas cluster
2. Update connection string in environment variables
3. Set up database indexes for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@mentorship-portal.com

## 🔮 Future Enhancements

- Mobile app development
- AI-powered mentor matching
- Advanced analytics dashboard
- Multi-language support
- Integration with educational institutions
- Gamification features
- Emergency helpline integration

---

**Built with ❤️ for empowering government school students** 