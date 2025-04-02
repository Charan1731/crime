import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, LogOut, Plus, MapPin, Calendar, User, X, Image as ImageIcon, Video, Maximize, Edit, Trash2, UploadCloud, Film, FileIcon, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Crime } from '../types';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [crimeToDelete, setCrimeToDelete] = useState<string | null>(null);
  const [editingCrime, setEditingCrime] = useState<Crime | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  const [previewUrls, setPreviewUrls] = useState<Array<{ url: string; type: string; name: string; size: number }>>([]);

  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
    video: null as File | null,
  });

  const resetEditForm = () => {
    if (editingCrime) {
      setNewReport({
        title: editingCrime.title,
        description: editingCrime.description,
        location: editingCrime.location,
        date: editingCrime.date,
        images: [],
        video: null,
      });
      // Clear any existing preview URLs
      setPreviewUrls([]);
    }
  };

  useEffect(() => {
    fetchUserCrimes();
  }, [user]);

  useEffect(() => {
    if (editingCrime) {
      resetEditForm();
    }
  }, [editingCrime]);

  const fetchUserCrimes = async () => {
    try {
      const response = await axios.get(`http://localhost:5500/api/v1/crimes/${user?._id}`);
      setCrimes(response.data.crimes);
    } catch (error) {
      showToast('Failed to fetch reports', 'error');
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
      if (isEditMode && editingCrime) {
        // Update existing crime
        await axios.put(`http://localhost:5500/api/v1/crimes/${editingCrime._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Report updated successfully', 'success');
      } else {
        // Create new crime
        await axios.post('http://localhost:5500/api/v1/crimes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Report submitted successfully', 'success');
      }
      
      setShowReportForm(false);
      setIsEditMode(false);
      setEditingCrime(null);
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
      showToast(isEditMode ? 'Failed to update report' : 'Failed to submit report', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!videoFile && newReport.video) {
      videoFile = newReport.video;
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
    
    if (videoFile && videoFile !== newReport.video) {
      newPreviews.push({
        url: URL.createObjectURL(videoFile),
        type: 'video',
        name: videoFile.name,
        size: videoFile.size
      });
    }
    
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    setNewReport(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
      video: videoFile || prev.video,
    }));
  }, [newReport.video]);

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
    
    if (fileToRemove.type === 'video' && newReport.video) {
      // Remove video
      URL.revokeObjectURL(fileToRemove.url);
      setNewReport(prev => ({
        ...prev,
        video: null,
      }));
    } else if (fileToRemove.type === 'image') {
      // Remove image
      URL.revokeObjectURL(fileToRemove.url);
      // Find corresponding index in the images array
      const imageIndex = newReport.images.findIndex((img, i) => {
        // Match by name and size since we don't have a direct reference
        const previewFile = previewUrls.filter(p => p.type === 'image')[i];
        return previewFile && img.name === previewFile.name && img.size === previewFile.size;
      });
      
      if (imageIndex !== -1) {
        setNewReport(prev => ({
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateToReportCrime = () => {
    navigate('/report-crime');
  };

  const openCrimeDetails = (crime: Crime) => {
    setSelectedCrime(crime);
  };

  const closeCrimeDetails = () => {
    setSelectedCrime(null);
    setActiveImage(null);
  };

  const startEditCrime = (crime: Crime) => {
    setEditingCrime(crime);
    setIsEditMode(true);
    setShowReportForm(true);
    closeCrimeDetails();
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingCrime(null);
    setShowReportForm(false);
    setNewReport({
      title: '',
      description: '',
      location: '',
      date: '',
      images: [],
      video: null,
    });
    // Clear preview URLs and revoke object URLs to avoid memory leaks
    previewUrls.forEach(file => URL.revokeObjectURL(file.url));
    setPreviewUrls([]);
  };

  const confirmDeleteCrime = (crimeId: string) => {
    setCrimeToDelete(crimeId);
    setShowDeleteConfirm(true);
    closeCrimeDetails();
  };

  const cancelDelete = () => {
    setCrimeToDelete(null);
    setShowDeleteConfirm(false);
  };

  const deleteCrime = async () => {
    if (!crimeToDelete) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5500/api/v1/crimes/${crimeToDelete}`);
      showToast('Report deleted successfully', 'success');
      fetchUserCrimes();
    } catch (error) {
      showToast('Failed to delete report', 'error');
    } finally {
      setIsLoading(false);
      setCrimeToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <style>{`
        @keyframes gradient-rotate {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold"><span className='text-blue-400'>Welcome,</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">{user?.name}</span></h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={navigateToReportCrime}
          className="w-full mb-8 p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex justify-center items-center hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-colors"
        >
          <FileText className="w-8 h-8 mb-2 mr-2" />
          <span className="text-xl font-semibold">Report New Crime</span>
        </motion.button>


        {/* Report/Edit Form */}
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl backdrop-blur-lg bg-white/5"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Report' : 'New Report'}</h2>
              <button 
                onClick={cancelEdit}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] focus:[border:1px_solid_transparent] focus:[animation:gradient-rotate_3s_linear_infinite] focus:[background-size:300%_300%]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <div className="relative">
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] focus:[border:1px_solid_transparent] focus:[animation:gradient-rotate_3s_linear_infinite] focus:[background-size:300%_300%] h-32"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] focus:[border:1px_solid_transparent] focus:[animation:gradient-rotate_3s_linear_infinite] focus:[background-size:300%_300%]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={newReport.date}
                    onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg focus:outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] relative z-10 [background:linear-gradient(#000,#000)_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] focus:[border:1px_solid_transparent] focus:[animation:gradient-rotate_3s_linear_infinite] focus:[background-size:300%_300%]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Media Files {isEditMode && '(New files will be added to existing ones)'}
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
                      ? '[background:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8))_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] [border:2px_solid_transparent] [animation:gradient-rotate_3s_linear_infinite] [background-size:300%_300%]' 
                      : 'border-gray-600 bg-white/5 hover:bg-white/10 hover:[background:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8))_padding-box,linear-gradient(120deg,#3B82F6,#9333EA,#EC4899,#3B82F6)_border-box] hover:[border:2px_solid_transparent] hover:[animation:gradient-rotate_3s_linear_infinite] hover:[background-size:300%_300%]'
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

              {isEditMode && editingCrime && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Current Media</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editingCrime.images && editingCrime.images.length > 0 && editingCrime.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-white/10">
                        <img 
                          src={img.fileUrl} 
                          alt={`Existing ${idx}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    
                    {editingCrime.video && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                        <Video className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end">
                {isEditMode && (
                  <motion.button
                    type="button"
                    onClick={cancelEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                )}
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
                        {isEditMode ? 'Updating...' : 'Submitting...'}
                      </span>
                    ) : (
                      isEditMode ? 'Update Report' : 'Submit Report'
                    )}
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Your Reports</h2>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : crimes.length === 0 ? (
            <div className="text-center text-gray-400">No reports found</div>
          ) : (
            crimes.map((crime) => (
              <motion.div
                key={crime._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl backdrop-blur-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="cursor-pointer" onClick={() => openCrimeDetails(crime)}>
                    <h3 className="text-xl text-blue-400 font-semibold mb-2">{crime.title}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{crime.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{crime.location}</span>
                      <span>{format(new Date(crime.date), 'PPP')}</span>
                    </div>
                    {crime.images && crime.images.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">{crime.images.length} image{crime.images.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="flex items-center mb-4">
                      {crime.status === 'pending' ? (
                        <div className="flex items-center text-yellow-500">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <span>Pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Solved</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditCrime(crime)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                        title="Edit report"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => confirmDeleteCrime(crime._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
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
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl text-blue-400 font-bold">{selectedCrime.title}</h2>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          closeCrimeDetails();
                          startEditCrime(selectedCrime);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                        title="Edit report"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          closeCrimeDetails();
                          confirmDeleteCrime(selectedCrime._id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={closeCrimeDetails}
                        className="p-2 hover:bg-red-400/50 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
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
                        <p className="text-sm text-gray-400">Status</p>
                        <p className={selectedCrime.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}>
                          {selectedCrime.status === 'pending' ? 'Pending' : 'Solved'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-6">
                    <h3 className="flex items-center text-lg font-semibold text-blue-400 mb-3">
                      <FileText className="w-5 h-5 mr-2" />
                      Description
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedCrime.description}</p>
                  </div>

                  {/* Evidence/Media Section */}
                  {selectedCrime.images && selectedCrime.images.length > 0 && (
                    <div className="my-6">
                      <h3 className="flex items-center text-lg text-blue-400 font-semibold mb-3">
                        <ImageIcon className="w-5 h-5 mr-2" />
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

                  {selectedCrime.video && (
                    <div className="my-6">
                      <h3 className="flex items-center text-lg text-blue-400 font-semibold mb-3">
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete this report? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteCrime}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

export default UserDashboard;