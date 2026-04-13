import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle2, Star, Zap, CreditCard, Lock, LogOut, Trash2, X, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function ProfileModal({ isOpen, onClose, user, historyCount = 0, onLogout }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
      setStatus({ error: "Password must be at least 6 characters", loading: false, success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setStatus({ loading: false, error: error.message, success: '' });
    } else {
      setStatus({ loading: false, error: '', success: 'Password successfully updated!' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setNewPassword('');
        setStatus({ loading: false, error: '', success: '' });
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsChangingPassword(false);
    setNewPassword('');
    setStatus({ loading: false, error: '', success: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-darkBg/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-textMuted hover:text-white transition-colors z-20"
            >
              <X size={16} />
            </button>

            {/* Header Banner */}
            <div className="h-24 bg-gradient-to-r from-primaryAccent/20 via-secondaryAccent/20 to-tertiaryAccent/20 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            </div>

            <AnimatePresence mode="wait">
              {!isChangingPassword ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6 relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-darkSurface border-4 border-darkBg flex items-center justify-center -mt-8 mb-3 shadow-xl relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primaryAccent to-secondaryAccent opacity-20" />
                    <User size={24} className="text-white z-10 relative" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-display font-bold text-white">{user || "Content Creator"}</h2>
                      <div className="text-xs text-textMuted">{user ? `${user.toLowerCase().replace(' ', '')}@example.com` : "user@example.com"}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondaryAccent/10 border border-secondaryAccent/20 text-secondaryAccent text-[10px] font-bold uppercase tracking-wider">
                      <Star size={10} className="fill-secondaryAccent/50" /> Pro
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-darkBg border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primaryAccent/10"><Zap size={14} className="text-primaryAccent" /></div>
                      <div>
                        <div className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Generations</div>
                        <div className="text-sm font-bold text-white">{historyCount}</div>
                      </div>
                    </div>
                    <div className="flex-1 bg-darkBg border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-tertiaryAccent/10"><CreditCard size={14} className="text-tertiaryAccent" /></div>
                      <div>
                        <div className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Credits</div>
                        <div className="text-sm font-bold text-white">&infin;</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-darkBg border border-white/5 hover:bg-white/5 transition-colors text-sm font-medium text-white group"
                    >
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-textMuted group-hover:text-white transition-colors" />
                        Change Password
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (onLogout) {
                          handleClose();
                          onLogout();
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-darkBg border border-white/5 hover:bg-white/5 transition-colors text-sm font-medium text-white group"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} className="text-textMuted group-hover:text-white transition-colors" />
                        Logout
                      </div>
                    </button>
                    <button className="w-full flex items-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-sm font-medium text-red-500 hover:text-white transition-colors mt-4">
                      <div className="flex items-center gap-2 mx-auto">
                        <Trash2 size={16} /> Delete Account
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6 relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-darkSurface border-4 border-darkBg flex items-center justify-center -mt-8 mb-4 shadow-xl relative z-10 overflow-hidden">
                    <button 
                      onClick={() => setIsChangingPassword(false)}
                      className="absolute inset-0 bg-gradient-to-br from-primaryAccent to-secondaryAccent opacity-20 hover:opacity-40 transition-opacity flex items-center justify-center"
                    >
                       <ArrowLeft size={24} className="text-white drop-shadow-md" />
                    </button>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
                  <p className="text-xs text-textMuted mb-6">Enter a new secure password for your account.</p>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent/20 transition-all"
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    {status.error && <div className="text-[11px] text-red-400 font-medium p-2 bg-red-400/10 rounded-lg">{status.error}</div>}
                    {status.success && <div className="text-[11px] text-emerald-400 font-medium p-2 bg-emerald-400/10 rounded-lg flex items-center gap-1.5"><CheckCircle2 size={14}/> {status.success}</div>}

                    <button 
                      disabled={status.loading || status.success}
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primaryAccent to-tertiaryAccent text-white text-sm font-bold shadow-lg shadow-primaryAccent/20 hover:shadow-primaryAccent/40 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
                    >
                      {status.loading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
