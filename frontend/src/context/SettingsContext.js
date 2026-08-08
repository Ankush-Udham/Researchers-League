import { createContext, useContext, useEffect, useState, useMemo } from "react";
import api from "../lib/api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  
  const refresh = () => api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  useEffect(() => { refresh(); }, []);

  // Dynamically rebuild the constants so the UI doesn't crash
  const SPORTS = useMemo(() => {
    if (!settings?.sports) return {};
    return settings.sports.reduce((acc, s) => ({ ...acc, [s.code]: s.name }), {});
  }, [settings]);

  const TEAM_COLOR = useMemo(() => {
    if (!settings?.teams) return {};
    return settings.teams.reduce((acc, t) => ({ ...acc, [t.name]: t.color }), {});
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, refresh, SPORTS, TEAM_COLOR }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
