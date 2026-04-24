import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, TrendingUp, Clock, Calendar, 
  ArrowUpRight, ArrowDownRight, Bell, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { toast } from 'react-hot-toast';
import socket from '../services/socket';
import API from '../config';

const ClientDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();

    // WebSocket listener for real-time credit updates
    socket.on('credit_update', (data) => {
      console.log("Real-time update received:", data);
      toast.success(`Votre solde a été mis à jour : ${data.new_balance.toLocaleString()} FCFA`, {
        icon: '💰',
        duration: 5000
      });
      fetchData(); // Refresh all data
    });

    return () => {
      socket.off('credit_update');
    };
  }, []);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const [sRes, tRes] = await Promise.all([
        axios.get(`${API}/client/summary`, { headers }),
        axios.get(`${API}/transactions/my`, { headers })
      ]);
      setSummary(sRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-xs tracking-widest uppercase">Synchronisation sécurisée...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bonjour, {user?.nom}</h1>
            <p className="text-slate-400 font-bold">Heureux de vous revoir sur OtiZi.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
          <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-px bg-slate-100 mx-2"></div>
          <div className="pr-4 pl-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Compte</p>
            <p className="text-xs font-black text-emerald-500">CLIENT VÉRIFIÉ</p>
          </div>
        </div>
      </div>

      {/* ─── Main Balance Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
          <div className="absolute right-0 bottom-0 opacity-10 -mr-8 -mb-8">
            <Wallet size={200} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Mon Solde Actuel</p>
            <h2 className="text-5xl font-black mb-8 tracking-tighter">
              {(summary?.balance || 0).toLocaleString()} <span className="text-xl opacity-40 font-bold">FCFA</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <ArrowDownRight size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Total Remboursé</span>
                </div>
                <span className="font-black">{(summary?.total_paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                    <ArrowUpRight size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Total Crédit</span>
                </div>
                <span className="font-black">{(summary?.total_credit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Chart Evolution ─── */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 px-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-indigo-600" size={20} />
              Évolution de ma dette
            </h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-500 outline-none">
              <option>6 Derniers Mois</option>
              <option>Cette Année</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.monthly_evolution || []}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800}}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── Recent Transactions ─── */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
            <Clock className="text-slate-400" size={20} />
            Historique des opérations
          </h3>
          <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">
            Tout Voir
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-700">{t.date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-800">{t.description}</p>
                    {t.note && <p className="text-[10px] font-bold text-slate-400 italic">Note: {t.note}</p>}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      ['achat', 'correction'].includes(t.type) 
                        ? 'bg-rose-50 text-rose-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className={`text-sm font-black ${
                      ['achat', 'correction'].includes(t.type) ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {['achat', 'correction'].includes(t.type) ? '+' : '-'}{t.montant.toLocaleString()}
                    </p>
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

export default ClientDashboard;
