import { useState } from 'react';
import { C } from '../constants/theme';

export function BtnPrimary({ children, onClick, disabled, style, small }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled
          ? C.gray200
          : `linear-gradient(135deg, ${C.greenMid} 0%, ${C.green} 60%, ${C.greenDark} 100%)`,
        color: disabled ? C.gray400 : "#fff",
        border: "none",
        borderRadius: 8,
        padding: small ? "8px 16px" : "12px 22px",
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: disabled
          ? "none"
          : pressed
            ? "0 1px 4px rgba(26,138,92,0.3)"
            : hov
              ? "0 8px 24px rgba(26,138,92,0.45)"
              : "0 3px 12px rgba(26,138,92,0.35)",
        transform: pressed ? "translateY(1px) scale(0.98)" : hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        animation: !disabled && !hov && !pressed ? "pulse 3s ease-in-out infinite" : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick, style, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer",
        background: hov ? (danger ? C.redLight : C.greenLight) : "transparent",
        color: danger ? (hov ? C.red : C.gray600) : (hov ? C.green : C.gray600),
        border: `1px solid ${hov ? (danger ? C.red : C.green) : C.gray200}`,
        borderRadius: 7,
        padding: "7px 14px",
        fontSize: 13, fontWeight: 500,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.16s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: hov ? `0 4px 12px ${danger ? "rgba(192,57,43,0.15)" : "rgba(26,138,92,0.15)"}` : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function IconBtn({ icon, onClick, title, danger, color: colorProp }) {
  const [hov, setHov] = useState(false);
  // Import Icon lazily to avoid circular issues — consumer passes rendered icon
  const accentColor = danger ? C.red : colorProp || C.gray600;
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 7,
        border: `1px solid ${hov ? accentColor : C.gray200}`,
        background: hov ? (danger ? C.redLight : C.greenLight) : C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: hov ? accentColor : C.gray400,
        transform: hov ? "scale(1.1)" : "scale(1)",
        transition: "all 0.14s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: hov ? `0 2px 8px ${accentColor}33` : "none",
      }}
    >
      {icon}
    </button>
  );
}
