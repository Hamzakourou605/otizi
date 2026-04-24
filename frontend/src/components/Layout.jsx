import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, BarChart3, 
  LogOut, Search, Bell, HelpCircle, Building2, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const homeRoute = isAdmin ? '/admin' : '/client';

  const adminNav = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/admin' },
    { icon: Users,           label: 'Clients',       path: '/admin/clients' },
    { icon: FileText,        label: 'Transactions',  path: '/admin/transactions' },
    { icon: BarChart3,       label: 'Statistiques',  path: '/admin/statistics' },
    { icon: ShieldAlert,     label: 'Audit Logs',    path: '/admin/logs' },
  ];

  const clientNav = [
    { icon: LayoutDashboard, label: 'Accueil',    path: '/client' },
    { icon: FileText,        label: 'Historique', path: '/client/history' },
    { icon: BarChart3,       label: 'Mon Profil', path: '/profile' },
  ];

  const navItems = isAdmin ? adminNav : clientNav;

  const isActive = (path) => {
    if (path === '/admin' && location.pathname !== '/admin') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed left-0 top-0 bottom-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">
              Oti<span className="text-indigo-600">Zi</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              Magasin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-100/50 relative overflow-hidden'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
              )}
              <item.icon size={18} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom: logout */}
        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">

        {/* Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-40 items-center justify-end px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100/60">
          {/* Right Actions - Profile Only */}
          <div className="flex items-center gap-6">


            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{user?.nom}</p>
                <p className="text-[10px] font-semibold text-slate-500">{isAdmin ? 'Ahmed El Baissi' : 'Client Account'}</p>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'U')}&background=4f46e5&color=fff&bold=true`}
                alt="avatar"
                className="w-10 h-10 rounded-full shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Oti<span className="text-indigo-600">Zi</span>
            </span>
          </div>
          <Link to="/profile">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'U')}&background=4f46e5&color=fff&bold=true`}
              alt="avatar"
              className="w-9 h-9 rounded-full shadow-sm"
            />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-[1400px] mx-auto"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 py-1 flex items-center justify-around pb-safe">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive(item.path) ? 2.5 : 2}
              />
              <span className="text-[10px] font-bold">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
};

export default Layout;
