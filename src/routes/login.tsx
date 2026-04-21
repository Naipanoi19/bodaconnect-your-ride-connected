import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Phone, Lock, Loader2, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/bv/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useT, sheng } from "@/lib/i18n/strings";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — BodaVert" }] }),
  component: LoginPage,
});

function normalizePhone(p: string) {
  const digits = p.replace(/\D/g, "");
  if (digits.startsWith("254")) return "+" + digits;
  if (digits.startsWith("0")) return "+254" + digits.slice(1);
  return "+254" + digits;
}

function LoginPage() {
  const navigate = useNavigate();
  const t = useT();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Tafadhali weka nambari sahihi");
      return;
    }
    setLoading(true);
    const fullPhone = normalizePhone(phone);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;
      toast.success("OTP imetumwa kwa " + fullPhone);
      navigate({ to: "/otp", search: { phone: fullPhone } });
    } catch (err) {
      const msg = (err as Error).message;
      // Phone provider may not be enabled; fall back to demo flow with email-style anonymous
      if (msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("provider")) {
        toast.message("SMS provider not configured", {
          description: "Using demo flow — tap Verify with any 6-digit code.",
        });
        navigate({ to: "/otp", search: { phone: fullPhone } });
      } else {
        toast.error(sheng.loginFail, { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Yellow gradient header */}
      <div className="bv-gradient-yellow-dark h-[35vh] flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-3 bv-fade-up">
          <Logo size={64} variant="black" />
          <span className="font-display text-2xl text-secondary">BodaVert</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-8 bg-background rounded-t-[32px] px-6 pt-8 pb-8 bv-shadow-elevated relative">
        <h2 className="font-display text-2xl">{t("welcomeBack")}</h2>
        <p className="bv-text-grey text-sm mt-1 mb-6">{t("signInToContinue")}</p>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 bv-text-grey text-sm font-medium flex items-center gap-1">
              <Phone size={16} /> +254
            </span>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-20 h-12 bg-secondary text-secondary-foreground border-0 placeholder:text-white/40 rounded-xl"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 bv-text-grey" />
            <Input
              type={showPwd ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-secondary text-secondary-foreground border-0 placeholder:text-white/40 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/login" className="text-sm bv-text-grey hover:text-foreground">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            onClick={sendOtp}
            disabled={loading}
            className="w-full h-14 text-base font-semibold rounded-xl bv-shadow-yellow"
          >
            {loading ? <Loader2 className="animate-spin" /> : t("continueWithSms")}
          </Button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs bv-text-grey">{t("or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-secondary">
            {t("signUp")}
          </Button>

          <button
            onClick={() => setBiometric(!biometric)}
            className="w-full flex items-center justify-center gap-2 text-sm bv-text-grey pt-2"
          >
            <Fingerprint size={18} className={biometric ? "text-primary" : ""} />
            <span>{t("enableBiometrics")}</span>
            <span
              className={`ml-2 inline-block w-8 h-4 rounded-full transition-colors ${
                biometric ? "bg-primary" : "bg-muted"
              } relative`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  biometric ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}