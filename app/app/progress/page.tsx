"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppNav } from "../../components/AppNav";

interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  adherence: number | null;
  notes: string | null;
}

export default function ProgressPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    weightKg: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    adherence: "",
    notes: "",
  });

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/progress?limit=30");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [session, fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.weightKg) body.weightKg = parseFloat(form.weightKg);
      if (form.calories) body.calories = parseInt(form.calories, 10);
      if (form.protein) body.protein = parseInt(form.protein, 10);
      if (form.carbs) body.carbs = parseInt(form.carbs, 10);
      if (form.fat) body.fat = parseInt(form.fat, 10);
      if (form.adherence) body.adherence = parseFloat(form.adherence);
      if (form.notes) body.notes = form.notes;

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setForm({ weightKg: "", calories: "", protein: "", carbs: "", fat: "", adherence: "", notes: "" });
        setShowForm(false);
        fetchEntries();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // Derive stats
  const latestWeight = entries.find((e) => e.weightKg !== null)?.weightKg ?? null;
  const weights = entries.filter((e) => e.weightKg !== null).map((e) => e.weightKg!).reverse();
  const avgAdherence = entries.filter((e) => e.adherence !== null).length
    ? Math.round(
        entries.filter((e) => e.adherence !== null).reduce((s, e) => s + e.adherence!, 0) /
          entries.filter((e) => e.adherence !== null).length
      )
    : null;
  const avgCalories = entries.filter((e) => e.calories !== null).length
    ? Math.round(
        entries.filter((e) => e.calories !== null).reduce((s, e) => s + e.calories!, 0) /
          entries.filter((e) => e.calories !== null).length
      )
    : null;
  const avgProtein = entries.filter((e) => e.protein !== null).length
    ? Math.round(
        entries.filter((e) => e.protein !== null).reduce((s, e) => s + e.protein!, 0) /
          entries.filter((e) => e.protein !== null).length
      )
    : null;

  // streak: consecutive days with entries
  const streak = (() => {
    if (!entries.length) return 0;
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 86400000;
    for (let i = 0; i < entries.length; i++) {
      const d = new Date(entries[i].date);
      d.setHours(0, 0, 0, 0);
      const expected = new Date(today.getTime() - i * dayMs);
      expected.setHours(0, 0, 0, 0);
      if (d.getTime() === expected.getTime()) count++;
      else break;
    }
    return count;
  })();

  return (
    <div className="np-shell">
      <AppNav />
      <main className="np-main" style={{ padding: "1.5rem 1rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📊 Progress Dashboard</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Track weight, macros, and adherence over time
            </p>
          </div>
          {session?.user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="np-btn np-btn-primary"
              style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
            >
              {showForm ? "Cancel" : "+ Log Entry"}
            </button>
          )}
        </div>

        {!session?.user && (
          <div style={cardStyle}>
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              🔒 Sign in to track your progress
            </p>
          </div>
        )}

        {/* Entry Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ ...cardStyle, marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>📝 New Entry</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={labelStyle}>
                Weight (kg)
                <input
                  type="number"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  style={inputStyle}
                  placeholder="75.0"
                />
              </label>
              <label style={labelStyle}>
                Calories
                <input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  style={inputStyle}
                  placeholder="2200"
                />
              </label>
              <label style={labelStyle}>
                Protein (g)
                <input
                  type="number"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  style={inputStyle}
                  placeholder="150"
                />
              </label>
              <label style={labelStyle}>
                Carbs (g)
                <input
                  type="number"
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                  style={inputStyle}
                  placeholder="200"
                />
              </label>
              <label style={labelStyle}>
                Fat (g)
                <input
                  type="number"
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })}
                  style={inputStyle}
                  placeholder="70"
                />
              </label>
              <label style={labelStyle}>
                Adherence (0-100%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.adherence}
                  onChange={(e) => setForm({ ...form, adherence: e.target.value })}
                  style={inputStyle}
                  placeholder="85"
                />
              </label>
            </div>
            <label style={{ ...labelStyle, marginTop: "0.75rem" }}>
              Notes (optional)
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                placeholder="How did the week go?"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="np-btn np-btn-primary"
              style={{ marginTop: "1rem", width: "100%" }}
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </form>
        )}

        {/* Stats Cards */}
        {session?.user && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <StatCard label="Current Weight" value={latestWeight !== null ? `${latestWeight} kg` : "—"} icon="⚖️" />
            <StatCard label="Avg Calories" value={avgCalories !== null ? `${avgCalories} kcal` : "—"} icon="🔥" />
            <StatCard label="Avg Protein" value={avgProtein !== null ? `${avgProtein}g` : "—"} icon="💪" />
            <StatCard label="Adherence" value={avgAdherence !== null ? `${avgAdherence}%` : "—"} icon="✅" />
            <StatCard label="Streak" value={streak > 0 ? `${streak} day${streak > 1 ? "s" : ""}` : "—"} icon="🔥" />
          </div>
        )}

        {/* Weight Chart (CSS-based) */}
        {weights.length > 1 && (
          <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>⚖️ Weight Trend</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
              {(() => {
                const min = Math.min(...weights) - 1;
                const max = Math.max(...weights) + 1;
                const range = max - min || 1;
                return weights.slice(-14).map((w, i) => {
                  const pct = ((w - min) / range) * 100;
                  return (
                    <div
                      key={i}
                      title={`${w} kg`}
                      style={{
                        flex: 1,
                        height: `${Math.max(pct, 5)}%`,
                        background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                        borderRadius: "4px 4px 0 0",
                        minWidth: 8,
                        transition: "height 0.3s",
                      }}
                    />
                  );
                });
              })()}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.7rem", color: "#9ca3af" }}>
              <span>{weights.slice(-14)[0]?.toFixed(1)} kg</span>
              <span>{weights[weights.length - 1]?.toFixed(1)} kg</span>
            </div>
          </div>
        )}

        {/* Macro Bars (last 7 entries) */}
        {entries.filter((e) => e.protein || e.carbs || e.fat).length > 0 && (
          <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>🍽️ Macro Overview (Last 7)</h3>
            {entries
              .filter((e) => e.protein || e.carbs || e.fat)
              .slice(0, 7)
              .map((entry) => {
                const total = (entry.protein ?? 0) + (entry.carbs ?? 0) + (entry.fat ?? 0);
                const pPct = total ? ((entry.protein ?? 0) / total) * 100 : 0;
                const cPct = total ? ((entry.carbs ?? 0) / total) * 100 : 0;
                const fPct = total ? ((entry.fat ?? 0) / total) * 100 : 0;
                const dateLabel = new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" });
                return (
                  <div key={entry.id} style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>
                      <span>{dateLabel}</span>
                      <span>P:{entry.protein ?? 0}g C:{entry.carbs ?? 0}g F:{entry.fat ?? 0}g</span>
                    </div>
                    <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pPct}%`, background: "#3b82f6" }} title={`Protein: ${entry.protein}g`} />
                      <div style={{ width: `${cPct}%`, background: "#f59e0b" }} title={`Carbs: ${entry.carbs}g`} />
                      <div style={{ width: `${fPct}%`, background: "#ef4444" }} title={`Fat: ${entry.fat}g`} />
                    </div>
                  </div>
                );
              })}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#3b82f6", marginRight: 4 }} />Protein</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#f59e0b", marginRight: 4 }} />Carbs</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#ef4444", marginRight: 4 }} />Fat</span>
            </div>
          </div>
        )}

        {/* Recent Entries Table */}
        {session?.user && entries.length > 0 && (
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>📋 Recent Entries</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Weight</th>
                    <th style={thStyle}>Kcal</th>
                    <th style={thStyle}>P/C/F</th>
                    <th style={thStyle}>Adh.</th>
                    <th style={thStyle}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={tdStyle}>
                        {new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </td>
                      <td style={tdStyle}>{entry.weightKg ?? "—"}</td>
                      <td style={tdStyle}>{entry.calories ?? "—"}</td>
                      <td style={tdStyle}>
                        {entry.protein ?? "—"}/{entry.carbs ?? "—"}/{entry.fat ?? "—"}
                      </td>
                      <td style={tdStyle}>{entry.adherence !== null ? `${entry.adherence}%` : "—"}</td>
                      <td style={{ ...tdStyle, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {session?.user && !loading && entries.length === 0 && !showForm && (
          <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1.5rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</p>
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No entries yet</h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Start logging your weight, macros, and adherence to see trends.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="np-btn np-btn-primary"
            >
              + Log First Entry
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>Loading...</div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{label}</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "1rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "#374151",
  gap: 4,
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
};

const thStyle: React.CSSProperties = { padding: "0.5rem 0.25rem", fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.25rem" };
