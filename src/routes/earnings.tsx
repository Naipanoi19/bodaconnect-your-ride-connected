import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, TrendingUp, Bike, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useT } from "@/lib/i18n/strings";

export const Route = createFileRoute("/earnings")({
  head: () => ({ meta: [{ title: "Earnings — BodaVert" }] }),
  component: EarningsPage,
});

const WEEK = [
  { d: "Mon", v: 980 },
  { d: "Tue", v: 1240 },
  { d: "Wed", v: 760 },
  { d: "Thu", v: 1420 },
  { d: "Fri", v: 1890 },
  { d: "Sat", v: 2150 },
  { d: "Sun", v: 1340 },
];

const MONTH = Array.from({ length: 30 }).map((_, i) => ({
  d: `${i + 1}`,
  v: 600 + Math.round(Math.random() * 1800),
}));

function EarningsPage() {
  const t = useT();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"today" | "week" | "month">("week");

  const data = tab === "month" ? MONTH : tab === "week" ? WEEK : [{ d: "Today", v: 1240 }];
  const total = data.reduce((s, d) => s + d.v, 0);
  const fee = Math.round(total * 0.05);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/driver" })}>
          <ChevronLeft size={22} />
        </button>
        <span className="font-display">{t("earnings")}</span>
      </header>

      <div className="bg-secondary text-white px-4 pb-5">
        <div className="text-xs text-white/60">Net earnings ({tab})</div>
        <div className="font-display text-4xl text-primary">KSh {(total - fee).toLocaleString()}</div>
        <div className="text-[11px] text-white/60 mt-1">
          Gross KSh {total.toLocaleString()} · Platform fee KSh {fee.toLocaleString()}
        </div>
      </div>

      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl bv-shadow-elevated p-1 flex">
          {(["today", "week", "month"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl ${tab === x ? "bg-primary text-secondary" : "bv-text-grey"}`}
            >
              {t(x)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 bg-white rounded-2xl mx-4 bv-shadow-card p-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="d" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip cursor={{ fill: "rgba(255,202,40,.15)" }} />
            <Bar dataKey="v" fill="#FFCA28" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        <Mini icon={<Bike size={16} className="text-secondary" />} label="Rides" value={tab === "month" ? 142 : tab === "week" ? 38 : 8} />
        <Mini icon={<Star size={16} className="text-primary fill-primary" />} label="Rating" value={4.8} />
        <Mini icon={<TrendingUp size={16} className="bv-text-success" />} label="vs last" value="+12%" />
      </div>

      <div className="px-4 mt-4 mb-6">
        <div className="text-xs font-medium bv-text-grey mb-2">Recent payouts</div>
        <div className="space-y-2">
          {[
            { id: 1, label: "M-Pesa · MX12AB", amt: 480, t: "2h ago" },
            { id: 2, label: "M-Pesa · MX12CD", amt: 620, t: "Yesterday" },
            { id: 3, label: "M-Pesa · MX12EF", amt: 1120, t: "Sat" },
          ].map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-3 flex justify-between items-center bv-shadow-card">
              <div>
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[10px] bv-text-grey">{p.t}</div>
              </div>
              <div className="font-display text-primary">+{p.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-3 bv-shadow-card">
      <div className="flex items-center gap-1">{icon}<span className="text-[10px] bv-text-grey">{label}</span></div>
      <div className="font-display text-lg mt-1">{value}</div>
    </div>
  );
}
