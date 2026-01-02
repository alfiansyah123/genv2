import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import AddonDomains from './pages/AddonDomains';
import Generator from './pages/Generator';
import Login from './pages/Login';
import BulkUrl from './pages/BulkUrl';
import GeneratorAddonDomain from './pages/GeneratorAddonDomain';
import ChangePassword from './pages/ChangePassword';
import TrackerAuthGuard from './components/TrackerAuthGuard';


function AppContent() {
  const location = useLocation();
  const { isDark } = useTheme();
  const path = location.pathname;

  const isLoginPage = path === '/login';
  const isDashboard = path === '/';
  const isCampaigns = path.startsWith('/campaigns');
  const isAddonDomains = path.startsWith('/addon-domains');

  const isAdminPage = isDashboard || isCampaigns || isAddonDomains;
  const isGeneratorPage = !isAdminPage && !isLoginPage;

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors ${isDark ? 'bg-[#111122]' : 'bg-gray-50'}`}>
      {/* Show Header only on admin pages (not login, not generator) */}
      {isAdminPage && <Header />}

      <main className={`flex-grow w-full ${isAdminPage ? 'px-6 py-8' : ''}`}>
        <div className={isAdminPage ? "max-w-[1440px] mx-auto flex flex-col h-full" : "w-full h-full"}>
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/addon-domains" element={<AddonDomains />} />
              <Route path="/gantipw" element={<ChangePassword />} />
            </Route>

            {/* Tracker Routes Protected by Password Guard */}
            <Route element={<TrackerAuthGuard />}>
              <Route path="/:trackerId" element={<Generator />} />
              <Route path="/:trackerId/bulk-url" element={<BulkUrl />} />
              <Route path="/:trackerId/addon-domain" element={<GeneratorAddonDomain />} />
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
