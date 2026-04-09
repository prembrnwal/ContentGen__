import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function LoginPage({ setPage, setUser }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function handleSubmit(e) {
    e?.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setErr("Please fill in all fields."); return;
    }
    if (!email.includes("@")) { setErr("Enter a valid email address."); return; }
    setErr(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser(mode === "signup" ? name.split(" ")[0] : email.split("@")[0]);
      setPage("app");
    }, 1200);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-darkBg overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primaryAccent/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primaryAccent to-tertiaryAccent flex items-center justify-center shadow-lg shadow-primaryAccent/20">
              <BrainCircuit size={24} className="text-white" />
            </div>
            <div className="font-display font-bold text-2xl tracking-wide">
              Content<span className="gradient-text">Gen</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-white mb-2"
          >
            {mode === "login" ? "Welcome back" : "Create an account"}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-textMuted"
          >
            {mode === "login" ? "Enter your credentials to access your workspace." : "Start generating content with AI in seconds."}
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-darkBg/50 border border-darkBorder text-white text-sm rounded-xl px-10 py-3 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-darkBg/50 border border-darkBorder text-white text-sm rounded-xl px-10 py-3 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Password</label>
                {mode === "login" && (
                  <span className="text-xs font-medium text-primaryAccent cursor-pointer hover:text-white transition-colors">Forgot?</span>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-darkBg/50 border border-darkBorder text-white text-sm rounded-xl px-10 py-3 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                />
              </div>
            </div>

            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm font-medium"
                >
                  {err}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group py-3 rounded-xl bg-gradient-to-r from-primaryAccent to-tertiaryAccent text-white font-semibold flex items-center justify-center shadow-lg shadow-primaryAccent/20 hover:shadow-primaryAccent/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
              </span>
            </button>
          </form>

          <p className="text-center text-sm text-textMuted mt-6">
            {mode === "login" ? "New to ContentGen? " : "Already have an account? "}
            <span
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}
              className="text-white font-medium cursor-pointer hover:text-primaryAccent transition-colors"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => setPage("landing")}
            className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
