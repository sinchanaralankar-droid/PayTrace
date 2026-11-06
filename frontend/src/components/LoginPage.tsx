import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('merchant.admin@paytrace.store');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      name: 'Asha Rao (Store Owner)',
      email: email,
      role: 'Merchant Admin'
    });
  };

  const handleQuickLogin = (role: string, userEmail: string, userName: string) => {
    setEmail(userEmail);
    onLogin({
      name: userName,
      email: userEmail,
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-skyBg via-pastel-bg to-pastel-lavenderBg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official Brand Logo */}
        <div
          className="mx-auto h-20 w-20 rounded-2xl overflow-hidden border-2 border-pastel-skyBorder shadow-md mb-3 bg-[#1E60F2]"
        >
          <img src="/logo.png" alt="PayTrace Logo" className="h-full w-full object-cover" />
        </div>

        <h2 className="text-3xl font-extrabold text-pastel-darkText tracking-tight">
          PayTrace
        </h2>
        <p className="mt-1 text-xs text-pastel-subText max-w-xs mx-auto">
          AI-Powered PayPal Payment Verification & Decision Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-pastel-card py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-pastel-border sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-pastel-darkText mb-1">
                Merchant Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pastel-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-pastel-bg border border-pastel-border rounded-xl text-pastel-darkText focus:outline-none focus:border-pastel-skySolid focus:ring-1 focus:ring-pastel-skySolid transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pastel-darkText mb-1">
                Sandbox Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pastel-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-pastel-bg border border-pastel-border rounded-xl text-pastel-darkText focus:outline-none focus:border-pastel-skySolid focus:ring-1 focus:ring-pastel-skySolid transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-pastel-subText cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-pastel-border text-pastel-skySolid focus:ring-pastel-skySolid"
                />
                Remember merchant session
              </label>
              <span className="text-pastel-skySolid font-semibold">PayPal Sandbox Mode</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-pastel-skySolid hover:bg-sky-700 shadow-md shadow-sky-600/20 transition"
            >
              <span>Sign In to Merchant Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-pastel-border space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-pastel-muted text-center mb-2">
              ⚡ One-Click Demo Sign-In
            </span>

            <button
              type="button"
              onClick={() => handleQuickLogin('Store Manager', 'asha.rao@store.com', 'Asha Rao')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pastel-mintBg border border-pastel-mintBorder text-left hover:bg-emerald-100/70 transition"
            >
              <div className="text-xs">
                <span className="font-bold text-pastel-mintText block">Asha Rao (Merchant Store Owner)</span>
                <span className="text-[11px] text-pastel-subText">Access active store orders & decision queue</span>
              </div>
              <span className="text-xs font-bold text-pastel-mintSolid">Login →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Risk Auditor', 'risk.analyst@paytrace.com', 'Devin Patel')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pastel-lavenderBg border border-pastel-lavenderBorder text-left hover:bg-purple-100/70 transition"
            >
              <div className="text-xs">
                <span className="font-bold text-pastel-lavenderText block">Devin Patel (Risk Operations Lead)</span>
                <span className="text-[11px] text-pastel-subText">Access AI claim auditing & rule settings</span>
              </div>
              <span className="text-xs font-bold text-pastel-lavenderSolid">Login →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
