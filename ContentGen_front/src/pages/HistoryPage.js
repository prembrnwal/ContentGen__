import { useState } from 'react';
import { C, TEMPLATES, TONES } from '../constants/theme';
import { BtnGhost, BtnPrimary } from '../components/Buttons';
import { FilterChip } from '../components/TemplateBtn';
import HistoryRow from '../components/HistoryRow';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

export default function HistoryPage({ history, setHistory, setPrompt, setTemplate, setTone, setTab, showToast }) {
  const [filter, setFilter] = useState("All");
  const [toneFilter, setToneFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState(null);

  const templates = ["All", ...TEMPLATES.map(t => t.id)];
  const tones = ["All", ...TONES];

  const filtered = history.filter(h => {
    const matchTmpl = filter === "All" || h.template === filter;
    const matchTone = toneFilter === "All" || h.tone === toneFilter;
    const matchSearch = !search || h.title?.toLowerCase().includes(search.toLowerCase()) || h.prompt?.toLowerCase().includes(search.toLowerCase());
    return matchTmpl && matchTone && matchSearch;
  });

  function copyItem(item) {
    const txt = `${item.title}\n\n${item.introduction}\n\nKey Points:\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n${item.conclusion}\n\nKeywords: ${item.keywords.join(", ")}`;
    navigator.clipboard.writeText(txt).then(() => showToast("Copied to clipboard"));
  }

  function reuseItem(item) {
    setPrompt(item.prompt);
    setTemplate(item.template);
    setTone(item.tone);
    setTab("generate");
    showToast("Prompt loaded — ready to generate");
  }

  async function deleteItem(id) {
    try {
      await fetch(`http://localhost:8083/api/content/${id}`, { method: 'DELETE' });
      setHistory(h => h.filter(x => x.id !== id));
      showToast("Deleted from history");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete content");
    }
  }

  async function clearAll() {
    if (window.confirm("Clear all history? This cannot be undone.")) {
      try {
        for (const item of history) {
          await fetch(`http://localhost:8083/api/content/${item.id}`, { method: 'DELETE' });
        }
        setHistory([]);
        showToast("History cleared");
      } catch (err) {
        console.error(err);
        showToast("Failed to clear history");
      }
    }
  }

  const card = { background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" };
  const inputStyle = { fontSize: 13, color: C.black, background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "8px 14px", transition: "border-color 0.15s", outline: "none" };

  return (
    <div>
      <Modal item={modalItem} onClose={() => setModalItem(null)} />

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ height: 3, width: 32, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, borderRadius: 2, marginBottom: 14 }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px", fontFamily: "'DM Serif Display', serif", color: C.black, marginBottom: 4 }}>Content History</h1>
            <p style={{ fontSize: 14, color: C.gray600 }}>{history.length} piece{history.length !== 1 ? "s" : ""} generated · View, reuse, or copy past content</p>
          </div>
          {history.length > 0 && (
            <BtnGhost onClick={clearAll} danger>
              <Icon name="delete" size={13} color={C.gray400} /> Clear All
            </BtnGhost>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="fade-up-1" style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="filter" size={14} color={C.gray400} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.gray600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Filter</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {templates.map(f => (
              <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: C.gray200, flexShrink: 0 }} />
          <select
            value={toneFilter}
            onChange={e => setToneFilter(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {tones.map(t => <option key={t}>{t}</option>)}
          </select>
          <input
            placeholder="Search content…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, minWidth: 160 }}
          />
        </div>
      </div>

      {/* History list */}
      <div className="fade-up-2" style={card}>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.gray400 }}>
            <Icon name="history" size={40} color={C.gray200} />
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 500, color: C.gray600 }}>No content generated yet</div>
            <div style={{ fontSize: 13, color: C.gray400, marginTop: 4 }}>Go to the Generator to create your first piece</div>
            <BtnPrimary small style={{ marginTop: 18 }} onClick={() => setTab("generate")}>
              <Icon name="sparkle" size={14} color="#fff" /> Start Generating
            </BtnPrimary>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: C.gray400, fontSize: 13 }}>
            No results match your filters.
          </div>
        ) : (
          filtered.map(item => (
            <HistoryRow
              key={item.id}
              item={item}
              onCopy={copyItem}
              onReuse={reuseItem}
              onDelete={deleteItem}
              onView={setModalItem}
            />
          ))
        )}
      </div>
    </div>
  );
}
