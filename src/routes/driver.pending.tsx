import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Hourglass, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/strings";

export const Route = createFileRoute("/driver/pending")({
  head: () => ({ meta: [{ title: "Under review — BodaVert" }] }),
  component: PendingPage,
});

function PendingPage() {
  const navigate = useNavigate();
  const t = useT();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bv-gradient-yellow flex items-center justify-center bv-shadow-yellow bv-pulse-soft mb-6">
        <Hourglass size={42} className="text-secondary" />
      </div>
      <h1 className="font-display text-2xl">{t("underReview")}</h1>
      <p className="bv-text-grey text-sm mt-3 max-w-sm">{t("underReviewSub")}</p>

      <div className="mt-6 px-4 py-1.5 bg-muted rounded-full">
        <span className="text-xs bv-text-grey">Stage: <span className="text-foreground font-medium">Rongai Central Stage</span></span>
      </div>

      <div className="mt-8 flex gap-6 text-xs bv-text-grey">
        <div className="flex items-center gap-1.5"><MessageSquare size={14} /> SMS</div>
        <div className="flex items-center gap-1.5"><Bell size={14} /> Push</div>
      </div>

      <Button
        variant="outline"
        className="mt-10 h-12 rounded-xl border-2 border-secondary px-8"
        onClick={() => navigate({ to: "/customer" })}
      >
        {t("backToHome")}
      </Button>
    </div>
  );
}