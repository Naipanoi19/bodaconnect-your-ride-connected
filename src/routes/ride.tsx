import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Phone, Share2, Navigation, MapPin, Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OsmMap, type MapMarker } from "@/components/bv/OsmMap";
import { useT, sheng } from "@/lib/i18n/strings";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { RONGAI_CENTER, type MockDriver } from "@/lib/mock/drivers";
import type { PlaceResult } from "@/lib/services/nominatim";
import { fareFromDistance, getRoute } from "@/lib/services/osrm";

export const Route = createFileRoute("/ride")({
  head: () => ({ meta: [{ title: "Active ride — BodaVert" }] }),
  component: RideScreen,
});

type Phase = "matching" | "arriving" | "in_progress" | "completed";

function RideScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [phase, setPhase] = useState<Phase>("matching");
  const [holdProgress, setHoldProgress] = useState(0);
  const [userLoc, setUserLoc] = useState<[number, number]>(RONGAI_CENTER);
  const [driver, setDriver] = useState<MockDriver | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);
  const [driverLoc, setDriverLoc] = useState<[number, number]>([RONGAI_CENTER[0] + 0.005, RONGAI_CENTER[1] + 0.005]);
  const [route, setRoute] = useState<Array<[number, number]> | null>(null);
  const [routeMeta, setRouteMeta] = useState<{ km: number; mins: number } | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate active driver + dropoff from localStorage
  useEffect(() => {
    try {
      const d = localStorage.getItem("bv-active-driver");
      if (d) {
        const parsed = JSON.parse(d) as MockDriver;
        setDriver(parsed);
        setDriverLoc([parsed.lat, parsed.lng]);
      }
      const drop = localStorage.getItem("bv-dropoff");
      if (drop) setDropoff(JSON.parse(drop) as PlaceResult);
    } catch {
      /* noop */
    }
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setUserLoc([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Simulate ride progression
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("arriving"), 2500);
    const t2 = setTimeout(() => setPhase("in_progress"), 7000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Simulate driver moving toward user
  useEffect(() => {
    if (phase !== "arriving") return;
    const interval = setInterval(() => {
      setDriverLoc(([dLat, dLng]) => [
        dLat + (userLoc[0] - dLat) * 0.15,
        dLng + (userLoc[1] - dLng) * 0.15,
      ]);
    }, 1500);
    return () => clearInterval(interval);
  }, [phase, userLoc]);

  // OSRM route from user to dropoff
  useEffect(() => {
    if (!dropoff) return;
    const ctrl = new AbortController();
    void (async () => {
      const r = await getRoute(userLoc, [dropoff.lat, dropoff.lng], ctrl.signal);
      if (r) {
        setRoute(r.coords);
        setRouteMeta({ km: r.distanceMeters / 1000, mins: Math.round(r.durationSeconds / 60) });
      }
    })();
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropoff?.lat, dropoff?.lng]);

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = [
      { id: "user", lat: userLoc[0], lng: userLoc[1], kind: "user", label: "You" },
      { id: "driver", lat: driverLoc[0], lng: driverLoc[1], kind: "driver", label: driver?.plate ?? "Driver" },
    ];
    if (dropoff) m.push({ id: "drop", lat: dropoff.lat, lng: dropoff.lng, kind: "dropoff", label: dropoff.name });
    return m;
  }, [userLoc, driverLoc, driver, dropoff]);

  const triggerPanic = async () => {
    toast.success(t("panicSent"), { description: sheng.broadcastSent });
    try {
      if (user) {
        await supabase.from("panic_events").insert({
          customer_id: user.id,
          lat: userLoc[0],
          lng: userLoc[1],
        });
      }
    } catch { /* offline ok */ }
  };

  // Hold-to-panic logic (3 second hold)
  const startHold = () => {
    setHoldProgress(0);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdInterval.current = setInterval(() => {
      setHoldProgress((p) => {
        if (p >= 100) {
          if (holdInterval.current) clearInterval(holdInterval.current);
          void triggerPanic();
          return 0;
        }
        return p + 4; // ~2.5s to fill
      });
    }, 100);
  };
  const cancelHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHoldProgress(0);
  };

  const phaseLabel = {
    matching: "Finding nearby boda…",
    arriving: t("driverEnRoute"),
    in_progress: t("rideInProgress"),
    completed: "Ride complete",
  }[phase];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/customer" })}>
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <div className="font-display text-base">{phaseLabel}</div>
          <div className="text-[11px] text-primary">{phase === "arriving" ? "ETA 3 min" : phase === "in_progress" ? "12 min to drop-off" : "Hold tight…"}</div>
        </div>
      </header>

      <div className="relative flex-1">
        <OsmMap markers={markers} center={userLoc} zoom={15} routeCoords={route ?? undefined} />
      </div>

      {/* Driver card */}
      <div className="bg-white px-4 pt-4 pb-6 bv-shadow-elevated space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl">🏍️</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{driver?.name ?? "Finding driver…"}</div>
            <div className="text-[11px] bv-text-grey truncate">
              {driver ? `${driver.plate} · ⭐ ${driver.rating} · ${driver.totalRides} rides` : "Matching nearby boda"}
            </div>
          </div>
          <a
            href={driver ? `tel:${driver.phone}` : undefined}
            className="w-10 h-10 rounded-full bv-bg-success text-white flex items-center justify-center"
          >
            <Phone size={16} />
          </a>
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) void navigator.share({ title: "My BodaVert ride", url });
              else {
                void navigator.clipboard.writeText(url);
                toast.success("Trip link copied");
              }
            }}
            className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center"
          >
            <Share2 size={16} />
          </button>
        </div>

        <div className="bv-bg-grey rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center gap-2"><MapPin size={12} className="bv-text-success" /> You ({userLoc[0].toFixed(4)}, {userLoc[1].toFixed(4)})</div>
          <div className="flex items-center gap-2"><Flag size={12} /> {dropoff?.name ?? "No destination set"}</div>
          {routeMeta && (
            <div className="flex items-center gap-2 pt-1 border-t border-border/50 mt-1">
              <Navigation size={12} className="text-primary" />
              <span>
                {routeMeta.km.toFixed(1)} km · {routeMeta.mins} min · KSh {fareFromDistance(routeMeta.km * 1000).min}–{fareFromDistance(routeMeta.km * 1000).max}
              </span>
            </div>
          )}
        </div>

        {/* Panic */}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          className="w-full h-14 rounded-xl bv-bg-danger text-white font-display tracking-wide relative overflow-hidden bv-pulse-panic"
        >
          <span
            className="absolute inset-y-0 left-0 bg-white/25"
            style={{ width: `${holdProgress}%`, transition: "width .08s linear" }}
          />
          <span className="relative">🚨 {t("holdToPanic")}</span>
        </button>

        <Button
          variant="outline"
          className="w-full h-11 rounded-xl"
          onClick={() => {
            navigate({ to: "/rate" });
          }}
        >
          <Navigation size={14} /> Mark complete
        </Button>
      </div>
    </div>
  );
}
