# 🎨 Makeup Artist Booking Platform

A full-stack web application for booking makeup artists, built with React, TypeScript, Node.js, and MongoDB Atlas.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [MongoDB Atlas Setup](#mongodb-atlas-setup)
  - [Backend Configuration](#backend-configuration)
  - [Frontend Configuration](#frontend-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

This is a makeup artist booking platform where clients can browse, book, and review makeup artists, and artists can manage their schedules, bookings, and portfolios. The application features role-based authentication with separate interfaces for clients and makeup artists.

## ✨ Features

- **🔐 Dual Authentication System**
  - Separate login flows for clients and makeup artists
  - JWT token-based authentication
  - Secure password hashing with bcrypt
  - Session management

- **👥 User Management**
  - Client profiles with booking history
  - Artist profiles with portfolio management
  - User role-based access control
  - Profile image uploads

- **📅 Booking System**
  - Browse available makeup artists
  - Book appointments with real-time availability
  - Booking status tracking (pending, confirmed, completed)
  - Calendar view for scheduling

- **⭐ Review System**
  - Client reviews and ratings
  - Artist feedback management
  - Rating-based artist discovery

- **💚 Favorites System**
  - Save favorite artists
  - Quick access to preferred makeup artists
  - Personalized recommendations

- **🎨 Portfolio Management**
  - Artists can upload portfolio images
  - Showcase work samples
  - Portfolio categories (Bridal, Evening, Natural, etc.)

- **📱 Responsive Design**
  - Works seamlessly on desktop, tablet, and mobile
  - Tailwind CSS for modern styling
  - glassmorphism UI effects

## 🛠️ Tech Stack

### Frontend
- **React** 18+ - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching & caching
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Install](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB Atlas Account** (free) - [Create Account](https://cloud.mongodb.com/)
- **Git** - [Install](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. MongoDB Atlas Setup

#### Step 1: Create MongoDB Atlas Account
1. Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
2. Sign up with email or Google/GitHub account

#### Step 2: Create a Cluster
1. Click "Create a deployment"
2. Select **M0 Free** tier (free forever)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "makeup-artist-db")
5. Click "Create Cluster"
6. Wait for cluster to be created (2-3 minutes)

#### Step 3: Security Configuration
1. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password
   - Click "Add User"

2. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add `0.0.0.0/0` for development (allows all IPs)
   - Click "Confirm"

3. **Get Connection String**
   - Go to "Clusters" → your cluster
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials

### 2. Clone Repository

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd makeup-artist
```

### 3. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

Create `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@makeup-artist-db.xxxxx.mongodb.net/makeup-artist-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Configuration

```bash
# Navigate back to project root
cd ..

# Install dependencies
npm install
```

Create `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Terminal 2: Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## 📚 API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user (client or artist)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update user profile

### User Endpoints
- `GET /api/auth/artists` - Get all makeup artists
- `GET /api/users/artist/:id` - Get single artist details
- `GET /api/users/profile` - Get current user profile

### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Review Endpoints
- `POST /api/reviews` - Create review
- `GET /api/reviews/artist/:id` - Get artist reviews
- `PUT /api/reviews/:id` - Update review

## 📁 Project Structure

```
makeup-artist/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginModal.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── ...
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (shadcn-ui components)
│   │   └── ...
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── ArtistDashboard.tsx
│   │   ├── ArtistProfile.tsx
│   │   ├── ClientProfile.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── dataService.ts
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── sanitize.js
│   │   └── upload.js
│   ├── utils/
│   │   └── validation.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── public/
│   ├── js/
│   │   ├── main.js
│   │   ├── artists.js
│   │   ├── booking.js
│   │   └── ...
│   └── styles/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 💻 Development

### Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd backend
npm run build
```

### Running Tests

```bash
# Frontend tests (if configured)
npm run test

# Backend tests (if configured)
cd backend
npm run test
```

### Code Quality

```bash
# ESLint
npm run lint

# Format code
npm run format
```

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Vercel**
   - Connect your GitHub repository
   - Set `VITE_API_URL` environment variable
   - Deploy automatically on push

2. **Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Backend Deployment (Heroku/Railway/Render)

1. **Environment Variables**
   - Set `MONGODB_URI` with your MongoDB Atlas connection
   - Set `JWT_SECRET`
   - Set `NODE_ENV=production`

2. **Deploy**
   - Follow provider-specific deployment instructions
   - Ensure backend URL is updated in frontend `.env`

## 🔐 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ JWT token expiration and refresh
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Secure file upload handling
- ✅ Role-based access control

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Test connection with MongoDB Compass

### Frontend/Backend Communication
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running on correct port
- Check browser console for errors

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (on Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📞 Support & Contact

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Contact: [Your Contact Information]
- Documentation: [Link to detailed docs]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn-ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - Frontend framework

---

**Happy Coding! 🚀**

Last Updated: November 2024
