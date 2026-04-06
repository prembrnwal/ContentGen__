import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Zap, LayoutTemplate, CopyButton, ArrowRight, Bot, Layers, Fingerprint } from 'lucide-react';

const FEATURES = [
  { icon: Bot, title: "Advanced AI Models", desc: "Powered by state-of-the-art language models tailored for content generation." },
  { icon: LayoutTemplate, title: "Smart Templates", desc: "Access specialized templates for blogs, ads, social posts, and more." },
  { icon: Fingerprint, title: "Voice Matching", desc: "Generate content that perfectly aligns with your brand's unique tone." },
];

export default function LandingPage({ setPage }) {
  // A glowing orb background effect
  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden flex flex-col">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primaryAccent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-secondaryAccent/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border border-white/5"
        >
          <Sparkles size={14} className="text-tertiaryAccent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-textMuted pt-[1px]">The New Standard in AI content</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold max-w-4xl mx-auto leading-tight md:leading-[1.1] mb-6"
        >
          Create compelling content <br className="hidden md:block" />
          <span className="gradient-text italic opacity-90 block mt-2">at the speed of thought</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
        >
          ContentGen Pro uses advanced artificial intelligence to generate blog posts, emails, LinkedIn content, ad copy, and more — precisely tailored to your exact tone and style.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <button
            onClick={() => setPage("login")}
            className="group relative px-8 py-4 w-full sm:w-auto rounded-xl bg-textMain text-darkBg font-bold text-lg hover:pr-10 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Start Generating Free
            <ArrowRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button
            onClick={() => setPage("login")}
            className="group px-8 py-4 w-full sm:w-auto rounded-xl glass-panel hover:bg-white/5 border border-white/10 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <Layers size={18} className="text-textMuted group-hover:text-white transition-colors" />
            View Templates
          </button>
        </motion.div>
      </div>

      {/* Feature grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <feature.icon size={24} className="text-primaryAccent" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3 text-white">{feature.title}</h3>
            <p className="text-textMuted leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-textMuted mt-auto">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <BrainCircuit size={16} className="text-primaryAccent" />
          <span className="font-semibold text-white">ContentGen</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
