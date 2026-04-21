import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, IdCard, Camera, FileText, Bike as Plate, Award, Lock, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useT, sheng } from "@/lib/i18n/strings";

export const Route = createFileRoute("/driver/verification")({
  head: () => ({ meta: [{ title: "Driver verification — BodaVert" }] }),
  component: VerificationPage,
});

type DocKey = "id_front" | "id_back" | "selfie" | "logbook" | "plate" | "psv";

const DOCS: { key: DocKey; label: string; Icon: typeof IdCard; optional?: boolean }[] = [
  { key: "id_front", label: "ID Front", Icon: IdCard },
  { key: "id_back", label: "ID Back", Icon: IdCard },
  { key: "selfie", label: "Selfie", Icon: Camera },
  { key: "logbook", label: "Logbook", Icon: FileText },
  { key: "plate", label: "Number Plate", Icon: Plate },
  { key: "psv", label: "PSV Badge", Icon: Award, optional: true },
];

function VerificationPage() {
  const navigate = useNavigate();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<1 | 2>(1);
  const [stageName, setStageName] = useState("Rongai Central Stage");
  const [uploaded, setUploaded] = useState<Record<DocKey, boolean>>({
    id_front: false, id_back: false, selfie: false, logbook: false, plate: false, psv: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const mockUpload = (key: DocKey) => {
    setUploaded((u) => ({ ...u, [key]: true }));
    toast.success(`${key} uploaded ✓`);
  };

  const allRequired = (["id_front", "id_back", "selfie", "logbook", "plate"] as DocKey[]).every((k) => uploaded[k]);

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate({ to: "/login" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("drivers").upsert({
        user_id: user.id,
        stage_name: stageName,
        status: "pending",
        national_id_front_url: "pending://upload",
        national_id_back_url: "pending://upload",
        selfie_url: "pending://upload",
        logbook_url: "pending://upload",
        plate_url: "pending://upload",
        psv_url: uploaded.psv ? "pending://upload" : null,
      });
      if (error) throw error;
      toast.success(sheng.verified.replace("Umeidhinishwa!", "Imewasilishwa!"));
      navigate({ to: "/driver/pending" });
    } catch (e) {
      toast.error("Imeshindwa", { description: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bv-gradient-yellow-dark px-4 py-4 flex items-center gap-3">
        <button onClick={() => (step === 2 ? setStep(1) : navigate({ to: "/choose-role" }))}>
          <ChevronLeft size={22} className="text-secondary" />
        </button>
        <h1 className="font-display text-lg text-secondary">Driver Verification</h1>
      </header>

      {/* Progress */}
      <div className="px-4 py-3 flex items-center gap-2">
        <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        <span className="text-xs bv-text-grey ml-2">Step {step} of 2</span>
      </div>

      <div className="flex-1 px-4 py-4">
        {step === 1 ? (
          <div className="space-y-4 bv-fade-up">
            <h2 className="font-display text-xl">{t("selectStage")}</h2>
            <Input
              placeholder="Type your stage name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs bv-text-grey">If your stage isn't listed, type it and a chairman will be assigned.</p>
            <Button
              className="w-full h-12 rounded-xl mt-4"
              disabled={!stageName.trim()}
              onClick={() => setStep(2)}
            >
              {t("continueBtn")}
            </Button>
          </div>
        ) : (
          <div className="bv-fade-up">
            <h2 className="font-display text-xl">{t("uploadDocs")}</h2>
            <p className="text-xs bv-text-grey flex items-center gap-1 mt-1 mb-4">
              <Lock size={12} /> {t("docsEncrypted")}
            </p>
            <div className="space-y-3">
              {DOCS.map(({ key, label, Icon, optional }) => (
                <button
                  key={key}
                  onClick={() => mockUpload(key)}
                  className="w-full bg-secondary text-white rounded-xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform"
                >
                  <Icon size={20} className="text-primary" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{label}</div>
                    {optional && <div className="text-[10px] text-white/50">Optional</div>}
                  </div>
                  {uploaded[key] ? (
                    <div className="w-6 h-6 rounded-full bv-bg-success flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                  )}
                </button>
              ))}
            </div>
            <Button
              onClick={submit}
              disabled={!allRequired || submitting}
              className="w-full h-14 mt-6 rounded-xl text-base font-semibold bv-shadow-yellow"
            >
              {submitting ? <Loader2 className="animate-spin" /> : t("submitForReview")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}