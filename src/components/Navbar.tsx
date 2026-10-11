import { useState } from 'react';
import { Bus, Menu, X, LogOut, Home, Search, Plus, List, Calendar, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const passengerNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Find a Ride', path: '/find-ride', icon: Search },
  { label: 'Find Ride Home', path: '/find-ride-home', icon: Home },
  { label: 'My Bookings', path: '/my-bookings', icon: Calendar },
  { label: 'Profile', path: '/profile', icon: User },
];

const driverNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Post a Ride', path: '/post-ride', icon: Plus },
  { label: 'My Rides', path: '/my-rides', icon: List },
  { label: 'Find a Ride', path: '/find-ride', icon: Search },
  { label: 'Profile', path: '/profile', icon: User },
];

export function Navbar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = profile?.role === 'DRIVER' ? driverNav : passengerNav;

  function handleNav(path: string) {
    onNavigate(path);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('/dashboard')} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 shadow-sm">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-bold leading-tight text-slate-900">Campus Smart Ride</span>
            <span className="block text-[11px] leading-tight text-slate-500">Privacy-Preserving Rides</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <span className="block text-sm font-semibold text-slate-800">{profile?.full_name}</span>
            <span className="block text-xs text-slate-500">{profile?.role}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="my-2 border-t border-slate-100" />
            <div className="flex items-center justify-between px-3 py-2">
              <div>
                <span className="block text-sm font-semibold text-slate-800">{profile?.full_name}</span>
                <span className="block text-xs text-slate-500">{profile?.role}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export type { UserRole };
