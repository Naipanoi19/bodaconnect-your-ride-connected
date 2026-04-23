import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — BodaVert" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Supabase auto-detects #type=recovery and sets a session
    if (window.location.hash.includes("type=recovery")) {
      setHasRecoverySession(true);
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasRecoverySession(true);
    });
  }, []);

  const submit = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated! 🎉");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <h1 className="font-display text-2xl">Set a new password</h1>
      <p className="bv-text-grey text-sm mt-1">
        {hasRecoverySession
          ? "Choose a new password for your BodaVert account."
          : "Open this page from the link we emailed you."}
      </p>

      <div className="relative mt-8">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 bv-text-grey" />
        <Input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="pl-10 pr-10 h-12 rounded-xl"
          disabled={!hasRecoverySession}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bv-text-grey"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Button
        onClick={submit}
        disabled={loading || !hasRecoverySession}
        className="w-full h-12 mt-4 rounded-xl bv-shadow-yellow"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Update password"}
      </Button>
    </div>
  );
}