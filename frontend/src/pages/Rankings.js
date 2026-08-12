import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";
import { toast } from "sonner";
import { CheckCircle, X } from "lucide-react";

export default function Rankings() {
  const { TEAM_COLOR } = useSettings();
  const [standings, setStandings] = useState({});
  const [activeTab, setActiveTab] = useState("OVERALL");
  const [showModal, setShowModal] = useState(false);
  const [tournamentName, setTournamentName] = useState("");

  const isAdmin = !!localStorage.getItem("token");

  const load = () => api.get("/standings").then(r => setStandings(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const SPORTS_LIST = [
    { code: "OVERALL", name: "Overall" },
    { code: "TT", name: "Table Tennis" },
    { code: "LT", name: "Lawn Tennis" },
    { code: "BT", name: "Badminton" }
  ];

  const handleArchive = async () => {
    if (!tournamentName) return toast.error("Please enter a tournament name");
    try {
      await api.post("/history/archive", { tournament_name: tournamentName });
      toast.success("Tournament archived and reset successfully!");
      setShowModal(false);
      setTournamentName("");
      load(); // Reloads the page to show empty stats
    } catch { toast.error("Failed to archive tournament"); }
  };

  const currentData = standings[activeTab] || [];

  return (
    <div className="min-h-screen">
      <PageHead label="Leaderboards" title="RANKINGS" accent="#EAB308" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        
        {/* Navigation & Admin Archive Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-3">
            {SPORTS_LIST.map(s => (
              <button key={s.code} onClick={() => setActiveTab(s.code)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeTab === s.code ? "bg-[#EAB308] text-black" : "bg-[#141414] text-zinc-400 hover:text-white border border-white/10"}`}>
                {s.name}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#22C55E]/30 transition-colors animate-pulse">
              <CheckCircle size={16} /> Complete Tournament
            </button>
          )}
        </div>

        {/* Standings Table */}
        <div className="card-tech rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="p-4 font-semibold">Pos</th>
                  <th className="p-4 font-semibold">Team</th>
                  <th className="p-4 font-semibold text-center">P</th>
                  <th className="p-4 font-semibold text-center">W</th>
                  <th className="p-4 font-semibold text-center">L</th>
                  <th className="p-4 font-semibold text-center">PF</th>
                  <th className="p-4 font-semibold text-center">PA</th>
                  <th className="p-4 font-semibold text-center text-[#EAB308]">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.length === 0 ? (
                  <tr><td colSpan="8" className="p-8 text-center text-zinc-500">No data available. Generate fixtures to begin.</td></tr>
                ) : currentData.map((row, i) => (
                  <tr key={row.team} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-display text-xl text-zinc-500">{i + 1}</td>
                    <td className="p-4 font-bold text-lg" style={{ color: TEAM_COLOR?.[row.team] || "#FFF" }}>{row.team}</td>
                    <td className="p-4 text-center text-zinc-300">{row.played}</td>
                    <td className="p-4 text-center text-zinc-300">{row.won}</td>
                    <td className="p-4 text-center text-zinc-300">{row.lost}</td>
                    <td className="p-4 text-center text-zinc-300">{row.pf}</td>
                    <td className="p-4 text-center text-zinc-300">{row.pa}</td>
                    <td className="p-4 text-center font-display text-2xl text-[#EAB308]">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Archive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-white">Archive Tournament</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Enter a name for this tournament (e.g., "Season 1 - 2026"). This will permanently save the overall scorecard and team rosters to the History page, and reset all current matches.</p>
            <input 
              type="text" 
              placeholder="e.g. Summer League 2026..." 
              value={tournamentName} 
              onChange={e => setTournamentName(e.target.value)} 
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] mb-6"
            />
            <button onClick={handleArchive} className="w-full bg-[#22C55E] text-black font-bold py-3 rounded-lg hover:bg-[#22C55E]/90 transition-colors">
              Save & Reset Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
