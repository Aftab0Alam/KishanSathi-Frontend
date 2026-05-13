/**
 * KisanSathi - Supabase Client
 * Compatible with new key formats: sb_publishable_* and sb_secret_*
 * Uses latest @supabase/supabase-js SDK (no legacy JWT validation)
 */
import { createClient } from "@supabase/supabase-js";

// New Supabase key format support — no JWT format validation
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_placeholder";

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Modern PKCE flow — more secure than implicit
  },
  global: {
    headers: {
      "X-Client-Info": "kisansathi-ai/1.0.0",
    },
  },
});

export const supabaseConfigured = isConfigured;

// Type exports
export type UserRole = "farmer" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  state?: string;
  village?: string;
  farm_size?: number;
  role: UserRole;
  created_at: string;
}
