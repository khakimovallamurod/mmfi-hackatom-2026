import React from 'react';

const StatCard = ({ title, value, icon, color, trend, up }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30',
    red: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded border ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
