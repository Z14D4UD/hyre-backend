import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import CarUpload from './components/CarUpload';
import IdVerification from './components/IdVerification';
import Payment from './components/Payment';
import Search from './components/Search';
import CarDetails from './pages/CarDetails';
import Chat from './components/Chat'; // Chat component

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-car" element={<CarUpload />} />
        <Route path="/verify-id" element={<IdVerification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/search" element={<Search />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
