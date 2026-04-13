import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Zap, FileText, Mail, Network, Megaphone, Share2, Box } from 'lucide-react';

const TEMPLATE_META = {
  "Blog": { icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10", bar: "bg-blue-400" },
  "Email": { icon: Mail, color: "text-emerald-400", bg: "bg-emerald-400/10", bar: "bg-emerald-400" },
  "LinkedIn": { icon: Network, color: "text-blue-500", bg: "bg-blue-500/10", bar: "bg-blue-500" },
  "Ad": { icon: Megaphone, color: "text-orange-400", bg: "bg-orange-400/10", bar: "bg-orange-400" },
  "Social": { icon: Share2, color: "text-purple-400", bg: "bg-purple-400/10", bar: "bg-purple-400" },
  "Product": { icon: Box, color: "text-rose-400", bg: "bg-rose-400/10", bar: "bg-rose-400" }
};

export default function DashboardPage({ history, sessionCount = 0, setTab }) {
  const templates = ["Blog", "Email", "LinkedIn", "Ad", "Social", "Product"];
  const countsByTemplate = {};
  templates.forEach(t => { countsByTemplate[t] = history.filter(h => h.template === t).length; });
  const recent = history.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="w-10 h-1 bg-gradient-to-r from-primaryAccent to-tertiaryAccent rounded-full mb-4" />
        <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
        <p className="text-textMuted">Welcome back. Here's a snapshot of your content activity.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <History size={60} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-2">Total Generated</div>
            <div className="text-4xl font-display font-bold text-white mb-1">{history.length}</div>
            <div className="text-xs text-textMuted">All time</div>
          </div>
        </div>
        
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondaryAccent/10 to-transparent" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={60} className="text-secondaryAccent" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-semibold text-secondaryAccent uppercase tracking-wider mb-2">This Session</div>
            <div className="text-4xl font-display font-bold text-white mb-1">{sessionCount}</div>
            <div className="text-xs text-textMuted">Since you opened the app</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-tertiaryAccent/10 to-transparent" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={60} className="text-tertiaryAccent" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-semibold text-tertiaryAccent uppercase tracking-wider mb-2">Avg. Quality</div>
            <div className="text-4xl font-display font-bold text-white mb-1">
              {history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.qualityScore || 92), 0) / history.length) + "%" : "—"}
            </div>
            <div className="text-xs text-textMuted">AI quality score</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Breakdown */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl border border-white/5 p-6">
          <h2 className="text-lg font-bold text-white mb-6 font-display">Content by Template</h2>
          <div className="space-y-4 flex-1">
            {templates.map(t => {
              const count = countsByTemplate[t];
              const pct = history.length > 0 ? (count / history.length) * 100 : 0;
              const meta = TEMPLATE_META[t] || TEMPLATE_META["Blog"];
              
              return (
                <div key={t}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-textMain flex items-center gap-2">
                      <meta.icon size={14} className={meta.color} /> {t}
                    </span>
                    <span className="text-textMuted text-xs font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-darkBg rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${meta.bar} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white font-display">Recent Activity</h2>
            {history.length > 5 && (
              <button onClick={() => setTab("history")} className="text-xs font-semibold text-primaryAccent hover:text-white transition-colors">
                View all →
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-darkBg flex items-center justify-center mb-4 border border-darkBorder">
                <History size={24} className="text-textMuted" />
              </div>
              <p className="text-textMuted text-sm mb-4">No content generated yet.</p>
              <button 
                onClick={() => setTab("generate")}
                className="text-sm font-semibold text-primaryAccent hover:text-white transition-colors flex items-center gap-2"
              >
                Generate your first <Sparkles size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {recent.map((item, idx) => {
                const meta = TEMPLATE_META[item.template] || TEMPLATE_META["Blog"];
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.id} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                      <meta.icon size={18} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate group-hover:text-primaryAccent transition-colors">
                        {item.title || item.prompt}
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="shrink-0 px-2.5 py-1 rounded-md bg-darkBg border border-darkBorder text-[10px] font-bold text-textMuted uppercase tracking-wider">
                      {item.template}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA section (if no history) */}
      <AnimatePresence>
        {history.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl bg-gradient-to-r from-primaryAccent/20 to-tertiaryAccent/20 border border-primaryAccent/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primaryAccent/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <div className="relative z-10 text-center sm:text-left">
              <h3 className="text-xl font-bold font-display text-white mb-2">Ready to create your first piece?</h3>
              <p className="text-sm text-textMuted max-w-md">Pick a template, write a prompt, and let our advanced AI models do the heavy lifting.</p>
            </div>
            <button
              onClick={() => setTab("generate")}
              className="relative z-10 shrink-0 px-6 py-3 rounded-xl bg-white text-darkBg font-bold text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <Sparkles size={16} className="text-primaryAccent group-hover:animate-pulse" /> Start Generating
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
