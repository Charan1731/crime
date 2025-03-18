import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCrimes();
  }, []);

  const fetchAllCrimes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5500/api/v1/crimes/crimes');
      setCrimes(response.data.crimes);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      toast.error('Failed to fetch crime reports');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5500/api/v1/crimes/crimes/update/${id}`, { status });
      toast.success('Status updated successfully');
      fetchAllCrimes();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Crime Reports</h2>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : crimes.length === 0 ? (
          <p className="text-gray-500">No crime reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {crimes.map((crime) => (
              <div key={crime._id} className="border p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{crime.title}</h3>
                    <p className="text-gray-600">{crime.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Location: {crime.location}</p>
                      <p>Date: {new Date(crime.date).toLocaleDateString()}</p>
                      <p>Reported by: {crime.uplodedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <select
                      value={crime.status}
                      onChange={(e) => updateStatus(crime._id, e.target.value)}
                      className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>
                </div>
                
                {crime.images && crime.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {crime.images.map((image, index) => (
                      <div key={index} className="relative">
                        {image.fileType.startsWith('image/') ? (
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

export default AdminDashboard