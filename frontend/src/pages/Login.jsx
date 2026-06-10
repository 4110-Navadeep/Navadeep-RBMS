import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] border border-slate-200">
        
        {/* Left Side: Illustration / Welcome Block */}
        <div className="md:col-span-5 bg-gradient-to-br from-navy-900 to-navy-800 text-white p-10 flex flex-col justify-between items-center text-center">
          <Link to="/" className="flex items-center space-x-2 text-white self-start">
            <BookOpen size={24} className="text-white" />
            <span className="text-lg font-bold tracking-wider">RBMS</span>
          </Link>
          
          <div className="space-y-6 max-w-xs">
            {/* Simple Graphic details */}
            <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-sans">Welcome Back!</h2>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Login to continue your booking journey, reserve seminar rooms, labs, or marriage halls.
              </p>
            </div>
          </div>
          
          <div className="text-xs text-slate-400">
            &copy; 2026 RBMS System
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <div className="md:col-span-7 p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Account Login
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Please enter your credentials to login
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-red-700 font-medium">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Password
                  </label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 disabled:bg-navy-600 text-white font-bold rounded-lg text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="text-center text-sm text-slate-500 pt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
