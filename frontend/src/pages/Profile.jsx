import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, LogOut, ChevronRight, Bell, Lock, FileText } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  const menuItems = [
    { icon: Bell, label: 'Notifications', sub: 'Gérer les alertes' },
    { icon: Lock, label: 'Sécurité', sub: 'Mot de passe & accès' },
    { icon: FileText, label: 'Mes rapports', sub: 'Historique des exports PDF' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
      >
        {/* Decoration */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-sm overflow-hidden mb-4 ring-4 ring-white/20 shadow-xl">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'U')}&background=6366f1&color=fff&size=200&bold=true`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{user?.nom}</h2>
          <p className="text-indigo-200 font-medium mt-1">{user?.email}</p>
          <span className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-amber-400 text-amber-900' : 'bg-white/20 text-white'}`}>
            {user?.role === 'admin' ? '👑 Admin' : '👤 Client'}
          </span>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4"
      >
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informations du compte</h3>
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><User size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom</p>
            <p className="font-black text-slate-800">{user?.nom}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Mail size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p>
            <p className="font-black text-slate-800">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Shield size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rôle</p>
            <p className="font-black text-slate-800 capitalize">{user?.role}</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm"
      >
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest p-6 pb-0">Paramètres</h3>
        <div className="p-3 space-y-1">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group text-left"
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-800">{item.label}</p>
                <p className="text-xs font-medium text-slate-400">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-all" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 py-5 rounded-[2rem] font-black text-lg transition-all"
        >
          <LogOut size={22} />
          Déconnexion
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
