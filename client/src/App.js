// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

/* -------- pages & components -------- */
import Home                   from './pages/Home';
import Login                  from './pages/Login';
import Signup                 from './pages/Signup';
import Dashboard              from './components/Dashboard';
import CustomerDashboard      from './components/CustomerDashboard';
import AffiliateDashboard     from './components/AffiliateDashboard';
import CarUpload              from './pages/CarUpload';
import IdVerification         from './components/IdVerification';
import Payment                from './components/Payment';
import SearchResultsPage      from './pages/SearchResultsPage';
import CarDetailsPage         from './pages/CarDetailsPage';
import Chat                   from './components/Chat';
import Profile                from './pages/Profile';
import CustomerAccountPage    from './pages/CustomerAccountPage';
import ChangePassword         from './pages/ChangePassword';
import CustomerBookingsPage   from './pages/CustomerBookingsPage';
import MessagesPage           from './pages/MessagesPage';
import AboutHyre              from './pages/AboutHyre';
import ContactUs              from './pages/ContactUs';
import LegalPage              from './pages/LegalPage';
import BusinessProfile        from './pages/BusinessProfile';
import AddListing             from './pages/AddListing';
import MyListings             from './pages/MyListings';
import EditListing            from './pages/EditListing';
import BusinessBookings       from './pages/BusinessBookings';
import BusinessMessagesPage   from './pages/BusinessMessagesPage';
import ConnectBank            from './pages/ConnectBank';

export default function App() {
  return (
    <Routes>
      {/* ───── public ───── */}
      <Route path="/"            element={<Home />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/signup"      element={<Signup />} />

      {/* ───── dashboards ───── */}
      <Route path="/dashboard/business"  element={<Dashboard />} />
      <Route path="/dashboard/customer"  element={<CustomerDashboard />} />
      <Route path="/dashboard/affiliate" element={<AffiliateDashboard />} />

      {/* ───── functional pages ───── */}
      <Route path="/upload-car"        element={<CarUpload />} />
      <Route path="/verify-id"         element={<IdVerification />} />
      <Route path="/payment"           element={<Payment />} />
      <Route path="/search"            element={<SearchResultsPage />} />

      {/* universal details view (car | listing) */}
      <Route path="/details/:type/:id" element={<CarDetailsPage />} />

      <Route path="/chat"              element={<Chat />} />
      <Route path="/insurance-legal"   element={<div>Insurance & Legal Page</div>} />

      {/* ───── account & misc ───── */}
      <Route path="/profile"                 element={<Profile />} />
      <Route path="/account"                 element={<CustomerAccountPage />} />
      <Route path="/change-password"         element={<ChangePassword />} />

      {/* bookings / messages */}
      <Route path="/bookings/customer"       element={<CustomerBookingsPage />} />
      <Route path="/bookings/business"       element={<BusinessBookings />} />
      <Route path="/messages"                element={<MessagesPage />} />
      <Route path="/messages/business"       element={<BusinessMessagesPage />} />

      {/* marketing */}
      <Route path="/about-hyre"      element={<AboutHyre />} />
      <Route path="/contact-support" element={<ContactUs />} />
      <Route path="/legal"           element={<LegalPage />} />

      {/* business specific */}
      <Route path="/profile/business" element={<BusinessProfile />} />
      <Route path="/add-listing"      element={<AddListing />} />
      <Route path="/my-listings"      element={<MyListings />} />
      <Route path="/edit-listing/:id" element={<EditListing />} />
      <Route path="/connect-bank"     element={<ConnectBank />} />

      {/* catch‑all */}
      <Route path="*" element={<div style={{padding:"2rem"}}>404 – Not Found</div>} />
    </Routes>
  );
}
