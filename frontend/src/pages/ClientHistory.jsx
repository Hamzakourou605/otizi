import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Download, Filter, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../config';

const ClientHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const res = await axios.get(`${API}/transactions/my`, { headers });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.date || '').includes(searchQuery)
  );

  const downloadPDF = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const res = await axios.get(`${API}/export/pdf`, { headers, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mon_Historique_OtiZi.pdf`;
      a.click();
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-xs tracking-widest uppercase">Chargement de l'historique...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique complet</h1>
          <p className="text-slate-400 font-bold mt-1">Retrouvez toutes vos transactions passées.</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={18} />
          Télécharger en PDF
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 border-b border-slate-50">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher une transaction..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {filteredTransactions.length} Opérations trouvées
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic font-bold">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, i) => (
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
                        {['achat', 'correction'].includes(t.type) ? '+' : '-'}{t.montant.toLocaleString()} MAD
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientHistory;
