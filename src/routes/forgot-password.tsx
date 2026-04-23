import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — BodaVert" }] }),
  component: ForgotPasswordPage,
});

function phoneToEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.includes("@")) return phone;
  const normalized = digits.startsWith("254")
    ? digits
    : digits.startsWith("0")
      ? "254" + digits.slice(1)
      : "254" + digits;
  return `bv${normalized}@bodavert.app`;
}

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!identifier) {
      toast.error("Enter your phone or email");
      return;
    }
    setLoading(true);
    const email = identifier.includes("@") ? identifier : phoneToEmail(identifier);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your email");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-3 flex items-center gap-3">
        <Link to="/login"><ChevronLeft size={22} /></Link>
        <span className="font-display">Reset password</span>
      </header>

      <div className="flex-1 px-6 py-8 max-w-md w-full mx-auto">
        {sent ? (
          <div className="text-center bv-fade-up">
            <div className="text-5xl">📬</div>
            <h2 className="font-display text-2xl mt-3">Check your email</h2>
            <p className="bv-text-grey text-sm mt-2">
              We sent a reset link to <span className="text-foreground font-medium">{identifier}</span>.
              Tap it to set a new password.
            </p>
            <Link to="/login">
              <Button className="mt-6 w-full h-12 rounded-xl">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl">Forgot your password?</h2>
            <p className="bv-text-grey text-sm mt-1">
              Enter the phone number or email you signed up with. We'll send a reset link.
            </p>
            <div className="relative mt-6">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 bv-text-grey" />
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="07XX XXX XXX or you@example.com"
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <Button
              onClick={submit}
              disabled={loading}
              className="w-full h-12 mt-4 rounded-xl bv-shadow-yellow"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send reset link"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}