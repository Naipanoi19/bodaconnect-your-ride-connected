import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, User, Crown, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/dev")({
  head: () => ({ meta: [{ title: "Dev Tools — BodaVert" }] }),
  component: DevTools,
});

type Persona = "customer" | "driver" | "chairman" | "admin";

const ACCOUNTS: Record<Persona, { email: string; password: string; label: string; route: string; icon: React.ReactNode }> = {
  customer: {
    email: "test-customer@bodavert.app",
    password: "Test1234!",
    label: "Test as Customer",
    route: "/customer",
    icon: <User size={20} />,
  },
  driver: {
    email: "test-driver@bodavert.app",
    password: "Test1234!",
    label: "Test as Driver",
    route: "/driver",
    icon: <Bike size={20} />,
  },
  chairman: {
    email: "test-chairman@bodavert.app",
    password: "Test1234!",
    label: "Test as Chairman",
    route: "/chairman",
    icon: <Crown size={20} />,
  },
  admin: {
    email: "test-admin@bodavert.app",
    password: "Test1234!",
    label: "Test as Admin",
    route: "/admin",
    icon: <ShieldCheck size={20} />,
  },
};

function DevTools() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const [busy, setBusy] = useState<Persona | null>(null);

  const loginAs = async (p: Persona) => {
    setBusy(p);
    const { email, password, route } = ACCOUNTS[p];
    try {
      // Try sign-in first
      const initial = await supabase.auth.signInWithPassword({ email, password });
      let uid: string | undefined = initial.data?.user?.id;

      // If no account, sign up then retry sign-in
      if (initial.error) {
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: `Test ${p}` },
          },
        });
        if (signUp.error) throw signUp.error;
        uid = signUp.data?.user?.id;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (!retry.error && retry.data?.user?.id) uid = retry.data.user.id;
      }
      if (!uid) {
        toast.message("Account created — confirm email to sign in", {
          description: "Disable email confirmation in backend settings for instant dev login.",
        });
        setBusy(null);
        return;
      }

      // Customer role auto-assigned by signup trigger.
      // Driver can self-assign via RLS policy.
      if (p === "driver") {
        await supabase.from("user_roles").upsert(
          { user_id: uid, role: "driver" },
          { onConflict: "user_id,role" },
        );
      }
      // Chairman & admin require admin grant (cannot self-assign for security).
      if (p === "chairman" || p === "admin") {
        toast.message(`${p} role requires admin grant`, {
          description: "Test account signed in. Ask backend admin to add the role to user_roles.",
        });
      }

      toast.success(`Signed in as ${p}`);
      navigate({ to: route });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  };

  const clearLocal = () => {
    try {
      localStorage.removeItem("bv-dropoff");
      localStorage.removeItem("bv-active-driver");
      localStorage.removeItem("bv-recent-places");
      toast.success("Local cache cleared");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white px-6 py-10 flex flex-col">
      <h1 className="font-display text-3xl">🛠️ Dev Tools</h1>
      <p className="text-sm text-white/60 mt-1">Test BodaVert flows without real onboarding.</p>

      <div className="mt-8 space-y-3">
        {(Object.keys(ACCOUNTS) as Persona[]).map((p) => {
          const acc = ACCOUNTS[p];
          return (
            <Button
              key={p}
              onClick={() => loginAs(p)}
              disabled={busy !== null}
              className="w-full h-14 justify-start gap-3 rounded-xl bg-white text-secondary hover:bg-primary"
            >
              {busy === p ? <RefreshCw size={18} className="animate-spin" /> : acc.icon}
              <span className="font-semibold">{acc.label}</span>
              <span className="ml-auto text-[10px] text-secondary/50 truncate">{acc.email}</span>
            </Button>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <div className="text-xs uppercase tracking-wide text-primary">Utilities</div>
        <Button
          variant="outline"
          onClick={clearLocal}
          className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
        >
          <Trash2 size={16} /> Clear local cache
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            navigate({ to: "/login" });
          }}
          className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
        >
          Sign out current user
        </Button>
      </div>

      <div className="mt-auto text-[10px] text-white/40 pt-10">
        Dev test accounts use password <code>Test1234!</code>. Created on first click via auth signup.
      </div>
    </div>
  );
}