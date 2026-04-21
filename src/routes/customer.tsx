import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Mic, MapPin, Flag, Bike, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/bv/Logo";
import { OsmMap, type MapMarker } from "@/components/bv/OsmMap";
import { useT, sheng } from "@/lib/i18n/strings";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Find a boda — BodaVert" }] }),
  component: CustomerHome,
});

function CustomerHome() {
  const t = useT();
  const navigate = useNavigate();
  const { user, init } = useAuthStore();
  const [userLoc, setUserLoc] = useState<[number, number]>([-1.2921, 36.8219]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    const c = init();
    return c;
  }, [init]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserLoc([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  // Generate fake nearby drivers around user
  useEffect(() => {
    const drivers: MapMarker[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `d${i}`,
      lat: userLoc[0] + (Math.random() - 0.5) * 0.012,
      lng: userLoc[1] + (Math.random() - 0.5) * 0.012,
      kind: "driver",
      label: `KCB ${100 + i}X`,
    }));
    setMarkers([
      { id: "me", lat: userLoc[0], lng: userLoc[1], kind: "user", label: "You" },
      ...drivers,
    ]);
  }, [userLoc]);

  const findBike = () => {
    if (markers.length <= 1) {
      toast.error(sheng.noDrivers);
      return;
    }
    navigate({ to: "/ride" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-4 py-3 flex items-center justify-between bg-secondary text-white">
        <div className="flex items-center gap-2">
          <Logo size={28} variant="yellow" />
          <span className="font-display text-base">BodaVert</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Link to="/settings">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <OsmMap center={userLoc} markers={markers} zoom={15} />

        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <button className="w-full bg-white rounded-2xl bv-shadow-elevated px-4 py-3 flex items-center gap-3">
            <Search size={18} className="bv-text-grey" />
            <span className="flex-1 text-left text-sm bv-text-grey truncate">{t("whereTo")}</span>
            <Mic size={18} className="text-primary" />
          </button>

          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {["🏠 Home", "💼 Work", "🛒 Market", "🏥 Hospital"].map((q) => (
              <button
                key={q}
                className="bg-primary text-secondary text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap bv-shadow-yellow"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-secondary text-white px-4 py-2 flex justify-between items-center text-xs">
        <span>{t("estFare")}: <span className="font-semibold text-primary">KSh 120–180</span></span>
        <span className="text-white/60">{markers.length - 1} drivers nearby</span>
      </div>

      <div className="bg-white px-4 pt-4 pb-6 bv-shadow-elevated">
        <div className="flex gap-2 mb-3">
          <Button variant="default" className="flex-1 h-11 rounded-lg gap-2">
            <MapPin size={16} /> {t("setPickup")}
          </Button>
          <Button className="flex-1 h-11 rounded-lg gap-2 bg-secondary text-white hover:bg-secondary/90">
            <Flag size={16} /> {t("setDropoff")}
          </Button>
        </div>
        <Button
          onClick={findBike}
          className="w-full h-14 text-lg font-display tracking-wide rounded-xl bv-shadow-yellow gap-2"
        >
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
