import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function Modal({ item, onClose }) {
  if (!item) return null;

  function copyAll() {
    let txt = "";
    if (item.hook) txt += `Hook: ${item.hook}\n\n`;
    if (item.title) txt += `Title: ${item.title}\n\n`;
    if (item.introduction) txt += `${item.introduction}\n\n`;
    if (item.script) txt += `Script: ${item.script}\n\n`;
    if (item.visual) txt += `Visual: ${item.visual}\n\n`;
    if (item.audio) txt += `Audio: ${item.audio}\n\n`;
    if (item.story) txt += `Story: ${item.story}\n\n`;
    
    if (Array.isArray(item.headings)) {
      item.headings.forEach(h => {
        txt += `## ${h.h2 || h.heading}\n${h.content}\n\n`;
      });
    }

    if (Array.isArray(item.steps)) {
      txt += "Steps:\n";
      item.steps.forEach((s, idx) => { txt += `${idx + 1}. ${s}\n`; });
      txt += "\n";
    }

    if (Array.isArray(item.keyPoints)) {
      txt += "Key Points:\n";
      item.keyPoints.forEach(p => { txt += `• ${p}\n`; });
      txt += "\n";
    }

    if (item.conclusion) txt += `Conclusion: ${item.conclusion}\n\n`;
    if (item.keywords?.length) txt += `Keywords: ${item.keywords.join(", ")}`;

    navigator.clipboard.writeText(txt);
  }

  const Section = ({ title, color, children }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${color}`} />
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-sm text-textMain leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );

  const Divider = () => <div className="w-full h-px bg-darkBorder/50 my-6" />;

  const isSocial = item.hook && item.script;
  const isBlog = item.headings && item.headings.length > 0;
  const isEdu = item.steps && item.steps.length > 0;
  const isMarketing = item.problem && item.solution;
  const isStory = item.story && item.ending;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-darkBg/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] bg-darkSurface border border-darkBorder rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between bg-darkBg/50">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 rounded bg-primaryAccent/20 text-primaryAccent border border-primaryAccent/30 text-[10px] font-bold uppercase tracking-wider">{item.template}</span>
                <span className="px-2.5 py-1 rounded bg-darkBg border border-darkBorder text-textMuted text-[10px] font-bold uppercase tracking-wider">{item.tone}</span>
                {item.platform && item.platform !== "General" && (
                  <span className="px-2.5 py-1 rounded bg-secondaryAccent/20 text-secondaryAccent border border-secondaryAccent/30 text-[10px] font-bold uppercase tracking-wider">{item.platform}</span>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-white pr-8">{item.title || item.hook || "Generated Content"}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-darkBg border border-darkBorder text-textMuted hover:text-white hover:border-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* SOCIAL MODE */}
            {isSocial && (
              <div className="space-y-6">
                <Section title="Viral Hook" color="bg-primaryAccent">{item.hook}</Section>
                <Divider />
                <Section title="Video Script" color="bg-secondaryAccent">{item.script}</Section>
                <Section title="Visual Specs" color="bg-tertiaryAccent">{item.visual}</Section>
                {item.audio && <Section title="Trending Audio" color="bg-rose-500">{item.audio}</Section>}
                {item.viralReason && (
                   <div className="mt-4 p-3 rounded-xl bg-primaryAccent/5 border border-primaryAccent/10 text-[11px] text-primaryAccent/80 italic">
                     ✨ {item.viralReason}
                   </div>
                )}
              </div>
            )}

            {/* BLOG MODE */}
            {isBlog && (
              <div className="space-y-6">
                {item.seoIntro && <Section title="SEO Intro" color="bg-emerald-500">{item.seoIntro}</Section>}
                <Divider />
                {item.headings.map((h, i) => (
                  <div key={i} className="mb-6 last:mb-0">
                    <h4 className="text-white font-bold text-base mb-2"># {h.h2 || h.heading}</h4>
                    <p className="text-textMain text-sm leading-relaxed">{h.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION MODE */}
            {isEdu && (
              <div className="space-y-6">
                <Section title="Methodology Steps" color="bg-sky-500">
                  <ul className="space-y-3">
                    {item.steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            )}

            {/* MARKETING MODE */}
            {isMarketing && (
              <div className="space-y-6">
                <Section title="The Problem" color="bg-orange-500">{item.problem}</Section>
                <Section title="The Solution" color="bg-emerald-500">{item.solution}</Section>
                {item.benefits && (
                  <Section title="Key Benefits" color="bg-primaryAccent">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {b}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
                {item.cta && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center font-bold text-emerald-400 text-sm">
                    CTA: {item.cta}
                  </div>
                )}
              </div>
            )}

            {/* STORY MODE */}
            {isStory && (
              <div className="space-y-6">
                <Section title="The Hook" color="bg-rose-500">{item.hook}</Section>
                <Divider />
                <Section title="Narrative" color="bg-primaryAccent">{item.story}</Section>
                <Section title="The Ending" color="bg-secondaryAccent">{item.ending}</Section>
              </div>
            )}

            {/* FALLBACK / STANDARD MODE */}
            {!isSocial && !isBlog && !isEdu && !isMarketing && !isStory && (
              <div className="space-y-6">
                {item.introduction && (
                  <Section title="Introduction" color="bg-primaryAccent">{item.introduction}</Section>
                )}
                
                {item.keyPoints?.length > 0 && (
                  <>
                    <Divider />
                    <Section title="Key Points" color="bg-tertiaryAccent">
                      <ul className="space-y-3">
                        {item.keyPoints.map((pt, i) => (
                          <li key={i} className="flex gap-3 text-textMain leading-relaxed">
                            <CheckCircle2 size={18} className="text-tertiaryAccent shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  </>
                )}

                {item.conclusion && (
                  <>
                    <Divider />
                    <Section title="Conclusion" color="bg-secondaryAccent">{item.conclusion}</Section>
                  </>
                )}
              </div>
            )}

            {/* Keywords in footer of body */}
            {item.keywords?.length > 0 && (
              <div className="pt-8">
                <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-2">SEO Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((k, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-darkBg border border-darkBorder text-textMuted text-xs font-medium">#{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-white/5 bg-darkBg/50 flex items-center justify-between">
            <button 
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-textMuted hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Copy size={16} /> Copy All
            </button>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primaryAccent hover:bg-primaryAccent/90 text-white font-semibold transition-colors shadow-lg shadow-primaryAccent/20 text-sm"
            >
              <Check size={16} /> Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
