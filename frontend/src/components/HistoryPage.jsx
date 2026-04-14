import React, { useState } from "react";

function Icon({ name, filled = false, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' 24` }}
    >
      {name}
    </span>
  );
}

const HISTORY = [
  { id: "ALS-99021-X", food: "Tacos", time: "Just now", allergens: ["gluten", "dairy"], safe: false, confidence: 91.2 },
  { id: "ALS-88201-Q", food: "Quinoa Salad", time: "2 hours ago", allergens: [], safe: true, confidence: 87.4 },
  { id: "ALS-77103-M", food: "Green Smoothie", time: "Yesterday", allergens: [], safe: true, confidence: 94.1 },
  { id: "ALS-66044-P", food: "Pad Thai", time: "2 days ago", allergens: ["peanuts", "shellfish"], safe: false, confidence: 88.7 },
  { id: "ALS-55932-R", food: "Caesar Salad", time: "3 days ago", allergens: ["dairy", "eggs", "fish"], safe: false, confidence: 92.3 },
  { id: "ALS-44811-T", food: "Fruit Bowl", time: "4 days ago", allergens: [], safe: true, confidence: 96.5 },
  { id: "ALS-33700-Z", food: "Spaghetti Bolognese", time: "5 days ago", allergens: ["gluten", "dairy"], safe: false, confidence: 89.0 },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = HISTORY.filter((s) => {
    if (filter === "safe" && !s.safe) return false;
    if (filter === "risk" && s.safe) return false;
    if (search && !s.food.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
          Scan History
        </h1>
        <p className="text-slate-500 text-lg">All your past food analyses in one place.</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Scans", value: HISTORY.length, icon: "biotech", color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Safe Foods", value: HISTORY.filter(s => s.safe).length, icon: "check_circle", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Allergens Detected", value: HISTORY.filter(s => !s.safe).length, icon: "warning", color: "text-red-500", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <Icon name={stat.icon} className={`${stat.color} text-2xl`} filled />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-2.5 text-slate-400 text-[18px]" />
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["all", "safe", "risk"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? "bg-emerald-700 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "All" : f === "safe" ? "Safe" : "Risky"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Analysis ID", "Food Item", "Allergens", "Confidence", "Status", "Time"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.id}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{row.food}</td>
                <td className="px-6 py-4">
                  {row.allergens.length === 0 ? (
                    <span className="text-slate-300 text-xs">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {row.allergens.map((a) => (
                        <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-emerald-700">{row.confidence}%</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.safe ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {row.safe ? "Safe" : "Allergen Detected"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Icon name="search_off" className="text-5xl mb-2" />
            <p>No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
