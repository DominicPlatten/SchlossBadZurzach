import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Exhibition from './pages/Exhibition';
import Map from './pages/Map';
import Artists from './pages/Artists';
import Artist from './pages/Artist';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminExhibitions from './pages/admin/Exhibitions';
import AdminArtists from './pages/admin/Artists';
import AdminMap from './pages/admin/Map';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Header />}>
            <Route index element={<Home />} />
            <Route path="exhibition/:id" element={<Exhibition />} />
            <Route path="map" element={<Map />} />
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
            <Route path="map" element={<AdminMap />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;