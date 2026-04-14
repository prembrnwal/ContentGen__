import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Monitor, Type, Palette, Layout, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage({ showToast }) {
  const [theme, setTheme] = useState("dark");
  const [font, setFont] = useState("inter");
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    // Load existing settings
    try {
      const savedSettings = JSON.parse(localStorage.getItem('cg_settings') || '{}');
      if (savedSettings.theme) setTheme(savedSettings.theme);
      if (savedSettings.font) setFont(savedSettings.font);
      if (savedSettings.hoverEnabled !== undefined) setHoverEnabled(savedSettings.hoverEnabled);
      if (savedSettings.highContrast !== undefined) setHighContrast(savedSettings.highContrast);
    } catch(e){}
  }, []);

  const saveSettings = () => {
    const settings = { theme, font, hoverEnabled, highContrast };
    localStorage.setItem('cg_settings', JSON.stringify(settings));
    
    // Apply classes globally
    document.body.classList.remove('theme-light', 'font-manrope', 'no-hover', 'high-contrast');
    if (theme === 'light') document.body.classList.add('theme-light');
    if (font === 'manrope') document.body.classList.add('font-manrope');
    if (!hoverEnabled) document.body.classList.add('no-hover');
    if (highContrast) document.body.classList.add('high-contrast');

    showToast("Preferences saved successfully!");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-4xl mx-auto pb-20">
      <motion.div variants={itemVariants} className="mb-8">
        <div className="w-8 h-1 bg-gradient-to-r from-primaryAccent to-tertiaryAccent rounded-full mb-4" />
        <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-textMuted">Customise your workspace preferences and application appearance.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <Palette className="text-primaryAccent" size={24} />
            <div>
              <h2 className="text-xl font-display font-bold text-white">Appearance</h2>
              <p className="text-sm text-textMuted">Manage your theme and overall look.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-textMuted mb-4 block">Theme Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "dark", label: "Dark Mode", desc: "Sleek and easy on the eyes", icon: Moon },
                  { id: "light", label: "Light Mode", desc: "Clean and highly readable", icon: Sun },
                  { id: "system", label: "System Sync", desc: "Adapts to your device", icon: Monitor }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left ${
                      theme === t.id
                        ? 'bg-primaryAccent/10 border-primaryAccent/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-darkBg border-darkBorder hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <t.icon size={20} className={`mb-3 ${theme === t.id ? 'text-primaryAccent' : 'text-textMuted'}`} />
                    <div className={`font-semibold mb-1 ${theme === t.id ? 'text-white' : 'text-textMain'}`}>{t.label}</div>
                    <div className="text-xs text-textMuted">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-textMuted mb-4 block">Font Family</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "inter", label: "Inter + Space Grotesk", desc: "Modern, structural, and tech-focused" },
                  { id: "manrope", label: "Manrope + Poppins", desc: "Rounded, friendly, and approachable" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      font === f.id
                        ? 'bg-primaryAccent/10 border-primaryAccent/50 text-white'
                        : 'bg-darkBg border-darkBorder hover:border-white/20 text-textMuted'
                    }`}
                  >
                    <Type size={20} className={font === f.id ? 'text-primaryAccent' : 'text-textMuted'} />
                    <div>
                      <div className="font-semibold">{f.label}</div>
                      <div className="text-[10px] sm:text-xs opacity-70">{f.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Configuration */}
        <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <Layout className="text-secondaryAccent" size={24} />
            <div>
              <h2 className="text-xl font-display font-bold text-white">Workspace Preferences</h2>
              <p className="text-sm text-textMuted">Configure how ContentGen behaves for you.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div 
              onClick={() => setHoverEnabled(!hoverEnabled)}
              className="flex items-center justify-between p-4 rounded-xl border border-darkBorder bg-darkBg cursor-pointer hover:border-white/10 transition-colors"
            >
              <div>
                <div className="font-semibold text-white">Enable Hover Animations</div>
                <div className="text-xs text-textMuted">Disable for maximum performance on older devices</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${hoverEnabled ? 'bg-primaryAccent' : 'bg-darkSurface border border-darkBorder'}`}>
                <motion.div 
                  className={`absolute top-1 w-4 h-4 rounded-full ${hoverEnabled ? 'bg-white' : 'bg-textMuted'}`}
                  animate={{ left: hoverEnabled ? '26px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>

            <div 
              onClick={() => setHighContrast(!highContrast)}
              className="flex items-center justify-between p-4 rounded-xl border border-darkBorder bg-darkBg cursor-pointer hover:border-white/10 transition-colors"
            >
              <div>
                <div className="font-semibold text-white">High Contrast UI</div>
                <div className="text-xs text-textMuted">Increases border visibility and text brightness</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${highContrast ? 'bg-primaryAccent' : 'bg-darkSurface border border-darkBorder'}`}>
                <motion.div 
                  className={`absolute top-1 w-4 h-4 rounded-full ${highContrast ? 'bg-white' : 'bg-textMuted'}`}
                  animate={{ left: highContrast ? '26px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div variants={itemVariants} className="flex justify-end pt-4">
          <button 
            onClick={saveSettings}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primaryAccent to-tertiaryAccent text-white font-bold transition-all shadow-lg shadow-primaryAccent/20 hover:-translate-y-0.5 hover:shadow-primaryAccent/40"
          >
            <Save size={18} /> Save Settings
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
