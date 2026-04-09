import { useState } from 'react';
import { Copy, RefreshCw, Trash2, FileText, Mail, Network, Megaphone, Share2, Box } from 'lucide-react';

const TEMPLATE_META = {
  "Blog": { icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  "Email": { icon: Mail, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  "LinkedIn": { icon: Network, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Ad": { icon: Megaphone, color: "text-orange-400", bg: "bg-orange-400/10" },
  "Social": { icon: Share2, color: "text-purple-400", bg: "bg-purple-400/10" },
  "Product": { icon: Box, color: "text-rose-400", bg: "bg-rose-400/10" }
};

export default function HistoryRow({ item, onCopy, onReuse, onDelete, onView }) {
  const [hov, setHov] = useState(false);
  const meta = TEMPLATE_META[item.template] || TEMPLATE_META["Blog"];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onView(item)}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer mb-3 relative group"
      style={{
        backgroundColor: hov ? 'var(--dark-bg, #0f1115)' : 'var(--dark-surface, #161922)',
        borderColor: hov ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 10px 30px -10px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 transition-colors ${hov ? 'bg-darkSurface' : meta.bg}`}>
        <meta.icon size={20} className={meta.color} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-base font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1">
          {item.title || item.prompt}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/5 text-textMuted border border-white/10">
            {item.template}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/5 text-textMuted border border-white/10">
            {item.tone}
          </span>
          {item.platform && item.platform !== "General" && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondaryAccent/10 text-secondaryAccent border border-secondaryAccent/20">
              {item.platform}
            </span>
          )}
          <div className="w-1 h-1 rounded-full bg-darkBorder mx-1 hidden sm:block" />
          <span className="text-xs text-textMuted/60 font-medium">
            {new Date(item.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
            {" · "}
            {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div 
        className={`flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-2 sm:mt-0`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => onCopy(item)}
          className="p-2 rounded-lg bg-darkBg border border-darkBorder text-textMuted hover:text-white hover:border-white/20 transition-colors"
          title="Copy"
        >
          <Copy size={16} />
        </button>
        <button 
          onClick={() => onReuse(item)}
          className="p-2 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent hover:bg-primaryAccent hover:text-white transition-colors"
          title="Reuse prompt"
        >
          <RefreshCw size={16} />
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors ml-2"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
