import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterManager() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/register-manager', { name, email, password });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-500">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Register as Manager</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              className="block w-full px-3 py-2 border border-white/30 rounded-lg shadow-sm text-white bg-white/10 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 sm:text-sm"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="block w-full px-3 py-2 border border-white/30 rounded-lg shadow-sm text-white bg-white/10 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              className="block w-full px-3 py-2 border border-white/30 rounded-lg shadow-sm text-white bg-white/10 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-lg shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-200 hover:underline text-sm font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterManager; 