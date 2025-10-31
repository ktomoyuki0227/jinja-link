import { createClient } from "@supabase/supabase-js";
import { envConfig } from "./env";

export const supabase = createClient(
  envConfig.supabaseUrl,
  envConfig.supabaseAnonKey
);
