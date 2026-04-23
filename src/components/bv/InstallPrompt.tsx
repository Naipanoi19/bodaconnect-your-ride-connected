import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "bv-install-dismissed";

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    // Hide if already installed (display-mode standalone)
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setVisible(false);
    setEvt(null);
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-[1700] px-4 pb-4 bv-fade-up pointer-events-none">
      <div className="mx-auto max-w-md rounded-2xl bg-primary text-secondary p-4 bv-shadow-yellow flex items-center gap-3 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
          <Smartphone size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm">📱 Install BodaVert on your phone!</div>
          <button
            onClick={dismiss}
            className="text-[11px] underline opacity-70"
          >
            Not now
          </button>
        </div>
        <button
          onClick={install}
          className="bg-secondary text-primary text-xs font-semibold rounded-lg px-3 py-2"
        >
          Add to Home
        </button>
        <button onClick={dismiss} className="opacity-60" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}