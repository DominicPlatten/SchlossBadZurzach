import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Exhibition from './pages/Exhibition';
import Artists from './pages/Artists';
import Artist from './pages/Artist';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminExhibitions from './pages/admin/Exhibitions';
import AdminArtists from './pages/admin/Artists';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Header />}>
            <Route index element={<Home />} />
            <Route path="exhibition/:id" element={<Exhibition />} />
            <Route path="artists" element={<Artists />} />
            <Route path="artist/:id" element={<Artist />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginForm />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="exhibitions" element={<AdminExhibitions />} />
            <Route path="artists" element={<AdminArtists />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;