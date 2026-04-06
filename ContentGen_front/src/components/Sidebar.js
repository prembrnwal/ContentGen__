import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sparkles, Clock, LogOut, BrainCircuit, User, Settings } from 'lucide-react';

function SideItem({ icon: IconComponent, label, active, onClick, badge }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
        active 
          ? 'bg-primaryAccent/10 text-primaryAccent font-medium shadow-[inset_2px_0_0_0_#3b82f6]' 
          : 'text-textMuted hover:bg-white/5 hover:text-white'
      }`}
    >
      <IconComponent size={18} className={active ? 'text-primaryAccent' : hov ? 'text-white' : 'text-textMuted'} />
      <span className="flex-1 text-sm">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-primaryAccent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primaryAccent/20">
          {badge}
        </span>
      )}
    </div>
  );
}

export default function Sidebar({ tab, setTab, history, user, setUser, setPage }) {
  return (
    <div className="w-[260px] shrink-0 bg-darkSurface border-r border-darkBorder flex flex-col h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-darkBorder/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryAccent via-secondaryAccent to-tertiaryAccent flex items-center justify-center shadow-lg shadow-primaryAccent/20">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-white tracking-wide">
              Content<span className="gradient-text">Gen</span>
            </div>
            <div className="text-[10px] font-bold text-secondaryAccent tracking-widest uppercase mt-0.5">Professional</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-darkBorder/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-darkBg border border-darkBorder/50">
          <div className="w-8 h-8 rounded-full bg-primaryAccent/20 flex items-center justify-center border border-primaryAccent/30">
            <User size={14} className="text-primaryAccent" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{user || "User"}</div>
            <div className="text-[11px] text-textMuted font-medium">Pro Plan</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="p-4 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold tracking-widest uppercase text-textMuted/70 px-4 pb-2 pt-2">Menu</div>
        <SideItem icon={LayoutDashboard} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
        <SideItem icon={Sparkles} label="Generator" active={tab === "generate"} onClick={() => setTab("generate")} />
        <SideItem icon={Clock} label="History" active={tab === "history"} onClick={() => setTab("history")} badge={history.length} />
        <SideItem icon={Settings} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
      </div>

      {/* Pro Tip */}
      <div className="mx-4 mb-4 p-4 rounded-xl glass-panel relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-secondaryAccent/10 to-primaryAccent/10 opacity-50" />
        <div className="relative z-10">
          <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-tertiaryAccent" /> Pro Tip
          </div>
          <div className="text-[11px] text-textMuted leading-relaxed">
            Use the specialized templates for the best results and tone matching.
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-darkBorder/50">
        <SideItem icon={LogOut} label="Log out" onClick={() => { setUser(null); setPage("landing"); }} />
      </div>
    </div>
  );
}
