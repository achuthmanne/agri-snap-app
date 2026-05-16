import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LangType = "te" | "en";

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: any) => {
  // 1. 🔥 ఇక్కడ డీఫాల్ట్ గా "te" అని మార్చాను
  const [language, setLanguage] = useState<LangType>("te");

  // 🔥 load saved language once
  useEffect(() => {
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem("APP_LANG");
      if (saved === "te" || saved === "en") {
        setLanguage(saved);
      } else {
        // 2. 🔥 ఫస్ట్ టైమ్ యాప్ ఓపెన్ చేస్తే స్టోరేజ్ లో ఏమీ ఉండదు కాబట్టి, ఆటోమేటిక్ గా 'te' సేవ్ అవుతుంది
        setLanguage("te");
        AsyncStorage.setItem("APP_LANG", "te");
      }
    };
    loadLang();
  }, []);

  const changeLanguage = (lang: LangType) => {
    setLanguage(lang); // 🔥 instant UI

    // 🔥 background save (no await)
    AsyncStorage.setItem("APP_LANG", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);