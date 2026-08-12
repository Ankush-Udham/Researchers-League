import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";

export default function Matches() {
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
    let p1 = m.team1_pts; let p2 = m.team2_pts;
    if (p1 === undefined || p1 === null) {
      if (m.team1_score > m.team2_score) { p1 = 3; p2 = 0; }
      else if (m.team2_score > m.team1_score) { p1 = 0; p2 = 3; }
      else { p1 = 1; p2 = 1; }
    }
    // FIX 1: We spread the entire match (...m) into the form so the backend doesn't forget the scores when we save the points!
    setEditForm({ ...m, team1_pts: p1, team2_pts: p2 });
  };

  const saveEdit = async (id) => {
    try {
      // FIX 2: We convert the text back to a number right before sending it to the database
      const payload = { 
        ...editForm, 
        team1_pts: editForm.team1_pts === "" ? 0 : Number(editForm.team1_pts),
        team2_pts: editForm.team2_pts === "" ? 0 : Number(editForm.team2_pts)
      };
      await api.put(`/matches/${id}`, payload);
      toast.success("Custom points awarded! Rankings updated.");
      setEditingId(null);
      load();
    } catch { toast.error("Failed to update points"); }
  };

  const currentMatches = matches.filter(m => m.sport === activeTab);

  return (
    <div className="min-h-screen">
      <PageHead label="Matches & Stats" title="MATCH CENTRE" accent="#FF3B30" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        <p className="text-zinc-400 text-sm mb-4">Admin mode — Edit custom Points awarded for completed matches.</p>
        
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {SPORTS_LIST.map(s => (
            <button key={s.code} onClick={() => setActiveTab(s.code)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeTab === s.code ? "bg-[#FF3B30] text-white" : "bg-[#141414] text-zinc-400 hover:text-white border border-white/10"}`}>
              {s.name} Stats
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {currentMatches.length === 0 ? <p className="text-zinc-500 text-center py-10">No stats available.</p> : currentMatches.map(m => {
            
            let winnerText = <span className="text-zinc-500 text-xs">Awaiting Result</span>;
            if (m.status === "completed") {
              if (m.team1_score > m.team2_score) winnerText = <span className="text-[#22C55E] text-xs font-bold uppercase">{m.team1} Won</span>;
              else if (m.team2_score > m.team1_score) winnerText = <span className="text-[#22C55E] text-xs font-bold uppercase">{m.team2} Won</span>;
              else winnerText = <span className="text-yellow-500 text-xs font-bold uppercase">Draw</span>;
            }

            return (
            <div key={m.id} className="card-tech rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-col flex-1">
                {winnerText}
                <div className="flex items-center gap-4 mt-1">
                  <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team1] || "#FFF" }}>{m.team1}</span>
                  <span className="text-zinc-600 text-sm">vs</span>
                  <span className="font-semibold text-lg" style={{ color: TEAM_COLOR?.[m.team2] || "#FFF" }}>{m.team2}</span>
                </div>
              </div>

              {editingId === m.id ? (
                <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 rounded-lg border border-white/15">
                  <div className="text-center"><span className="text-xs text-zinc-500 block">T1 Pts</span>
                    {/* FIX 3: We removed the strict 'Number()' wrap here so your Backspace key actually works! */}
                    <input type="number" min="0" value={editForm.team1_pts ?? ""} onChange={e => setEditForm({...editForm, team1_pts: e.target.value})} className="w-12 bg-transparent text-center font-display text-xl outline-none text-white border-b border-white/10" />
                  </div>
                  <div className="text-center"><span className="text-xs text-zinc-500 block">T2 Pts</span>
                    <input type="number" min="0" value={editForm.team2_pts ?? ""} onChange={e => setEditForm({...editForm, team2_pts: e.target.value})} className="w-12 bg-transparent text-center font-display text-xl outline-none text-white border-b border-white/10" />
                  </div>
                  <button onClick={() => saveEdit(m.id)} className="text-[#22C55E] p-1 ml-2"><Save size={20}/></button>
                  <button onClick={() => setEditingId(null)} className="text-[#FF3B30] p-1"><X size={20}/></button>
                </div>
              ) : (
                <div className="flex items-center gap-5 bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-4">
                    <div className="text-center"><span className="text-[10px] text-zinc-500 uppercase tracking-widest block">T1 PTS</span><span className="font-display text-xl text-white">{m.team1_pts !== null && m.team1_pts !== undefined ? m.team1_pts : "-"}</span></div>
                    <div className="text-center"><span className="text-[10px] text-zinc-500 uppercase tracking-widest block">T2 PTS</span><span className="font-display text-xl text-white">{m.team2_pts !== null && m.team2_pts !== undefined ? m.team2_pts : "-"}</span></div>
                  </div>
                  {isAdmin && m.status === "completed" && <button onClick={() => handleEdit(m)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full ml-2"><Edit2 size={16}/></button>}
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
