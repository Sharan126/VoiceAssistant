import { LANGUAGES, type LanguageConfig } from "./languages";
import { TRANSLATIONS, type TranslationDictionary } from "./translations";

export * from "./languages";
export * from "./translations";

/**
 * Get localized translation dictionary for a language code (with English fallback)
 */
export function getTranslations(lang = "en"): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS["en"] || ({} as TranslationDictionary);
}

/**
 * Get language configuration by code
 */
export function getLanguageConfig(lang = "en"): LanguageConfig {
  return LANGUAGES[lang] || LANGUAGES["en"] || {
    code: "en",
    locale: "en-US",
    name: "English",
    nativeName: "English",
    speechCode: "en-US",
  };
}
