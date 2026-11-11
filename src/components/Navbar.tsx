import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/start', label: 'Start a Campaign' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin', label: 'Admin' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-stone-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="GiveRoot home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-primary-300 hover:text-primary-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              My Giving
            </Link>
            <Link
              to="/start"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Start a Campaign
            </Link>
          </div>
          <button
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-stone-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-stone-700 hover:bg-stone-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
            <ShieldCheck className="h-4 w-4" />
            Demo payments — no real money moves
          </div>
        </nav>
      )}
    </header>
  );
}
