import { useState } from 'react';
import { C } from '../constants/theme';
import { Badge } from './Primitives';
import Icon from './Icon';

export default function SectionBlock({ label, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${C.gray100}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 20px", background: open ? C.gray50 : C.white,
          border: "none", fontSize: 13, fontWeight: 600, color: C.gray800,
          textAlign: "left", cursor: "pointer", transition: "background 0.15s",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
        {label}
        {badge && <Badge>{badge}</Badge>}
        <span style={{ marginLeft: "auto", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: C.gray400 }}>
          <Icon name="chevron" size={14} color={C.gray400} />
        </span>
      </button>
      {open && (
        <div style={{ padding: "14px 20px 18px", fontSize: 14, lineHeight: 1.78, color: C.gray800, background: C.white }}>
          {children}
        </div>
      )}
    </div>
  );
}
