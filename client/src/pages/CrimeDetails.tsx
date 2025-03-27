import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/config';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Crime } from '../types';

const CrimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crime, setCrime] = useState<Crime | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCrimeDetails();
  }, [id]);

  const fetchCrimeDetails = async () => {
    try {
      const response = await api.get(`/crimes/${id}`);
      setCrime(response.data.crime);
    } catch (error) {
      toast.error('Failed to fetch crime details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Crime['status']) => {
    try {
      await api.put(`/crimes/status/${id}`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchCrimeDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!crime) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-white">Crime not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800"
        >
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{crime.title}</h1>
              <div className="flex items-center space-x-2">
                {crime.status === 'pending' && (
                  <span className="px-2 py-1 text-xs font-semibold text-yellow-200 bg-yellow-900 rounded-full">
                    Pending
                  </span>
                )}
                {crime.status === 'investigating' && (
                  <span className="px-2 py-1 text-xs font-semibold text-blue-200 bg-blue-900 rounded-full">
                    Investigating
                  </span>
                )}
                {crime.status === 'resolved' && (
                  <span className="px-2 py-1 text-xs font-semibold text-green-200 bg-green-900 rounded-full">
                    Resolved
                  </span>
                )}
                {crime.status === 'rejected' && (
                  <span className="px-2 py-1 text-xs font-semibold text-red-200 bg-red-900 rounded-full">
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Description</h2>
                <p className="mt-2 text-gray-300">{crime.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-300">{crime.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-300">
                    {format(new Date(crime.date), 'PPP p')}
                  </span>
                </div>
              </div>

              {crime.mediaFiles && crime.mediaFiles.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-white mb-4">Media Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crime.mediaFiles.map((file, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-gray-800">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={`Media ${index + 1}`}
                            className="object-cover w-full h-48"
                          />
                        ) : (
                          <video
                            src={file.url}
                            controls
                            className="w-full h-48"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="border-t border-gray-800 pt-6">
                  <h2 className="text-lg font-medium text-white mb-4">Update Status</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate('investigating')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Mark Investigating
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CrimeDetails; 