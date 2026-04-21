import React from 'react';
import { Bell, Moon, Sun, Globe, LogOut, User, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AdminHeader = ({ onMenuOpen }) => {
  const { t, lang, changeLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return t.dashboard;
      case '/analytics': return t.analytics;
      case '/reports': return t.reports;
      case '/team': return t.team_members;
      case '/settings': return 'Settings';
      default: return 'Admin Console';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="text-xs font-bold uppercase tracking-tight text-slate-800 dark:text-white sm:text-sm">
          {getPageTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-2 dark:border-slate-800 sm:pr-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded text-slate-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="hidden items-center gap-1 sm:flex">
            <Globe size={14} className="text-slate-400" />
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="cursor-pointer bg-transparent text-[10px] font-bold uppercase text-slate-700 outline-none dark:text-slate-300"
            >
              <option value="uz">UZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>
        </div>
        
        <button className="relative rounded p-2 text-slate-500 hover:text-blue-600">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>

        <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-800 sm:ml-2 sm:gap-3 sm:pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">Admin</p>
            <p className="text-[9px] text-green-500 font-bold uppercase">Online</p>
          </div>
          <div className="group relative">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer">
              <User size={16} />
            </div>
            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1">
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
