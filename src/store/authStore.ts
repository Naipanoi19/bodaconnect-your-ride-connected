import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "customer" | "driver" | "chairman" | "admin";

interface AuthState {
  session: Session | null;
  user: User | null;
  roles: Role[];
  loading: boolean;
  init: () => () => void;
  fetchRoles: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  roles: [],
  loading: true,

  init: () => {
    // SSR guard — auth only runs in the browser
    if (typeof window === "undefined") {
      set({ loading: false });
      return () => {};
    }

    let unsub: (() => void) | undefined;
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, loading: false });
        if (session?.user) {
          setTimeout(() => void get().fetchRoles(), 0);
        } else {
          set({ roles: [] });
        }
      });
      unsub = () => sub.subscription.unsubscribe();

      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          set({ session, user: session?.user ?? null, loading: false });
          if (session?.user) void get().fetchRoles();
        })
        .catch((err) => {
          console.error("[auth] getSession failed", err);
          set({ loading: false });
        });
    } catch (err) {
      console.error("[auth] init failed", err);
      set({ loading: false });
    }

    // Hard fallback: never stay in loading > 2.5s
    const fallback = setTimeout(() => {
      if (get().loading) set({ loading: false });
    }, 2500);

    return () => {
      clearTimeout(fallback);
      unsub?.();
    };
  },

  fetchRoles: async () => {
    const uid = get().user?.id;
    if (!uid) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    set({ roles: (data?.map((r) => r.role) ?? []) as Role[] });
  },

  setRole: async (role: Role) => {
    const uid = get().user?.id;
    if (!uid) return;
    if (role === "customer" || role === "admin") return;
    await supabase.from("user_roles").upsert({ user_id: uid, role }, { onConflict: "user_id,role" });
    await get().fetchRoles();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, roles: [] });
  },
}));