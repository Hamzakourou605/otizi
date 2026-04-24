import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Clock, User, DollarSign, Activity } from 'lucide-react';
import API from '../config';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API}/admin/logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Chargement des audits...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Journal d'Audit 🔐</h1>
        <p className="text-slate-400 font-bold mt-1">Traçabilité complète des actions administratives.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-indigo-500" />
                      <span className="text-sm font-black text-slate-800">{log.admin_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-700">{log.client_name || 'N/A'}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-black text-slate-900">{log.amount ? `${log.amount.toLocaleString()} MAD` : '-'}</p>
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

export default AdminLogs;
