import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/permissions")({
  head: () => ({ meta: [{ title: "Permissions — BodaVert" }] }),
  component: PermissionsPage,
});

function PermissionsPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const askLocation = async () => {
    setBusy(true);
    try {
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { enableHighAccuracy: true, timeout: 6000 },
          );
        });
      }
    } finally {
      try {
        localStorage.setItem("bv-permissions-asked", "1");
      } catch {
        /* noop */
      }
      navigate({ to: "/customer" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-secondary px-4 py-3 font-display text-lg">
        BodaVert
      </header>
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="font-display text-2xl">Allow access</h1>
        <p className="bv-text-grey text-sm mt-1">
          We use these to find boda riders near you and keep you safe.
        </p>

        <div className="mt-6 space-y-3">
          <Card
            icon={<MapPin size={22} className="text-secondary" />}
            title="Location"
            sub="So we can show drivers near you and share your trip with the rider."
          />
          <Card
            icon={<Bell size={22} className="text-secondary" />}
            title="Notifications"
            sub="To alert you when a driver accepts and arrives."
          />
        </div>

        <div className="mt-auto pt-8 space-y-3">
          <Button onClick={askLocation} disabled={busy} className="w-full h-14 rounded-xl">
            {busy ? <Loader2 className="animate-spin" /> : "Allow & Continue"}
          </Button>
          <button
            onClick={() => navigate({ to: "/customer" })}
            className="w-full text-sm bv-text-grey"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-3 items-start bv-shadow-card">
      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs bv-text-grey">{sub}</div>
      </div>
    </div>
  );
}