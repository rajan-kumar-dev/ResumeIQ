import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { auth, signOut } = useAuth();

  return (
    <header className="border-b border-ink-border px-6 py-4 flex items-center justify-between">
      <p className="font-display text-xl tracking-tight">ResumeIQ</p>
      <div className="flex items-center gap-4 text-sm text-parchment/70">
        <span>{auth?.email}</span>
        <button
          onClick={signOut}
          className="text-parchment/50 hover:text-parchment transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
