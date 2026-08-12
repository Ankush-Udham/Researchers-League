import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";

export default function Tournament() {
  const { TEAM_COLOR } = useSettings();
  const [matches, setMatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState("TT"); // Controls which sport is showing

  // Hardcoded to ensure it never crashes regardless of database format
  const SPORTS_LIST = [
    { code: "TT", name: "Table Tennis" },
    { code: "LT", name: "Lawn Tennis" },
    { code: "BT", name: "Badminton" }
  ];

  // Checks if you are logged in as admin
  const isAdmin = !!localStorage.getItem("token");

  const load = () => api.get("/matches").then(r => setMatches(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ team1_score: m.team1_score || 0, team2_score: m.team2_score || 0, status: m.status || "scheduled" });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/matches/${id}`, editForm);
      toast.success("Score updated! Rankings have been automatically recalculated.");
      setEditingId(null);
      load();
    } catch { toast.error("Failed to update score"); }
  };

  // Filters fixtures to show ONLY the sport you clicked on
  const currentMatches = matches.filter(m => m.sport === activeTab);

  return (
    <div className="min-h-screen">
      <PageHead label="Schedule & Results" title="TOURNAMENT" accent="#007AFF" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        
        {/* Sport Navigation Tabs */}
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {SPORTS_LIST.map(s => (
            <button 
              key={s.code} 
              onClick={() => setActiveTab(s.code)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeTab === s.code ? "bg-[#007AFF] text-white" : "bg-[#141414] text-zinc-400 hover:text-white border border-white/10"}`}
            >
              {s.name} Fixtures
            </button>
          ))}
        </div>

        {/* Fixtures List */}
        <div className="grid gap-3">
          {currentMatches.length === 0 ? (
            <p className="text-zinc-500 text-center py-10">No fixtures generated for this sport yet.</p>
          ) : currentMatches.map(m => (
            <div key={m.id} className="card-tech rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 flex-1">
                {/* Team Colors are preserved here */}
                <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team1] || "#FFF" }}>{m.team1}</span>
                <span className="text-zinc-500 text-sm">vs</span>
                <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team2] || "#FFF" }}>{m.team2}</span>
              </div>

              {/* Admin Editing Interface */}
              {editingId === m.id ? (
                <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 rounded-lg border border-white/15">
                  <input type="number" min="0" value={editForm.team1_score} onChange={e => setEditForm({...editForm, team1_score: Number(e.target.value)})} className="w-12 bg-transparent text-center font-display text-xl outline-none text-white" />
                  <span className="text-zinc-500">-</span>
                  <input type="number" min="0" value={editForm.team2_score} onChange={e => setEditForm({...editForm, team2_score: Number(e.target.value)})} className="w-12 bg-transparent text-center font-display text-xl outline-none text-white" />
                  
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-[#141414] text-xs px-2 py-2 rounded outline-none border border-white/10 text-white">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <button onClick={() => saveEdit(m.id)} className="text-[#22C55E] p-1"><Save size={20}/></button>
                  <button onClick={() => setEditingId(null)} className="text-[#FF3B30] p-1"><X size={20}/></button>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <span className="font-display text-2xl tracking-widest">{m.team1_score ?? "-"} : {m.team2_score ?? "-"}</span>
                  
                  {/* Status Tag (Turns Green if completed) */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${m.status === "completed" ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30" : "bg-white/5 text-zinc-400 border border-white/10"}`}>
                    {m.status || "SCHEDULED"}
                  </span>
                  
                  {isAdmin && (
                    <button onClick={() => handleEdit(m)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><Edit2 size={16}/></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
