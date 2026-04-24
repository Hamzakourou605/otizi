import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Sparkles, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../config';

const Register = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/register`, { 
        nom, 
        email, 
        telephone, 
        password,
        role: 'client' 
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600 px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 rounded-full -translate-x-1/2 translate-y-1/2 opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-100">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bienvenue !</h1>
            <p className="text-slate-400 font-bold mt-2">Créez votre compte en quelques secondes</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 border border-rose-100 text-rose-500 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Jean Dupont"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-700"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="email" 
                    placeholder="jean@..."
                    className="w-full pl-11 pr-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-700 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text" 
                    placeholder="06..."
                    className="w-full pl-11 pr-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-700 text-sm"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? "Création..." : (
                <>
                  Créer mon compte
                  <UserPlus size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-bold">
              Vous avez déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline font-black">Se connecter</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
