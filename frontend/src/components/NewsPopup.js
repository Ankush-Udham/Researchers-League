import { useEffect, useState } from "react";
import api from "../lib/api";
import { X } from "lucide-react";

export default function NewsPopup() {
  const [news, setNews] = useState([]);
  const [closedIds, setClosedIds] = useState(new Set());

  // Fetch news when the website loads
  useEffect(() => {
    api.get("/news").then(r => setNews(r.data)).catch(() => {});
  }, []);

  // Filter out the news items the visitor has already closed
  const visibleNews = news.filter(n => !closedIds.has(n.id));

  if (visibleNews.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-[320px] max-w-[calc(100vw-32px)]">
      {visibleNews.map((n) => (
        <div key={n.id} className="bg-[#141414] border border-white/20 shadow-2xl rounded-xl p-4 relative animate-fade-in-up">
          
          <button 
            onClick={() => {
              const updated = new Set(closedIds);
              updated.add(n.id);
              setClosedIds(updated);
            }} 
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <h4 className="font-semibold text-white text-sm pr-5">{n.title}</h4>
          <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">{n.body}</p>
          
        </div>
      ))}
    </div>
  );
}
