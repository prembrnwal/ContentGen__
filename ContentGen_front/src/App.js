import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppPage from './pages/AppPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('cg_settings') || '{}');
      if (savedSettings.theme === 'light') document.body.classList.add('theme-light');
      if (savedSettings.font === 'manrope') document.body.classList.add('font-manrope');
      if (savedSettings.hoverEnabled === false) document.body.classList.add('no-hover');
      if (savedSettings.highContrast === true) document.body.classList.add('high-contrast');
    } catch(e) {}

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user.email?.split("@")[0] || "User");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user.email?.split("@")[0] || "User");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setPage = (pageName) => {
    if (pageName === "app") navigate("/dashboard");
    else if (pageName === "landing") navigate("/");
    else navigate("/" + pageName);
  };

  const isAppRoute = ['/dashboard', '/generate', '/history', '/settings'].includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primaryAccent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-textMain font-sans overflow-x-hidden selection:bg-primaryAccent selection:text-white">
      {!isAppRoute && <Header setPage={setPage} user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<LandingPage setPage={setPage} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage setPage={setPage} setUser={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage setPage={setPage} setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="dashboard" /> : <Navigate to="/login" replace />} />
        <Route path="/generate" element={user ? <AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="generate" /> : <Navigate to="/login" replace />} />
        <Route path="/history" element={user ? <AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="history" /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <AppPage user={user} setUser={setUser} setPage={setPage} defaultTab="settings" /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
