import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, AlertTriangle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-6">Crime Reporting System</h1>
          <p className="text-xl text-gray-400 mb-8">Report incidents securely and efficiently</p>
          
          <div className="flex justify-center gap-6">
            <Link
              to="/signin"
              className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/admin-login"
              className="px-8 py-3 bg-transparent border border-white rounded-lg hover:bg-white hover:text-black transition duration-300"
            >
              Admin Login
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg backdrop-blur-lg bg-white/5"
          >
            <Shield className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Reporting</h3>
            <p className="text-gray-400">Submit reports with complete confidentiality and security</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-lg backdrop-blur-lg bg-white/5"
          >
            <Users className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Safety</h3>
            <p className="text-gray-400">Help maintain safety in your community through active reporting</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-lg backdrop-blur-lg bg-white/5"
          >
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quick Response</h3>
            <p className="text-gray-400">Get timely updates on reported incidents and their status</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;