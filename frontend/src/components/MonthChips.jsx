import React from 'react';

const MonthChips = ({ selectedMonth, onChange }) => {
  // Generate the last 12 months
  const months = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    months.push({ value: monthValue, label: monthLabel });
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onChange('')}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
          selectedMonth === '' 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
        }`}
      >
        Tout
      </button>
      
      {months.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            selectedMonth === m.value 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};

export default MonthChips;
