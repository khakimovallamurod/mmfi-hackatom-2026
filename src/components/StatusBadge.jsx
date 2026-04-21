import React from 'react';

const StatusBadge = ({ status, text }) => {
  const statusStyles = {
    green: 'bg-green-500 text-white shadow-green-500/20',
    yellow: 'bg-yellow-500 text-white shadow-yellow-500/20',
    red: 'bg-red-500 text-white shadow-red-500/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${statusStyles[status] || statusStyles.green}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
