import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import Breadcrumbs from './Breadcrumbs';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] transition-colors dark:bg-slate-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-60">
        <AdminHeader onMenuOpen={() => setSidebarOpen(true)} />
        <Breadcrumbs />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
