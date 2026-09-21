import GameShell from "./GameShell";

// Static shell (SSC-34): no auth() or data reads during render. User state loads
// in the browser after Clerk authenticates.
export default function GamePage() {
  return <GameShell />;
}
