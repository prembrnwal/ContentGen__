import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardPage from './DashboardPage';
import GeneratePage from './GeneratePage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import { supabase } from '../supabase';

function Toast({ msg, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-50 glass-panel border border-primaryAccent/30 shadow-lg shadow-primaryAccent/10 rounded-xl px-5 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-primaryAccent/20 flex items-center justify-center">
            <Bell size={14} className="text-primaryAccent" />
          </div>
          <span className="text-sm font-medium text-white">{msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppPage({ user, setUser, setPage }) {
  const [tab, setTab] = useState("generate");
  const [history, setHistory] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${process.env.REACT_APP_API_URL}/content/history`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(data.map(item => ({
          ...item,
          ts: item.createdAt ? new Date(item.createdAt) : new Date(),
          prompt: item.prompt || item.topic,
        })));
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    
    loadHistory();
  }, [user]);

  // Shared state to allow history → generate prefill
  const [sharedPrompt, setSharedPrompt] = useState("");
  const [sharedTemplate, setSharedTemplate] = useState("Blog");
  const [sharedTone, setSharedTone] = useState("Professional");

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }

  const tabLabel = tab === "dashboard" ? "Dashboard" : tab === "generate" ? "Generator" : "Content History";

  return (
    <div className="flex min-h-screen bg-darkBg overflow-hidden">
      <Sidebar tab={tab} setTab={setTab} history={history} user={user} setUser={setUser} setPage={setPage} />

      <main className="flex-1 flex flex-col h-screen h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 bg-darkSurface/80 backdrop-blur-md border-b border-darkBorder flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="text-sm font-medium">
            <span className="text-textMuted/70">Workspace / </span>
            <span className="text-white">{tabLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent text-xs font-bold shadow-sm">
              {history.length} Pieces Generated
            </div>
            <button
              onClick={() => setTab("generate")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primaryAccent to-tertiaryAccent text-white text-sm font-medium hover:shadow-lg hover:shadow-primaryAccent/20 transition-all hover:-translate-y-0.5"
            >
              <Sparkles size={14} /> New Content
            </button>
          </div>
        </header>

        {/* Dynamic content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-5xl mx-auto px-8 py-8 w-full min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {tab === "dashboard" && (
                  <DashboardPage history={history} sessionCount={sessionCount} setTab={setTab} />
                )}
                {tab === "generate" && (
                  <GeneratePage
                    history={history}
                    setHistory={(updater) => {
                      setHistory(updater);
                    }}
                    onGenerated={(count) => setSessionCount(n => n + count)}
                    setTab={setTab}
                    showToast={showToast}
                    initialPrompt={sharedPrompt}
                    initialTemplate={sharedTemplate}
                    initialTone={sharedTone}
                  />
                )}
                {tab === "history" && (
                  <HistoryPage
                    history={history}
                    setHistory={setHistory}
                    setPrompt={setSharedPrompt}
                    setTemplate={setSharedTemplate}
                    setTone={setSharedTone}
                    setTab={setTab}
                    showToast={showToast}
                  />
                )}
                {tab === "settings" && <SettingsPage showToast={showToast} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
