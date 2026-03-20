# LuxStay - Hotel Booking and Reservation Management System

LuxStay is a premium, full-stack MERN hotel booking system designed with a modern, responsive UI and a robust, secure backend. It features Role-Based Access Control, Razorpay integration, real-time Socket.io updates, and robust security measures.

## 🚀 Features

### For Customers
* Beautiful, responsive landing page and hotel search
* View detailed hotel profiles with image galleries, rooms, and reviews
* Real-time double-booking prevention system
* Secure Razorpay checkout for reservations
* User dashboard to manage and cancel bookings
* Add ratings and reviews to hotels

### For Hotel Managers
* Dedicated Manager Dashboard
* Register new hotel properties
* Add / Update / Delete rooms and manage availability
* Respond to guest reviews

### For Administrators
* Dedicated Admin Dashboard
* View platform-wide revenue and booking analytics
* System User Management
* Approve / Reject new hotel listings 

### Security & Performance
* 100% Secure JWT HTTP-only Cookie Authentication
* Express Rate Limiting (DDoS prevention)
* MongoDB Data Sanitization and XSS Attack Prevention
* Automated temporary booking locks (15 min expiry)
* Socket.io real-time availability sync

## 🛠️ Technology Stack

* **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, Socket.io-client
* **Backend:** Node.js, Express.js, JWT, Razorpay SDK, Socket.io
* **Database:** MongoDB Atlas, Mongoose ODM

## 💻 Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
# Clone the repo (if using git)
# git clone <repo_url>
cd hotel-booking-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables Setup

You need to configure two `.env` files.

**Backend (`backend/.env`)**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_strong_random_string
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key
```

### 3. Run the Application

Open two separate terminals:

**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🌐 Deployment 

* **MongoDB:** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
* **Backend (Render):** Connect your GitHub repo to an Express Web Service on Render. Set the root to `backend`, Build command to `npm install`, and Start command to `npm start`. Add all backend ENV vars.
* **Frontend (Vercel):** Import the repo to Vercel, set Framework to Vite, Root to `frontend`, and inject `VITE_API_BASE_URL` pointing to the live Render URL.

---
Built with ❤️ using the MERN stack.
