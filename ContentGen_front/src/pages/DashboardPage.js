import { C, TEMPLATE_ICONS, TYPE_COLOR } from '../constants/theme';
import { Badge } from '../components/Primitives';
import { BtnPrimary } from '../components/Buttons';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

export default function DashboardPage({ history, setTab }) {
  const templates = ["Blog", "Email", "LinkedIn", "Ad", "Social", "Product"];
  const countsByTemplate = {};
  templates.forEach(t => { countsByTemplate[t] = history.filter(h => h.template === t).length; });
  const recent = history.slice(0, 5);

  return (
    <div>
      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ height: 3, width: 32, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, borderRadius: 2, marginBottom: 14 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px", fontFamily: "'DM Serif Display', serif", color: C.black, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: C.gray600 }}>Welcome back. Here's a snapshot of your content activity.</p>
      </div>

      {/* Stat cards */}
      <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="generate" label="Total Generated" value={history.length} sub="All time" />
        <StatCard
          icon="history"
          label="This Session"
          value={history.length}
          sub="Since you opened the app"
          color="#7c3aed"
          bg="#ede9fe"
        />
        <StatCard
          icon="sparkle"
          label="Avg. Quality"
          value={history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.qualityScore || 80), 0) / history.length) + "%" : "—"}
          sub="AI quality score"
          color={C.teal}
          bg="#e6f9f5"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Template breakdown */}
        <div className="fade-up-2" style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 16 }}>Content by Template</div>
          {templates.map(t => {
            const count = countsByTemplate[t];
            const pct = history.length > 0 ? (count / history.length) * 100 : 0;
            const color = TYPE_COLOR[t] || C.green;
            return (
              <div key={t} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: C.gray800, fontWeight: 500 }}>{t}</span>
                  <span style={{ color: C.gray400, fontSize: 12 }}>{count}</span>
                </div>
                <div style={{ height: 5, background: C.gray100, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent activity */}
        <div className="fade-up-3" style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.black }}>Recent Content</div>
            {history.length > 5 && (
              <span onClick={() => setTab("history")} style={{ fontSize: 12, color: C.green, cursor: "pointer", fontWeight: 600 }}>View all →</span>
            )}
          </div>
          {recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.gray400, fontSize: 13 }}>
              No content yet.{" "}
              <span onClick={() => setTab("generate")} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Generate your first →</span>
            </div>
          ) : (
            recent.map(item => {
              const color = TYPE_COLOR[item.template] || C.green;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.gray100}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={TEMPLATE_ICONS[item.template] || "blog"} size={14} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.black, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title || item.prompt}
                    </div>
                    <div style={{ fontSize: 11, color: C.gray400 }}>
                      {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <Badge color={color} bg={color + "18"}>{item.template}</Badge>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick-start CTA */}
      {history.length === 0 && (
        <div className="fade-up-3" style={{ marginTop: 22, background: `linear-gradient(135deg, ${C.greenLight}, #fff)`, border: `1px solid ${C.green}22`, borderRadius: 14, padding: "28px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.black, marginBottom: 6 }}>Ready to create your first piece?</div>
            <div style={{ fontSize: 13, color: C.gray600 }}>Pick a template, write a prompt, and let AI do the heavy lifting.</div>
          </div>
          <BtnPrimary onClick={() => setTab("generate")} style={{ flexShrink: 0 }}>
            <Icon name="sparkle" size={15} color="#fff" /> Start Generating
          </BtnPrimary>
        </div>
      )}
    </div>
  );
}
