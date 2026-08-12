import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, Trophy, LogOut } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { fileUrl } from "../lib/api";

const langs = [{ c: "en", l: "EN" }, { c: "hi", l: "हिं" }, { c: "pa", l: "ਪੰ" }];

export const Navbar = () => {
  const { t, lang, setLang } = useLang();
  const { isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to: "/tournament", label: t("tournament") },
    { to: "/matches", label: t("matches") },
    { to: "/rankings", label: t("rankings") },
    { to: "/developer", label: t("developer") },
    { to: "/history", label: t("history") },
    { to: "/gallery", label: t("gallery") },
    { to: "/rules", label: "Rules" },
  ];
  
  const logo = settings?.logo_url ? (settings.logo_url.startsWith("http") ? settings.logo_url : fileUrl(settings.logo_url)) : null;

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/10" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="nav-logo-link" onClick={() => setOpen(false)}>
          {logo ? <img src={logo} alt="logo" className="h-9 w-9 rounded-full object-cover border border-white/20" />
            : <span className="h-9 w-9 rounded-full bg-[#FF3B30] flex items-center justify-center"><Trophy size={18} /></span>}
          <span className="font-display text-xl hidden sm:block tracking-wide">{settings?.league_name || "IISER LEAGUE"}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.to.slice(1)}`}
              className={`text-sm font-medium transition-colors hover:text-[#FF3B30] ${loc.pathname === l.to ? "text-[#FF3B30]" : "text-zinc-300"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button data-testid="lang-toggle" onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-white/15 hover:border-white/40 transition-colors text-sm">
              <Globe size={16} /> {langs.find((x) => x.c === lang)?.l}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-24 bg-[#141414] border border-white/15 rounded-lg overflow-hidden">
                {langs.map((x) => (
                  <button key={x.c} data-testid={`lang-${x.c}`} onClick={() => { setLang(x.c); setLangOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">{x.l}</button>
                ))}
              </div>
            )}
          </div>
          {isAdmin && (
            <>
              <Link to="/admin" data-testid="nav-admin" className="hidden sm:block text-sm px-3 py-1.5 rounded-full bg-[#FF3B30] font-semibold">Admin</Link>
              <button data-testid="nav-logout" onClick={logout} className="p-2 rounded-full border border-white/15 hover:border-white/40"><LogOut size={16} /></button>
            </>
          )}
          <button className="lg:hidden p-2" data-testid="nav-mobile-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass border-t border-white/10 px-4 py-4 flex flex-col gap-1" data-testid="mobile-menu">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="py-2.5 text-base font-medium border-b border-white/5 hover:text-[#FF3B30]">{l.label}</Link>
          ))}
          {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-2.5 text-[#FF3B30] font-semibold">Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
};
