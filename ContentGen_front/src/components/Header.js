import { BrainCircuit, Sparkles, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ setPage, user, setUser }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full glass-panel border-b border-darkBorder/50 py-3 px-6 xl:px-12 flex items-center justify-between"
    >
      <div
        onClick={() => setPage("landing")}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryAccent via-secondaryAccent to-tertiaryAccent flex items-center justify-center shadow-lg shadow-primaryAccent/20 group-hover:shadow-primaryAccent/40 transition-all duration-300 relative overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"
          />
          <BrainCircuit size={22} className="text-white relative z-10" />
        </div>
        <div className="font-display font-bold text-xl tracking-wide group-hover:opacity-90 transition-opacity">
          Content<span className="gradient-text">Gen</span> Pro
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-medium text-textMuted hidden sm:block">
              Welcome, <span className="text-textMain">{user.split('@')[0]}</span>
            </span>
            <button
              onClick={() => { setUser(null); setPage("landing"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-textMuted hover:text-white hover:bg-darkBorder/50 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <button
              onClick={() => setPage("app")}
              className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all shadow-sm hidden sm:block"
            >
              Dashboard
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setPage("login")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-textMuted hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setPage("login")}
              className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-primaryAccent to-secondaryAccent text-white text-sm font-semibold shadow-lg shadow-primaryAccent/30 hover:shadow-primaryAccent/50 transition-all hover:-translate-y-0.5 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={16} /> Get Started
              </span>
              <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </button>
          </>
        )}
      </div>
    </motion.header>
  );
}
