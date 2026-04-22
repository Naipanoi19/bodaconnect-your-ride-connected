import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/bv/Logo";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/i18n/strings";

export function Splash() {
  const navigate = useNavigate();
  const t = useT();
  const { user, roles, loading, init } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [forceGo, setForceGo] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cleanup = init();
    // Safety net: never let users sit on splash for more than 3s
    const safety = setTimeout(() => setForceGo(true), 3000);
    return () => {
      clearTimeout(safety);
      cleanup?.();
    };
  }, [init]);

  useEffect(() => {
    if (!mounted) return;
    if (loading && !forceGo) return;
    const timer = setTimeout(() => {
      const onboarded = typeof window !== "undefined" && localStorage.getItem("bv-onboarded");
      if (!user) {
        if (!onboarded) navigate({ to: "/onboarding" });
        else navigate({ to: "/login" });
        return;
      }
      // Logged in — route by role
      if (roles.includes("admin")) navigate({ to: "/chairman" });
      else if (roles.includes("chairman")) navigate({ to: "/chairman" });
      else if (roles.includes("driver")) navigate({ to: "/driver" });
      else navigate({ to: "/customer" });
    }, forceGo ? 0 : 800);
    return () => clearTimeout(timer);
  }, [mounted, loading, forceGo, user, roles, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary text-secondary-foreground px-6">
      <div className="flex flex-col items-center gap-4 bv-fade-up">
        <div className="bv-pulse-soft">
          <Logo size={96} variant="yellow" />
        </div>
        <h1 className="font-display text-4xl text-white">{t("appName")}</h1>
        <p className="text-sm bv-text-grey text-center max-w-xs">{t("tagline")}</p>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="text-xs bv-text-grey">{t("checkingLogin")}</span>
      </div>
    </div>
  );
}