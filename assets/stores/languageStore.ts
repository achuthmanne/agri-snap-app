let currentLanguage: "te" | "en" = "en";

export const setAppLanguage = (lang: "te" | "en") => {
  currentLanguage = lang;
};

export const getAppLanguage = () => currentLanguage;