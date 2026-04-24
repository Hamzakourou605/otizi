import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, MoreHorizontal, Loader2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import API from '../config';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTransactions(res.data.recent_transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t._id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Transactions</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitor all credit activities and payments across the system.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={16} />
          Export Ledger
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 border-b border-slate-100">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by client, description or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <p className="text-xs font-semibold text-slate-500">Showing {filteredTransactions.length} recent transactions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-600" />
                    <p>Loading ledger...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {t.client_name.substring(0,2).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-slate-800">{t.client_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {t.type === 'achat' ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 rounded text-[10px] font-black uppercase">
                            <ArrowUpRight size={12} /> Achat
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase">
                            <ArrowDownRight size={12} /> Paiement
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{t.description}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">
                      {(t.montant).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{t.date}</td>
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

export default AdminTransactions;
