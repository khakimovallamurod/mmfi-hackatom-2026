import React from 'react';

const SurfaceCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? (
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default SurfaceCard;
