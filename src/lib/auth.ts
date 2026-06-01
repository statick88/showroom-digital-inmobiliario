import { supabase } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Credenciales inválidas. Verifica tu email y contraseña.",
  "Email not confirmed": "Email no confirmado. Revisa tu bandeja de entrada.",
  "invalid_grant": "Credenciales inválidas. Verifica tu email y contraseña.",
  "User already registered": "El usuario ya está registrado.",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
};

function getSpanishError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message: string }).message;
    return ERROR_MESSAGES[msg] ?? msg;
  }
  return "Error de autenticación. Intenta de nuevo más tarde.";
}

export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(getSpanishError(error));
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(getSpanishError(error));
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(getSpanishError(error));
    return data.session;
  },

  onAuthChange(callback: (event: string, session: unknown) => void) {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  },
};

/**
 * ⚠️ DISABLE PUBLIC REGISTRATION
 *
 * This application uses hash-based routing (#admin, #app) and does NOT
 * expose /signup or /register routes. To prevent unauthorized signups:
 *
 * 1. Go to Supabase Dashboard → Authentication → Settings
 * 2. Under "User Registrations", DISABLE "Allow new user signups"
 * 3. This ensures only admin users created via the Supabase dashboard can log in.
 *
 * The auth service's signIn method still works for existing admin users.
 */
