import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppPage from './pages/AppPage';

export default function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const setPage = (pageName) => {
    if (pageName === "app") navigate("/dashboard");
    else if (pageName === "landing") navigate("/");
    else navigate("/" + pageName);
  };

  const isAppRoute = ['/dashboard', '/generate', '/history', '/settings'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-darkBg text-textMain font-sans overflow-x-hidden selection:bg-primaryAccent selection:text-white">
      {!isAppRoute && <Header setPage={setPage} user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<LandingPage setPage={setPage} />} />
        <Route path="/login" element={<LoginPage setPage={setPage} setUser={setUser} />} />
        <Route path="/signup" element={<LoginPage setPage={setPage} setUser={setUser} />} />
        <Route path="/dashboard" element={<AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="dashboard" />} />
        <Route path="/generate" element={<AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="generate" />} />
        <Route path="/history" element={<AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="history" />} />
        <Route path="/settings" element={<AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
