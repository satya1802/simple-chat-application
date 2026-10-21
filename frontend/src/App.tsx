import * as React from "react";
import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";
import ResetPassword from "@/screens/ResetPassword";
import Chat from "@/screens/Chat";
import { getToken, signOut } from "@/lib/api";
import { useNavigate } from "@/lib/navigate";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The screens behind sign-in render inside the side menu. Login and the other
// screens shown before sign-in render on their own, with no menu around them.
function Shell() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("sign-in");
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
          className="mt-4 block rounded-[var(--brand-radius)] px-3 py-2 text-left text-sm font-medium text-[var(--brand-fg-muted)] transition-colors hover:bg-[var(--brand-hover)] hover:text-[var(--brand-fg)]"
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

/** Redirect to /sign-in when there is no stored session token. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) {
    return <Navigate to="/sign-in" replace />;
  }
  return <>{children}</>;
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
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}