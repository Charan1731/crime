import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Crime } from '../types';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
    video: null as File | null,
  });

  useEffect(() => {
    fetchUserCrimes();
  }, [user]);

  const fetchUserCrimes = async () => {
    try {
      const response = await axios.get(`http://localhost:5500/api/v1/crimes/${user?._id}`);
      setCrimes(response.data.crimes);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', newReport.title);
    formData.append('description', newReport.description);
    formData.append('location', newReport.location);
    formData.append('date', newReport.date);

    newReport.images.forEach((image) => {
      formData.append('mediaFiles', image);
    });

    if (newReport.video) {
      formData.append('mediaFiles', newReport.video);
    }

    try {
      await axios.post('http://localhost:5500/api/v1/crimes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report submitted successfully');
      setShowReportForm(false);
      fetchUserCrimes();
      setNewReport({
        title: '',
        description: '',
        location: '',
        date: '',
        images: [],
        video: null,
      });
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter(file => file.type.startsWith('image/'));
    const video = files.find(file => file.type.startsWith('video/'));

    setNewReport(prev => ({
      ...prev,
      images: [...prev.images, ...images],
      video: video || prev.video,
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="px-4 py-6">
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/report-crime')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-5 w-5 mr-2" />
              Report New Crime
            </motion.button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crimes.map((crime) => (
              <motion.div
                key={crime._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
                onClick={() => window.open(`/crime/${crime._id}`, '_blank')}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{crime.title}</h3>
                <p className="text-gray-400 mb-4">{crime.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <p>{crime.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <p>{format(new Date(crime.date), 'PPP')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;