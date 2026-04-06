import { C, TYPE_COLOR, TEMPLATE_ICONS } from '../constants/theme';
import { Badge, Tag } from './Primitives';
import { BtnGhost, BtnPrimary } from './Buttons';
import SectionBlock from './SectionBlock';
import Icon from './Icon';

export default function Modal({ item, onClose }) {
  if (!item) return null;
  const color = TYPE_COLOR[item.template] || C.green;

  function copyAll() {
    const txt = `${item.title}\n\n${item.introduction}\n\nKey Points:\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n${item.conclusion}\n\nKeywords: ${item.keywords.join(", ")}`;
    navigator.clipboard.writeText(txt);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(17,25,35,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        className="scale-in"
        style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.gray100}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <Badge color={color} bg={color + "18"}>{item.template}</Badge>
              <Badge color={C.gray600} bg={C.gray100}>{item.tone}</Badge>
              {item.platform && item.platform !== "General" && (
                <Badge color="#0077b5" bg="#e8f4fd">{item.platform}</Badge>
              )}
              {item.audience && item.audience !== "General Public" && (
                <Badge color="#7c3aed" bg="#ede9fe">{item.audience}</Badge>
              )}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.black, fontFamily: "'DM Serif Display', serif" }}>{item.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: C.gray100, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: C.gray600, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ overflow: "auto", flex: 1 }}>
          <SectionBlock label="Introduction" badge="Intro">
            <p>{item.introduction}</p>
          </SectionBlock>
          <SectionBlock label="Key Points" badge={`${item.keyPoints?.length} points`}>
            <ul style={{ paddingLeft: 18 }}>
              {item.keyPoints?.map((pt, i) => <li key={i} style={{ marginBottom: 7 }}>{pt}</li>)}
            </ul>
          </SectionBlock>
          <SectionBlock label="Conclusion" badge="Wrap-up">
            <p>{item.conclusion}</p>
          </SectionBlock>
          <SectionBlock label="Keywords" badge="SEO">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.keywords?.map((k, i) => <Tag key={i}>{k}</Tag>)}
            </div>
          </SectionBlock>
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: C.gray600, minWidth: 90 }}>Quality score</span>
            <div style={{ flex: 1, height: 6, background: C.gray100, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${item.qualityScore}%`, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, borderRadius: 6, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{Math.round(item.qualityScore)}/100</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.gray100}`, display: "flex", gap: 10 }}>
          <BtnGhost onClick={copyAll}>
            <Icon name="copy" size={14} color={C.gray600} /> Copy all
          </BtnGhost>
          <div style={{ flex: 1 }} />
          <BtnPrimary onClick={onClose} small>
            <Icon name="check" size={14} color="#fff" /> Done
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}
