import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 6)  { setError('Le mot de passe doit faire au moins 6 caractères'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🗺️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">WAYFINDER</h1>
          <p className="text-blue-100 mt-1 text-sm">Rejoignez la plateforme</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Créer un compte</h2>
          <p className="text-gray-400 text-sm mb-6">
            Le premier compte créé obtient le rôle <span className="font-semibold text-brand-500">Admin</span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input className="input" placeholder="Jean Dupont" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" className="input" placeholder="vous@exemple.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" className="input" placeholder="Minimum 6 caractères" value={password}
                onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
              <input type="password" className="input" placeholder="Répéter le mot de passe" value={confirm}
                onChange={e => setConfirm(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Création…</>
                : 'Créer mon compte'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
