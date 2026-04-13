import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Trash2, Clock, Sparkles } from 'lucide-react';
import { TEMPLATES, TONES } from '../constants/theme';
import { supabase } from '../supabase';
import HistoryRow from '../components/HistoryRow';
import Modal from '../components/Modal';

export default function HistoryPage({ history, historyLoading = false, setHistory, setPrompt, setTemplate, setTone, setTab, showToast }) {
  const [filter, setFilter] = useState("All");
  const [toneFilter, setToneFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState(null);

  const templates = ["All", ...TEMPLATES.map(t => t.id)];
  const tones = ["All", ...TONES];

  const filtered = history.filter(h => {
    const matchTmpl = filter === "All" || h.template === filter;
    const matchTone = toneFilter === "All" || h.tone === toneFilter;
    const matchSearch = !search || h.title?.toLowerCase().includes(search.toLowerCase()) || h.prompt?.toLowerCase().includes(search.toLowerCase());
    return matchTmpl && matchTone && matchSearch;
  });

  function copyItem(item) {
    const keyPoints = Array.isArray(item.keyPoints) ? item.keyPoints : [];
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    
    const txt = `${item.title || ""}\n\n${item.introduction || ""}\n\nKey Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n${item.conclusion || ""}\n\nKeywords: ${keywords.join(", ")}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => showToast("Copied to clipboard"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = txt;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast("Copied to clipboard");
      } catch (err) {
        showToast("Copy failed");
      }
      document.body.removeChild(textArea);
    }
  }

  function reuseItem(item) {
    setPrompt(item.prompt);
    setTemplate(item.template);
    setTone(item.tone);
    setTab("generate");
    showToast("Prompt loaded — ready to generate");
  }

  async function deleteItem(id) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch(`${process.env.REACT_APP_API_URL}/content/${id}`, { 
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      setHistory(h => h.filter(x => x.id !== id));
      showToast("Deleted from history");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete content");
    }
  }

  async function regenerateItem(item) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/content/regenerate/${item.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          topic: item.topic || item.prompt,
          template: item.template,
          tone: item.tone,
          platform: item.platform,
          audience: item.audience,
        }),
      });

      if (!res.ok) throw new Error("Regeneration failed");
      const updated = await res.json();

      const newEntry = { 
        ...updated, 
        ts: new Date(),
        prompt: updated.prompt || updated.topic
      };

      setHistory(h => [newEntry, ...h]);
      showToast("Content regenerated! New version added to history.");
    } catch (err) {
      console.error(err);
      showToast("Regeneration failed");
    }
  }

  async function clearAll() {
    if (window.confirm("Clear all history? This cannot be undone.")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        await Promise.all(
          history.map(item =>
            fetch(`${process.env.REACT_APP_API_URL}/content/${item.id}`, {
              method: 'DELETE',
              headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
            })
          )
        );
        setHistory([]);
        showToast("History cleared");
      } catch (err) {
        console.error(err);
        showToast("Failed to clear history");
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-5xl mx-auto pb-20">
      <Modal item={modalItem} onClose={() => setModalItem(null)} />

      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="w-8 h-1 bg-gradient-to-r from-primaryAccent to-tertiaryAccent rounded-full mb-4" />
          <h1 className="text-3xl font-display font-bold text-white mb-2">Content History</h1>
          <p className="text-textMuted text-sm">
            {history.length} piece{history.length !== 1 ? "s" : ""} generated · View, reuse, or copy past content
          </p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm font-semibold border border-red-500/20"
          >
            <Trash2 size={16} /> Clear History
          </button>
        )}
      </motion.div>

      {/* Filters Bar */}
      <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl border border-white/5 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 pr-4 lg:border-r border-white/10 shrink-0">
            <Filter size={18} className="text-textMuted" />
            <span className="text-xs font-bold tracking-widest uppercase text-textMain">Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-2 flex-1">
            {templates.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f 
                    ? 'bg-primaryAccent text-white shadow-lg shadow-primaryAccent/20' 
                    : 'bg-darkBg text-textMuted border border-darkBorder hover:border-white/20 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={toneFilter}
              onChange={e => setToneFilter(e.target.value)}
              className="bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primaryAccent transition-colors w-32"
            >
              {tones.map(t => <option key={t}>{t}</option>)}
            </select>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48 bg-darkBg border border-darkBorder rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-textMuted/50 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* History List */}
      <motion.div variants={itemVariants} className="min-h-[400px]">
        <AnimatePresence>
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl border border-white/5 p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-white/5 rounded-full w-2/3" />
                      <div className="h-2.5 bg-white/5 rounded-full w-1/3" />
                    </div>
                    <div className="h-6 w-16 bg-white/5 rounded-lg" />
                    <div className="h-6 w-16 bg-white/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl border border-white/5 p-16 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-darkBg border border-darkBorder flex items-center justify-center mb-6">
                <Clock size={32} className="text-textMuted" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No history</h3>
              <p className="text-textMuted mb-6 max-w-sm">You haven't generated any content yet. Head over to the Generator to create your first piece.</p>
              <button 
                onClick={() => setTab("generate")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primaryAccent hover:bg-primaryAccent/90 text-white font-semibold transition-colors shadow-lg shadow-primaryAccent/20"
              >
                <Sparkles size={18} /> Start Generating
              </button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl border border-white/5 py-16 text-center"
            >
              <p className="text-textMuted">No outputs match your current filters.</p>
              <button 
                onClick={() => { setFilter("All"); setToneFilter("All"); setSearch(""); }}
                className="mt-4 text-primaryAccent hover:text-white transition-colors text-sm font-semibold"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onCopy={copyItem}
                  onReuse={reuseItem}
                  onDelete={deleteItem}
                  onView={setModalItem}
                  onRegenerate={regenerateItem}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
