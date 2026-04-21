import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ShieldCheck, Smartphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/strings";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to BodaVert" }] }),
  component: OnboardingPage,
});

const slides = [
  { Icon: MapPin, title: "Find a Boda Near You", sub: "See verified drivers around you in real time" },
  { Icon: ShieldCheck, title: "Ride with Confidence", sub: "Track your ride, panic button always ready" },
  { Icon: Smartphone, title: "Pay Fast & Easy", sub: "M-Pesa payments, instant driver payouts" },
];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const t = useT();
  const last = step === slides.length - 1;
  const { Icon, title, sub } = slides[step];

  const finish = () => {
    if (typeof window !== "undefined") localStorage.setItem("bv-onboarded", "1");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <div className="flex justify-end">
        <Link to="/login" onClick={finish} className="text-sm bv-text-grey hover:text-foreground">
          {t("skip")}
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 bv-fade-up" key={step}>
        <div className="w-40 h-40 rounded-full bv-gradient-yellow flex items-center justify-center bv-shadow-yellow">
          <Icon size={72} className="text-secondary" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-3xl max-w-xs">{title}</h1>
        <p className="bv-text-grey text-sm max-w-xs">{sub}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-2 bg-muted"}`}
          />
        ))}
      </div>

      {last ? (
        <Button size="lg" className="h-14 text-base font-semibold rounded-xl bv-shadow-yellow" onClick={finish}>
          {t("getStarted")} <ChevronRight size={20} />
        </Button>
      ) : (
        <Button size="lg" className="h-14 text-base font-semibold rounded-xl" onClick={() => setStep(step + 1)}>
          {t("next")} <ChevronRight size={20} />
        </Button>
      )}
    </div>
  );
}