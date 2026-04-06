import { C } from '../constants/theme';
import Icon from './Icon';

export default function Toast({ msg, show }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: C.gray800, color: "#fff", fontSize: 13, fontWeight: 500,
      padding: "10px 18px", borderRadius: 10,
      boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: 8,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0) scale(1)" : "translateY(10px) scale(0.96)",
      transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none",
    }}>
      <Icon name="check" size={14} color={C.green} />
      {msg}
    </div>
  );
}
