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
  const [activeTab, setActiveTab] = useState("TT");

  const SPORTS_LIST = [{ code: "TT", name: "Table Tennis" }, { code: "LT", name: "Lawn Tennis" }, { code: "BT", name: "Badminton" }];
  const isAdmin = !!localStorage.getItem("token");

  const load = () => api.get("/matches").then(r => setMatches(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ team1_score: m.team1_score || 0, team2_score: m.team2_score || 0, scheduled_date: m.scheduled_date || "", scheduled_time: m.scheduled_time || "", status: m.status || "scheduled" });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/matches/${id}`, editForm);
      toast.success("Match logistics updated!");
      setEditingId(null);
      load();
    } catch { toast.error("Failed to update"); }
  };

  const currentMatches = matches.filter(m => m.sport === activeTab);

  return (
    <div className="min-h-screen">
      <PageHead label="Schedule & Results" title="TOURNAMENT" accent="#007AFF" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {SPORTS_LIST.map(s => (
            <button key={s.code} onClick={() => setActiveTab(s.code)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeTab === s.code ? "bg-[#007AFF] text-white" : "bg-[#141414] text-zinc-400 hover:text-white border border-white/10"}`}>
              {s.name} Fixtures
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {currentMatches.length === 0 ? <p className="text-zinc-500 text-center py-10">No fixtures generated.</p> : currentMatches.map(m => (
            <div key={m.id} className="card-tech rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              
              {editingId === m.id ? (
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <input type="date" value={editForm.scheduled_date} onChange={e => setEditForm({...editForm, scheduled_date: e.target.value})} className="bg-[#0A0A0A] border border-white/15 rounded px-2 py-1 text-sm text-white" />
                  <input type="time" value={editForm.scheduled_time} onChange={e => setEditForm({...editForm, scheduled_time: e.target.value})} className="bg-[#0A0A0A] border border-white/15 rounded px-2 py-1 text-sm text-white" />
                  
                  <span className="font-semibold text-lg ml-2" style={{ color: TEAM_COLOR?.[m.team1] || "#FFF" }}>{m.team1}</span>
                  <input type="number" min="0" value={editForm.team1_score} onChange={e => setEditForm({...editForm, team1_score: Number(e.target.value)})} className="w-12 bg-[#0A0A0A] border border-white/15 rounded text-center text-white" />
                  <span className="text-zinc-500">-</span>
                  <input type="number" min="0" value={editForm.team2_score} onChange={e => setEditForm({...editForm, team2_score: Number(e.target.value)})} className="w-12 bg-[#0A0A0A] border border-white/15 rounded text-center text-white" />
                  <span className="font-semibold text-lg mr-2" style={{ color: TEAM_COLOR?.[m.team2] || "#FFF" }}>{m.team2}</span>
                  
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-[#141414] text-xs px-2 py-1 rounded outline-none border border-white/10 text-white">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <button onClick={() => saveEdit(m.id)} className="text-[#22C55E] ml-auto"><Save size={20}/></button>
                  <button onClick={() => setEditingId(null)} className="text-[#FF3B30]"><X size={20}/></button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col flex-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">{m.scheduled_date || "TBD"} • {m.scheduled_time || "TBD"}</span>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team1] || "#FFF" }}>{m.team1}</span>
                      <span className="font-display text-2xl tracking-widest bg-white/5 px-3 py-1 rounded-lg">{m.team1_score ?? "-"} : {m.team2_score ?? "-"}</span>
                      <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team2] || "#FFF" }}>{m.team2}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${m.status === "completed" ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30" : "bg-white/5 text-zinc-400 border border-white/10"}`}>
                      {m.status || "SCHEDULED"}
                    </span>
                    {isAdmin && <button onClick={() => handleEdit(m)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><Edit2 size={16}/></button>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
