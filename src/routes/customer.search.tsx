import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, MapPin, Search, Loader2, Clock, Home, Briefcase, Crosshair } from "lucide-react";
import { searchPlaces, reverseGeocode, type PlaceResult } from "@/lib/services/nominatim";

export const Route = createFileRoute("/customer/search")({
  head: () => ({ meta: [{ title: "Where to? — BodaVert" }] }),
  component: SearchPage,
});

const RECENTS_KEY = "bv-recent-places";

function loadRecents(): PlaceResult[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as PlaceResult[]).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function saveRecent(p: PlaceResult) {
  try {
    const list = loadRecents().filter((r) => r.id !== p.id);
    list.unshift(p);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 3)));
  } catch {
    /* noop */
  }
}

function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<PlaceResult[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    setRecents(loadRecents());
  }, []);

  // Debounced search
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchPlaces(q);
      setResults(r);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  const pickPlace = (p: PlaceResult) => {
    saveRecent(p);
    try {
      localStorage.setItem("bv-dropoff", JSON.stringify(p));
    } catch {
      /* noop */
    }
    navigate({ to: "/customer" });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        pickPlace({
          id: `cur-${Date.now()}`,
          name: "Current location",
          displayName: name,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          type: "current",
        });
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-secondary px-3 py-3 flex items-center gap-2 sticky top-0 z-10">
        <button onClick={() => navigate({ to: "/customer" })} className="p-1">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 flex items-center bg-white rounded-xl px-3 h-10 gap-2">
          <Search size={16} className="bv-text-grey" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a place in Kenya"
            className="flex-1 bg-transparent outline-none text-sm text-secondary placeholder:bv-text-grey"
          />
          {loading && <Loader2 size={14} className="animate-spin bv-text-grey" />}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {q.trim().length < 2 && (
          <div className="px-4 pt-4 pb-2 space-y-1">
            <Quick icon={<Crosshair size={16} className="text-primary" />} label="Use my current location" onClick={useCurrentLocation} />
            <Quick icon={<Home size={16} className="text-primary" />} label="Home (set later)" disabled />
            <Quick icon={<Briefcase size={16} className="text-primary" />} label="Work (set later)" disabled />
            {recents.length > 0 && (
              <>
                <div className="text-[11px] uppercase font-semibold bv-text-grey mt-4 mb-1 px-2">Recent</div>
                {recents.map((r) => (
                  <Result key={r.id} p={r} onClick={() => pickPlace(r)} icon={<Clock size={16} className="bv-text-grey" />} />
                ))}
              </>
            )}
          </div>
        )}

        {q.trim().length >= 2 && (
          <div className="px-2 pt-2">
            {!loading && results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🔎</div>
                <div className="text-sm font-medium">No matches</div>
                <div className="text-xs bv-text-grey">Try a landmark or estate name</div>
              </div>
            ) : (
              results.map((r) => (
                <Result key={r.id} p={r} onClick={() => pickPlace(r)} icon={<MapPin size={16} className="text-primary" />} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Quick({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="w-9 h-9 rounded-full bg-secondary/5 flex items-center justify-center">{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Result({ p, onClick, icon }: { p: PlaceResult; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-muted/40 text-left">
      <div className="w-9 h-9 rounded-full bg-secondary/5 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{p.name}</div>
        <div className="text-[11px] bv-text-grey truncate">{p.displayName}</div>
      </div>
    </button>
  );
}