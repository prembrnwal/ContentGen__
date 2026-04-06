import { useState } from 'react';
import { C } from '../constants/theme';
import Icon from './Icon';

export default function StatCard({ icon, label, value, sub, color = C.green, bg = C.greenLight }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1px solid ${hov ? color + "44" : C.gray200}`,
        borderRadius: 12, padding: "18px 20px",
        boxShadow: hov ? `0 8px 24px ${color}22` : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        display: "flex", alignItems: "center", gap: 16,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.black, letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>{value}</div>
        <div style={{ fontSize: 13, color: C.gray600, marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
