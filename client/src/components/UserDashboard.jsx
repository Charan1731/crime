import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [crimes, setCrimes] = useState([]);
  const [newCrime, setNewCrime] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    mediaFiles: []
  });
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      fetchUserCrimes();
    }
  }, [user]);

  const fetchUserCrimes = async () => {
    try {
      const response = await axios.get(`http://localhost:5500/api/v1/crimes/crimes/${user._id}`);
      setCrimes(response.data.crimes);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      toast.error('Failed to fetch reports');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newCrime).forEach(key => {
      if (key === 'mediaFiles') {
        for (let file of newCrime.mediaFiles) {
          formData.append('mediaFiles', file);
        }
      } else {
        formData.append(key, newCrime[key]);
      }
    });

    try {
      await axios.post('http://localhost:5500/api/v1/crimes/crimes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Crime report submitted successfully');
      fetchUserCrimes();
      resetForm();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      toast.error(error.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewCrime({ ...newCrime, mediaFiles: files });
    
    // Create previews for selected files
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name
    }));
    
    // Clean up previous preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const updatedFiles = [...newCrime.mediaFiles];
    updatedFiles.splice(index, 1);
    setNewCrime({ ...newCrime, mediaFiles: updatedFiles });
    
    // Clean up the preview URL
    URL.revokeObjectURL(previews[index].url);
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const resetForm = () => {
    setNewCrime({
      title: '',
      description: '',
      location: '',
      date: '',
      mediaFiles: []
    });
    // Clean up all preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
      
      {/* New Crime Report Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Report New Crime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={newCrime.title}
              onChange={(e) => setNewCrime({...newCrime, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newCrime.description}
              onChange={(e) => setNewCrime({...newCrime, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={newCrime.location}
              onChange={(e) => setNewCrime({...newCrime, location: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={newCrime.date}
              onChange={(e) => setNewCrime({...newCrime, date: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Media Files</label>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              accept="image/*,video/*"
            />
            <p className="text-sm text-gray-500">Upload up to 5 images or videos as evidence (optional)</p>
            
            {/* Preview section */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {preview.type.startsWith('image/') ? (
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={preview.url}
                        className="w-full h-40 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Submit Report
          </button>
        </form>
      </div>

      {/* List of User's Crime Reports */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
        {crimes.length === 0 ? (
          <p className="text-gray-500">No reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {crimes.map((crime) => (
              <div key={crime._id} className="border p-4 rounded-md">
                <h3 className="font-semibold">{crime.title}</h3>
                <p className="text-gray-600">{crime.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Location: {crime.location}</p>
                  <p>Date: {new Date(crime.date).toLocaleDateString()}</p>
                  <p>Status: <span className={`font-semibold ${crime.status === 'solved' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {crime.status}
                  </span></p>
                </div>
                {crime.images && crime.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {crime.images.map((image, index) => (
                      <div key={index} className="relative">
                        {image.fileType === 'image' ? (
                          <img
                            src={image.fileUrl}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-40 object-cover rounded"
                          />
                        ) : (
                          <video
                            src={image.fileUrl}
                            controls
                            className="w-full h-40 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard