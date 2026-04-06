import { C } from '../constants/theme';

export function Badge({ children, color = C.green, bg = C.greenLight }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 9px",
      borderRadius: 20, background: bg, color, letterSpacing: "0.03em",
    }}>
      {children}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span style={{
      fontSize: 12, padding: "4px 12px", borderRadius: 20,
      background: C.greenLight, color: C.greenDark, fontWeight: 500,
      border: `1px solid ${C.green}22`,
    }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 15, color = "#fff" }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}44`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}
