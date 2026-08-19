export interface LanguageConfig {
  code: string;
  locale: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: "en",
    locale: "en-US",
    name: "English",
    nativeName: "English",
    speechCode: "en-US",
  },
  kn: {
    code: "kn",
    locale: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    speechCode: "kn-IN",
  },
  hi: {
    code: "hi",
    locale: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    speechCode: "hi-IN",
  },
  te: {
    code: "te",
    locale: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    speechCode: "te-IN",
  },
  ta: {
    code: "ta",
    locale: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    speechCode: "ta-IN",
  },
  mr: {
    code: "mr",
    locale: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
    speechCode: "mr-IN",
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
