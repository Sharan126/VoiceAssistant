export const APP_CONFIG = {
  name: "Aura Voice",
  description: "Next-generation AI voice assistant with low-latency streaming and real-time reasoning.",
  version: "0.1.0",
  routes: {
    home: "/",
    login: "/login",
    signup: "/signup",
    app: "/app",
    authCallback: "/auth/callback",
    authSignout: "/auth/signout",
  },
  links: {
    github: "https://github.com",
    docs: "/docs",
  },
} as const;

export const AUTH_STORAGE_KEYS = {
  session: "aura-voice-session",
} as const;
