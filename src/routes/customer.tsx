import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, MapPin, Flag, Bike, Settings, Star, X, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/bv/Logo";
import { OsmMap, type MapMarker } from "@/components/bv/OsmMap";
import { useT, sheng } from "@/lib/i18n/strings";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { MOCK_DRIVERS, RONGAI_CENTER, type MockDriver } from "@/lib/mock/drivers";
import type { PlaceResult } from "@/lib/services/nominatim";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Find a boda — BodaVert" }] }),
  component: CustomerHome,
});

function CustomerHome() {
  const t = useT();
  const navigate = useNavigate();
  const { user, init } = useAuthStore();
  const [userLoc, setUserLoc] = useState<[number, number]>(RONGAI_CENTER);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);

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

  // Read dropoff that the search page may have stored
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bv-dropoff");
      if (raw) setDropoff(JSON.parse(raw) as PlaceResult);
    } catch {
      /* noop */
    }
  }, []);

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = [
      { id: "me", lat: userLoc[0], lng: userLoc[1], kind: "user", label: "You" },
      ...MOCK_DRIVERS.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        kind: "driver" as const,
        label: d.plate,
      })),
    ];
    if (dropoff) m.push({ id: "drop", lat: dropoff.lat, lng: dropoff.lng, kind: "dropoff", label: dropoff.name });
    return m;
  }, [userLoc, dropoff]);

  const selected = MOCK_DRIVERS.find((d) => d.id === selectedId) ?? null;

  const distanceFromMe = (d: MockDriver) => haversineMeters(userLoc[0], userLoc[1], d.lat, d.lng);

  const fareEstimate = useMemo(() => {
    if (!dropoff) return { min: 80, max: 150 };
    const km = haversineMeters(userLoc[0], userLoc[1], dropoff.lat, dropoff.lng) / 1000;
    const min = Math.max(50, Math.round(km * 35));
    const max = Math.max(80, Math.round(km * 50));
    return { min, max };
  }, [userLoc, dropoff]);

  const requestRide = (driver: MockDriver) => {
    try {
      localStorage.setItem("bv-active-driver", JSON.stringify(driver));
    } catch {
      /* noop */
    }
    toast.success("Driver requested!", { description: `${driver.name} • ETA ${driver.eta} min` });
    navigate({ to: "/ride" });
  };

  const findBike = () => {
    if (!dropoff) {
      toast.message("Set a destination first", { description: "Tap the search bar to choose where to go." });
      return;
    }
    // Pick the closest driver as default
    const closest = [...MOCK_DRIVERS].sort((a, b) => distanceFromMe(a) - distanceFromMe(b))[0];
    if (!closest) {
      toast.error(sheng.noDrivers);
      return;
    }
    requestRide(closest);
  };

  const clearDropoff = () => {
    setDropoff(null);
    try {
      localStorage.removeItem("bv-dropoff");
    } catch {
      /* noop */
    }
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
        <OsmMap
          center={userLoc}
          markers={markers}
          zoom={15}
          onMarkerClick={(id) => {
            if (MOCK_DRIVERS.some((d) => d.id === id)) setSelectedId(id);
          }}
        />

        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <button
            onClick={() => navigate({ to: "/customer/search" })}
            className="w-full bg-white rounded-2xl bv-shadow-elevated px-4 py-3 flex items-center gap-3"
          >
            <Search size={18} className="bv-text-grey" />
            <span className="flex-1 text-left text-sm truncate">
              {dropoff ? <span className="text-secondary font-medium">{dropoff.name}</span> : <span className="bv-text-grey">{t("whereTo")}</span>}
            </span>
            {dropoff && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clearDropoff();
                }}
                className="text-secondary/50"
              >
                <X size={16} />
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-secondary text-white px-4 py-2 flex justify-between items-center text-xs">
        <span>
          {t("estFare")}: <span className="font-semibold text-primary">KSh {fareEstimate.min}–{fareEstimate.max}</span>
        </span>
        <span className="text-white/60">{MOCK_DRIVERS.length} drivers nearby</span>
      </div>

      <div className="bg-white px-4 pt-4 pb-6 bv-shadow-elevated">
        <div className="flex gap-2 mb-3">
          <Button variant="default" className="flex-1 h-11 rounded-lg gap-2">
            <MapPin size={16} /> {t("setPickup")}
          </Button>
          <Button
            onClick={() => navigate({ to: "/customer/search" })}
            className="flex-1 h-11 rounded-lg gap-2 bg-secondary text-white hover:bg-secondary/90"
          >
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

      {/* Driver bottom sheet */}
      {selected && (
        <DriverSheet
          driver={selected}
          distanceMeters={distanceFromMe(selected)}
          onClose={() => setSelectedId(null)}
          onRequest={() => {
            requestRide(selected);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function DriverSheet({
  driver,
  distanceMeters,
  onClose,
  onRequest,
}: {
  driver: MockDriver;
  distanceMeters: number;
  onClose: () => void;
  onRequest: () => void;
}) {
  const distLabel = distanceMeters < 1000 ? `${Math.round(distanceMeters)}m away` : `${(distanceMeters / 1000).toFixed(1)}km away`;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[1500] bv-fade-up" onClick={onClose} />
      <div className="fixed left-0 right-0 bottom-0 z-[1600] bg-white rounded-t-3xl p-5 bv-shadow-elevated bv-fade-up">
        <div className="mx-auto w-12 h-1.5 rounded-full bg-secondary/15 mb-4" />
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary text-secondary font-display text-xl flex items-center justify-center">
            {driver.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{driver.name}</div>
            <div className="text-xs bv-text-grey flex items-center gap-1">
              <Star size={12} className="text-primary" fill="currentColor" /> {driver.rating} · {driver.totalRides} rides · {driver.plate}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary/5 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Distance" value={distLabel} />
          <Stat label="ETA" value={`${driver.eta} min`} />
          <Stat
            label="Helmet"
            value={driver.hasHelmet ? "🪖 Yes" : "⚠️ No"}
            tone={driver.hasHelmet ? "good" : "warn"}
          />
        </div>

        <div className="flex gap-2 mt-5">
          <a
            href={`tel:${driver.phone}`}
            className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={18} />
          </a>
          <Button onClick={onRequest} className="flex-1 h-12 rounded-xl text-base font-semibold">
            Request This Driver
          </Button>
        </div>

        <button onClick={onClose} className="w-full text-center text-xs bv-text-grey mt-3">
          See all drivers
        </button>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  const toneCls = tone === "good" ? "bg-[oklch(0.78_0.18_152/0.15)] text-[oklch(0.45_0.18_152)]" : tone === "warn" ? "bg-[oklch(0.85_0.16_60/0.2)] text-[oklch(0.45_0.16_60)]" : "bg-secondary/5 text-secondary";
  return (
    <div className={`rounded-xl p-2.5 ${toneCls}`}>
      <div className="text-[10px] uppercase opacity-70">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
