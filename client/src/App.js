// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CarUpload from './pages/CarUpload';
// import your other pages (Login, Signup, etc.)

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload-car" element={<CarUpload />} />
        {/* 
          Add your other routes:
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/insurance-legal" element={<InsuranceLegal />} />
          ...
        */}
      </Routes>
    </div>
  );
}

export default App;
