import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, 
  Search, Plus, Bell, Shield, Activity, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton } from '../components/Skeleton';
import API from '../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API}/search?q=${q}`, { headers });
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Header SaaS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bonjour, Ahmed El Baissi</h1>
          <p className="text-slate-400 font-bold mt-1">Voici l'état actuel de votre réseau de crédit.</p>
        </div>
        
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un client (nom, tel, email)..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700"
          />
          
          {/* Search Results Dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center text-slate-400 font-bold">Recherche en cours...</div>
              ) : (
                searchResults.map(client => (
                  <button 
                    key={client._id}
                    onClick={() => navigate(`/admin/clients/${client._id}`)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      {(client.nom || '??').substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{client.nom}</p>
                      <p className="text-xs font-bold text-slate-400">{client.email} • {client.telephone}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Bell size={20} />
          </button>
          <button onClick={() => navigate('/admin/clients')} className="btn-primary !px-5">
            <Plus size={20} />
            <span className="hidden sm:inline">Nouveau Client</span>
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
            <Wallet size={160} />
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Dette Globale Totale</p>
          <h2 className="text-3xl font-black mb-4">{(stats?.global_credit || 0).toLocaleString()} <span className="text-sm opacity-60">MAD</span></h2>
          <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            <Shield size={10} /> Cumulatif
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
            <TrendingUp size={160} />
          </div>
          <p className="text-indigo-200 font-black text-xs uppercase tracking-widest mb-2">Crédit du mois</p>
          <h2 className="text-3xl font-black mb-4">{(stats?.this_month_credit || 0).toLocaleString()} <span className="text-sm opacity-60">MAD</span></h2>
          <div className="flex items-center gap-2 bg-indigo-500/30 w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            <Calendar size={10} /> MOIS EN COURS
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Mois Précédent</p>
            <h2 className="text-3xl font-black text-slate-800">{(stats?.prev_month_credit || 0).toLocaleString()} <span className="text-sm text-slate-300">MAD</span></h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
            <Clock size={14} /> Total du mois dernier
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Revenus (Paiements)</p>
            <h2 className="text-3xl font-black text-slate-800">{(stats?.total_revenue || 0).toLocaleString()} <span className="text-sm text-slate-300">MAD</span></h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
            <ArrowUpRight size={14} /> Global encaissé
          </div>
        </div>
      </div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Debtors */}
        <div className="card">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-rose-500" size={20} />
              Plus gros débiteurs
            </h3>
            <button onClick={() => navigate('/admin/clients')} className="text-indigo-600 font-black text-xs hover:underline">Voir tout</button>
          </div>
          <div className="p-6 space-y-4">
            {stats?.top_debtors.map((c, i) => (
              <div key={i} onClick={() => navigate(`/admin/clients/${c._id}`)} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">
                    {(c.nom || '??').substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{c.nom}</p>
                    <p className="text-[10px] font-bold text-slate-400">ID: {c._id.substring(18)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-rose-500 font-black">{(c.credit_total || 0).toLocaleString()} MAD</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Dette Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <Activity className="text-indigo-500" size={20} />
              Activités récentes
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {stats?.recent_transactions.map((tx, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'achat' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                  {tx.type === 'achat' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{tx.client_name || 'Inconnu'}</p>
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{tx.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${
                    tx.type === 'achat' ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {tx.type === 'achat' ? '+' : '-'}{(tx.montant || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
