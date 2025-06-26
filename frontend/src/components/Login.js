import { AtSign, KeyRound, LogIn } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-500">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            Feedback<span className="text-blue-200">Pro</span>
          </h1>
          <p className="text-blue-100 mt-2 text-lg">Welcome back! Please sign in to your account.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-lg shadow-sm text-white bg-white/10 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-lg shadow-sm text-white bg-white/10 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 rounded-lg shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-4 text-center">
          <Link to="/register-manager" className="text-blue-200 hover:underline text-sm font-medium">Register as Manager</Link>
        </div>
        <div className="mt-6 bg-white/10 border border-white/20 text-blue-100 px-4 py-3 rounded-lg text-sm">
          <h4 className="font-bold mb-2">Demo Credentials:</h4>
          <div className="space-y-1 text-xs">
            <p><strong>Manager:</strong> <span className="font-mono">john.manager@company.com</span> / <span className="font-mono">manager123</span></p>
            <p><strong>Employee:</strong> <span className="font-mono">alice.employee@company.com</span> / <span className="font-mono">employee123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;