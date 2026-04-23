import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { InstallPrompt } from "@/components/bv/InstallPrompt";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary text-white px-6">
      <div className="max-w-md text-center bv-fade-up">
        <div className="text-7xl">🏍️💨</div>
        <h1 className="text-6xl font-display text-primary mt-2">404</h1>
        <h2 className="mt-3 text-xl font-display">Eish! Hii page imepotea</h2>
        <p className="mt-2 text-sm text-white/60">
          The page you're looking for took a detour. Let's get you back on the road.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary bv-shadow-yellow"
          >
            🏠 Go home
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "manifest",
        href: "/manifest.webmanifest",
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <OfflineBanner />
      <Outlet />
      <InstallPrompt />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
