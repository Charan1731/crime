import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Search, Filter, MapPin, Calendar, User, ArrowLeft, X, Image, Video, FileText, Maximize } from 'lucide-react';
import { Crime } from '../types';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ViewCrimes = () => {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCrimes();
  }, []);

  const fetchAllCrimes = async () => {
    try {
      const response = await axios.get('http://localhost:5500/api/v1/crimes');
      setCrimes(response.data.crimes);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (crimeId: string, newStatus: 'pending' | 'solved') => {
    try {
      await axios.put(`http://localhost:5500/api/v1/crimes/status/${crimeId}`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchAllCrimes();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openCrimeDetails = (crime: Crime) => {
    setSelectedCrime(crime);
  };

  const closeCrimeDetails = () => {
    setSelectedCrime(null);
    setActiveImage(null);
  };

  const filteredAndSortedCrimes = crimes
    .filter(crime => 
      crime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crime.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(crime => statusFilter === 'all' ? true : crime.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  const stats = {
    total: crimes.length,
    pending: crimes.filter(c => c.status === 'pending').length,
    solved: crimes.filter(c => c.status === 'solved').length,
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Crime Reports</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Total Reports</h3>
            <p className="text-4xl font-bold text-blue-400">{stats.total}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2 text-yellow-500">Pending</h3>
            <p className="text-4xl font-bold text-yellow-500">{stats.pending}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <h3 className="text-xl font-semibold mb-2 text-green-500">Solved</h3>
            <p className="text-4xl font-bold text-green-500">{stats.solved}</p>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'solved')}
                className="pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white appearance-none min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="solved">Solved</option>
              </select>
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as 'date' | 'status');
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
              className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white appearance-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading reports...</p>
            </div>
          ) : filteredAndSortedCrimes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl backdrop-blur-lg">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No reports found</p>
            </div>
          ) : (
            filteredAndSortedCrimes.map((crime) => (
              <motion.div
                key={crime._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => openCrimeDetails(crime)}
                className="p-6 rounded-xl backdrop-blur-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{crime.title}</h3>
                      {crime.status === 'pending' ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
                          Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                          Solved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">{crime.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{crime.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(crime.date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{crime.uplodedBy}</span>
                      </div>
                    </div>
                    {crime.images && crime.images.length > 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        <Image className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">{crime.images.length} image{crime.images.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      {crime.status === 'pending' ? (
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <select
                      value={crime.status}
                      onChange={(e) => handleStatusUpdate(crime._id, e.target.value as 'pending' | 'solved')}
                      className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="solved">Mark as Solved</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Crime Details Modal */}
        <AnimatePresence>
          {selectedCrime && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeCrimeDetails}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCrime.title}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        {selectedCrime.status === 'pending' ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
                            Pending
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                            Solved
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          Reported on {format(new Date(selectedCrime.createdAt), 'PPP')}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={closeCrimeDetails}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-t border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Location</p>
                        <p>{selectedCrime.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Incident Date</p>
                        <p>{format(new Date(selectedCrime.date), 'PPP')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Reported By</p>
                        <p>{selectedCrime.uplodedBy}</p>
                      </div>
                    </div>
                  </div>

                  <div className="my-6">
                    <h3 className="flex items-center text-lg font-semibold mb-3">
                      <FileText className="w-5 h-5 mr-2" />
                      Description
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedCrime.description}</p>
                  </div>

                  {/* Evidence/Media Section */}
                  {selectedCrime.images && selectedCrime.images.length > 0 && (
                    <div className="my-6">
                      <h3 className="flex items-center text-lg font-semibold mb-3">
                        <Image className="w-5 h-5 mr-2" />
                        Images
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedCrime.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.fileUrl}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer"
                              onClick={() => setActiveImage(img.fileUrl)}
                            />
                            <button
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setActiveImage(img.fileUrl)}
                            >
                              <Maximize className="w-6 h-6" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video evidence */}
                  {selectedCrime.video && (
                    <div className="my-6">
                      <h3 className="flex items-center text-lg font-semibold mb-3">
                        <Video className="w-5 h-5 mr-2" />
                        Video
                      </h3>
                      <div className="rounded-lg overflow-hidden">
                        <video 
                          src={selectedCrime.video} 
                          controls
                          className="w-full max-h-[400px]"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="mt-8 flex justify-end">
                    <select
                      value={selectedCrime.status}
                      onChange={(e) => {
                        handleStatusUpdate(selectedCrime._id, e.target.value as 'pending' | 'solved');
                        setSelectedCrime({
                          ...selectedCrime,
                          status: e.target.value as 'pending' | 'solved'
                        });
                      }}
                      className="px-4 py-2 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="solved">Mark as Solved</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Image Modal */}
        <AnimatePresence>
          {activeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setActiveImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-5xl"
              >
                <img 
                  src={activeImage} 
                  alt="Full size" 
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
                <button 
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                  onClick={() => setActiveImage(null)}
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewCrimes;