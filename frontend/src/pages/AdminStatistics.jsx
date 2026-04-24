import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, Users, Wallet, 
  Loader2, Activity, Calendar, Download, 
  ShieldCheck, AlertCircle, TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { toast } from 'react-hot-toast';
import API from '../config';

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12 Months');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="font-bold text-sm tracking-widest uppercase">Analyse des données en cours...</p>
    </div>
  );

  const pieData = [
    { name: 'Risque Faible', value: 65, color: '#10b981' },
    { name: 'Risque Moyen', value: 20, color: '#f59e0b' },
    { name: 'Risque Élevé', value: 15, color: '#4f46e5' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* ─── Header SaaS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analyses & Insights</h1>
          <p className="text-slate-400 font-bold mt-1">Performance du réseau de crédit en temps réel.</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
          {['12 Mois', '6 Mois', '30 Jours'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                timeRange === range 
                  ? 'bg-slate-900 text-white shadow-xl' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-stat bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100">
          <p className="text-indigo-200 font-black text-[10px] uppercase tracking-widest mb-1">CAPITAL TOTAL</p>
          <h3 className="text-3xl font-black mb-3">{(stats?.global_credit || 0).toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
             <TrendingUp size={14} /> +12% vs LY
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">SCORE MOYEN</p>
          <h3 className="text-3xl font-black text-slate-900 mb-3">742</h3>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
             <TrendingUp size={14} /> +8 pts ce mois
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">TAUX D'IMPAYÉS</p>
          <h3 className="text-3xl font-black text-rose-500 mb-3">1.84%</h3>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
             <TrendingDown size={14} /> -0.2% amélioration
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">REVENUS GÉNÉRÉS</p>
          <h3 className="text-3xl font-black text-slate-900 mb-3">{(stats?.total_revenue || 0).toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500">
             <Activity size={14} /> Flux Constant
          </div>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <BarChart3 className="text-indigo-600" size={24} />
             Volume d'Activité Mensuel
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { m: 'Jan', v: 450000 }, { m: 'Fév', v: 520000 }, { m: 'Mar', v: 480000 },
                { m: 'Avr', v: 610000 }, { m: 'Mai', v: 590000 }, { m: 'Jun', v: 720000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}} />
                <Bar dataKey="v" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px] flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-800 mb-8 self-start flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" size={24} />
             Répartition des Risques
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-black text-slate-900">100%</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio</span>
            </div>
          </div>
          <div className="w-full space-y-3 mt-6">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-xs font-bold text-slate-600">{d.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Top Performers Table ─── */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">Top Débiteurs Actifs</h3>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
             <Download size={16} /> Rapport Complet
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Crédit Actuel</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risque</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.top_debtors?.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors cursor-pointer group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                        {(c.nom || '??').substring(0,2).toUpperCase()}
                      </div>
                      <p className="font-black text-slate-800">{c.nom}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900">{(c.credit_total || 0).toLocaleString()} FCFA</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.credit_total > 5000 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {c.credit_total > 5000 ? 'CRITIQUE' : 'NORMAL'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Vérifié</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminStatistics;
