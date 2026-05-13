"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error?: string }>;
  role: "farmer" | "admin" | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"farmer" | "admin" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem("kisansathi_token", session.access_token);
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem("kisansathi_token", session.access_token);
        fetchRole(session.user.id);
      } else {
        localStorage.removeItem("kisansathi_token");
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data } = await supabase.from("users").select("role").eq("id", userId).single();
      setRole(data?.role || "farmer");
    } catch {
      setRole("farmer");
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (!error && data.user) {
      await supabase.from("users").insert({ id: data.user.id, email, role: "farmer" });
      await supabase.from("farmer_profiles").insert({ user_id: data.user.id, name });
    }
    return { error: error?.message };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      // Return full error string so UI can detect "provider not enabled" / "validation_failed"
      return { error: error ? (error.message || JSON.stringify(error)) : undefined };
    } catch (err: any) {
      // Network-level or Supabase 400 error — pass full message through
      const msg: string =
        err?.message ||
        err?.error_code ||
        err?.msg ||
        JSON.stringify(err) ||
        "Unknown error";
      return { error: msg };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      return { error: error?.message };
    } catch (err: any) {
      return { error: err?.message || "Failed to resend confirmation email" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("kisansathi_token");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut, resendConfirmation, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
