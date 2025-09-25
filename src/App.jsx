// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateDonation from './pages/CreateDonation.jsx';
import MyDonations from './pages/MyDonations.jsx';
import DonationDetails from './pages/DonationDetails.jsx';
import Requests from './pages/Requests.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import VolunteerPanel from './pages/VolunteerPanel.jsx';
import AiTools from './pages/AiTools.jsx';
import AiChat from './pages/AiChat.jsx';
import RecipeGenerator from './pages/RecipeGenerator.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import MyRequests from './pages/MyRequests.jsx'

function App() {
  return (
    <>
      <AppNavbar />
      <div className="container-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-donation" element={<PrivateRoute><CreateDonation /></PrivateRoute>} />
          <Route path="/my-donations" element={<PrivateRoute><MyDonations /></PrivateRoute>} />
          <Route path="/donations/:id" element={<PrivateRoute><DonationDetails /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminPanel /></PrivateRoute>} />
          <Route path="/volunteer" element={<PrivateRoute role="VOLUNTEER"><VolunteerPanel /></PrivateRoute>} />
          <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
          <Route path="/ai-tools" element={<PrivateRoute><AiTools /></PrivateRoute>} />
          <Route path="/ai/chat" element={<PrivateRoute><AiChat /></PrivateRoute>} />
          <Route path="/ai/recipe" element={<PrivateRoute><RecipeGenerator /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
