import { useEffect, useState } from "react";
import api from "../lib/api";
import { SPORTS, TEAM_COLOR, PageHead } from "../components/shared";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Matches() {
  const { isAdmin } = useAuth();
  const [matches, setMatches] = useState([]);
  const [sport, setSport] = useState("TT");
  const [edit, setEdit] = useState(null);

  const load = () => api.get("/matches").then((r) => setMatches(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const rows = matches.filter((m) => m.sport === sport);

  const save = async () => {
    try {
      await api.put(`/matches/${edit.id}`, {
        scheduled_date: edit.scheduled_date, scheduled_time: edit.scheduled_time, venue: edit.venue,
        team1_score: edit.team1_score === "" ? null : Number(edit.team1_score),
        team2_score: edit.team2_score === "" ? null : Number(edit.team2_score),
        status: (edit.team1_score !== "" && edit.team2_score !== "" && edit.team1_score != null && edit.team2_score != null) ? "completed" : "scheduled",
      });
      toast.success("Match updated");
      setEdit(null); load();
    } catch (e) { toast.error("Update failed"); }
  };

  return (
    <div className="min-h-screen">
      <PageHead label="Matches & Stats" title="MATCH CENTRE" accent="#007AFF" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {!isAdmin && <p className="text-zinc-400 mb-6">Live fixtures with dates, times and results. The developer updates results as matches complete.</p>}
        {isAdmin && <p className="text-[#22C55E] mb-6 text-sm">Admin mode — click a match to edit date, time and score.</p>}
        <div className="flex gap-2 mb-6">
          {Object.entries(SPORTS).map(([k, v]) => (
            <button key={k} data-testid={`mtab-${k}`} onClick={() => setSport(k)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${sport === k ? "bg-[#007AFF] border-[#007AFF]" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{v}</button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <div key={m.id} className={`card-tech rounded-xl p-5 ${isAdmin ? "cursor-pointer" : ""}`} data-testid={`match-card-${m.id}`}
              onClick={() => isAdmin && setEdit({ ...m, team1_score: m.team1_score ?? "", team2_score: m.team2_score ?? "" })}>
              <div className="flex justify-between items-center">
                <span className="label-tag text-xs text-zinc-500">Round {m.round}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${m.status === "completed" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-white/10 text-zinc-400"}`}>{m.status}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-semibold text-sm" style={{ color: TEAM_COLOR[m.team1] }}>{m.team1}</span>
                <span className="font-display text-3xl">{m.status === "completed" ? `${m.team1_score}-${m.team2_score}` : "vs"}</span>
                <span className="font-semibold text-sm" style={{ color: TEAM_COLOR[m.team2] }}>{m.team2}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-4">{m.scheduled_date || "Date TBD"} · {m.scheduled_time || "Time TBD"}</p>
            </div>
          ))}
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()} data-testid="match-edit-modal">
            <h4 className="font-display text-2xl mb-4">{edit.team1} vs {edit.team2}</h4>
            <div className="space-y-3">
              <input type="date" value={edit.scheduled_date} onChange={(e) => setEdit({ ...edit, scheduled_date: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="edit-date" />
              <input type="time" value={edit.scheduled_time} onChange={(e) => setEdit({ ...edit, scheduled_time: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="edit-time" />
              <div className="flex gap-3">
                <input type="number" min="0" placeholder={edit.team1} value={edit.team1_score} onChange={(e) => setEdit({ ...edit, team1_score: e.target.value })} className="w-1/2 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="edit-score1" />
                <input type="number" min="0" placeholder={edit.team2} value={edit.team2_score} onChange={(e) => setEdit({ ...edit, team2_score: e.target.value })} className="w-1/2 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="edit-score2" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} className="flex-1 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid="edit-save">Save</button>
              <button onClick={() => setEdit(null)} className="px-4 py-2 rounded-full border border-white/15">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
