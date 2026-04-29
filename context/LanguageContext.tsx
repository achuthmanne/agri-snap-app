import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LangType = "te" | "en";

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState<LangType>("en");

  // 🔥 load saved language once
  useEffect(() => {
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem("APP_LANG");
      if (saved === "te" || saved === "en") {
        setLanguage(saved);
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