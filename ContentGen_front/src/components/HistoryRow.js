import { useState } from 'react';
import { C, TEMPLATE_ICONS, TYPE_COLOR, TYPE_BG } from '../constants/theme';
import { Badge } from './Primitives';
import { IconBtn } from './Buttons';
import Icon from './Icon';

export default function HistoryRow({ item, onCopy, onReuse, onDelete, onView }) {
  const [hov, setHov] = useState(false);
  const color = TYPE_COLOR[item.template] || C.green;
  const bg = TYPE_BG[item.template] || C.greenLight;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 16px", borderRadius: 10, marginBottom: 8,
        background: hov ? "#f8fdfb" : C.white,
        border: `1px solid ${hov ? C.green + "44" : C.gray100}`,
        boxShadow: hov ? "0 4px 16px rgba(26,138,92,0.08)" : "none",
        transform: hov ? "translateX(3px)" : "translateX(0)",
        transition: "all 0.18s ease", cursor: "pointer",
      }}
      onClick={() => onView(item)}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={TEMPLATE_ICONS[item.template] || "blog"} size={16} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.black, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title || item.prompt}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
          <Badge color={color} bg={bg}>{item.template}</Badge>
          <Badge color={C.gray600} bg={C.gray100}>{item.tone}</Badge>
          {item.platform && item.platform !== "General" && (
            <Badge color="#0077b5" bg="#e8f4fd">{item.platform}</Badge>
          )}
          {item.audience && item.audience !== "General Public" && (
            <Badge color="#7c3aed" bg="#ede9fe">{item.audience}</Badge>
          )}
          <span style={{ fontSize: 11, color: C.gray400 }}>
            {new Date(item.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
            {" · "}
            {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 6, opacity: hov ? 1 : 0, transition: "opacity 0.15s" }}
        onClick={e => e.stopPropagation()}
      >
        <IconBtn
          icon={<Icon name="copy" size={13} color={hov ? C.green : C.gray400} />}
          onClick={() => onCopy(item)}
          title="Copy"
        />
        <IconBtn
          icon={<Icon name="reload" size={13} color={C.green} />}
          onClick={() => onReuse(item)}
          title="Reuse prompt"
          color={C.green}
        />
        <IconBtn
          icon={<Icon name="delete" size={13} color={hov ? C.red : C.gray400} />}
          onClick={() => onDelete(item.id)}
          title="Delete"
          danger
        />
      </div>
    </div>
  );
}
