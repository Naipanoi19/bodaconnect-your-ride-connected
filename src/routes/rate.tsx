import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT, sheng } from "@/lib/i18n/strings";

export const Route = createFileRoute("/rate")({
  head: () => ({ meta: [{ title: "Rate ride — BodaVert" }] }),
  component: RatePage,
});

const TAGS = ["Safe driving", "Polite", "Knew the route", "Clean helmet", "On time"];

function RatePage() {
  const t = useT();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const submit = () => {
    if (stars === 0) {
      toast.error("Tafadhali chagua nyota");
      return;
    }
    toast.success(sheng.rideComplete);
    navigate({ to: "/customer" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <h1 className="font-display text-2xl text-center">{t("rateRide")}</h1>
      <p className="text-sm bv-text-grey text-center mt-1">Peter Kamau · KSh 180</p>

      <div className="flex justify-center gap-2 mt-8">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} className="transition-transform active:scale-90">
            <Star
              size={44}
              className={n <= stars ? "fill-primary text-primary" : "text-muted"}
            />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-8">
        {TAGS.map((tag) => {
          const on = tags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => setTags(on ? tags.filter((x) => x !== tag) : [...tags, tag])}
              className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-primary border-primary text-secondary" : "bg-white border-border bv-text-grey"}`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment…"
        className="mt-6 rounded-xl bv-bg-grey border-0"
        rows={3}
      />

      <Button
        onClick={submit}
        className="w-full h-14 mt-auto text-base font-semibold rounded-xl bv-shadow-yellow"
      >
        {t("submit")}
      </Button>
    </div>
  );
}
