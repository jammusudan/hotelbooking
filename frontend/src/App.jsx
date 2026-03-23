import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestRoute from './components/routing/GuestRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Invoice from './pages/Invoice';

// Dashboard Components
import CustomerDashboard from './pages/customer/Dashboard';
import Profile from './pages/customer/Profile';
import Security from './pages/customer/Security';
import AdminLayout from './components/layout/AdminLayout';
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerHotels from './pages/manager/Hotels';
import ManagerRooms from './pages/manager/Rooms';
import ManagerBookings from './pages/manager/Bookings';
import ManagerReviews from './pages/manager/Reviews';

// ProtectedRoute logic moved to src/components/routing/ProtectedRoute.jsx

function App() {
  return (
    <Router>
      <Routes>
        {/* Isolated Login Routes */}
        <Route path="/login" element={<GuestRoute><Login role="customer" /></GuestRoute>} />
        <Route path="/manager/login" element={<GuestRoute><Login role="manager" /></GuestRoute>} />
        <Route path="/admin/login" element={<GuestRoute><Login role="admin" /></GuestRoute>} />

        {/* Manager Routes */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="hotels" element={<ManagerHotels />} />
          <Route path="rooms" element={<ManagerRooms />} />
          <Route path="bookings" element={<ManagerBookings />} />
          <Route path="reviews" element={<ManagerReviews />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          {[
            'dashboard', 'approve-hotels', 'hotels', 'users', 'bookings', 'payments', 'promotions', 'reviews', 'analytics'
          ].map(path => (
            <Route key={path} path={path} element={<AdminDashboard />} />
          ))}
        </Route>

        {/* Main/Customer Routes */}
        <Route 
          path="*" 
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/hotels/:id" element={<HotelDetails />} />
                  
                  {/* Protected Customer Routes */}
                  <Route path="/customer/dashboard" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/security" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Security />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment/:id" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Payment />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-bookings" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyBookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/invoice/:id" element={
                    <ProtectedRoute allowedRoles={['customer', 'manager', 'admin']}>
                      <Invoice />
                    </ProtectedRoute>
                  } />

                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
