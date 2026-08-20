export interface TranslationDictionary {
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    subheading: string;
  };
  prompts: {
    planDay: { title: string; prompt: string };
    explain: { title: string; prompt: string };
    webSearch: { title: string; prompt: string };
    reminder: { title: string; prompt: string };
    coding: { title: string; prompt: string };
  };
  status: {
    tapToSpeak: string;
    listening: string;
    processing: string;
    thinking: string;
    speaking: string;
    toolExecution: string;
    error: string;
    retry: string;
  };
  input: {
    placeholder: string;
    listeningPlaceholder: string;
    send: string;
  };
  actions: {
    newChat: string;
    autoPlay: string;
    voiceActive: string;
    voiceInactive: string;
    voiceLabel: string;
    preferences: string;
    memoryHub: string;
    stopGenerating: string;
    clear: string;
  };
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    greetings: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      subheading: "How can I help you today?",
    },
    prompts: {
      planDay: { title: "Plan my day", prompt: "Help me structure my schedule and top priorities for today." },
      explain: { title: "Explain a concept", prompt: "Explain quantum computing in simple terms with examples." },
      webSearch: { title: "Search web news", prompt: "What is the latest news and updates regarding ISRO?" },
      reminder: { title: "Set a reminder", prompt: "Remind me to study algorithms tomorrow at 9 AM." },
      coding: { title: "Help me code", prompt: "Write a clean TypeScript debounce hook with React." },
    },
    status: {
      tapToSpeak: "Tap to speak",
      listening: "Listening...",
      processing: "Processing speech...",
      thinking: "Thinking...",
      speaking: "Speaking...",
      toolExecution: "Executing tool...",
      error: "Couldn't understand that. Try again.",
      retry: "Tap to retry",
    },
    input: {
      placeholder: "Ask anything or tap the mic to speak...",
      listeningPlaceholder: "Listening to your voice...",
      send: "Send message",
    },
    actions: {
      newChat: "New Chat",
      autoPlay: "Voice Output",
      voiceActive: "Voice: Active",
      voiceInactive: "Voice: Inactive",
      voiceLabel: "Voice Response Mode",
      preferences: "Preferences",
      memoryHub: "Memory Hub",
      stopGenerating: "Stop generating",
      clear: "Clear",
    },
  },

  kn: {
    greetings: {
      morning: "ಶುಭೋದಯ",
      afternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
      evening: "ಶುಭ ಸಂಜೆ",
      subheading: "ನಾನು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    },
    prompts: {
      planDay: { title: "ದಿನದ ಯೋಜನೆ", prompt: "ಇಂದಿನ ನನ್ನ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಮುಖ್ಯ ಕೆಲಸಗಳನ್ನು ಯೋಜಿಸಲು ಸಹಾಯ ಮಾಡಿ." },
      explain: { title: "ವಿವರಣೆ ಪಡೆಯಿರಿ", prompt: "ಕ್ವಾಂಟಮ್ ಕಂಪ್ಯೂಟಿಂಗ್ ಅನ್ನು ಸರಳವಾಗಿ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ವಿವರಿಸಿ." },
      webSearch: { title: "ಸುದ್ದಿ ಹುಡುಕಿ", prompt: "ಇಸ್ರೋ ಬಗ್ಗೆ ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು ಮತ್ತು ನವೀಕರಣಗಳು ಯಾವುವು?" },
      reminder: { title: "ಜ್ಞಾಪನೆ ಹೊಂದಿಸಿ", prompt: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 9 ಗಂಟೆಗೆ ಓದಲು ನನಗೆ ನೆನಪಿಸಿ." },
      coding: { title: "ಕೋಡಿಂಗ್ ಸಹಾಯ", prompt: "ಜಾವಾಸ್ಕ್ರಿಪ್ಟ್‌ನಲ್ಲಿ ಅಲ್ಗಾರಿದಮ್ ಬರೆಯಲು ಸಹಾಯ ಮಾಡಿ." },
    },
    status: {
      tapToSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿರಿ",
      listening: "ಆಲಿಸುತ್ತಿದೆ...",
      processing: "ಧ್ವನಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
      thinking: "ಯೋಚಿಸುತ್ತಿದೆ...",
      speaking: "ಮಾತನಾಡುತ್ತಿದೆ...",
      toolExecution: "ಉಪಕರಣ ಚಾಲನೆಯಾಗುತ್ತಿದೆ...",
      error: "ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    },
    input: {
      placeholder: "ಏನನ್ನಾದರೂ ಕೇಳಿ ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ...",
      listeningPlaceholder: "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸುತ್ತಿದೆ...",
      send: "ಕಳುಹಿಸಿ",
    },
    actions: {
      newChat: "ಹೊಸ ಸಂಭಾಷಣೆ",
      autoPlay: "ಧ್ವನಿ ಔಟ್‌ಪುಟ್",
      voiceActive: "ಧ್ವನಿ: ಸಕ್ರಿಯ",
      voiceInactive: "ಧ್ವನಿ: ನಿಷ್ಕ್ರಿಯ",
      voiceLabel: "ಧ್ವನಿ ಪ್ರತಿಕ್ರಿಯೆ ರೂಪ",
      preferences: "ಆದ್ಯತೆಗಳು",
      memoryHub: "ನೆನಪಿನ ಕೇಂದ್ರ",
      stopGenerating: "ನಿಲ್ಲಿಸಿ",
      clear: "ಅಳಿಸಿ",
    },
  },

  hi: {
    greetings: {
      morning: "शुभ प्रभात",
      afternoon: "शुभ दोपहर",
      evening: "शुभ संध्या",
      subheading: "आज मैं आपकी क्या सहायता कर सकता हूँ?",
    },
    prompts: {
      planDay: { title: "दिन की योजना बनाएं", prompt: "आज के मेरे शेड्यूल और प्राथमिकताओं को व्यवस्थित करने में मदद करें।" },
      explain: { title: "अवधारणा समझें", prompt: "क्वांटम कंप्यूटिंग को सरल शब्दों में उदाहरण सहित समझाएं।" },
      webSearch: { title: "ताज़ा समाचार", prompt: "इसरो (ISRO) के बारे में नवीनतम समाचार क्या हैं?" },
      reminder: { title: "रिमाइंडर सेट करें", prompt: "मुझे कल सुबह 9 बजे अध्ययन करने का रिमाइंडर दें।" },
      coding: { title: "कोडिंग सहायता", prompt: "टाइपस्क्रिप्ट में एक उपयोगी फ़ंक्शन लिखकर समझाएं।" },
    },
    status: {
      tapToSpeak: "बोलने के लिए टैप करें",
      listening: "सुन रहा हूँ...",
      processing: "आवाज़ प्रोसेस हो रही है...",
      thinking: "सोच रहा हूँ...",
      speaking: "बोल रहा हूँ...",
      toolExecution: "टूल निष्पादित हो रहा है...",
      error: "समझ नहीं पाया। कृपया पुनः प्रयास करें।",
      retry: "पुनः प्रयास करें",
    },
    input: {
      placeholder: "कुछ भी पूछें या बोलने के लिए माइक दबाएं...",
      listeningPlaceholder: "आपकी आवाज़ सुन रहा हूँ...",
      send: "भेजें",
    },
    actions: {
      newChat: "नया चैट",
      autoPlay: "वॉइस आउटपुट",
      voiceActive: "आवाज़: सक्रिय",
      voiceInactive: "आवाज़: निष्क्रिय",
      voiceLabel: "आवाज़ प्रतिक्रिया मोड",
      preferences: "प्राथमिकताएं",
      memoryHub: "मेमोरी हब",
      stopGenerating: "रोकें",
      clear: "साफ़ करें",
    },
  },

  te: {
    greetings: {
      morning: "శుభోదయం",
      afternoon: "శుభ మధ్యాహ్నం",
      evening: "శుభ సాయంత్రం",
      subheading: "నేను మీకు ఈ రోజు ఎలా సహాయపడగలను?",
    },
    prompts: {
      planDay: { title: "రోజు ప్రణాళిక", prompt: "ఈ రోజు నా షెడ్యూల్ మరియు ప్రాధాన్యతలను ప్లాన్ చేయడంలో సహాయం చేయండి." },
      explain: { title: "వివరణ పొందండి", prompt: "క్వాంటమ్ కంప్యూటింగ్‌ను ఉదాహరణలతో సులభంగా వివరించండి." },
      webSearch: { title: "తాజా వార్తలు", prompt: "ఇస్రో గురించి తాజా వార్తలు ఏమిటి?" },
      reminder: { title: "రిమైండర్ పెట్టండి", prompt: "రేపు ఉదయం 9 గంటలకు చదువుకోవాలని నాకు గుర్తు చేయండి." },
      coding: { title: "కోడింగ్ సహాయం", prompt: "రియాక్ట్ కోసం ఉపయోగకరమైన కోడ్ రాయండి." },
    },
    status: {
      tapToSpeak: "మాట్లాడటానికి నొక్కండి",
      listening: "వింటోంది...",
      processing: "వాయిస్ ప్రాసెస్ అవుతోంది...",
      thinking: "ఆలోచిస్తోంది...",
      speaking: "మాట్లాడుతోంది...",
      toolExecution: "టూల్ అమలు అవుతోంది...",
      error: "అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
      retry: "మళ్లీ ప్రయత్నించండి",
    },
    input: {
      placeholder: "ఏదైనా అడగండి లేదా మైక్ నొక్కండి...",
      listeningPlaceholder: "మీ వాయిస్ వింటోంది...",
      send: "పంపు",
    },
    actions: {
      newChat: "కొత్త సంభాషణ",
      autoPlay: "వాయిస్ అవుట్‌పుట్",
      voiceActive: "వాయిస్: యాక్టివ్",
      voiceInactive: "వాయిస్: ఇన్యాక్టివ్",
      voiceLabel: "వాయిస్ ప్రతిస్పందన విధానం",
      preferences: "ప్రాధాన్యతలు",
      memoryHub: "మెమరీ హబ్",
      stopGenerating: "ఆపు",
      clear: "క్లియర్ చేయండి",
    },
  },

  ta: {
    greetings: {
      morning: "காலை வணக்கம்",
      afternoon: "மதிய வணக்கம்",
      evening: "மாலை வணக்கம்",
      subheading: "இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    },
    prompts: {
      planDay: { title: "நாள் திட்டமிடல்", prompt: "இன்றைய அட்டவணை மற்றும் பணிகளை திட்டமிட உதவுங்கள்." },
      explain: { title: "கருத்து விளக்கம்", prompt: "குவாண்டம் கம்ப்யூட்டிங் பற்றி எளிய முறையில் விளக்குங்கள்." },
      webSearch: { title: "செய்திகள் தேடுங்கள்", prompt: "இஸ்ரோ பற்றிய சமீபத்திய செய்திகள் என்ன?" },
      reminder: { title: "நினைவூட்டல் அமைக்கவும்", prompt: "நாளை காலை 9 மணிக்கு படிக்க நினைவூட்டுங்கள்." },
      coding: { title: "குறியீட்டு உதவி", prompt: "ஜாவாஸ்கிரிப்ட் குறியீடு எழுத உதவுங்கள்." },
    },
    status: {
      tapToSpeak: "பேச தட்டவும்",
      listening: "கேட்கிறது...",
      processing: "குரல் செயலாக்கப்படுகிறது...",
      thinking: "யோசிக்கிறது...",
      speaking: "பேசுகிறது...",
      toolExecution: "கருவி இயங்குகிறது...",
      error: "புரியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      retry: "மீண்டும் முயற்சிக்கவும்",
    },
    input: {
      placeholder: "ஏதேனும் கேட்கவும் அல்லது மைக்கை தட்டவும்...",
      listeningPlaceholder: "உங்கள் குரலைக் கேட்கிறது...",
      send: "அனுப்பு",
    },
    actions: {
      newChat: "புதிய உரையாடல்",
      autoPlay: "குரல் வெளியீடு",
      voiceActive: "குரல்: ஆக்டிவ்",
      voiceInactive: "குரல்: இன்ஆக்டிவ்",
      voiceLabel: "குரல் பதில் முறை",
      preferences: "விருப்பத்தேர்வுகள்",
      memoryHub: "நினைவக மையம்",
      stopGenerating: "நிறுத்து",
      clear: "அழி",
    },
  },

  mr: {
    greetings: {
      morning: "शुभ प्रभात",
      afternoon: "शुभ दुपार",
      evening: "शुभ संध्याकाळ",
      subheading: "आज मी तुम्हाला कशी मदत करू शकतो?",
    },
    prompts: {
      planDay: { title: "दिवसाचे नियोजन", prompt: "आजचे माझे वेळापत्रक आणि कामे ठरवण्यात मदत करा." },
      explain: { title: "संकल्पना समजून घ्या", prompt: "क्वांटम कॉम्प्युटिंग सोप्या भाषेत उदाहरणासह समजावून सांगा." },
      webSearch: { title: "ताज्या बातम्या", prompt: "इस्रोबद्दल ताज्या बातम्या आणि अपडेट्स काय आहेत?" },
      reminder: { title: "स्मरणपत्र सेट करा", prompt: "मला उद्या सकाळी ९ वाजता अभ्यासाची आठवण करून द्या." },
      coding: { title: "कोडिंग मदत", prompt: "टाईपस्क्रिप्टमध्ये उपयुक्त फंक्शन लिहून दाखवा." },
    },
    status: {
      tapToSpeak: "बोलण्यासाठी टॅप करा",
      listening: "ऐकत आहे...",
      processing: "आवाज प्रक्रिया होत आहे...",
      thinking: "विचार करत आहे...",
      speaking: "बोलत आहे...",
      toolExecution: "टूल कार्यरत आहे...",
      error: "समजले नाही. कृपया पुन्हा प्रयत्न करा.",
      retry: "पुन्हा प्रयत्न करा",
    },
    input: {
      placeholder: "काहीही विचारा किंवा बोलण्यासाठी माइक दाबा...",
      listeningPlaceholder: "तुमचा आवाज ऐकत आहे...",
      send: "पाठवा",
    },
    actions: {
      newChat: "नवीन चॅट",
      autoPlay: "आवाज आऊटपुट",
      voiceActive: "आवाज: सक्रिय",
      voiceInactive: "आवाज: निष्क्रिय",
      voiceLabel: "आवाज प्रतिसाद मोड",
      preferences: "पसंती",
      memoryHub: "मेमरी हब",
      stopGenerating: "थांबवा",
      clear: "साफ करा",
    },
  },
};
