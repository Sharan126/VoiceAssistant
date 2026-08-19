export interface SupportedLanguage {
  code: string;
  locale: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: "en",
    locale: "en-US",
    name: "English",
    nativeName: "English (US / Global)",
    speechCode: "en-US",
  },
  {
    code: "kn",
    locale: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ (Kannada)",
    speechCode: "kn-IN",
  },
  {
    code: "hi",
    locale: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी (Hindi)",
    speechCode: "hi-IN",
  },
  {
    code: "te",
    locale: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు (Telugu)",
    speechCode: "te-IN",
  },
  {
    code: "ta",
    locale: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ் (Tamil)",
    speechCode: "ta-IN",
  },
  {
    code: "mr",
    locale: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी (Marathi)",
    speechCode: "mr-IN",
  },
];

export type ResponseStyle = "conversational" | "concise" | "detailed" | "technical";

export interface ResponseStyleOption {
  id: ResponseStyle;
  label: string;
  description: string;
}

export const RESPONSE_STYLES: ResponseStyleOption[] = [
  {
    id: "conversational",
    label: "Conversational",
    description: "Friendly, balanced, and natural voice dialogue.",
  },
  {
    id: "concise",
    label: "Concise",
    description: "Short, direct, high-density answers without filler.",
  },
  {
    id: "detailed",
    label: "Detailed & In-depth",
    description: "Thorough explanations with rich background context.",
  },
  {
    id: "technical",
    label: "Technical & Code-First",
    description: "Engineered for software developers with precise syntax and deep technical nuances.",
  },
];

export type ThemeOption = "dark" | "light" | "system";

export const DEFAULT_USER_SETTINGS = {
  voice: "default",
  speaking_speed: 1.0,
  auto_play: true,
  memory_enabled: true,
  theme: "dark",
  language: "en",
  response_style: "conversational",
};
