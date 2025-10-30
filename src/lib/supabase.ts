import { createClient } from "@supabase/supabase-js";
import { envConfig } from "./env";

export const supabase = createClient(
  envConfig.supabaseUrl,
  envConfig.supabaseAnonKey
);

// Type-safe database queries
import type { Database } from "@/types/supabase";

export const db = supabase as ReturnType<typeof createClient<Database>>;
