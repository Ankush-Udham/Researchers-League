import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";

export default function Tournament() {
  const [matches, setMatches] = useState([]);
  const [sport, setSport] = useState("TT");
  useEffect(() => { api.get("/matches").then((r) => setMatches(r.data)).catch(() => {}); }, []);
  const rows = matches.filter((m) => m.sport === sport);

  return (
    <div className="min-h-screen">
      <PageHead label="Tournament & Events" title="THE SCHEDULE" accent="#FF3B30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <p className="text-zinc-400 mb-6 max-w-2xl">Round-robin format — every pair of teams plays 5 matches in each sport. 45 fixtures across Table Tennis, Lawn Tennis and Badminton.</p>
        <div className="flex gap-2 mb-6">
          {Object.entries(SPORTS).map(([k, v]) => (
            <button key={k} data-testid={`tab-${k}`} onClick={() => setSport(k)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${sport === k ? "bg-[#FF3B30] border-[#FF3B30]" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{v}</button>
          ))}
        </div>
        <div className="overflow-x-auto border border-white/10 rounded-xl" data-testid="schedule-table">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-[#1F1F1F] text-zinc-400 label-tag text-xs">
              <tr>
                <th className="text-left p-4">Round</th><th className="text-left p-4">Fixture</th>
                <th className="text-left p-4">Date</th><th className="text-left p-4">Time</th>
                <th className="text-left p-4">Score</th><th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-t border-white/10 hover:bg-white/5" data-testid={`fixture-${m.id}`}>
                  <td className="p-4">R{m.round}</td>
                  <td className="p-4 font-semibold"><span style={{ color: TEAM_COLOR[m.team1] }}>{m.team1}</span> <span className="text-zinc-500">vs</span> <span style={{ color: TEAM_COLOR[m.team2] }}>{m.team2}</span></td>
                  <td className="p-4 text-zinc-300">{m.scheduled_date || "TBD"}</td>
                  <td className="p-4 text-zinc-300">{m.scheduled_time || "TBD"}</td>
                  <td className="p-4 font-display text-lg">{m.status === "completed" ? `${m.team1_score} - ${m.team2_score}` : "—"}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${m.status === "completed" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-white/10 text-zinc-400"}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
