// KisanSathi - Internationalization (i18n)
// Supports: English, Hindi, Punjabi

type Language = "en" | "hi" | "pa";

type Translations = {
  [key: string]: {
    en: string;
    hi: string;
    pa: string;
  };
};

export const translations: Translations = {
  // Navigation
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", pa: "ਡੈਸ਼ਬੋਰਡ" },
  disease_detection: { en: "Disease Detection", hi: "रोग पहचान", pa: "ਰੋਗ ਪਛਾਣ" },
  fertilizer: { en: "Fertilizer AI", hi: "उर्वरक AI", pa: "ਖਾਦ AI" },
  weather: { en: "Weather", hi: "मौसम", pa: "ਮੌਸਮ" },
  chat: { en: "AI Chatbot", hi: "AI चैट", pa: "AI ਚੈਟ" },
  crops: { en: "Crop Advice", hi: "फसल सलाह", pa: "ਫਸਲ ਸਲਾਹ" },
  yield: { en: "Yield Prediction", hi: "उत्पाद भविष्यवाणी", pa: "ਉਤਪਾਦਨ ਭਵਿੱਖਬਾਣੀ" },
  reports: { en: "Reports", hi: "रिपोर्ट", pa: "ਰਿਪੋਰਟਾਂ" },
  notifications: { en: "Notifications", hi: "सूचनाएं", pa: "ਸੂਚਨਾਵਾਂ" },

  // Auth
  login: { en: "Login", hi: "लॉगिन", pa: "ਲੌਗਿਨ" },
  signup: { en: "Sign Up", hi: "साइन अप", pa: "ਸਾਈਨ ਅੱਪ" },
  logout: { en: "Logout", hi: "लॉगआउट", pa: "ਲੌਗਆਊਟ" },
  start_free: { en: "Start Free", hi: "मुफ्त शुरू करें", pa: "ਮੁਫਤ ਸ਼ੁਰੂ ਕਰੋ" },

  // Dashboard
  welcome: { en: "Welcome back", hi: "वापस स्वागत है", pa: "ਵਾਪਸ ਸੁਆਗਤ ਹੈ" },
  crop_health: { en: "Crop Health Score", hi: "फसल स्वास्थ्य स्कोर", pa: "ਫਸਲ ਸਿਹਤ ਸਕੋਰ" },
  quick_actions: { en: "Quick Actions", hi: "त्वरित कार्य", pa: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ" },
  ai_alerts: { en: "AI Alerts", hi: "AI अलर्ट", pa: "AI ਅਲਰਟ" },

  // Disease
  upload_image: { en: "Upload Plant Image", hi: "पौधे की फोटो अपलोड करें", pa: "ਪੌਦੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ" },
  analyze: { en: "Analyze Disease", hi: "रोग विश्लेषण करें", pa: "ਰੋਗ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ" },
  treatment: { en: "Treatment", hi: "उपचार", pa: "ਇਲਾਜ" },
  severity: { en: "Severity", hi: "गंभीरता", pa: "ਗੰਭੀਰਤਾ" },

  // Chat
  type_message: { en: "Type your farming question...", hi: "अपना खेती का सवाल टाइप करें...", pa: "ਆਪਣਾ ਖੇਤੀ ਸਵਾਲ ਟਾਈਪ ਕਰੋ..." },
  send: { en: "Send", hi: "भेजें", pa: "ਭੇਜੋ" },

  // Weather
  get_weather: { en: "Get Weather", hi: "मौसम देखें", pa: "ਮੌਸਮ ਵੇਖੋ" },
  farming_alerts: { en: "Farming Alerts", hi: "खेती अलर्ट", pa: "ਖੇਤੀ ਅਲਰਟ" },
  temperature: { en: "Temperature", hi: "तापमान", pa: "ਤਾਪਮਾਨ" },
  humidity: { en: "Humidity", hi: "नमी", pa: "ਨਮੀ" },
  wind_speed: { en: "Wind Speed", hi: "हवा की गति", pa: "ਹਵਾ ਦੀ ਗਤੀ" },

  // Crops
  recommend_crops: { en: "Get Crop Recommendations", hi: "फसल सिफारिश पाएं", pa: "ਫਸਲ ਸਿਫਾਰਿਸ਼ ਪਾਓ" },
  soil_type: { en: "Soil Type", hi: "मिट्टी का प्रकार", pa: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ" },
  season: { en: "Season", hi: "मौसम", pa: "ਮੌਸਮ" },

  // General
  loading: { en: "Loading...", hi: "लोड हो रहा है...", pa: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
  error: { en: "Something went wrong", hi: "कुछ गलत हुआ", pa: "ਕੁਝ ਗਲਤ ਹੋਇਆ" },
  success: { en: "Success!", hi: "सफलता!", pa: "ਸਫਲਤਾ!" },
  download: { en: "Download", hi: "डाउनलोड", pa: "ਡਾਊਨਲੋਡ" },
  share: { en: "Share", hi: "शेयर करें", pa: "ਸਾਂਝਾ ਕਰੋ" },
  submit: { en: "Submit", hi: "जमा करें", pa: "ਜਮ੍ਹਾਂ ਕਰੋ" },
  cancel: { en: "Cancel", hi: "रद्द करें", pa: "ਰੱਦ ਕਰੋ" },
  save: { en: "Save", hi: "सहेजें", pa: "ਸੇਵ ਕਰੋ" },
  result: { en: "Analysis Result", hi: "विश्लेषण परिणाम", pa: "ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ" },
};

export function translate(key: string, language: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[language] || entry.en || key;
}

export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "\u0939\u093F\u0902\u0926\u0940",
  pa: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
};

export const languageFlags: Record<Language, string> = {
  en: "GB",
  hi: "IN",
  pa: "IN",
};

export type { Language };
