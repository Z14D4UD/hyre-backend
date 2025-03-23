// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';              // Business Dashboard
import CustomerDashboard from './components/CustomerDashboard';  // Customer Dashboard
import AffiliateDashboard from './components/AffiliateDashboard'; // Affiliate Dashboard
import CarUpload from './pages/CarUpload';
import IdVerification from './components/IdVerification';
import Payment from './components/Payment';
import Search from './components/Search';
import CarDetails from './pages/CarDetails';
import Chat from './components/Chat';
import Profile from './pages/Profile';
import AccountPage from './pages/AccountPage';
import ChangePassword from './pages/ChangePassword';
import BookingsPage from './pages/BookingsPage';


function App() {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard/business" element={<Dashboard />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/affiliate" element={<AffiliateDashboard />} />

        {/* Other Routes */}
        <Route path="/upload-car" element={<CarUpload />} />
        <Route path="/verify-id" element={<IdVerification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/search" element={<Search />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/insurance-legal" element={<div>Insurance & Legal Page</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<BookingsPage />} />


        {/* Account and Change Password */}
        <Route path="/account" element={<AccountPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Catch-all */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
