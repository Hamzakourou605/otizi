import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Download, Plus, Mail, Phone, ShoppingCart, 
  Wallet, FileText, CheckCircle2, ChevronLeft, ChevronRight, Activity, X, Loader2, TrendingUp
} from 'lucide-react';
import MonthChips from '../components/MonthChips';
import API from '../config';

const AdminClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [activeTab, setActiveTab] = useState('Transactions');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState('achat');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txNote, setTxNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    fetchData('');
  }, [id]);

  const fetchData = async (month) => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        axios.get(`${API}/clients/${id}`, { headers }),
        axios.get(`${API}/transactions/client/${id}${month ? `?mois=${month}` : ''}`, { headers })
      ]);
      setClient(cRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (val) => {
    setFilterMonth(val);
    fetchData(val);
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get(
        `${API}/export/pdf?client_id=${id}${filterMonth ? `?mois=${filterMonth}` : ''}`,
        { headers, responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${client.nom}_${filterMonth || 'Global'}.pdf`;
      a.click();
    } catch {
      alert('Erreur lors du téléchargement');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/transactions`, {
        client_id: id,
        type: txType,
        montant: parseFloat(txAmount),
        description: txDesc,
        note: txNote
      }, { headers });
      
      setIsModalOpen(false);
      setTxAmount('');
      setTxDesc('');
      setTxNote('');
      toast.success("Transaction ajoutée avec succès !");
      fetchData(filterMonth); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !client) return <div className="p-12 text-center text-slate-400">Loading profile...</div>;
  if (!client) return <div className="p-12 text-center text-rose-500">Client not found.</div>;

  // Compute totals
  const safeTransactions = transactions || [];
  const totalPurchases = safeTransactions.filter(t => ['achat', 'correction'].includes(t.type)).reduce((acc, t) => acc + (t.montant || 0), 0);
  const totalPayments = safeTransactions.filter(t => ['paiement', 'bonus', 'remise'].includes(t.type)).reduce((acc, t) => acc + (t.montant || 0), 0);
  
  // Calculate previous balance (from the oldest transaction in the current view)
  const previousBalance = safeTransactions.length > 0 
    ? safeTransactions[safeTransactions.length - 1].old_balance 
    : (client?.current_balance || 0);

  // Calculate new balance based on the previous balance and the current view's transactions
  const finalBalance = previousBalance + totalPurchases - totalPayments;
  
  const tabs = ['Overview', 'Transactions', 'Credit Analysis', 'Documents'];

  return (
    <div className="space-y-6 relative">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
        <Link to="/admin/clients" className="hover:text-indigo-600 transition-colors">Clients</Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-800">Client Details</span>
      </div>

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-5">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nom || 'Client')}&background=4f46e5&color=fff&size=128&bold=true`}
            alt={client.nom || 'Client'}
            className="w-16 h-16 rounded-2xl shadow-sm"
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{client.nom || 'Client Inconnu'}</h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                Premium Tier
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {client.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {client.telephone || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 border border-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10"><Wallet size={120} className="-mr-6 -mb-6" /></div>
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1 relative z-10">SOLDE PRÉCÉDENT</p>
          <h3 className="text-3xl font-black tracking-tight mb-2 relative z-10">{previousBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</h3>
          <p className="text-[10px] font-semibold text-indigo-100 relative z-10 flex items-center gap-1">
            Avant cette période
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingCart size={16} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ACHATS</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-2">{totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</h3>
          <p className="text-[10px] font-semibold text-slate-500">Last 30 Days</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet size={16} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PAIEMENTS</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-2">{totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</h3>
          <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> ALL ON TIME</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4 relative z-10">
            <TrendingUp size={16} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NOUVEAU SOLDE</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-2">{finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</h3>
          <p className="text-[10px] font-semibold text-slate-500">Crédit total actuel</p>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-2 pt-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Transactions' && (
          <div>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <MonthChips selectedMonth={filterMonth} onChange={handleMonthChange} />
              <p className="text-xs font-semibold text-slate-500 hidden md:block">Showing 1-{transactions.length} of {transactions.length} transactions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic font-medium">No transactions found.</td>
                    </tr>
                  ) : (
                    safeTransactions.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{t.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              ['achat', 'correction'].includes(t.type) ? 'bg-indigo-600' : 'bg-emerald-500'
                            }`}></div>
                            <span className="text-sm font-bold text-slate-700 capitalize">{t.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{t.description}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Ref ID: TXN_{t._id ? t._id.substring(18).toUpperCase() : 'UNKNOWN'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">
                          {['achat', 'correction'].includes(t.type) ? '' : '-'}{(t.montant || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest uppercase rounded">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                {['achat', 'paiement'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTxType(type)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                      txType === type 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Amount (MAD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">MAD</span>
                  </div>
                  <input 
                    type="number" 
                    required 
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                <input 
                  type="text" 
                  required 
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="credit description"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Notes Internes (Optionnel)</label>
                <textarea 
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Notes privées pour l'admin..."
                  rows="2"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminClientDetails;
