import { useState, useRef } from 'react';
import { C, TEMPLATES, TONES, TONE_HINTS, PLATFORMS, AUDIENCES, NUMBER_OF_IDEAS_OPTIONS } from '../constants/theme';
import { Badge, Tag, Spinner } from '../components/Primitives';
import { BtnPrimary, BtnGhost } from '../components/Buttons';
import { TemplateBtn } from '../components/TemplateBtn';
import SectionBlock from '../components/SectionBlock';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

// ── Shared select style ────────────────────────────────────────────────────
function makeSelect(base) {
  return {
    ...base,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  };
}

// ── Field label ───────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: C.gray600,
      marginBottom: 8, display: "block",
    }}>
      {children}
    </span>
  );
}

// ── Platform chip ─────────────────────────────────────────────────────────
function PlatformChip({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 12, padding: "5px 13px", borderRadius: 20, cursor: "pointer",
        border: active ? `1.5px solid ${C.green}` : `1px solid ${hov ? C.green + "66" : C.gray200}`,
        background: active ? C.greenLight : hov ? "#f5fbf8" : C.white,
        color: active ? C.greenDark : hov ? C.green : C.gray600,
        fontWeight: active ? 600 : 400,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.14s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: active ? `0 2px 8px ${C.green}22` : "none",
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function GeneratePage({
  history, setHistory, setTab, showToast,
  initialPrompt = "", initialTemplate = "Blog", initialTone = "Professional",
}) {
  // Fields
  const [topic, setTopic] = useState(initialPrompt);
  const [template, setTemplate] = useState(initialTemplate);
  const [tone, setTone] = useState(initialTone);
  const [platform, setPlatform] = useState("General");
  const [audience, setAudience] = useState("General Public");
  const [numberOfIdeas, setNumberOfIdeas] = useState(1);

  // UI state
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [validErr, setValidErr] = useState(false);
  const [scorePcts, setScorePcts] = useState({});
  const [modalItem, setModalItem] = useState(null);
  const outputRef = useRef(null);

  // ── Generate ─────────────────────────────────────────────────────────────
  async function generate(overrides = {}) {
    const p        = overrides.topic          ?? topic;
    const tmpl     = overrides.template       ?? template;
    const tn       = overrides.tone           ?? tone;
    const plt      = overrides.platform       ?? platform;
    const aud      = overrides.audience       ?? audience;
    const numIdeas = overrides.numberOfIdeas  ?? numberOfIdeas;

    if (!p.trim()) { setValidErr(true); return; }
    setValidErr(false); setLoading(true); setScorePcts({}); setOutputs([]);

    try {
      const res = await fetch("http://localhost:8083/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: p,
          template: tmpl,
          tone: tn,
          platform: plt,
          audience: aud,
          numberOfIdeas: numIdeas
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate content");
      }
      
      const parsed = await res.json();

      const entries = parsed.map((idea, idx) => ({
        ...idea,
        ts: idea.ts ? new Date(idea.ts) : new Date(),
        id: idea.id || Date.now() + idx,
      }));

      setOutputs(entries);
      setHistory(h => [...[...entries].reverse(), ...h]);

      entries.forEach((e, idx) => {
        setTimeout(() => setScorePcts(prev => ({ ...prev, [idx]: e.qualityScore })), 200 + idx * 120);
      });
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

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", fontSize: 14, color: C.black, background: C.gray50,
    border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "10px 14px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const card = {
    background: C.white, border: `1px solid ${C.gray100}`,
    borderRadius: 12, padding: "20px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <Modal item={modalItem} onClose={() => setModalItem(null)} />

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ height: 3, width: 32, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, borderRadius: 2, marginBottom: 14 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px", fontFamily: "'DM Serif Display', serif", color: C.black, marginBottom: 4 }}>
          AI Content Generator
        </h1>
        <p style={{ fontSize: 14, color: C.gray600 }}>
          Fill in your topic, platform, audience and tone — then let AI do the rest.
        </p>
      </div>

      {/* ── 1. Topic ── */}
      <div className="fade-up-1" style={{ ...card, marginBottom: 14 }}>
        <FieldLabel>Topic / Prompt</FieldLabel>
        <textarea
          value={topic}
          onChange={e => { setTopic(e.target.value); setValidErr(false); }}
          placeholder="e.g. 'Benefits of morning exercise for busy professionals'"
          style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.65, display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {validErr
            ? <span style={{ fontSize: 12, color: C.red }}>Please enter a topic before generating.</span>
            : <span />}
          <span style={{ fontSize: 12, color: C.gray400 }}>{topic.length} chars</span>
        </div>
      </div>

      {/* ── 2. Template ── */}
      <div className="fade-up-1" style={{ ...card, marginBottom: 14 }}>
        <FieldLabel>Template</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {TEMPLATES.map(t => (
            <TemplateBtn key={t.id} t={t} active={template === t.id} onClick={() => setTemplate(t.id)} />
          ))}
        </div>
      </div>

      {/* ── 3. Tone + Platform ── */}
      <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <FieldLabel>Tone of Voice</FieldLabel>
          <select value={tone} onChange={e => setTone(e.target.value)} style={makeSelect(inputStyle)}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={{ fontSize: 12, color: C.gray400, marginTop: 8 }}>{TONE_HINTS[tone]}</div>
        </div>

        <div style={card}>
          <FieldLabel>Platform</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {PLATFORMS.map(plt => (
              <PlatformChip
                key={plt.id}
                label={plt.label}
                active={platform === plt.id}
                onClick={() => setPlatform(plt.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Audience + Number of Ideas ── */}
      <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <FieldLabel>Target Audience</FieldLabel>
          <select value={audience} onChange={e => setAudience(e.target.value)} style={makeSelect(inputStyle)}>
            {AUDIENCES.map(a => <option key={a}>{a}</option>)}
          </select>
          <div style={{ fontSize: 12, color: C.gray400, marginTop: 8 }}>
            Content will be tailored specifically for this audience.
          </div>
        </div>

        <div style={card}>
          <FieldLabel>Number of Ideas</FieldLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {NUMBER_OF_IDEAS_OPTIONS.map(n => {
              const active = numberOfIdeas === n;
              return (
                <button
                  key={n}
                  onClick={() => setNumberOfIdeas(n)}
                  style={{
                    width: 44, height: 44, borderRadius: 10, cursor: "pointer",
                    border: active ? `2px solid ${C.green}` : `1px solid ${C.gray200}`,
                    background: active ? C.greenLight : C.white,
                    color: active ? C.greenDark : C.gray600,
                    fontWeight: active ? 700 : 500, fontSize: 15,
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: active ? `0 2px 8px ${C.green}22` : "none",
                    transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: C.gray400, marginTop: 10 }}>
            {numberOfIdeas === 1
              ? "Generate a single focused piece."
              : `Generate ${numberOfIdeas} distinct content ideas at once.`}
          </div>
        </div>
      </div>

      {/* ── Generate button ── */}
      <div className="fade-up-3" style={{ marginBottom: 28 }}>
        <BtnPrimary
          style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 10, opacity: loading ? 0.8 : 1 }}
          onClick={() => generate()}
          disabled={loading}
        >
          {loading ? <Spinner /> : <Icon name="sparkle" size={16} color="#fff" />}
          {loading
            ? "Generating your content…"
            : numberOfIdeas > 1
              ? `Generate ${numberOfIdeas} Ideas`
              : "Generate Content"}
        </BtnPrimary>
      </div>

      {/* ── Outputs ── */}
      {outputs.length > 0 && (
        <div ref={outputRef}>
          {/* Summary badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <Badge>{outputs[0].template}</Badge>
            <Badge color={C.gray600} bg={C.gray100}>{outputs[0].tone}</Badge>
            <Badge color="#0077b5" bg="#e8f4fd">{outputs[0].platform}</Badge>
            <Badge color="#7c3aed" bg="#ede9fe">{outputs[0].audience}</Badge>
            {numberOfIdeas > 1 && (
              <Badge color={C.amber} bg={C.amberLight}>{outputs.length} ideas</Badge>
            )}
          </div>

          {outputs.map((output, idx) => (
            <div
              key={output.id}
              className="scale-in"
              style={{
                background: C.white, border: `1px solid ${C.gray100}`,
                borderRadius: 14, overflow: "hidden",
                boxShadow: "0 8px 28px rgba(26,138,92,0.08)",
                marginBottom: idx < outputs.length - 1 ? 18 : 0,
              }}
            >
              {/* Card header */}
              <div style={{ borderBottom: `1px solid ${C.gray100}`, padding: "16px 22px", background: `linear-gradient(135deg, ${C.greenLight} 0%, #fff 100%)` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    {numberOfIdeas > 1 && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
                        Idea {idx + 1} of {outputs.length}
                      </div>
                    )}
                    <div style={{ fontSize: 19, fontWeight: 700, color: C.black, fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.3px" }}>
                      {output.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <BtnGhost onClick={() => generate()} small>
                      <Icon name="reload" size={13} color={C.gray600} /> Regenerate
                    </BtnGhost>
                    <BtnGhost onClick={() => copyOutput(output)}>
                      <Icon name="copy" size={13} color={C.gray600} /> Copy
                    </BtnGhost>
                  </div>
                </div>
              </div>

              <SectionBlock label="Introduction" badge="Intro">
                <p>{output.introduction}</p>
              </SectionBlock>
              <SectionBlock label="Key Points" badge={`${output.keyPoints.length} points`}>
                <ul style={{ paddingLeft: 18 }}>
                  {output.keyPoints.map((pt, i) => <li key={i} style={{ marginBottom: 7 }}>{pt}</li>)}
                </ul>
              </SectionBlock>
              <SectionBlock label="Conclusion" badge="Wrap-up">
                <p>{output.conclusion}</p>
              </SectionBlock>
              <SectionBlock label="Keywords" badge="SEO">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {output.keywords.map((k, i) => <Tag key={i}>{k}</Tag>)}
                </div>
              </SectionBlock>

              {/* Quality score */}
              <div style={{ padding: "14px 22px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 12, color: C.gray600, minWidth: 100 }}>Quality Score</span>
                <div style={{ flex: 1, height: 7, background: C.gray100, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${scorePcts[idx] || 0}%`,
                    background: `linear-gradient(90deg, ${C.green}, ${C.teal})`,
                    borderRadius: 6,
                    transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green, minWidth: 50, textAlign: "right" }}>
                  {Math.round(output.qualityScore)}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
