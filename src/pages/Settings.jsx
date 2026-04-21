import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Shield, Eye, Globe, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { lang, changeLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Eye size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">Dark Mode</div>
              <div className="text-sm text-gray-500">Enable or disable dark theme</div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 transition-all"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Localization</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {['uz', 'en', 'ru'].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`py-3 rounded-2xl font-bold uppercase transition-all ${
                  lang === l 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {['Email Alerts', 'System Sounds', 'Push Notifications'].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">{item}</span>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
