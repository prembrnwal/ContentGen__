     import { useState, useRef } from 'react';
import { motion, AnimatePresence, useViewportScroll, useTransform } from 'framer-motion';
import { BrainCircuit, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

export default function LoginPage({ setPage, setUser }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setErr("Please fill in all fields."); return;
    }
    if (!email.includes("@")) { setErr("Enter a valid email address."); return; }
    
    setErr(""); 
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        setUser(data.user.email.split("@")[0]);
        setPage("app");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        
        setErr("Success! Please check your email for verification.");
      }
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-darkBg text-white overflow-hidden font-sans">
      {/* Left Panel - Hero Section */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="hidden lg:flex w-1/2 relative flex-col justify-center p-16 border-r border-darkBorder/50 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Static Background Layer - Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          
          {/* Deep Parallax Layer (Slow Movement, Inverse) */}
          <motion.div 
            animate={{ 
              x: isHovering ? mousePosition.x * -40 : 0, 
              y: isHovering ? mousePosition.y * -40 : 0,
            }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className="absolute inset-0 opacity-50"
          >
            {/* Large Distant Rings */}
            <div className="absolute left-[5%] top-[10%] w-[500px] h-[500px] rounded-full border border-darkBorder/40 border-dashed" />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
              className="absolute right-[-20%] bottom-[-10%] w-[700px] h-[700px] rounded-full border border-primaryAccent/10" 
            />
            {/* Abstract Lines */}
            <div className="absolute left-[30%] bottom-[20%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-tertiaryAccent/20 to-transparent rotate-45" />
            <div className="absolute right-[20%] top-[15%] w-[400px] h-[1px] bg-gradient-to-r from-transparent via-primaryAccent/20 to-transparent -rotate-[15deg]" />
            <div className="absolute left-[15%] top-[50%] w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12" />
          </motion.div>

          {/* Core Parallax Layer (Medium Movement, Inverse) */}
          <motion.div 
            animate={{ 
              x: isHovering ? mousePosition.x * -80 : 0, 
              y: isHovering ? mousePosition.y * -80 : 0,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute inset-0 opacity-70"
          >
            {/* Concentric Rings matching design */}
            <div className="absolute right-[5%] top-[35%] w-[400px] h-[400px] rounded-full border border-darkBorder/80 border-dashed" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="absolute right-[12%] top-[20%] w-[350px] h-[350px] rounded-full border border-primaryAccent/20" 
            />
            <div className="absolute right-[25%] top-[30%] w-[200px] h-[200px] rounded-full border border-tertiaryAccent/30" />
            
            {/* Smaller secondary rings */}
            <motion.div 
              animate={{ rotate: -180 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
              className="absolute left-[20%] top-[65%] w-[180px] h-[180px] border border-white/5 rounded-full" 
            />
            <div className="absolute left-[25%] top-[70%] w-[80px] h-[80px] border border-darkBorder border-dashed rounded-full" />
          </motion.div>

          {/* Foreground Orb Layer (Fast Movement, Direct Follow) */}
          <motion.div
            animate={{ 
              x: isHovering ? mousePosition.x * 120 : 0, 
              y: isHovering ? mousePosition.y * 120 : 0,
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="absolute inset-0"
          >
            {/* Primary Colored Orbs */}
            <div className="absolute right-[18%] top-[28%] w-2 h-2 bg-primaryAccent rounded-full shadow-[0_0_15px_rgba(var(--primary-accent),0.9)]" />
            <div className="absolute left-[35%] top-[40%] w-2.5 h-2.5 bg-tertiaryAccent rounded-full shadow-[0_0_15px_rgba(var(--tertiary-accent),0.9)]" />
            <div className="absolute right-[35%] bottom-[25%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
            <div className="absolute left-[45%] top-[15%] w-1 h-1 bg-primaryAccent rounded-full shadow-[0_0_8px_rgba(var(--primary-accent),0.6)]" />

            {/* Constellation-style Mini Dots */}
            <div className="absolute left-[25%] top-[25%] w-[3px] h-[3px] bg-white/40 rounded-full" />
            <div className="absolute left-[22%] top-[30%] w-[2px] h-[2px] bg-tertiaryAccent/50 rounded-full" />
            <div className="absolute right-[12%] bottom-[35%] w-[3px] h-[3px] bg-primaryAccent/40 rounded-full" />
            <div className="absolute right-[18%] bottom-[42%] w-[2px] h-[2px] bg-white/30 rounded-full" />
          </motion.div>

          {/* Hyper-Foreground Layer (Very Fast Movement, Inverse) */}
          <motion.div
            animate={{ 
              x: isHovering ? mousePosition.x * -180 : 0, 
              y: isHovering ? mousePosition.y * -180 : 0,
            }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            className="absolute inset-0"
          >
             {/* Dynamic Floaties */}
             <div className="absolute right-[8%] top-[55%] w-3 h-3 bg-tertiaryAccent rounded-full shadow-[0_0_18px_rgba(var(--tertiary-accent),0.8)]" />
             <div className="absolute left-[15%] bottom-[15%] w-2 h-2 bg-primaryAccent rounded-full shadow-[0_0_12px_rgba(var(--primary-accent),0.8)]" />
             <div className="absolute right-[45%] top-[75%] w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
             <div className="absolute left-[5%] top-[45%] w-1 h-1 bg-tertiaryAccent/60 rounded-full" />
             
             {/* Small pluses/crosses (decorative) */}
             <div className="absolute right-[25%] top-[15%] text-primaryAccent/30 text-[10px] font-bold">+</div>
             <div className="absolute left-[35%] bottom-[40%] text-white/20 text-[12px] font-bold">+</div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-12 cursor-pointer"
            onClick={() => setPage("landing")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryAccent to-tertiaryAccent flex items-center justify-center shadow-lg shadow-primaryAccent/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div className="font-display font-bold text-xl tracking-wide">
              Content<span className="gradient-text">Gen</span>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-bold tracking-[0.2em] text-textMuted uppercase mb-4"
          >
             Welcome back to ContentGen
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-display font-extrabold text-white mb-4 leading-tight"
          >
            {mode === "login" ? "Login to your account." : "Start creating today."}
            <br />
            <span className="text-textMuted font-medium text-4xl mt-2 block">
              Mastering AI generation.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-textMuted text-lg leading-relaxed mt-6 max-w-md"
          >
            Supercharge your workflow with curated AI models, seamless content generation, and a suite of powerful generative tools.
          </motion.p>
        </div>
        
        <div className="absolute bottom-8 left-16 text-xs text-textMuted z-10">
          © 2026 ContentGen — Built for creators, by creators.
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <button
          onClick={() => setPage("landing")}
          className="absolute top-8 left-8 lg:hidden inline-flex items-center gap-2 text-sm text-textMuted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-textMuted mb-8">
              {mode === "login" ? "Sign in to your ContentGen account" : "Join us to start generating content"}
            </p>

            {/* Social Logins (Placeholder aesthetic per screenshot) */}
            {mode === "login" && (
              <div className="mb-6 space-y-3">
                <button 
                  type="button" 
                  className="w-full bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
                >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   Sign in with Google
                </button>
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-darkBorder"></div>
                  <span className="flex-shrink-0 mx-4 text-textMuted text-xs uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-darkBorder"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="w-full bg-transparent border border-darkBorder text-white text-sm rounded-xl px-10 py-3.5 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-darkBorder text-white text-sm rounded-xl px-10 py-3.5 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Password</label>
                  {mode === "login" && (
                    <span className="text-xs font-medium text-textMuted hover:text-white transition-colors cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-darkBorder text-white text-sm rounded-xl px-10 py-3.5 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder:text-textMuted/50"
                  />
                </div>
              </div>

              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm font-medium mt-2"
                  >
                    {err}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-textMuted">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}
                  className="text-white font-semibold hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
            
            <p className="text-xs text-textMuted text-center mt-12 max-w-xs mx-auto">
              By continuing, you agree to our <span className="hover:text-white cursor-pointer">Terms of Service</span> and <span className="hover:text-white cursor-pointer">Privacy Policy</span>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

