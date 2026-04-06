import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function Modal({ item, onClose }) {
  if (!item) return null;

  function copyAll() {
    const txt = `${item.title}\n\n${item.introduction}\n\nKey Points:\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n${item.conclusion}\n\nKeywords: ${item.keywords.join(", ")}`;
    navigator.clipboard.writeText(txt);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-darkBg/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] bg-darkSurface border border-darkBorder rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between bg-darkBg/50">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 rounded bg-primaryAccent/20 text-primaryAccent border border-primaryAccent/30 text-[10px] font-bold uppercase tracking-wider">{item.template}</span>
                <span className="px-2.5 py-1 rounded bg-darkBg border border-darkBorder text-textMuted text-[10px] font-bold uppercase tracking-wider">{item.tone}</span>
                {item.platform && item.platform !== "General" && (
                  <span className="px-2.5 py-1 rounded bg-secondaryAccent/20 text-secondaryAccent border border-secondaryAccent/30 text-[10px] font-bold uppercase tracking-wider">{item.platform}</span>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-white pr-8">{item.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-darkBg border border-darkBorder text-textMuted hover:text-white hover:border-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div>
              <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Introduction</div>
              <p className="text-textMain leading-relaxed">{item.introduction}</p>
            </div>

            <div className="w-full h-px bg-darkBorder/50" />

            <div>
              <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Key Points</div>
              <ul className="space-y-3">
                {item.keyPoints?.map((pt, i) => (
                  <li key={i} className="flex gap-3 text-textMain leading-relaxed">
                    <CheckCircle2 size={18} className="text-tertiaryAccent shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full h-px bg-darkBorder/50" />

            <div>
              <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Conclusion</div>
              <p className="text-textMain leading-relaxed">{item.conclusion}</p>
            </div>

            <div>
              <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Tags & Keywords</div>
              <div className="flex flex-wrap gap-2">
                {item.keywords?.map((k, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-textMuted text-xs font-medium">#{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-white/5 bg-darkBg/50 flex items-center justify-between">
            <button 
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-textMuted hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Copy size={16} /> Copy All
            </button>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primaryAccent hover:bg-primaryAccent/90 text-white font-semibold transition-colors shadow-lg shadow-primaryAccent/20 text-sm"
            >
              <Check size={16} /> Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
