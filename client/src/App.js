// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import CustomerDashboard from './components/CustomerDashboard';
import AffiliateDashboard from './components/AffiliateDashboard';
import CarUpload from './pages/CarUpload';
import IdVerification from './components/IdVerification';
import Payment from './components/Payment';
import Search from './components/Search';
import CarDetails from './pages/CarDetails';
import Chat from './components/Chat';
import Profile from './pages/Profile';
import CustomerAccountPage from './pages/CustomerAccountPage'; 
import ChangePassword from './pages/ChangePassword';
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import MessagesPage from './pages/MessagesPage';
import AboutHyre from './pages/AboutHyre';
import ContactUs from './pages/ContactUs';
import LegalPage from './pages/LegalPage';
import BusinessProfile from './pages/BusinessProfile';
import AddListing from './pages/AddListing';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import BusinessBookings from './pages/BusinessBookings';
import BusinessMessagesPage from './pages/BusinessMessagesPage';
import ConnectBank from './pages/ConnectBank';

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
        <Route path="/bookings/customer" element={<CustomerBookingsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/about-hyre" element={<AboutHyre />} />
        <Route path="/contact-support" element={<ContactUs />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/profile/business" element={<BusinessProfile />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/bookings/business" element={<BusinessBookings />} />
        <Route path="/messages/business" element={<BusinessMessagesPage />} />
        <Route path="/connect-bank" element={<ConnectBank />} />




        {/* Customer Account and Change Password */}
        <Route path="/account" element={<CustomerAccountPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Catch-all */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
