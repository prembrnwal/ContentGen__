import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, RefreshCw, ChevronDown, CheckCircle2, Wand2, FileText, Mail, Megaphone, Share2, Box, Network, Check } from 'lucide-react';
import { TEMPLATES, TONES, TONE_HINTS, PLATFORMS, AUDIENCES, NUMBER_OF_IDEAS_OPTIONS } from '../constants/theme';
import { copyToClipboard, buildContentText } from '../utils/copyToClipboard';

// ─── Icon map per template ─────────────────────────────────────────────────
const TEMPLATE_ICONS = {
  Blog: FileText, Email: Mail, LinkedIn: Network,
  Ad: Megaphone, Social: Share2, Product: Box,
};
const TEMPLATE_COLORS = {
  Blog: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
  Email: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
  LinkedIn: 'from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400',
  Ad: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
  Social: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  Product: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400',
};

function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold tracking-widest uppercase text-textMuted/80">{children}</span>
      {hint && <span className="text-[10px] text-textMuted/50 italic">{hint}</span>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel rounded-2xl border border-white/5 p-6 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="h-5 w-1/3 rounded-lg bg-white/5 mb-4" />
          <div className="h-3 w-full rounded bg-white/5 mb-2" />
          <div className="h-3 w-5/6 rounded bg-white/5 mb-2" />
          <div className="h-3 w-4/6 rounded bg-white/5" />
        </div>
      ))}
    </motion.div>
  );
}

// ─── Custom Animated Select Dropdown ───────────────────────────────────────
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-20" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-darkBg border rounded-xl p-3.5 text-white focus:outline-none transition-all text-sm ${
          open ? 'border-primaryAccent ring-1 ring-primaryAccent/20' : 'border-darkBorder hover:border-white/20'
        }`}
      >
        <span>{value}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={15} className="text-textMuted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 w-full mt-2 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  value === opt 
                    ? 'bg-primaryAccent/15 text-primaryAccent font-bold' 
                    : 'text-textMain hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Check size={14} className="text-primaryAccent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GeneratePage({
  history, setHistory, setTab, showToast,
  initialPrompt = "", initialTemplate = "Blog", initialTone = "Professional",
  // Lifted generation state & handlers from AppPage
  loading = false,
  outputs = [],
  validErr = false,
  setValidErr = () => {},
  regeneratingId = null,
  onGenerate,
  onRegenerate,
}) {
  const [topic, setTopic] = useState(initialPrompt);
  const [template, setTemplate] = useState(initialTemplate);
  const [tone, setTone] = useState(initialTone);
  const [platform, setPlatform] = useState("General");
  const [audience, setAudience] = useState("General Public");
  const [numberOfIdeas, setNumberOfIdeas] = useState(1);
  const outputRef = useRef(null);

  function generate(overrides = {}) {
    const p = overrides.topic ?? topic;
    const tmpl = overrides.template ?? template;
    const tn = overrides.tone ?? tone;
    const plt = overrides.platform ?? platform;
    const aud = overrides.audience ?? audience;
    const numIdeas = overrides.numberOfIdeas ?? numberOfIdeas;
    onGenerate({ topic: p, template: tmpl, tone: tn, platform: plt, audience: aud, numberOfIdeas: numIdeas });
  }

  async function copyOutput(item) {
    const txt = buildContentText(item);
    const success = await copyToClipboard(txt);
    showToast(success ? "Copied to clipboard" : "Copy failed");
  }

  // Scroll to outputs when they arrive
  useEffect(() => {
    if (outputs.length > 0) {
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [outputs]);

  // Helper to render specialized sections
  const Section = ({ title, icon: Icon, color, children }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${color}`} />
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-1.5">
          {Icon && <Icon size={10} />} {title}
        </span>
      </div>
      <div className="text-textMain leading-relaxed text-sm whitespace-pre-wrap">{children}</div>
    </div>
  );

  const Divider = () => <div className="w-full h-px bg-gradient-to-r from-transparent via-darkBorder to-transparent my-6" />;

  function RenderBody({ output }) {
    const isSocial = output.hook && output.script;
    const isBlog = output.headings && output.headings.length > 0;
    const isEdu = output.steps && output.steps.length > 0;
    const isMarketing = output.problem && output.solution;
    const isStory = output.story && output.ending;

    return (
      <div className="p-6 space-y-6">
        {/* SOCIAL MODE */}
        {isSocial && (
          <>
            <Section title="Viral Hook" color="bg-primaryAccent">{output.hook}</Section>
            <Divider />
            <Section title="Video Script" color="bg-secondaryAccent">{output.script}</Section>
            <Section title="Visual Specs" color="bg-tertiaryAccent">{output.visual}</Section>
            {output.audio && <Section title="Trending Audio" color="bg-rose-500">{output.audio}</Section>}
            {output.viralReason && (
              <div className="mt-4 p-3 rounded-xl bg-primaryAccent/5 border border-primaryAccent/10 text-[11px] text-primaryAccent/80 italic">
                ✨ {output.viralReason}
              </div>
            )}
          </>
        )}

        {/* BLOG MODE */}
        {isBlog && (
          <>
            {output.seoIntro && <Section title="SEO Intro" color="bg-emerald-500">{output.seoIntro}</Section>}
            <Divider />
            {output.headings.map((h, i) => (
              <div key={i} className="mb-6 last:mb-0">
                <h4 className="text-white font-bold text-base mb-2"># {h.h2 || h.heading}</h4>
                <p className="text-textMain text-sm leading-relaxed">{h.content}</p>
              </div>
            ))}
          </>
        )}

        {/* EDUCATION MODE */}
        {isEdu && (
          <>
            <Section title="Methodology Steps" color="bg-sky-500">
              <ul className="space-y-3">
                {output.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}

        {/* MARKETING MODE */}
        {isMarketing && (
          <>
            <Section title="The Problem" color="bg-orange-500">{output.problem}</Section>
            <Section title="The Solution" color="bg-emerald-500">{output.solution}</Section>
            {output.benefits && (
              <Section title="Key Benefits" color="bg-primaryAccent">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {output.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {output.cta && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center font-bold text-emerald-400 text-sm">
                CTA: {output.cta}
              </div>
            )}
          </>
        )}

        {/* STORY MODE */}
        {isStory && (
          <>
            <Section title="The Hook" color="bg-rose-500">{output.hook}</Section>
            <Divider />
            <Section title="Narrative" color="bg-primaryAccent">{output.story}</Section>
            <Section title="The Ending" color="bg-secondaryAccent">{output.ending}</Section>
          </>
        )}

        {/* FALLBACK / STANDARD MODE */}
        {!isSocial && !isBlog && !isEdu && !isMarketing && !isStory && (
          <>
            {output.introduction && (
              <Section title="Introduction" color="bg-primaryAccent">{output.introduction}</Section>
            )}
            
            {output.keyPoints?.length > 0 && (
              <>
                <Divider />
                <Section title="Key Points" color="bg-tertiaryAccent">
                  <ul className="space-y-2.5">
                    {output.keyPoints.map((pt, i) => (
                      <li key={i} className="flex gap-3 text-textMain leading-relaxed text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-tertiaryAccent shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {output.conclusion && (
              <>
                <Divider />
                <Section title="Conclusion" color="bg-secondaryAccent">{output.conclusion}</Section>
              </>
            )}
          </>
        )}

        {/* FOOTER TAGS (COMMON) */}
        {output.keywords?.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest mr-1 opacity-50">SEO Tags:</span>
            {output.keywords.map((k, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-darkBg border border-darkBorder text-textMuted text-[10px] font-medium hover:border-primaryAccent/40 hover:text-primaryAccent transition-colors">
                #{k}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }


  async function regenerateOutput(output) {
    onRegenerate(output);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-4xl mx-auto pb-20">

      {/* ── Page Header ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-10 relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryAccent to-secondaryAccent flex items-center justify-center shadow-lg shadow-primaryAccent/20">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white leading-none">AI Generator</h1>
            <p className="text-textMuted text-sm mt-0.5">Configure parameters and let the AI do the heavy lifting.</p>
          </div>
        </div>
        {/* Subtle glow under header */}
        <div className="absolute -top-4 -left-4 w-48 h-24 bg-primaryAccent/5 blur-2xl rounded-full pointer-events-none" />
      </motion.div>

      <div className="space-y-5">

        {/* ── Topic Prompt ─────────────────────────────────── */}
        <motion.div variants={itemVariants}
          className="glass-panel p-6 rounded-2xl border border-white/5 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primaryAccent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primaryAccent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <FieldLabel hint={`${topic.length} chars`}>Topic / Prompt</FieldLabel>
          <textarea
            value={topic}
            onChange={e => { setTopic(e.target.value); setValidErr(false); }}
            placeholder="e.g. 'The future of artificial intelligence in software development...'"
            className={`w-full bg-darkBg border rounded-xl p-4 text-white placeholder:text-textMuted/30 focus:outline-none focus:ring-1 transition-all min-h-[130px] resize-y text-sm leading-relaxed ${
              validErr ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/20' : 'border-darkBorder focus:border-primaryAccent focus:ring-primaryAccent/20'
            }`}
          />
          <AnimatePresence>
            {validErr && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-400 text-xs font-semibold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Please enter a topic to generate content.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Template Picker ───────────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5">
          <FieldLabel>Template</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => {
              const Icon = TEMPLATE_ICONS[t.id] || FileText;
              const colors = TEMPLATE_COLORS[t.id] || TEMPLATE_COLORS.Blog;
              const active = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left overflow-hidden group/card ${
                    active
                      ? `bg-gradient-to-br ${colors} shadow-lg`
                      : 'bg-darkBg border-darkBorder hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  {active && <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-bl-full" />}
                  <Icon size={18} className={`mb-2 ${active ? colors.split(' ').find(c => c.startsWith('text-')) : 'text-textMuted group-hover/card:text-white'} transition-colors`} />
                  <div className={`text-sm font-bold mb-0.5 ${active ? 'text-white' : 'text-white/80'}`}>{t.label}</div>
                  <div className="text-[10px] text-textMuted leading-snug">{t.hint}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Tone + Audience ───────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10 relative">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <FieldLabel>Tone of Voice</FieldLabel>
            <CustomSelect options={TONES} value={tone} onChange={setTone} />
            <div className="text-xs text-textMuted/70 mt-3 pl-3 border-l-2 border-primaryAccent/40 italic leading-relaxed">
              {TONE_HINTS[tone]}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <FieldLabel>Target Audience</FieldLabel>
            <CustomSelect options={AUDIENCES} value={audience} onChange={setAudience} />
            <p className="text-xs text-textMuted/50 mt-3 leading-relaxed">
              Tailors vocabulary, complexity, and framing to your readers.
            </p>
          </div>
        </motion.div>

        {/* ── Platform + Variations ─────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <FieldLabel>Platform</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(plt => (
                  <button
                    key={plt.id}
                    onClick={() => setPlatform(plt.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm transition-all duration-200 border font-medium ${
                      platform === plt.id
                        ? 'bg-secondaryAccent/15 border-secondaryAccent/40 text-secondaryAccent shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                        : 'bg-darkBg border-darkBorder text-textMuted hover:text-white hover:border-white/20'
                    }`}
                  >
                    {plt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:w-44 shrink-0">
              <FieldLabel>Output Variations</FieldLabel>
              <div className="flex bg-darkBg p-1 rounded-xl border border-darkBorder">
                {NUMBER_OF_IDEAS_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setNumberOfIdeas(n)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      numberOfIdeas === n
                        ? 'bg-primaryAccent/20 text-primaryAccent shadow-inner'
                        : 'text-textMuted hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Generate Button ───────────────────────────────── */}
        <motion.div variants={itemVariants} className="pt-2">
          <button
            onClick={() => generate()}
            disabled={loading}
            className="w-full relative overflow-hidden group py-4 rounded-xl bg-gradient-to-r from-primaryAccent via-secondaryAccent to-tertiaryAccent text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-primaryAccent/25 transition-all hover:shadow-primaryAccent/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {/* Shimmer sweep */}
            {!loading && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            )}
            {/* Pulsing ring when idle */}
            {!loading && (
              <motion.span
                className="absolute inset-0 rounded-xl border-2 border-white/20"
                animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}
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

      {/* ── Loading Skeleton ───────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Outputs ───────────────────────────────────── */}
      <AnimatePresence>
        {outputs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-14"
            ref={outputRef}
          >
            {/* Output header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Generated Output</h2>
                <p className="text-textMuted text-xs mt-0.5">{outputs.length} result{outputs.length > 1 ? 's' : ''} ready</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-darkSurface border border-darkBorder text-[10px] font-bold text-textMuted uppercase tracking-wider">{outputs[0].template}</span>
                <span className="px-2.5 py-1 rounded-md bg-darkSurface border border-darkBorder text-[10px] font-bold text-textMuted uppercase tracking-wider">{outputs[0].tone}</span>
              </div>
            </div>

            <div className="space-y-6">
              {outputs.map((output, idx) => (
                <motion.div
                  key={output.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group/card"
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primaryAccent via-secondaryAccent to-tertiaryAccent" />

                  {/* Header */}
                  <div className="bg-darkSurface/60 border-b border-white/5 p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {outputs.length > 1 && (
                        <span className="inline-block text-[10px] font-bold text-primaryAccent tracking-widest uppercase mb-2 px-2 py-0.5 rounded bg-primaryAccent/10 border border-primaryAccent/20">
                          Variation {idx + 1} of {outputs.length}
                        </span>
                      )}
                      <h3 className="text-xl font-display font-bold text-white leading-tight">{output.title || output.hook || "Generated Content"}</h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => regenerateOutput(output)}
                        disabled={regeneratingId === output.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondaryAccent/10 hover:bg-secondaryAccent/20 text-secondaryAccent text-sm font-medium transition-colors border border-secondaryAccent/20 disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={regeneratingId === output.id ? 'animate-spin' : ''} />
                        {regeneratingId === output.id ? 'Regenerating...' : 'Regenerate'}
                      </button>
                      <button
                        onClick={() => copyOutput(output)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/5"
                      >
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                  </div>

                  {/* Body - DYNAMIC RENDERER */}
                  <RenderBody output={output} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
