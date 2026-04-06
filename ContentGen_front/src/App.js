import { useState } from 'react';
import { C } from './constants/theme';
import GlobalStyle from './components/GlobalStyle';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppPage from './pages/AppPage';

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-darkBg text-textMain font-sans overflow-x-hidden selection:bg-primaryAccent selection:text-white">
      {page !== "app" && <Header setPage={setPage} user={user} setUser={setUser} />}
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} setUser={setUser} />}
      {page === "app" && <AppPage user={user} setUser={setUser} setPage={setPage} />}
    </div>
  );
}
