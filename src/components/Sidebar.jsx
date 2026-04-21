import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  X,
  Database,
  BarChart2
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: t.dashboard, path: '/dashboard' },
    { icon: <BarChart2 size={18} />, label: t.analytics, path: '/analytics' },
    { icon: <Database size={18} />, label: t.reports, path: '/reports' },
    { icon: <Users size={18} />, label: t.team_members, path: '/team' },
    { icon: <Home size={18} />, label: t.home, path: '/' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col bg-[#1e293b] text-slate-300 shadow-lg transition-transform lg:w-60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      <div className="h-16 flex items-center px-6 bg-[#0f172a] border-b border-slate-700">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-blue-400" />
          <span className="text-lg font-bold text-white tracking-tight">DESAL ADMIN</span>
        </div>
        <button
          type="button"
          className="ml-auto rounded p-1 text-slate-300 hover:bg-slate-800 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center border-t border-slate-700">
        System Version 2.0.0
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
