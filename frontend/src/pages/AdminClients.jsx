import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Plus, Filter, MoreHorizontal, Loader2, 
  Search, X, UserPlus, Phone, Mail, Lock 
} from 'lucide-react';
import API from '../config';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'credit'
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
         navigate('/login');
         return;
      }
      const res = await axios.get(`${API}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error.response || error);
      if (error.response?.status === 422 || error.response?.status === 401) {
        alert("Session invalide. Redirection vers la connexion...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/register`, {
        ...formData,
        role: 'client'
      });
      setIsModalOpen(false);
      setFormData({ nom: '', email: '', telephone: '', password: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Erreur lors de la création du client");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskScore = (credit) => {
    const val = credit || 0;
    if (val > 10000) return { score: 642, label: 'HIGH EXPOSURE', color: 'text-amber-500', dot: 'bg-amber-500' };
    if (val < 0) return { score: 812, label: 'EXCELLENT', color: 'text-emerald-500', dot: 'bg-emerald-500' };
    return { score: 784, label: 'GOOD', color: 'text-emerald-500', dot: 'bg-emerald-500' };
  };

  const filteredClients = (clients || [])
    .filter(c => 
      (c.nom || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.telephone && c.telephone.includes(searchQuery)) ||
      (c._id || '').includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.nom || '').localeCompare(b.nom || '');
      if (sortBy === 'credit') return (b.credit_total || 0) - (a.credit_total || 0);
      return 0;
    });

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review and manage credit profiles across your enterprise portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 border border-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={16} />
            Nouveau client
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 border-b border-slate-100">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, phone, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setSortBy(sortBy === 'name' ? 'credit' : 'name')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                sortBy === 'credit' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Filter size={14} />
              {sortBy === 'credit' ? 'Sorted by Debt' : 'Sort by Name'}
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-500">Showing {filteredClients.length} clients</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Client Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Credit Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Credit</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Utilization</th>
                <th className="px-6 py-4 border-b border-slate-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-600" />
                    <p>Loading clients...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => {
                  const score = getRiskScore(c.credit_total);
                  const limit = 50000;
                  const utilization = c.credit_total > 0 ? Math.min((c.credit_total / limit) * 100, 100) : 0;
                  const avatarColor = 'bg-indigo-100 text-indigo-700';

                  return (
                    <tr 
                      key={c._id} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/clients/${c._id}`)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor}`}>
                            {(c.nom || 'U').substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{c.nom}</p>
                            <p className="text-[10px] font-semibold text-slate-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${score.dot}`}></div>
                          <span className={`text-sm font-black ${score.color}`}>{score.score}</span>
                          <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase ${score.color} bg-current/10`}>
                            {score.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {(c.credit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${score.dot}`} style={{ width: `${utilization}%` }}></div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 w-10">{utilization.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Nouveau client</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enregistrement Enterprise</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Nom complet</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Adresse Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="jean@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mot de passe temporaire</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-2 flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-70"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
