import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignUpProps {
  onSuccess: () => void;
  onNavigateToSignIn: () => void;
}

export default function SignUp({ onSuccess, onNavigateToSignIn }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please populate both email and password coordinates.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          data.user?.identities?.length === 0
            ? 'This email coordinates are already registered. Try signing in instead.'
            : 'Registration Successful! Redirecting to Home page...'
        );
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-6" id="signup-container">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Register Credentials</h2>
        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
          Deploy your credentials to synchronize customized color collections securely.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold" htmlFor="signup-email">
            Email Coordinates
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="email"
              id="signup-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@agency.io"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
            />
          </div>
        </div>

        {/* Password input field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold" htmlFor="signup-password">
            Establish Password (6+ Characters)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="password"
              id="signup-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Feedback block */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs mt-2" id="signup-error-block">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-350 text-xs mt-2" id="signup-success-block">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
            <p className="leading-relaxed font-semibold">{successMsg}</p>
          </div>
        )}

        {/* Submit authentication CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-center py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-[#00FFD1] text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer mt-2"
        >
          {loading ? 'Initializing Credentials...' : 'Register Secure Account'}
        </button>
      </form>

      <div className="border-t border-white/5 pt-4 text-center">
        <p className="text-xs text-slate-400">
          Already have coordinates?{' '}
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="text-[#00FFD1] font-bold hover:underline bg-transparent border-0 cursor-pointer"
          >
            Access Sign In Form
          </button>
        </p>
      </div>
    </div>
  );
}
