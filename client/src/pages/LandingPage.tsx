import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, AlertTriangle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      <header className="py-6 px-8 flex items-center justify-between border-b border-gray-800/50 -mt-16">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            CrimeReport
          </span>
        </div>
        <div className="space-x-4">
          <Link
            to="/signin"
            className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-300 to-indigo-400">
            Crime Reporting System
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Report incidents securely and efficiently, helping to create a safer community for everyone.
          </p>
          
          <div className="flex justify-center gap-6 flex-col sm:flex-row">
            <Link
              to="/signin"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-lg shadow-blue-700/20 flex items-center justify-center"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/admin-login"
              className="px-8 py-4 bg-transparent border border-gray-600 rounded-lg hover:bg-white/5 hover:border-gray-400 transition duration-300 flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              <span>Admin Login</span>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-xl backdrop-blur-sm bg-white/5 border border-gray-800/50 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Report Crimes</h3>
            <p className="text-gray-400">
              Easily report incidents with detailed descriptions, location data, and multimedia evidence.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-xl backdrop-blur-sm bg-white/5 border border-gray-800/50 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track Status</h3>
            <p className="text-gray-400">
              Monitor the status of your reports and receive updates as they are processed.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-xl backdrop-blur-sm bg-white/5 border border-gray-800/50 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community Safety</h3>
            <p className="text-gray-400">
              Contribute to building a safer community by reporting suspicious activities.
            </p>
          </motion.div>
        </div>
      </main>
      
      <footer className="mt-20 py-8 border-t border-gray-800/50 text-center text-gray-500">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Crime Reporting System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;