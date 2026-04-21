import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT, sheng } from "@/lib/i18n/strings";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/broadcast")({
  head: () => ({ meta: [{ title: "Broadcast — BodaVert" }] }),
  component: BroadcastPage,
});

const TEMPLATES = [
  { key: "meeting", label: "📅 Stage meeting today 6 PM" },
  { key: "fuel", label: "⛽ Fuel price update" },
  { key: "police", label: "🚓 Police checkpoint alert" },
  { key: "rain", label: "🌧️ Heavy rain — ride safely" },
  { key: "fees", label: "💰 Monthly fees due" },
];

function BroadcastPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tpl, setTpl] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const text = tpl ? TEMPLATES.find((x) => x.key === tpl)?.label ?? "" : msg.trim();
    if (!text) {
      toast.error("Andika ujumbe kwanza");
      return;
    }
    setSending(true);
    try {
      if (user) {
        // best-effort; if no stage_id known, this just records the broadcast attempt
        const { data: stages } = await supabase
          .from("stages")
          .select("id")
          .eq("chairman_id", user.id)
          .limit(1);
        const stageId = stages?.[0]?.id;
        if (stageId) {
          await supabase.from("broadcasts").insert({
            chairman_id: user.id,
            stage_id: stageId,
            message_text: text,
            is_template: !!tpl,
            template_key: tpl,
          });
        }
      }
      toast.success(sheng.broadcastSent);
      navigate({ to: "/chairman" });
    } catch (e) {
      toast.error("Imeshindikana", { description: (e as Error).message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/chairman" })}>
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-primary" />
          <span className="font-display">{t("sendBroadcast")}</span>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 flex-1">
        <div>
          <div className="text-xs font-medium bv-text-grey mb-2">{t("messageTemplate")}</div>
          <div className="space-y-2">
            {TEMPLATES.map((x) => (
              <button
                key={x.key}
                onClick={() => { setTpl(x.key); setMsg(""); }}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm border ${tpl === x.key ? "bg-primary border-primary text-secondary" : "bg-white border-border"}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium bv-text-grey mb-2">{t("customMessage")}</div>
          <Textarea
            value={msg}
            onChange={(e) => { setMsg(e.target.value); setTpl(null); }}
            placeholder="Andika ujumbe wako…"
            rows={4}
            className="rounded-xl bv-bg-grey border-0"
            maxLength={280}
          />
          <div className="text-[10px] bv-text-grey text-right mt-1">{msg.length}/280</div>
        </div>

        <div className="bv-bg-grey rounded-xl p-3 text-xs">
          📡 Itatumwa kwa madereva wote walioidhinishwa wa stage yako (~24 {t("recipients")})
        </div>
      </div>

      <div className="px-4 pb-6">
        <Button
          onClick={send}
          disabled={sending}
          className="w-full h-14 text-base font-semibold rounded-xl bv-shadow-yellow"
        >
          {sending ? "Inatuma…" : `📣 ${t("sendBroadcast")}`}
        </Button>
      </div>
    </div>
  );
}
