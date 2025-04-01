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
    setIsDragging(false);
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
    
    // Don't replace existing video unless a new one is provided
    if (!videoFile && report.video) {
      videoFile = report.video;
    }

    // Create preview URLs
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
      // Reset the input value so the same file can be uploaded again if needed
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
      // Remove image
      URL.revokeObjectURL(fileToRemove.url);
      // Find corresponding index in the images array
      const imageIndex = report.images.findIndex((img, i) => {
        // Match by name and size since we don't have a direct reference
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
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-gradient-to-r focus:from-blue-500 focus:via-purple-500 focus:to-pink-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Camera className="w-4 h-4 inline-block mr-2" />
                Evidence (Images/Video)
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                className="hidden"
              />
              
              {/* Dropzone area */}
              <div
                ref={dropAreaRef}
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative h-40 border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  isDragging 
                    ? 'border-blue-500/70 bg-blue-500/20' 
                    : 'border-gray-600 bg-white/5 hover:bg-white/10 hover:border-gray-500'
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

            {/* File previews */}
            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Uploaded Evidence ({previewUrls.length})</h3>
                  <button
                    type="button"
                    onClick={() => {
                      // Clear all previews
                      previewUrls.forEach(file => URL.revokeObjectURL(file.url));
                      setPreviewUrls([]);
                      setReport(prev => ({
                        ...prev,
                        images: [],
                        video: null
                      }));
                    }}
                    className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" /> Clear all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {previewUrls.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative flex items-center bg-white/10 rounded-lg p-3 group"
                    >
                      <div className="h-14 w-14 rounded-md bg-gray-700/70 flex items-center justify-center mr-3 overflow-hidden">
                        {file.type === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={`Preview ${index}`}
                            className="h-full w-full object-cover"
                          />
                        ) : file.type === 'video' ? (
                          <video 
                            src={file.url}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FileIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          {file.type === 'image' ? (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <Film className="w-3 h-3 mr-1" />
                          )}
                          <span>{file.type === 'image' ? 'Image' : 'Video'} • {formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportCrime;