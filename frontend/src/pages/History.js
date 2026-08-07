import { useSettings } from "../context/SettingsContext";
import { PageHead } from "../components/shared";
import { motion } from "framer-motion";

export default function History() {
  const { settings } = useSettings();
  const history = settings?.history || [];

  return (
    <div className="min-h-screen">
      <PageHead label="History" title="OUR STORY" accent="#FF3B30" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {history.length === 0 ? (
          <p className="text-zinc-500">The history timeline is empty. Years and milestones will be added by the developer.</p>
        ) : (
          <div className="relative border-l-2 border-white/10 pl-8 space-y-10">
            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="relative" data-testid={`history-item-${i}`}>
                <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-[#FF3B30] border-2 border-black" />
                <h3 className="font-display text-4xl text-[#FF3B30]">{h.year}</h3>
                <p className="text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">{h.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
