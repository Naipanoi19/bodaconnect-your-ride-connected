import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, Bike, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type Role } from "@/store/authStore";
import { useT } from "@/lib/i18n/strings";

export const Route = createFileRoute("/choose-role")({
  head: () => ({ meta: [{ title: "Choose your role — BodaVert" }] }),
  component: ChooseRolePage,
});

function ChooseRolePage() {
  const navigate = useNavigate();
  const t = useT();
  const setRole = useAuthStore((s) => s.setRole);

  const choose = async (role: Role, dest: string) => {
    if (role !== "customer") {
      try {
        await setRole(role);
      } catch (e) {
        toast.error("Imeshindwa kuweka role", { description: (e as Error).message });
        return;
      }
    }
    navigate({ to: dest });
  };

  return (
    <div
      className="min-h-screen relative px-6 py-10 flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.18 0 0 / 0.92), oklch(0.18 0 0 / 0.78)), radial-gradient(ellipse at top, oklch(0.84 0.16 86 / 0.4), transparent 60%)",
      }}
    >
      <div className="text-center mt-8 mb-10 bv-fade-up">
        <h1 className="font-display text-3xl text-white">{t("whoAreYou")}</h1>
        <p className="text-sm text-white/70 mt-2">{t("chooseRole")}</p>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <RoleCard
          onClick={() => choose("customer", "/permissions")}
          bg="bg-white"
          iconBg="bg-primary"
          iconColor="text-secondary"
          titleColor="text-secondary"
          subColor="bv-text-grey"
          chevronColor="text-primary"
          Icon={User}
          title={t("customer")}
          sub={t("customerSub")}
        />
        <RoleCard
          onClick={() => choose("driver", "/driver/verification")}
          bg="bg-primary"
          iconBg="bg-secondary"
          iconColor="text-primary"
          titleColor="text-secondary"
          subColor="text-secondary/80"
          note={t("driverNote")}
          chevronColor="text-secondary"
          Icon={Bike}
          title={t("driver")}
          sub={t("driverSub")}
        />
        <RoleCard
          onClick={() => choose("chairman", "/chairman")}
          bg="bg-secondary"
          iconBg="bg-primary"
          iconColor="text-secondary"
          titleColor="text-white"
          subColor="text-white/70"
          note={t("chairmanNote")}
          chevronColor="text-primary"
          Icon={Users}
          title={t("chairman")}
          sub={t("chairmanSub")}
        />
      </div>
    </div>
  );
}

interface RoleCardProps {
  onClick: () => void;
  bg: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  subColor: string;
  note?: string;
  chevronColor: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  sub: string;
}

function RoleCard({ onClick, bg, iconBg, iconColor, titleColor, subColor, note, chevronColor, Icon, title, sub }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${bg} rounded-2xl p-4 flex items-center gap-4 bv-shadow-card active:scale-[0.98] transition-transform`}
    >
      <div className={`${iconBg} w-14 h-14 rounded-full flex items-center justify-center shrink-0`}>
        <Icon size={26} className={iconColor} />
      </div>
      <div className="flex-1 text-left">
        <div className={`font-semibold text-lg ${titleColor}`}>{title}</div>
        <div className={`text-xs ${subColor}`}>{sub}</div>
        {note && <div className="text-[10px] bv-text-grey mt-0.5">{note}</div>}
      </div>
      <ChevronRight size={22} className={chevronColor} />
    </button>
  );
}