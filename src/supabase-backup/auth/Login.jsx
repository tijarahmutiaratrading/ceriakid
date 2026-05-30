// ─────────────────────────────────────────────────────
// Login Page — Magic Link (Supabase Auth)
// ─────────────────────────────────────────────────────
import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setStatus('error');
      setError(error.message);
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Cek email anda!</h1>
          <p className="text-slate-600">
            Kami dah hantar magic link ke <strong>{email}</strong>. 
            Klik link tu untuk login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-2xl font-black text-slate-900">Selamat datang ke CeriaKid</h1>
          <p className="text-slate-600 mt-2">Masukkan email untuk login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-50"
          >
            {status === 'sending' ? 'Menghantar...' : 'Hantar Magic Link'}
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Tiada password diperlukan. Kami akan email anda link untuk login.
        </p>
      </div>
    </div>
  );
}