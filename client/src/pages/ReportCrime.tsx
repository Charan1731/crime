import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Calendar, Camera, X, ArrowLeft, UploadCloud, Trash2, Image as ImageIcon, Film, FileIcon, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReportCrime = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const [report, setReport] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
    video: null as File | null,
  });

  const [previewUrls, setPreviewUrls] = useState<Array<{ url: string; type: string; name: string; size: number }>>([]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropAreaRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    let videoFile = files.find(file => file.type.startsWith('video/'));
    if (!videoFile && report.video) {
      videoFile = report.video;
    }

    const newPreviews = [
      ...imageFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: 'image',
        name: file.name,
        size: file.size
      }))
    ];
    
    if (videoFile && videoFile !== report.video) {
      newPreviews.push({
        url: URL.createObjectURL(videoFile),
        type: 'video',
        name: videoFile.name,
        size: videoFile.size
      });
    }
    
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    setReport(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
      video: videoFile || prev.video,
    }));
  }, [report.video]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processFiles(files);
      e.target.value = '';
    }
  }, [processFiles]);

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = previewUrls[index];
    
    if (fileToRemove.type === 'video' && report.video) {
      // Remove video
      URL.revokeObjectURL(fileToRemove.url);
      setReport(prev => ({
        ...prev,
        video: null,
      }));
    } else if (fileToRemove.type === 'image') {
      URL.revokeObjectURL(fileToRemove.url);
      const imageIndex = report.images.findIndex((img, i) => {
        const previewFile = previewUrls.filter(p => p.type === 'image')[i];
        return img.name === previewFile.name && img.size === previewFile.size;
      });
      
      if (imageIndex !== -1) {
        setReport(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== imageIndex)
        }));
      }
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
      showToast('Report submitted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to submit report', 'error');
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
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Report a Crime</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-blue-400" />
              <span className='text-blue-400'>Back to Dashboard</span>
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Incident Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] focus:[border:1px_solid_transparent]"
                  placeholder="Brief title describing the incident"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <div className="relative">
                <textarea
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] focus:[border:1px_solid_transparent] h-32"
                  placeholder="Provide detailed information about the incident"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-2" />
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={report.location}
                    onChange={(e) => setReport({ ...report, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] focus:[border:1px_solid_transparent]"
                    placeholder="Enter incident location"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline-block mr-2" />
                  Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={report.date}
                    onChange={(e) => setReport({ ...report, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] focus:[border:1px_solid_transparent]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Camera className="w-4 h-4 inline-block mr-2" />
                Evidence (Images/Video)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                className="hidden"
              />
              
              <div
                ref={dropAreaRef}
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative h-40 border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  isDragging 
                    ? '[background:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8))_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] [border:2px_solid_transparent]' 
                    : 'border-gray-600 bg-white/5 hover:bg-white/10 hover:[background:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8))_padding-box,linear-gradient(to_right,#3B82F6,#9333EA,#EC4899)_border-box] hover:[border:2px_solid_transparent]'
                }`}
              >
                <AnimatePresence>
                  {isDragging ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="text-center">
                        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-200 font-medium">Drop files here</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-4"
                    >
                      <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 mb-1">Drag and drop files here</p>
                      <p className="text-gray-400 text-sm">or click to browse</p>
                      <p className="text-gray-500 text-xs mt-2">Supports images and videos</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-white/10">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : file.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Report'
                  )}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportCrime;