"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/utils/i18n";
import { languageNames } from "@/utils/i18n";

const langs: { code: Language; flag: string }[] = [
  { code: "hi", flag: "🇮🇳" },
  { code: "en", flag: "🇬🇧" },
  { code: "pa", flag: "🇮🇳" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{
      display: "flex", gap: "4px", alignItems: "center",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px", padding: "3px",
    }}>
      {langs.map(({ code, flag }) => {
        const active = language === code;
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            aria-label={`Switch to ${languageNames[code]}`}
            style={{
              position: "relative",
              padding: "6px 14px",
              borderRadius: "9px",
              border: "none",
              background: "transparent",
              color: active ? "#4ADE80" : "#64748B",
              fontSize: "12px",
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
              transition: "color 0.2s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 1,
            }}
          >
            {active && (
              <motion.div
                layoutId="lang-indicator"
                style={{
                  position: "absolute", inset: 0,
                  borderRadius: "9px",
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ fontSize: "13px" }}>{flag}</span>
            {languageNames[code]}
          </button>
        );
      })}
    </div>
  );
}
