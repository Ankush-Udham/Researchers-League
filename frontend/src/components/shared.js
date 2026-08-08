
export const PageHead = ({ label, title, accent = "#FF3B30" }) => (
  <div className="pt-24 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
    <span className="label-tag text-xs" style={{ color: accent }}>{label}</span>
    <h1 className="font-display text-5xl sm:text-7xl tracking-tight mt-1">{title}</h1>
    <div className="h-1 w-28 mt-3" style={{ background: accent }} />
  </div>
);
