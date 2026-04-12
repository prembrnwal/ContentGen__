import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, RefreshCw, ChevronDown, CheckCircle2 } from 'lucide-react';
import { TEMPLATES, TONES, TONE_HINTS, PLATFORMS, AUDIENCES, NUMBER_OF_IDEAS_OPTIONS } from '../constants/theme';
import { supabase } from '../supabase';

function FieldLabel({ children }) {
  return (
    <span className="text-[10px] font-bold tracking-widest uppercase text-textMuted/80 mb-2 block">
      {children}
    </span>
  );
}

export default function GeneratePage({
  history, setHistory, setTab, showToast,
  initialPrompt = "", initialTemplate = "Blog", initialTone = "Professional",
}) {
  const [topic, setTopic] = useState(initialPrompt);
  const [template, setTemplate] = useState(initialTemplate);
  const [tone, setTone] = useState(initialTone);
  const [platform, setPlatform] = useState("General");
  const [audience, setAudience] = useState("General Public");
  const [numberOfIdeas, setNumberOfIdeas] = useState(1);
  const [loading, setLoading] = useState(false);

  const [outputs, setOutputs] = useState([]);
  const [validErr, setValidErr] = useState(false);
  const outputRef = useRef(null);

  async function generate(overrides = {}) {
    const p = overrides.topic ?? topic;
    const tmpl = overrides.template ?? template;
    const tn = overrides.tone ?? tone;
    const plt = overrides.platform ?? platform;
    const aud = overrides.audience ?? audience;
    const numIdeas = overrides.numberOfIdeas ?? numberOfIdeas;

    if (!p.trim()) { setValidErr(true); return; }
    setValidErr(false); setLoading(true); setOutputs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showToast("Session expired. Please log in again.");
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/content/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: p, template: tmpl, tone: tn, platform: plt, audience: aud, numberOfIdeas: numIdeas
        }),
      });

      if (!res.ok) throw new Error("Failed to generate content");

      const parsed = await res.json();
      const entries = parsed.map((idea, idx) => ({
        ...idea,
        ts: idea.ts ? new Date(idea.ts) : new Date(),
        id: idea.id || Date.now() + idx,
      }));

      setOutputs(entries);
      setHistory(h => [...entries.reverse(), ...h]);

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      console.error(err);
      showToast("Generation failed. Please retry.");
    }
    setLoading(false);
  }

  function copyOutput(item) {
    const txt = `${item.title}\n\n${item.introduction}\n\nKey Points:\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n${item.conclusion}\n\nKeywords: ${item.keywords.join(", ")}`;
    navigator.clipboard.writeText(txt).then(() => showToast("Copied to clipboard"));
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-4xl mx-auto pb-20">
      <motion.div variants={itemVariants} className="mb-8">
        <div className="w-8 h-1 bg-gradient-to-r from-primaryAccent to-tertiaryAccent rounded-full mb-4" />
        <h1 className="text-3xl font-display font-bold text-white mb-2">AI Generator</h1>
        <p className="text-textMuted">Configure your parameters and let our models do the heavy lifting.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Topic */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5 relative group">
          <div className="absolute inset-0 bg-primaryAccent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          <FieldLabel>Topic / Prompt</FieldLabel>
          <textarea
            value={topic}
            onChange={e => { setTopic(e.target.value); setValidErr(false); }}
            placeholder="e.g. 'The future of artificial intelligence in software development...'"
            className="w-full bg-darkBg border border-darkBorder rounded-xl p-4 text-white placeholder:text-textMuted/40 focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all min-h-[120px] resize-y"
          />
          <div className="flex justify-between mt-2 px-1">
            <AnimatePresence>
              {validErr && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-semibold">
                  Please enter a topic to generate content.
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-textMuted/50 text-xs ml-auto">{topic.length} chars</span>
          </div>
        </motion.div>

        {/* Template */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5">
          <FieldLabel>Template</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left ${template === t.id
                  ? 'bg-primaryAccent/10 border-primaryAccent/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-darkBg border-darkBorder hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                <div className={`font-semibold mb-1 ${template === t.id ? 'text-primaryAccent' : 'text-white'}`}>
                  {t.label}
                </div>
                <div className="text-[10px] text-textMuted leading-snug">{t.hint}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Configurations grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <FieldLabel>Tone of Voice</FieldLabel>
            <div className="relative">
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl p-3.5 pr-10 text-white appearance-none focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all cursor-pointer"
              >
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
            </div>
            <div className="text-xs text-textMuted mt-3 pl-1 border-l-2 border-primaryAccent/30">{TONE_HINTS[tone]}</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <FieldLabel>Target Audience</FieldLabel>
            <div className="relative">
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl p-3.5 pr-10 text-white appearance-none focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all cursor-pointer"
              >
                {AUDIENCES.map(a => <option key={a}>{a}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <FieldLabel>Platform</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(plt => (
                    <button
                      key={plt.id}
                      onClick={() => setPlatform(plt.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${platform === plt.id
                        ? 'bg-secondaryAccent/20 border-secondaryAccent/50 text-secondaryAccent font-semibold'
                        : 'bg-darkBg border-darkBorder text-textMuted hover:text-white hover:border-white/20'
                        }`}
                    >
                      {plt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:w-1/3">
                <FieldLabel>Output Variations</FieldLabel>
                <div className="flex bg-darkBg p-1 rounded-xl border border-darkBorder w-full">
                  {NUMBER_OF_IDEAS_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => setNumberOfIdeas(n)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${numberOfIdeas === n
                        ? 'bg-primaryAccent/20 text-primaryAccent'
                        : 'text-textMuted hover:text-white'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generate Button Wrapper */}
        <motion.div variants={itemVariants} className="pt-4">
          <button
            onClick={() => generate()}
            disabled={loading}
            className="w-full relative overflow-hidden group py-4 rounded-xl bg-gradient-to-r from-primaryAccent via-secondaryAccent to-primaryAccent bg-[length:200%_auto] hover:bg-right text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-primaryAccent/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Processing with AI Models...</>
              ) : (
                <><Sparkles size={20} /> {numberOfIdeas > 1 ? `Generate ${numberOfIdeas} Variations` : "Generate Content"}</>
              )}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Outputs Section */}
      <AnimatePresence>
        {outputs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
            ref={outputRef}
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-display font-bold text-white flex-1">Generated Output</h2>
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <span className="px-2.5 py-1 rounded-md bg-darkSurface border border-darkBorder text-[10px] font-bold text-textMuted uppercase">{outputs[0].template}</span>
                <span className="px-2.5 py-1 rounded-md bg-darkSurface border border-darkBorder text-[10px] font-bold text-textMuted uppercase">{outputs[0].tone}</span>
              </div>
            </div>

            <div className="space-y-6">
              {outputs.map((output, idx) => (
                <div key={output.id} className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Output Header */}
                  <div className="bg-darkSurface/50 border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      {numberOfIdeas > 1 && (
                        <div className="text-[10px] font-bold text-primaryAccent tracking-widest uppercase mb-1">
                          Variation {idx + 1} of {outputs.length}
                        </div>
                      )}
                      <h3 className="text-xl font-display font-bold text-white leading-tight">
                        {output.title}
                      </h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => copyOutput(output)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/5">
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                  </div>

                  {/* Output Body */}
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Introduction</div>
                      <p className="text-textMain leading-relaxed">{output.introduction}</p>
                    </div>

                    <div className="w-full h-px bg-darkBorder/50" />

                    <div>
                      <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Key Points</div>
                      <ul className="space-y-2">
                        {output.keyPoints.map((pt, i) => (
                          <li key={i} className="flex gap-3 text-textMain leading-relaxed">
                            <CheckCircle2 size={16} className="text-tertiaryAccent shrink-0 mt-1" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="w-full h-px bg-darkBorder/50" />

                    <div>
                      <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Conclusion</div>
                      <p className="text-textMain leading-relaxed">{output.conclusion}</p>
                    </div>

                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="font-bold text-textMuted mr-2 self-center uppercase tracking-wider">SEO Tags:</span>
                        {output.keywords.map((k, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-darkBg border border-darkBorder text-textMuted font-medium">#{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
