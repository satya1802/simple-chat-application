import type { ReactElement } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate as useRouterNavigate,
} from "react-router-dom";

import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";
import ResetPassword from "@/screens/ResetPassword";
import Chat from "@/screens/Chat";
import { logout, useSession } from "@/lib/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// A signed-out visitor has no business seeing the chat screen: send them to
// sign in instead, same as a dead or expired session would.
function RequireSession({ children }: { children: ReactElement }) {
  const session = useSession();
  if (!session) return <Navigate to="/sign-in" replace />;
  return children;
}

// The screens behind sign-in render inside the side menu. Login and the other
// screens shown before sign-in render on their own, with no menu around them.
function Shell() {
  const navigate = useRouterNavigate();

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      navigate("/sign-in", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className="w-56 shrink-0 border-r p-4"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <p
          className="mb-4 px-3 text-sm font-semibold"
          style={{ fontFamily: "var(--brand-font-heading)" }}
        >
          {"Simple chat application"}
        </p>
        <nav className="flex flex-col gap-1">
          <NavLink to="/reset-password" className={navLinkClass}>
            {"Set a new password"}
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            {"Chat"}
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 block w-full rounded-[var(--brand-radius)] px-3 py-2 text-left text-sm font-medium text-[var(--brand-fg-muted)] transition-colors hover:bg-[var(--brand-hover)]"
        >
          {"Sign out"}
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route element={<Shell />}>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/chat"
          element={
            <RequireSession>
              <Chat />
            </RequireSession>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
