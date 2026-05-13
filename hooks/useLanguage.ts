"use client";
// Re-exports the shared language context as a convenient hook.
// All components calling useLanguage() share the SAME language state.
export { useLanguageContext as useLanguage } from "@/contexts/LanguageContext";
