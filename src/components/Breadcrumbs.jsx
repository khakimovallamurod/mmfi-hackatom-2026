import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="mb-3 flex items-center gap-2 overflow-x-auto px-4 pt-3 text-sm text-slate-500 md:mb-4 md:px-8 md:pt-4">
      <Link to="/" className="text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-300">
        <Home size={16} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={name}>
            <ChevronRight size={14} />
            {isLast ? (
              <span className="capitalize font-bold text-slate-700 dark:text-slate-200">
                {name}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="capitalize whitespace-nowrap text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-300"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
