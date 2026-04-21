import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Megaphone, BarChart3, Search, ChevronRight, Star, Bike, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/strings";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/chairman")({
  head: () => ({ meta: [{ title: "Chairman dashboard — BodaVert" }] }),
  component: ChairmanDashboard,
});

type DriverRow = {
  user_id: string;
  stage_name: string | null;
  status: "pending" | "verified" | "suspended" | "rejected";
  rating_average: number;
  total_rides: number;
  submitted_at: string;
};

const STATUS_FILTERS = ["all", "pending", "verified", "suspended"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function ChairmanDashboard() {
  const t = useT();
  const { user, init } = useAuthStore();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = init();
    return c;
  }, [init]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("drivers")
        .select("user_id,stage_name,status,rating_average,total_rides,submitted_at")
        .order("submitted_at", { ascending: false });
      setDrivers((data ?? []) as DriverRow[]);
      setLoading(false);
    })();
  }, [user]);

  const counts = {
    total: drivers.length,
    pending: drivers.filter((d) => d.status === "pending").length,
    verified: drivers.filter((d) => d.status === "verified").length,
    suspended: drivers.filter((d) => d.status === "suspended").length,
  };

  const visible = drivers.filter(
    (d) =>
      (filter === "all" || d.status === filter) &&
      (d.stage_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-4 flex items-center justify-between">
        <div>
          <div className="font-display text-lg">Rongai Central Stage</div>
          <div className="text-xs text-primary">{t("chairmanDashboard")}</div>
        </div>
        <div className="flex items-center gap-3">
          <Bell size={20} />
          <Link to="/settings"><Settings size={20} /></Link>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-4 gap-2">
        <Stat label={t("totalDrivers")} value={counts.total} />
        <Stat label={t("pending")} value={counts.pending} highlight={counts.pending > 0} />
        <Stat label={t("verified")} value={counts.verified} />
        <Stat label={t("suspended")} value={counts.suspended} />
      </div>

      {/* Action cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <Link
          to="/broadcast"
          className="bg-primary text-secondary rounded-2xl p-4 flex flex-col gap-1 bv-shadow-yellow active:scale-[0.98] transition-transform"
        >
          <Megaphone size={24} />
          <div className="font-semibold text-sm mt-1">📢 {t("broadcast")}</div>
          <div className="text-[10px] opacity-70">Send to all drivers</div>
        </Link>
        <Link
          to="/earnings"
          className="bg-secondary text-white rounded-2xl p-4 flex flex-col gap-1 bv-shadow-card active:scale-[0.98] transition-transform"
        >
          <BarChart3 size={24} className="text-primary" />
          <div className="font-semibold text-sm mt-1">📊 {t("stageStats")}</div>
          <div className="text-[10px] opacity-70">Earnings & trends</div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-1 border-b border-border">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
              filter === f ? "border-primary text-foreground" : "border-transparent bv-text-grey"
            }`}
          >
            {f === "all" ? "All" : t(f as "pending" | "verified" | "suspended")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 bv-text-grey" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchDrivers")}
            className="pl-9 h-10 bv-bg-grey border-0 rounded-lg"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pb-6 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 bv-fade-up">
            <Bike size={48} className="bv-text-grey mx-auto mb-3" />
            <div className="font-display text-lg">{t("noDriversYet")}</div>
            <div className="text-xs bv-text-grey mt-1">{t("noDriversSub")}</div>
          </div>
        ) : (
          visible.map((d) => <DriverCard key={d.user_id} d={d} />)
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-2 text-center ${highlight ? "bg-primary" : "bg-white bv-shadow-card"}`}>
      <div className="font-display text-2xl">{value}</div>
      <div className="text-[9px] bv-text-grey leading-tight mt-0.5">{label}</div>
    </div>
  );
}

function DriverCard({ d }: { d: DriverRow }) {
  const statusColor = {
    pending: "bg-primary text-secondary",
    verified: "bv-bg-success text-white",
    suspended: "bv-bg-danger text-white",
    rejected: "bg-muted bv-text-grey",
  }[d.status];

  return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-3 bv-shadow-card">
      <div className="w-12 h-12 rounded-full bv-bg-grey flex items-center justify-center relative">
        <Bike size={20} className="bv-text-grey" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            d.status === "verified" ? "bv-bg-success" : d.status === "pending" ? "bg-primary" : "bv-bg-danger"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{d.stage_name ?? "Unnamed driver"}</div>
        <div className="text-[10px] bv-text-grey flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="text-primary fill-primary" /> {d.rating_average.toFixed(1)}
          </span>
          <span>· {d.total_rides} rides</span>
        </div>
      </div>
      <span className={`text-[10px] font-medium px-2 py-1 rounded-full capitalize ${statusColor}`}>{d.status}</span>
      <ChevronRight size={16} className="bv-text-grey" />
    </div>
  );
}