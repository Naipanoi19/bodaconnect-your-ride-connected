import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useT } from "@/lib/i18n/strings";

export function OfflineBanner() {
  const t = useT();
  const [online, setOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const goOnline = () => {
      setOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && !showBackOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bv-fade-up ${
        online ? "bv-bg-success" : "bv-bg-offline"
      }`}
      role="status"
    >
      {online ? <Wifi size={14} /> : <WifiOff size={14} />}
      <span>{online ? t("backOnline") : t("offlineBanner")}</span>
    </div>
  );
}