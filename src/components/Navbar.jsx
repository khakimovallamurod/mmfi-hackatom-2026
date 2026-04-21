import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t, lang, changeLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          AES Smart
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="mr-1 flex items-center gap-2 sm:mr-4">
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800 outline-none transition-colors focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="uz">UZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={t.toggle_theme}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              {t.home}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  {t.dashboard}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>{t.logout}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-lg font-medium transition-colors"
              >
                {t.login}
              </Link>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="p-2 text-gray-700 dark:text-gray-300 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="md:hidden mt-3 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t.home}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t.dashboard}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  <LogOut size={16} />
                  <span>{t.logout}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
