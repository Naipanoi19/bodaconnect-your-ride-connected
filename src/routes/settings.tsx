import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Globe, Wifi, Phone, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT, useLangStore } from "@/lib/i18n/strings";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — BodaVert" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { lang, setLang } = useLangStore();
  const { user, signOut } = useAuthStore();
  const [lowData, setLowData] = useState(false);
  const [contacts, setContacts] = useState<string[]>([""]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("low_data_mode,emergency_contacts")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLowData(data.low_data_mode);
          setContacts(data.emergency_contacts?.length ? data.emergency_contacts : [""]);
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) {
      toast.success("Imehifadhiwa kwa kifaa");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        low_data_mode: lowData,
        emergency_contacts: contacts.filter(Boolean),
        language_preference: lang,
      })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Imehifadhiwa ✓");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/customer" })}>
          <ChevronLeft size={22} />
        </button>
        <span className="font-display">{t("settings")}</span>
      </header>

      <div className="px-4 py-4 space-y-4 flex-1">
        {/* Language */}
        <Section icon={<Globe size={18} className="text-primary" />} title={t("language")}>
          <div className="flex gap-2">
            {(["en", "sw"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border ${lang === l ? "bg-primary border-primary text-secondary" : "bg-white border-border"}`}
              >
                {l === "en" ? "🇬🇧 English" : "🇰🇪 Kiswahili"}
              </button>
            ))}
          </div>
        </Section>

        {/* Low data */}
        <Section icon={<Wifi size={18} className="text-primary" />} title={t("lowDataMode")}>
          <button
            onClick={() => setLowData(!lowData)}
            className="w-full bg-white rounded-xl p-3 flex items-center justify-between"
          >
            <span className="text-sm">Punguza matumizi ya data</span>
            <span className={`w-12 h-7 rounded-full relative transition-colors ${lowData ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full bv-shadow-card transition-transform ${lowData ? "translate-x-6" : "translate-x-1"}`} />
            </span>
          </button>
        </Section>

        {/* Emergency contacts */}
        <Section icon={<Phone size={18} className="bv-text-danger" />} title={t("emergencyContacts")}>
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <Input
                key={i}
                value={c}
                onChange={(e) => {
                  const next = [...contacts];
                  next[i] = e.target.value;
                  setContacts(next);
                }}
                placeholder="+254 7XX XXX XXX"
                className="bv-bg-grey border-0 rounded-xl h-11"
              />
            ))}
            {contacts.length < 3 && (
              <button
                onClick={() => setContacts([...contacts, ""])}
                className="text-xs text-primary font-medium"
              >
                + {t("addContact")}
              </button>
            )}
          </div>
        </Section>

        <Section icon={<Shield size={18} className="bv-text-success" />} title="Safety">
          <div className="bv-bg-grey rounded-xl p-3 text-xs bv-text-grey">
            Hold the panic button during a ride to alert your contacts and the chairman with your live location.
          </div>
        </Section>
      </div>

      <div className="px-4 pb-6 space-y-2">
        <Button onClick={save} className="w-full h-12 rounded-xl">
          {t("save")}
        </Button>
        {user && (
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="w-full h-12 rounded-xl gap-2"
          >
            <LogOut size={16} /> {t("logout")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-sm font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}
