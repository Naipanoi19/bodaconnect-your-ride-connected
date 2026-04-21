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
  setRole: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  roles: [],
  loading: true,

  init: () => {
    // Subscribe FIRST then fetch session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // Defer role fetch to avoid recursive auth calls
        setTimeout(() => void get().fetchRoles(), 0);
      } else {
        set({ roles: [] });
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (session?.user) void get().fetchRoles();
    });

    return () => sub.subscription.unsubscribe();
  },

  // @ts-expect-error - extending state at runtime
  fetchRoles: async () => {
    const uid = get().user?.id;
    if (!uid) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    set({ roles: (data?.map((r) => r.role) ?? []) as Role[] });
  },

  setRole: async (role: Role) => {
    const uid = get().user?.id;
    if (!uid) return;
    if (role === "customer" || role === "admin") return; // assigned by system
    await supabase.from("user_roles").upsert({ user_id: uid, role }, { onConflict: "user_id,role" });
    // @ts-expect-error
    await get().fetchRoles();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, roles: [] });
  },
}));