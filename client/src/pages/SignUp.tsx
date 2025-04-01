import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      showToast('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,1))]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE4MjAzQSIgc3RvcC1vcGFjaXR5PSIwLjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9InRyYW5zcGFyZW50Ii8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 blur-xl rounded-xl transform rotate-6"></div>
        <div className="relative p-8 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-purple-400" />
            <h2 className="text-3xl font-bold ml-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Create Account</h2>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-200">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors h-5 w-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;