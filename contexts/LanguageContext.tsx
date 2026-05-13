"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Language } from "@/utils/i18n";
import { translate } from "@/utils/i18n";

const STORAGE_KEY = "kisansathi_language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en" on server to avoid SSR mismatch; sync with localStorage after hydration
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && saved !== language) {
      setLanguageState(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string) => translate(key, language),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  // During SSR the context may not exist yet — return a safe "en" fallback
  if (!ctx) {
    return {
      language: "en",
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return ctx;
}
