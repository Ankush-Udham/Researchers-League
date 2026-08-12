import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";

export default function Tournament() {
  const { SPORTS, TEAM_COLOR } = useSettings();
  const [matches, setMatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
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
      toast.success("Score updated! Rankings have been recalculated.");
      setEditingId(null);
      load();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="min-h-screen">
      <PageHead label="Schedule & Results" title="TOURNAMENT" accent="#007AFF" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
        
        {/* Groups matches by Sport automatically */}
        {Object.entries(SPORTS || {}).map(([sportCode, sportName]) => {
          const sportMatches = matches.filter(m => m.sport === sportCode);
          if (sportMatches.length === 0) return null;
          
          return (
            <div key={sportCode} className="space-y-4">
              <h3 className="font-display text-3xl text-[#007AFF] border-b border-white/10 pb-3">{sportName} Fixtures</h3>
              <div className="grid gap-3">
                {sportMatches.map(m => (
                  <div key={m.id} className="card-tech rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team1] || "#FFF" }}>{m.team1}</span>
                      <span className="text-zinc-500 text-sm">vs</span>
                      <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team2] || "#FFF" }}>{m.team2}</span>
                    </div>

                    {/* Admin Editing Interface */}
                    {editingId === m.id ? (
                      <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 rounded-lg border border-white/15">
                        <input type="number" value={editForm.team1_score} onChange={e => setEditForm({...editForm, team1_score: Number(e.target.value)})} className="w-12 bg-transparent text-center font-display text-xl outline-none" />
                        <span className="text-zinc-500">-</span>
                        <input type="number" value={editForm.team2_score} onChange={e => setEditForm({...editForm, team2_score: Number(e.target.value)})} className="w-12 bg-transparent text-center font-display text-xl outline-none" />
                        
                        <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-[#141414] text-xs px-2 py-2 rounded outline-none border border-white/10">
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                        </select>
                        
                        <button onClick={() => saveEdit(m.id)} className="text-[#22C55E] p-1"><Save size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="text-[#FF3B30] p-1"><X size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <span className="font-display text-2xl tracking-widest">{m.team1_score ?? "-"} : {m.team2_score ?? "-"}</span>
                        
                        {/* Status Tag (Green if completed) */}
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
          );
        })}
      </div>
    </div>
  );
}
