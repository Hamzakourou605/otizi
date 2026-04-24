import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

const Stats = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stats & Analytics</h1>
        <p className="text-slate-500 font-medium">Performance overview for the current period</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm uppercase tracking-widest">
              <TrendingUp size={18} />
              <span>Highest Debt</span>
            </div>
            <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-3xl font-black text-slate-800">2,450 <span className="text-sm opacity-60">MAD</span></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-widest">
              <TrendingDown size={18} />
              <span>Paid Back</span>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">High</span>
          </div>
          <p className="text-3xl font-black text-slate-800">88<span className="text-xl">%</span></p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-800">Credit Evolution</h2>
          <BarChart3 className="text-slate-400" />
        </div>
        <div className="h-48 flex items-end justify-between gap-2 px-2">
           {/* Dummy Chart Bars */}
           {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
             <div key={i} className="w-full bg-indigo-50 rounded-t-xl relative group">
                <div 
                  className="absolute bottom-0 w-full bg-indigo-600 rounded-t-xl transition-all duration-500 group-hover:bg-indigo-500" 
                  style={{ height: `${height}%` }}
                ></div>
             </div>
           ))}
        </div>
        <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 px-4">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20"><Activity size={64} /></div>
        <div className="flex items-center gap-2 mb-4 text-indigo-200 font-bold uppercase tracking-widest text-xs">
          <AlertCircle size={16} />
          <span>Smart Insight</span>
        </div>
        <p className="font-medium text-indigo-50 leading-relaxed mb-6 max-w-sm">
          Le client <strong className="text-white font-black">John Doe</strong> a remboursé 100% de son crédit tôt pendant 3 mois consécutifs. Envisagez d'augmenter sa limite de crédit.
        </p>
        <button className="bg-white text-indigo-600 font-black py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
          Voir recommandation
        </button>
      </motion.div>

    </div>
  );
};

export default Stats;
