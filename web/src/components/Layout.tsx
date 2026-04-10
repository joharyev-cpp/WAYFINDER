import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavItem { to: string; icon: string; label: string }

const navItems: NavItem[] = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/beacons',   icon: '📡', label: 'Beacons' },
  { to: '/services',  icon: '🛎️', label: 'Services' },
  { to: '/simulator', icon: '🔍', label: 'Simulateur' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar (md+) ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-xl">🗺️</div>
            <div>
              <p className="font-extrabold text-gray-900 leading-none">WAYFINDER</p>
              <p className="text-xs text-gray-400 mt-0.5">Beacon Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-500 text-sm uppercase">
              {user?.name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role === 'admin' ? '👑 Admin' : '🔧 Opérateur'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <span className="font-extrabold text-gray-900 text-lg">WAYFINDER</span>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-xl bg-gray-100">
            <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </header>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 space-y-1 z-50">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-500' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span>{item.icon}</span>{item.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">
              <span>🚪</span>Déconnexion
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white border-t border-gray-100 flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs font-medium gap-0.5 transition-colors ${
                  isActive ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
