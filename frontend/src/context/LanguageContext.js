import { createContext, useContext, useState } from "react";

const dict = {
  en: {
    tournament: "Tournament & Events", matches: "Matches & Stats", rankings: "Rankings",
    developer: "Developer", history: "History", gallery: "Gallery", admin: "Admin",
    players: "The Players", sports: "The Sports", schedule: "Schedule",
    standings: "Standings", overall: "Overall", search: "Search players, teams, matches...",
    connect: "Connect With Us", join: "Join WhatsApp Group", login: "Admin Login",
    logout: "Logout", recent: "Recent Results", news: "News & Announcements",
  },
  hi: {
    tournament: "टूर्नामेंट और इवेंट", matches: "मैच और आँकड़े", rankings: "रैंकिंग",
    developer: "डेवलपर", history: "इतिहास", gallery: "गैलरी", admin: "एडमिन",
    players: "खिलाड़ी", sports: "खेल", schedule: "कार्यक्रम",
    standings: "अंक तालिका", overall: "कुल", search: "खिलाड़ी, टीम, मैच खोजें...",
    connect: "हमसे जुड़ें", join: "व्हाट्सएप ग्रुप में शामिल हों", login: "एडमिन लॉगिन",
    logout: "लॉगआउट", recent: "हाल के परिणाम", news: "समाचार और घोषणाएँ",
  },
  pa: {
    tournament: "ਟੂਰਨਾਮੈਂਟ ਅਤੇ ਸਮਾਗਮ", matches: "ਮੈਚ ਅਤੇ ਅੰਕੜੇ", rankings: "ਰੈਂਕਿੰਗ",
    developer: "ਡਿਵੈਲਪਰ", history: "ਇਤਿਹਾਸ", gallery: "ਗੈਲਰੀ", admin: "ਐਡਮਿਨ",
    players: "ਖਿਡਾਰੀ", sports: "ਖੇਡਾਂ", schedule: "ਸ਼ਡਿਊਲ",
    standings: "ਅੰਕ ਸੂਚੀ", overall: "ਕੁੱਲ", search: "ਖਿਡਾਰੀ, ਟੀਮਾਂ, ਮੈਚ ਖੋਜੋ...",
    connect: "ਸਾਡੇ ਨਾਲ ਜੁੜੋ", join: "ਵਟਸਐਪ ਗਰੁੱਪ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", login: "ਐਡਮਿਨ ਲੌਗਇਨ",
    logout: "ਲੌਗਆਊਟ", recent: "ਹਾਲੀਆ ਨਤੀਜੇ", news: "ਖ਼ਬਰਾਂ ਅਤੇ ਐਲਾਨ",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const change = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const t = (key) => (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang: change, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
