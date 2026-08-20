import { LANGUAGES, type LanguageConfig } from "./languages";

export interface DetectionResult {
  language: string;
  speechCode: string;
  confidence: number;
  isExplicitRequest: boolean;
  languageConfig: LanguageConfig;
}

function getLangConfig(lang = "en"): LanguageConfig {
  return LANGUAGES[lang] || LANGUAGES["en"] || {
    code: "en",
    locale: "en-US",
    name: "English",
    nativeName: "English",
    speechCode: "en-US",
  };
}

/**
 * Explicit language override triggers across supported languages
 */
const EXPLICIT_TRIGGERS: { pattern: RegExp; lang: string }[] = [
  { pattern: /(?:kannada|ಕನ್ನಡ|\bin kn\b|ಕನ್ನಡದಲ್ಲಿ|kannadadb)/i, lang: "kn" },
  { pattern: /(?:hindi|हिंदी|\bin hi\b|हिंदी में|हिन्दी में)/i, lang: "hi" },
  { pattern: /(?:telugu|తెలుగు|\bin te\b|తెలుగులో)/i, lang: "te" },
  { pattern: /(?:tamil|தமிழ்|\bin ta\b|தமிழில்)/i, lang: "ta" },
  { pattern: /(?:marathi|मराठी|\bin mr\b|मराठीत)/i, lang: "mr" },
  { pattern: /(?:english|\bin en\b|in english|ಇಂಗ್ಲಿಷ್|अंग्रेजी|ఇంగ్లీష్|ஆங்கிலம்|इंग्रजीत)/i, lang: "en" },
];

/**
 * Lexical markers to distinguish Devanagari Hindi vs Marathi
 */
const MARATHI_MARKERS = /(?:आहे|आहेत|मला|आणि|करून|उद्या|नाही|काय|कसे|माझे|तुमचे|करा|आपण|झाले|हवे|अभ्यासाची|आठवण)/i;
const HINDI_MARKERS = /(?:मुझे|और|करो|कल|नहीं|क्या|कैसे|मेरा|आपका|करें|होगा|चाहिए|याद|दिलाना)/i;

/**
 * Robust Automatic Language Detector
 * Analyzes Unicode script frequencies and explicit triggers in input text.
 */
export function detectLanguage(input: string, fallbackLang = "en"): DetectionResult {
  const text = (input || "").trim();
  if (!text) {
    const config = getLangConfig(fallbackLang);
    return {
      language: config.code,
      speechCode: config.speechCode,
      confidence: 1.0,
      isExplicitRequest: false,
      languageConfig: config,
    };
  }

  // 1. Check for explicit language requests (e.g. "कन्नडದಲ್ಲಿ ಉತ್ತರಿಸಿ", "Answer in English", "हिंदी में जवाब दो")
  for (const trigger of EXPLICIT_TRIGGERS) {
    if (trigger.pattern.test(text)) {
      const config = getLangConfig(trigger.lang);
      return {
        language: config.code,
        speechCode: config.speechCode,
        confidence: 0.98,
        isExplicitRequest: true,
        languageConfig: config,
      };
    }
  }

  // 2. Count script characters in Unicode ranges
  let kannadaCount = 0;
  let devanagariCount = 0;
  let teluguCount = 0;
  let tamilCount = 0;
  let latinCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // Kannada: U+0C80 to U+0CFF
    if (code >= 0x0c80 && code <= 0x0cff) {
      kannadaCount++;
    }
    // Devanagari (Hindi / Marathi): U+0900 to U+097F
    else if (code >= 0x0900 && code <= 0x097f) {
      devanagariCount++;
    }
    // Telugu: U+0C00 to U+0C7F
    else if (code >= 0x0c00 && code <= 0x0c7f) {
      teluguCount++;
    }
    // Tamil: U+0B80 to U+0BFF
    else if (code >= 0x0b80 && code <= 0x0bff) {
      tamilCount++;
    }
    // Latin / English
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    }
  }

  const IndicTotal = kannadaCount + devanagariCount + teluguCount + tamilCount;

  // 3. Evaluate highest Indic script frequency
  if (IndicTotal > 0 && IndicTotal >= Math.max(1, Math.floor(latinCount * 0.3))) {
    if (kannadaCount >= devanagariCount && kannadaCount >= teluguCount && kannadaCount >= tamilCount) {
      const config = getLangConfig("kn");
      return {
        language: "kn",
        speechCode: config.speechCode,
        confidence: Math.min(0.99, kannadaCount / (text.length || 1)),
        isExplicitRequest: false,
        languageConfig: config,
      };
    }

    if (teluguCount >= devanagariCount && teluguCount >= tamilCount) {
      const config = getLangConfig("te");
      return {
        language: "te",
        speechCode: config.speechCode,
        confidence: Math.min(0.99, teluguCount / (text.length || 1)),
        isExplicitRequest: false,
        languageConfig: config,
      };
    }

    if (tamilCount >= devanagariCount) {
      const config = getLangConfig("ta");
      return {
        language: "ta",
        speechCode: config.speechCode,
        confidence: Math.min(0.99, tamilCount / (text.length || 1)),
        isExplicitRequest: false,
        languageConfig: config,
      };
    }

    if (devanagariCount > 0) {
      // Distinguish Marathi vs Hindi using lexical markers
      const isMarathi = MARATHI_MARKERS.test(text);
      const isHindi = HINDI_MARKERS.test(text);
      const langCode = isMarathi && !isHindi ? "mr" : "hi";
      const config = getLangConfig(langCode);

      return {
        language: langCode,
        speechCode: config.speechCode,
        confidence: Math.min(0.99, devanagariCount / (text.length || 1)),
        isExplicitRequest: false,
        languageConfig: config,
      };
    }
  }

  // 4. Default to English or provided fallback
  const finalLang = latinCount > 0 ? "en" : fallbackLang;
  const config = getLangConfig(finalLang);

  return {
    language: config.code,
    speechCode: config.speechCode,
    confidence: 0.9,
    isExplicitRequest: false,
    languageConfig: config,
  };
}
