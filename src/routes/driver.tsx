import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Bell, Bike, Star, TrendingUp, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/bv/Logo";
import { useT } from "@/lib/i18n/strings";
import { Button } from "@/components/ui/button";
import { OsmMap } from "@/components/bv/OsmMap";

export const Route = createFileRoute("/driver")({
  head: () => ({ meta: [{ title: "Driver — BodaVert" }] }),
  component: DriverHome,
});

function DriverHome() {
  const t = useT();
  const navigate = useNavigate();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    // If no driver record, route to verification
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bv-gradient-yellow-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={28} variant="black" />
          <span className="font-display text-base text-secondary">BodaVert</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              online ? "bv-bg-success text-white" : "bg-secondary/20 text-secondary"
            }`}
          >
            {online ? `🟢 ${t("online")}` : `⚫ ${t("offline")}`}
          </span>
          <Bell size={20} className="text-secondary" />
          <Link to="/settings"><Settings size={20} className="text-secondary" /></Link>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <OsmMap followUser />

        {/* Toggle card */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-2xl bv-shadow-elevated p-4 z-[1000]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg">{online ? "Go Offline" : "Go Online"}</div>
              <div className="text-xs bv-text-grey">
                {online ? "Online — Waiting for rides" : "Offline — You won't receive rides"}
              </div>
            </div>
            <button
              onClick={() => setOnline(!online)}
              className={`w-14 h-8 rounded-full relative transition-colors ${online ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform bv-shadow-card ${
                  online ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Earnings summary */}
      <div className="bg-secondary text-white px-4 py-5">
        <div className="text-xs text-white/60">Today's earnings</div>
        <div className="font-display text-3xl text-primary">KSh 1,240</div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><Bike size={12} /> 8 rides</span>
          <span className="flex items-center gap-1"><Star size={12} className="text-primary" /> 4.8</span>
          <span className="flex items-center gap-1"><TrendingUp size={12} /> +12% vs yesterday</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-primary text-primary hover:bg-primary hover:text-secondary"
            onClick={() => navigate({ to: "/earnings" })}
          >
            View earnings
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-white/30 text-white hover:bg-white/10"
            onClick={() => navigate({ to: "/driver/verification" })}
          >
            Verification
          </Button>
        </div>
      </div>
    </div>
  );
}