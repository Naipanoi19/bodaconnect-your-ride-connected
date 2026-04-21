import { createFileRoute } from "@tanstack/react-router";
import { Splash } from "@/screens/Splash";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <Splash />;
}
