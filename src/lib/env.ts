export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  ioIntelligenceApiKey: string;
  ioIntelligenceApiUrl: string;
  debugMode: boolean;
}

export const envConfig: EnvConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  ioIntelligenceApiKey: process.env.NEXT_PUBLIC_IO_INTELLIGENCE_API_KEY || "",
  ioIntelligenceApiUrl:
    process.env.NEXT_PUBLIC_IO_INTELLIGENCE_API_URL ||
    "https://api.io-intelligence.ai",
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
};

// Validation
if (
  !envConfig.supabaseUrl ||
  !envConfig.supabaseAnonKey ||
  !envConfig.ioIntelligenceApiKey
) {
  if (typeof window === "undefined") {
    console.warn(
      "⚠️  Missing required environment variables. Please check .env.local"
    );
  }
}
