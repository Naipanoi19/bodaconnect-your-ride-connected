import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useT, sheng } from "@/lib/i18n/strings";

export const Route = createFileRoute("/otp")({
  validateSearch: z.object({ phone: z.string().optional() }),
  head: () => ({ meta: [{ title: "Verify code — BodaVert" }] }),
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const t = useT();
  const { phone } = Route.useSearch();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const setDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 6) {
      void verify(next.join(""));
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      if (!phone) throw new Error("Missing phone");
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
      if (error) throw error;
      toast.success("Karibu BodaVert! 🎉");
      navigate({ to: "/choose-role" });
    } catch (err) {
      const msg = (err as Error).message;
      // Demo fallback: phone OTP not configured — sign in anonymously so the user can keep exploring
      if (msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("provider")) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          toast.error(sheng.loginFail, { description: error.message });
        } else {
          toast.success("Demo mode — karibu!");
          navigate({ to: "/choose-role" });
        }
      } else {
        toast.error("Msimbo si sahihi", { description: msg });
      }
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (!phone) return;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) toast.error("Imeshindwa kutuma", { description: error.message });
    else {
      toast.success("OTP imetumwa tena");
      setCountdown(60);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-6 flex flex-col">
      <Link to="/login" className="flex items-center gap-1 bv-text-grey text-sm">
        <ChevronLeft size={18} /> Back
      </Link>

      <div className="mt-8">
        <h1 className="font-display text-2xl">{t("enterOtp")}</h1>
        <p className="bv-text-grey text-sm mt-2">
          {t("sentCodeTo")} <span className="text-foreground font-medium">{phone ?? "your phone"}</span>
        </p>
        <Link to="/login" className="text-primary text-sm font-medium underline">
          {t("editNumber")}
        </Link>
      </div>

      <div className="flex justify-between gap-2 mt-10">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-display border-2 border-secondary rounded-xl bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        ))}
      </div>

      <div className="text-center mt-6 text-sm bv-text-grey">
        {countdown > 0 ? (
          <>
            {t("resendIn")} 0:{countdown.toString().padStart(2, "0")}
          </>
        ) : (
          <button onClick={resend} className="text-primary font-medium underline">
            {t("resendOtp")}
          </button>
        )}
      </div>

      <Button
        onClick={() => verify(digits.join(""))}
        disabled={digits.some((d) => !d) || verifying}
        className="w-full h-14 mt-auto text-base font-semibold rounded-xl bv-shadow-yellow"
      >
        {verifying ? <Loader2 className="animate-spin" /> : t("verify")}
      </Button>
    </div>
  );
}