import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Trophy } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import api, { fileUrl } from "../lib/api";

const SPORT_IMG = {
  TT: "https://images.pexels.com/photos/38446269/pexels-photo-38446269.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  LT: "https://images.unsplash.com/photo-1620742820748-87c09249a72a?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
  BT: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
};
const SPORT_NAME = { TT: "Table Tennis", LT: "Lawn Tennis", BT: "Badminton" };
const FALLBACK = [
  "https://images.unsplash.com/photo-1692197174597-1d85555c9b33?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1663576748367-4ff6bec25639?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1663576748377-cafb47103042?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1516224498413-84ecf3a1e7fd?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
];
const TEAM_COLOR = { "Team A": "#FF3B30", "Team B": "#007AFF", "Team C": "#22C55E" };

const PlayerRow = ({ p, i }) => {
  const img = p.photo_url ? (p.photo_url.startsWith("http") ? p.photo_url : fileUrl(p.photo_url)) : FALLBACK[i % FALLBACK.length];
  const left = i % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${left ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-6 md:gap-12 py-10`}
      data-testid={`player-row-${p.number}`}
    >
      <div className="relative w-full md:w-1/2">
        <div className="absolute -inset-2 rounded-2xl opacity-30 blur-2xl" style={{ background: TEAM_COLOR[p.team] }} />
        <img src={img} alt={p.name} loading="lazy" className="relative w-full h-72 sm:h-96 object-cover rounded-2xl border border-white/10" />
        <span className="absolute top-4 left-4 font-display text-6xl sm:text-8xl leading-none" style={{ color: TEAM_COLOR[p.team], WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>{p.number}</span>
      </div>
      <div className="w-full md:w-1/2">
        <span className="label-tag text-xs" style={{ color: TEAM_COLOR[p.team] }}>{p.team} · {p.role || "Player"}</span>
        <h3 className="font-display text-5xl sm:text-6xl mt-2">{p.name}</h3>
        <p className="text-zinc-400 mt-4 leading-relaxed">{p.bio || "Details coming soon."}</p>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const { t } = useLang();
  const { settings } = useSettings();
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/players").then((r) => setPlayers(r.data)).catch(() => {});
    api.get("/matches").then((r) => setMatches(r.data.filter((m) => m.status === "completed").slice(0, 8))).catch(() => {});
  }, []);

  const logo = settings?.logo_url ? (settings.logo_url.startsWith("http") ? settings.logo_url : fileUrl(settings.logo_url)) : null;
  const filtered = q ? players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.team.toLowerCase().includes(q.toLowerCase())) : players;

  return (
    <div className="grain">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} data-testid="hero-search"
              className="w-full glass border border-white/15 rounded-full pl-14 pr-5 py-4 text-base outline-none focus:border-[#FF3B30] transition-colors" />
          </div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="flex flex-col items-center">
            {logo ? <img src={logo} alt="league" className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-2 border-[#FF3B30]" />
              : <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gradient-to-b from-[#1F1F1F] to-[#0A0A0A] border-2 border-[#FF3B30] flex items-center justify-center"><Trophy size={56} className="text-[#FF3B30]" /></div>}
          </motion.div>
          <h1 className="font-display text-5xl sm:text-7xl text-center mt-6 tracking-tight">{settings?.league_name || "IISER MOHALI SPORTS LEAGUE"}</h1>
          <p className="text-center text-zinc-400 mt-3 label-tag text-xs sm:text-sm">{settings?.tagline || "6 PLAYERS · 3 TEAMS · 3 SPORTS"}</p>
        </div>
        <div className="absolute bottom-8 animate-bounce text-zinc-500"><ChevronDown size={28} /></div>
      </section>

      {/* PLAYERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16" data-testid="players-section" id="players">
        <h2 className="font-display text-4xl sm:text-5xl mb-2">{t("players")}</h2>
        <div className="h-1 w-24 bg-[#FF3B30] mb-4" />
        <div className="divide-y divide-white/5">
          {filtered.map((p, i) => <PlayerRow key={p.id} p={p} i={i} />)}
          {filtered.length === 0 && <p className="text-zinc-500 py-8">No players found.</p>}
        </div>
      </section>

      {/* SPORTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16" data-testid="sports-section">
        <h2 className="font-display text-4xl sm:text-5xl mb-2">{t("sports")}</h2>
        <div className="h-1 w-24 bg-[#007AFF] mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {Object.keys(SPORT_NAME).map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 h-72" data-testid={`sport-card-${s}`}>
              <img src={SPORT_IMG[s]} alt={SPORT_NAME[s]} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <span className="label-tag text-xs text-[#FF3B30]">{s}</span>
                <h3 className="font-display text-3xl">{SPORT_NAME[s]}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RECENT RESULTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16" data-testid="recent-results-section">
        <h2 className="font-display text-4xl sm:text-5xl mb-2">{t("recent")}</h2>
        <div className="h-1 w-24 bg-[#22C55E] mb-8" />
        {matches.length === 0 ? <p className="text-zinc-500">No completed matches yet. Scores will appear here.</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <div key={m.id} className="card-tech rounded-xl p-5" data-testid={`result-box-${m.id}`}>
                <span className="label-tag text-xs text-zinc-500">{SPORT_NAME[m.sport]} · R{m.round}</span>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold" style={{ color: TEAM_COLOR[m.team1] }}>{m.team1}</span>
                  <span className="font-display text-3xl">{m.team1_score} - {m.team2_score}</span>
                  <span className="font-semibold" style={{ color: TEAM_COLOR[m.team2] }}>{m.team2}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
