import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Crown, Bike, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — BodaVert" }] }),
  component: AdminDashboard,
});

type StageStatus = "pending" | "active" | "inactive";
type StageRow = {
  id: string;
  stage_name: string;
  status: StageStatus;
  total_drivers: number;
  chairman_id: string | null;
};

type PanicRow = {
  id: string;
  customer_id: string;
  lat: number | null;
  lng: number | null;
  triggered_at: string;
  status: "active" | "resolved" | "false_alarm";
};

function AdminDashboard() {
  const { user, roles, init } = useAuthStore();
  const [stages, setStages] = useState<StageRow[]>([]);
  const [panics, setPanics] = useState<PanicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => init(), [init]);

  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [s, p] = await Promise.all([
        supabase.from("stages").select("id,stage_name,status,total_drivers,chairman_id"),
        supabase.from("panic_events").select("id,customer_id,lat,lng,triggered_at,status").order("triggered_at", { ascending: false }).limit(20),
      ]);
      setStages((s.data ?? []) as StageRow[]);
      setPanics((p.data ?? []) as PanicRow[]);
      setLoading(false);
    })();
  }, [user]);

  const approveStage = async (id: string) => {
    const { error } = await supabase.from("stages").update({ status: "active" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStages((arr) => arr.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
    toast.success("Stage approved");
  };

  const suspendStage = async (id: string) => {
    const { error } = await supabase.from("stages").update({ status: "inactive" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStages((arr) => arr.map((s) => (s.id === id ? { ...s, status: "inactive" } : s)));
    toast.success("Stage suspended");
  };

  const resolvePanic = async (id: string) => {
    const { error } = await supabase.from("panic_events").update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPanics((arr) => arr.map((p) => (p.id === id ? { ...p, status: "resolved" } : p)));
    toast.success("Panic resolved");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-sm">
          <ShieldCheck size={48} className="text-primary mx-auto" />
          <h1 className="font-display text-2xl mt-3">Admin sign-in required</h1>
          <Link to="/login" className="inline-block mt-4">
            <Button>Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-sm">
          <AlertTriangle size={48} className="bv-text-danger mx-auto" />
          <h1 className="font-display text-2xl mt-3">Admin access required</h1>
          <p className="text-sm bv-text-grey mt-2">
            Your account doesn't have admin role. Ask a backend admin to grant it.
          </p>
          <Link to="/" className="inline-block mt-4">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingStages = stages.filter((s) => s.status === "pending");
  const activeStages = stages.filter((s) => s.status === "active");
  const activePanics = panics.filter((p) => p.status === "active");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-white px-4 py-4">
        <div className="font-display text-lg">🛡️ Admin Dashboard</div>
        <div className="text-xs text-primary">BodaVert Operations</div>
      </header>

      <div className="px-4 py-4 grid grid-cols-3 gap-2">
        <Stat label="Stages" value={stages.length} icon={<Crown size={14} />} />
        <Stat label="Pending" value={pendingStages.length} icon={<Bike size={14} />} highlight />
        <Stat label="Panics" value={activePanics.length} icon={<AlertTriangle size={14} />} danger={activePanics.length > 0} />
      </div>

      <Section title={`Pending chairman approvals (${pendingStages.length})`}>
        {loading ? (
          <Skeletons />
        ) : pendingStages.length === 0 ? (
          <Empty text="No pending approvals 🎉" />
        ) : (
          pendingStages.map((s) => (
            <Row key={s.id} title={s.stage_name} subtitle={`${s.total_drivers} drivers`}>
              <Button size="sm" onClick={() => approveStage(s.id)} className="h-8 gap-1">
                <CheckCircle2 size={14} /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => suspendStage(s.id)} className="h-8 gap-1">
                <XCircle size={14} /> Reject
              </Button>
            </Row>
          ))
        )}
      </Section>

      <Section title={`Active panic events (${activePanics.length})`}>
        {loading ? (
          <Skeletons />
        ) : activePanics.length === 0 ? (
          <Empty text="No active emergencies ✅" />
        ) : (
          activePanics.map((p) => (
            <Row
              key={p.id}
              title={`Panic @ ${new Date(p.triggered_at).toLocaleTimeString()}`}
              subtitle={p.lat && p.lng ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` : "No location"}
              tone="danger"
            >
              <Button size="sm" onClick={() => resolvePanic(p.id)} className="h-8">
                Resolve
              </Button>
            </Row>
          ))
        )}
      </Section>

      <Section title={`Active stages (${activeStages.length})`}>
        {loading ? (
          <Skeletons />
        ) : activeStages.length === 0 ? (
          <Empty text="No active stages yet" />
        ) : (
          activeStages.map((s) => (
            <Row key={s.id} title={s.stage_name} subtitle={`${s.total_drivers} drivers · active`}>
              <Button size="sm" variant="outline" onClick={() => suspendStage(s.id)} className="h-8">
                Suspend
              </Button>
            </Row>
          ))
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value, icon, highlight, danger }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean; danger?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${danger ? "bv-bg-danger text-white" : highlight ? "bg-primary text-secondary" : "bg-white bv-shadow-card"}`}>
      <div className="flex items-center justify-center gap-1 text-[10px] opacity-80">{icon}{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs font-semibold bv-text-grey uppercase tracking-wide mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ title, subtitle, tone, children }: { title: string; subtitle: string; tone?: "danger"; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-3 flex items-center gap-2 bv-shadow-card ${tone === "danger" ? "bg-[oklch(0.95_0.05_25)] border border-[oklch(0.7_0.2_25)]" : "bg-white"}`}>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        <div className="text-[10px] bv-text-grey">{subtitle}</div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Skeletons() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="h-[60px] rounded-xl bg-muted animate-pulse" />
      ))}
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-6 text-xs bv-text-grey">{text}</div>;
}