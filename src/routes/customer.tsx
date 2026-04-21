import { createFileRoute, redirect } from "@tanstack/react-router";
import { Bell, Search, Mic, MapPin, Flag, Bike, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/bv/Logo";
import { useT } from "@/lib/i18n/strings";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Find a boda — BodaVert" }] }),
  beforeLoad: () => {
    // Light client-side guard — splash drives the actual flow
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("sb-auth-token");
      if (!session) {
        // Don't redirect if Supabase token key uses a different name; let component handle
      }
    }
  },
  component: CustomerHome,
});

function CustomerHome() {
  const t = useT();
  const { user, init } = useAuthStore();
  useEffect(() => {
    const c = init();
    return c;
  }, [init]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bv-bg-grey px-4 py-3 flex items-center justify-between bg-secondary text-white">
        <div className="flex items-center gap-2">
          <Logo size={28} variant="yellow" />
          <span className="font-display text-base">BodaVert</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Link to="/customer">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Map placeholder */}
      <div className="relative flex-1 overflow-hidden">
        <MapPlaceholder />

        {/* Floating search */}
        <div className="absolute top-4 left-4 right-4">
          <button className="w-full bg-white rounded-2xl bv-shadow-elevated px-4 py-3 flex items-center gap-3">
            <Search size={18} className="bv-text-grey" />
            <span className="flex-1 text-left text-sm bv-text-grey truncate">{t("whereTo")}</span>
            <Mic size={18} className="text-primary" />
          </button>

          {/* Quick destinations */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {["🏠 Home", "💼 Work", "🛒 Market", "🏥 Hospital"].map((q) => (
              <button
                key={q}
                className="bg-primary text-secondary text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Fake driver markers */}
        <FakeMarker top="35%" left="40%" />
        <FakeMarker top="55%" left="60%" />
        <FakeMarker top="48%" left="22%" />
        <UserDot />
      </div>

      {/* Fare estimator */}
      <div className="bg-secondary text-white px-4 py-2 flex justify-between items-center text-xs">
        <span>{t("estFare")}: <span className="font-semibold text-primary">KSh 120–180</span></span>
        <span className="text-white/60">Based on your area</span>
      </div>

      {/* Bottom action bar */}
      <div className="bg-white px-4 pt-4 pb-6 bv-shadow-elevated">
        <div className="flex gap-2 mb-3">
          <Button variant="default" className="flex-1 h-11 rounded-lg gap-2">
            <MapPin size={16} /> {t("setPickup")}
          </Button>
          <Button variant="secondary" className="flex-1 h-11 rounded-lg gap-2 bg-secondary text-white hover:bg-secondary/90">
            <Flag size={16} /> {t("setDropoff")}
          </Button>
        </div>
        <Button className="w-full h-14 text-lg font-display tracking-wide rounded-xl bv-shadow-yellow gap-2">
          <Bike size={22} /> {t("findBike")}
        </Button>
        {!user && (
          <p className="text-[10px] text-center bv-text-grey mt-2">
            Demo mode — sign in to request a real ride
          </p>
        )}
      </div>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #e8eef5 0%, #d4dde8 50%, #e8eef5 100%)",
        backgroundImage:
          "linear-gradient(rgba(120,140,170,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,170,.18) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* fake roads */}
      <div className="absolute top-1/2 left-0 right-0 h-3 bg-white/80 -rotate-3" />
      <div className="absolute top-1/3 left-0 right-0 h-2 bg-white/70 rotate-6" />
      <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-white/80" />
      <div className="absolute bottom-2 right-2 text-[10px] bv-text-grey bg-white/80 px-2 py-0.5 rounded">
        Map preview · Mapbox coming next
      </div>
    </div>
  );
}

function FakeMarker({ top, left }: { top: string; left: string }) {
  return (
    <div className="absolute" style={{ top, left }}>
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center bv-shadow-yellow border-2 border-white">
        <Bike size={18} className="text-secondary" />
      </div>
    </div>
  );
}

function UserDot() {
  return (
    <div className="absolute" style={{ top: "62%", left: "45%" }}>
      <div className="relative">
        <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-500/40 bv-pulse-soft" />
        <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white relative" />
      </div>
    </div>
  );
}