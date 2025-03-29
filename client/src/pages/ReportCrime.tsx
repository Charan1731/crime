import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Calendar, Camera, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReportCrime = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
    video: null as File | null,
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter(file => file.type.startsWith('image/'));
    const video = files.find(file => file.type.startsWith('video/'));

    // Create preview URLs for images
    const newPreviewUrls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    setReport(prev => ({
      ...prev,
      images: [...prev.images, ...images],
      video: video || prev.video,
    }));
  };

  const removeImage = (index: number) => {
    setReport(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', report.title);
    formData.append('description', report.description);
    formData.append('location', report.location);
    formData.append('date', report.date);

    report.images.forEach((image) => {
      formData.append('mediaFiles', image);
    });

    if (report.video) {
      formData.append('mediaFiles', report.video);
    }

    try {
      await axios.post('http://localhost:5500/api/v1/crimes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report submitted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-lg bg-white/5 rounded-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Report a Crime</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Incident Title</label>
              <input
                type="text"
                value={report.title}
                onChange={(e) => setReport({ ...report, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Brief title describing the incident"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={report.description}
                onChange={(e) => setReport({ ...report, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors h-32"
                placeholder="Provide detailed information about the incident"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={report.location}
                  onChange={(e) => setReport({ ...report, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter incident location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline-block mr-2" />
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={report.date}
                  onChange={(e) => setReport({ ...report, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Camera className="w-4 h-4 inline-block mr-2" />
                Evidence (Images/Video)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <motion.button
                type="button"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportCrime;