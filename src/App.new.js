import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import Map from './components/map/Map';
import GlobalNewsPage from './pages/GlobalNewsPage';
import CountryRoutePlanner from './pages/CountryRoutePlanner';

function App() {
  return (
    <div data-testid="app-container">
      <AuthProvider>
        <CountryProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/country/:code" element={<DetailPage />} />
              <Route path="/map" element={<Map />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/global-news" element={<GlobalNewsPage />} />
              <Route path="/news" element={<GlobalNewsPage />} />
              <Route path="/route-planner" element={<CountryRoutePlanner />} />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CountryProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
