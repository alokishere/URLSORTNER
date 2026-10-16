import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Home,
  Link2,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import instance from "../axios";
import { getInitials, getStoredUser } from "../lib/dashboardData";
import { cx } from "../components/dashboard/classNames";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home, end: true },
  { to: "/dashboard/links", label: "My Links", icon: Link2 },
  { to: "/dashboard/create", label: "Create New", icon: Plus },
  { to: "/dashboard/analytics", label: "Analytics", icon: SlidersHorizontal },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(getStoredUser());
  const navigate = useNavigate();
  const signOut = async () => {
    try {
      await instance.post("/user/logout");
    } catch {
      /* local sign-out still clears the client session */
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(
      query.trim()
        ? `/dashboard/links?search=${encodeURIComponent(query.trim())}`
        : "/dashboard/links",
    );
  };

  const navClass = ({ isActive }) =>
    cx(
      "focus-ring group flex min-h-11 items-center gap-3 rounded-xl border-l-2 px-3 text-sm transition",
      isActive
        ? "border-[var(--accent)] bg-(--secondary)/55 font-semibold text-(--primary-text)"
        : "border-transparent text-(--secondary-text) hover:bg-(--surface-soft) hover:text-(--primary-text)",
    );

  return (
    <div className="dashboard-app flex min-h-dvh text-(--primary-text)">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 cursor-pointer bg-(--primary-text)/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-65 -translate-x-full flex-col border-r border-(--border) bg-(--surface) transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0",
          sidebarOpen && "translate-x-0",
        )}
      >
        <div className="flex h-19 shrink-0 items-center gap-3 border-b border-(--border) px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary) text-white">
            <Link2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tracking-[0.22em] text-(--primary-text)">
            URLSORTNER
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            className="focus-ring ml-auto inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft) lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav
          aria-label="Dashboard navigation"
          className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5"
        >
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--secondary-text)">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={navClass}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t border-(--border) p-4">
          <div className="rounded-2xl bg-(--surface-soft)/65 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-(--primary-text)">Usage</span>
              <span className="text-(--secondary-text)">
                {user?.usage || 120} / 1,000 links
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--border)">
              <div className="h-full w-[12%] rounded-full bg-(--primary)" />
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/billing")}
              className="focus-ring mt-3 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) text-xs font-semibold text-(--primary-text) transition hover:bg-(--accent-deep)"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Upgrade plan
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-white">
              {getInitials(user)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-(--primary-text)">
                {user?.name || user?.fullName || "Alok Vishwakarma"}
              </p>
              <p className="truncate text-[11px] text-(--secondary-text)">
                {user?.email || "Free Plan"}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="focus-ring inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft) hover:text-(--danger)"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-19 shrink-0 items-center gap-3 border-b border-(--border) bg-(--background)/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            className="focus-ring inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft) lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <form
            onSubmit={submitSearch}
            className="relative min-w-0 max-w-172.5 flex-1"
          >
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
              aria-hidden="true"
            />
            <label className="sr-only" htmlFor="dashboard-search">
              Search links, campaigns, or keywords
            </label>
            <input
              id="dashboard-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search links, campaigns, or keywords..."
              className="focus-ring h-11 w-full rounded-xl border border-(--border) bg-(--surface) pl-11 pr-16 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/80"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-lg border border-(--border) bg-(--surface-soft) px-2 py-1 text-[10px] text-(--secondary-text) sm:block">
              ⌘ K
            </span>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() =>
                document.documentElement.classList.toggle("dim-mode")
              }
              aria-label="Toggle display mode"
              title="Toggle display mode"
              className="focus-ring hidden h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft) sm:inline-flex"
            >
              <Moon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/notifications")}
              aria-label="View notifications"
              title="Notifications"
              className="focus-ring relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft)"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-(--background) bg-[#d53e32]" />
            </button>
            <div className="relative ml-1 border-l border-(--border) pl-2">
              <button
                type="button"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                className="focus-ring flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 hover:bg-(--surface-soft)"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-[10px] font-bold text-white">
                  {getInitials(user)}
                </span>
                <span className="hidden text-left sm:block">
                  <strong className="block max-w-32 truncate text-xs text-(--primary-text)">
                    {user?.name || user?.fullName || "Alok Vishwakarma"}
                  </strong>
                  <small className="block text-[10px] text-(--secondary-text)">
                    Free Plan
                  </small>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-(--secondary-text) sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-(--border) bg-(--surface) p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/settings")}
                    className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-(--primary-text) hover:bg-(--surface-soft)"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-(--danger) hover:bg-(--surface-soft)"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex="-1"
          className="dashboard-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
