import type { ReactElement } from "react";
import { useState } from "react";
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
import { Icons } from "@/lib/icons";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

const subNavLinkClass =
  "block w-full rounded-[var(--brand-radius)] px-3 py-2 text-left text-sm font-medium " +
  "text-[var(--brand-fg-muted)] transition-colors hover:bg-[var(--brand-hover)]";

// A signed-out visitor has no business seeing the chat screen: send them to
// sign in instead, same as a dead or expired session would.
function RequireSession({ children }: { children: ReactElement }) {
  const session = useSession();
  if (!session) return <Navigate to="/sign-in" replace />;
  return children;
}

// The screens behind sign-in render inside the side menu. Login and the other
// screens shown before sign-in render on their own, with no menu around them.
//
// On small viewports the whole nav collapses behind an accessible menu
// control. "Sign out" is not a standalone action any more: it lives nested
// under "Chat", the one place in the menu where a signed-in session matters.
function Shell() {
  const navigate = useRouterNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(true);

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      // logout() has already dropped the local session before rejecting --
      // sign-out still has to complete even when the server call to
      // invalidate the session fails (offline, 500, etc).
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
        <div className="mb-4 flex items-center justify-between gap-2">
          <p
            className="px-3 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"Simple chat application"}
          </p>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="shell-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-[var(--brand-radius)] p-1.5 text-[var(--brand-fg-muted)] hover:bg-[var(--brand-hover)] md:hidden"
          >
            <Icons.Menu size={18} />
          </button>
        </div>

        <nav
          id="shell-nav"
          aria-label="Main"
          className={`flex-col gap-1 ${menuOpen ? "flex" : "hidden"} md:flex`}
        >
          <NavLink to="/reset-password" className={navLinkClass}>
            {"Set a new password"}
          </NavLink>

          <div>
            <div className="flex items-center gap-1">
              <NavLink to="/chat" className={navLinkClass} style={{ flex: 1 }}>
                {"Chat"}
              </NavLink>
              <button
                type="button"
                aria-label={chatExpanded ? "Collapse Chat menu" : "Expand Chat menu"}
                aria-expanded={chatExpanded}
                aria-controls="chat-subnav"
                onClick={() => setChatExpanded((open) => !open)}
                className="rounded-[var(--brand-radius)] p-1.5 text-[var(--brand-fg-muted)] hover:bg-[var(--brand-hover)]"
              >
                <Icons.ChevronDown
                  size={14}
                  style={{ transform: chatExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                  aria-hidden="true"
                />
              </button>
            </div>

            {chatExpanded && (
              <ul
                id="chat-subnav"
                className="ml-3 flex flex-col gap-1 border-l pl-2"
                style={{ borderColor: "var(--brand-border)" }}
              >
                <li>
                  <button type="button" onClick={handleSignOut} className={subNavLinkClass}>
                    {"Sign out"}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </nav>
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
