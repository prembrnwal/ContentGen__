import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function AppPage({ user, setUser, setPage, defaultTab = "generate" }) {
  const navigate = useNavigate();
  const tab = defaultTab;
  const setTab = (t) => navigate('/' + t);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "" });

  // ── Generation state (lifted here so it survives tab switches) ────────────
  const [genLoading, setGenLoading] = useState(false);
  const [genOutputs, setGenOutputs] = useState([]);
  const [genValidErr, setGenValidErr] = useState(false);
  const [genRegeneratingId, setGenRegeneratingId] = useState(null);
  const genAbortRef = useRef(null);

  // ── History loader ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setHistoryLoading(false); return; }

        const res = await fetch(`${process.env.REACT_APP_API_URL}/content/history`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(Array.isArray(data) ? data.map(item => ({
          ...item,
          ts: item.createdAt ? new Date(item.createdAt) : new Date(),
          prompt: item.prompt || item.topic,
        })) : []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    loadHistory();
  }, [user]);

  // ── Background-safe generate function ─────────────────────────────────────
  async function handleGenerate(params) {
    const { topic, template, tone, platform, audience, numberOfIdeas } = params;
    if (!topic.trim()) { setGenValidErr(true); return; }
    setGenValidErr(false);
    setGenLoading(true);
    setGenOutputs([]);

    // Cancel any previous in-flight request
    if (genAbortRef.current) genAbortRef.current.abort();
    const controller = new AbortController();
    genAbortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { showToast("Session expired. Please log in again."); setGenLoading(false); return; }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ topic, template, tone, platform, audience, numberOfIdeas }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Failed to generate content");
      const parsed = await res.json();
      const entries = parsed.map((idea, idx) => ({
        ...idea,
        ts: idea.ts ? new Date(idea.ts) : new Date(),
        id: idea.id || Date.now() + idx,
      }));

      setGenOutputs(entries);
      setHistory(h => [...entries.reverse(), ...h]);
      setSessionCount(n => n + entries.length);
      showToast("✨ Content generated successfully!");
    } catch (err) {
      if (err.name === 'AbortError') return; // silently ignore manual cancels
      console.error(err);
      showToast("Generation failed. Please retry.");
    } finally {
      setGenLoading(false);
    }
  }

  // ── Background-safe regenerate function ───────────────────────────────────
  async function handleRegenerate(output) {
    setGenRegeneratingId(output.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/content/regenerate/${output.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        body: JSON.stringify({ topic: output.topic, template: output.template, tone: output.tone, platform: output.platform, audience: output.audience }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const updated = await res.json();
      const newEntry = { ...updated, ts: new Date(), prompt: updated.prompt || updated.topic };
      setGenOutputs(prev => [newEntry, ...prev]);
      setHistory(h => [newEntry, ...h]);
      showToast("Content regenerated! New version added to history.");
    } catch (err) {
      console.error(err);
      showToast("Regeneration failed. Please retry.");
    }
    setGenRegeneratingId(null);
  }

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
      <Sidebar tab={tab} setTab={setTab} history={history} user={user} setUser={setUser} setPage={setPage} genLoading={genLoading} />

      <main className="flex-1 flex flex-col h-screen h-screen overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 bg-darkSurface/80 backdrop-blur-md border-b border-darkBorder sticky top-0 z-30">
          <div className="h-16 flex items-center justify-between px-8">
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
          </div>

          {/* Background generation banner — visible only when away from generate tab */}
          <AnimatePresence>
            {genLoading && tab !== 'generate' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setTab('generate')}
                  className="w-full flex items-center justify-center gap-3 py-2 bg-gradient-to-r from-tertiaryAccent/20 via-secondaryAccent/20 to-primaryAccent/20 border-t border-tertiaryAccent/20 hover:from-tertiaryAccent/30 hover:via-secondaryAccent/30 hover:to-primaryAccent/30 transition-all"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiaryAccent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiaryAccent" />
                  </span>
                  <span className="text-xs font-semibold text-white/80">
                    AI generating in background — <span className="text-tertiaryAccent underline underline-offset-2">click to view progress</span>
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Dynamic content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-5xl mx-auto px-8 py-8 w-full min-h-full">

            {/*
              GeneratePage is ALWAYS mounted so background generation survives
              tab switches. We toggle visibility via CSS instead of conditional
              rendering to preserve component state and in-flight fetch requests.
            */}
            <div style={{ display: tab === 'generate' ? 'block' : 'none' }}>
              <GeneratePage
                history={history}
                setHistory={setHistory}
                setTab={setTab}
                showToast={showToast}
                initialPrompt={sharedPrompt}
                initialTemplate={sharedTemplate}
                initialTone={sharedTone}
                // Lifted generation state & handlers
                loading={genLoading}
                outputs={genOutputs}
                validErr={genValidErr}
                setValidErr={setGenValidErr}
                regeneratingId={genRegeneratingId}
                onGenerate={handleGenerate}
                onRegenerate={handleRegenerate}
              />
            </div>

            <AnimatePresence mode="wait">
              {tab !== 'generate' && (
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
                  {tab === "history" && (
                    <HistoryPage
                      history={history}
                      historyLoading={historyLoading}
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
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
