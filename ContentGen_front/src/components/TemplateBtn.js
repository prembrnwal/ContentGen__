import { useState } from 'react';
import { C, TEMPLATE_ICONS } from '../constants/theme';
import Icon from './Icon';

export function TemplateBtn({ t, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={t.hint}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500,
        padding: "8px 14px", borderRadius: 8,
        border: active ? `1.5px solid ${C.green}` : `1px solid ${hov ? C.green + "66" : C.gray200}`,
        background: active ? C.greenLight : hov ? "#f5fbf8" : C.white,
        color: active ? C.greenDark : hov ? C.green : C.gray800,
        display: "inline-flex", alignItems: "center", gap: 7,
        transform: hov && !active ? "translateY(-1px)" : "none",
        boxShadow: active ? `0 2px 8px ${C.green}22` : hov ? `0 3px 10px rgba(26,138,92,0.1)` : "none",
        transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <Icon name={TEMPLATE_ICONS[t.id] || "blog"} size={14} color={active ? C.green : hov ? C.green : C.gray600} />
      {t.label}
    </button>
  );
}

export function FilterChip({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 12, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
        border: active ? `1.5px solid ${C.green}` : `1px solid ${hov ? C.green + "66" : C.gray200}`,
        background: active ? C.greenLight : hov ? "#f5fbf8" : C.white,
        color: active ? C.greenDark : hov ? C.green : C.gray600,
        fontWeight: active ? 600 : 400,
        transition: "all 0.14s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {label}
    </button>
  );
}
