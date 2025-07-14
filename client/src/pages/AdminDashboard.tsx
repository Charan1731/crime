import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Search, LogOut, Filter, List, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Crime } from '../types';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solved'>('all');
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCrimes();
  }, []);

  const fetchAllCrimes = async () => {
    try {
      const response = await axios.get('http://localhost:5500/api/v1/crimes');
      setCrimes(response.data.crimes);
    } catch (error) {
      showToast('Failed to fetch reports', "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (crimeId: string, newStatus: 'pending' | 'solved') => {
    try {
      await axios.put(`http://localhost:5500/api/v1/crimes/status/${crimeId}`, { status: newStatus });
      showToast('Status updated successfully', 'success');
      fetchAllCrimes();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateToViewCrimes = () => {
    navigate('/view-crimes');
  };

  const filteredCrimes = crimes
    .filter(crime => 
      crime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(crime => statusFilter === 'all' ? true : crime.status === statusFilter);

  const stats = {
    total: crimes.length,
    pending: crimes.filter(c => c.status === 'pending').length,
    solved: crimes.filter(c => c.status === 'solved').length,
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={navigateToViewCrimes}
              className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <List className="w-5 h-5 mr-2" />
              View All Crimes
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2">Total Reports</h3>
            <p className="text-4xl font-bold text-blue-400">{stats.total}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2">Pending</h3>
            <p className="text-4xl font-bold text-yellow-500">{stats.pending}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2">Solved</h3>
            <p className="text-4xl font-bold text-green-500">{stats.solved}</p>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'solved')}
              className="pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="solved">Solved</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : filteredCrimes.length === 0 ? (
            <div className="text-center text-gray-400">No reports found</div>
          ) : (
            filteredCrimes.map((crime) => (
              <motion.div
                key={crime._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{crime.title}</h3>
                    <p className="text-gray-400 mb-4">{crime.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <p>{crime.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <p>{format(new Date(crime.date), 'PPP')}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Reported by:</span>
                        <p>{crime.uplodedBy?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center">
                      {crime.status === 'pending' ? (
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      <span className="ml-2 text-sm capitalize">{crime.status}</span>
                    </div>
                    <select
                      value={crime.status}
                      onChange={(e) => handleStatusUpdate(crime._id, e.target.value as 'pending' | 'solved')}
                      className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;