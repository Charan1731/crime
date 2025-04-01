import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

const ToastDemo: React.FC = () => {
  const { showToast } = useToast();

  const showSuccessToast = () => {
    showToast('Operation completed successfully!', 'success');
  };

  const showErrorToast = () => {
    showToast('An error occurred. Please try again.', 'error');
  };

  const showWarningToast = () => {
    showToast('Please review your information before continuing.', 'warning');
  };

  const showInfoToast = () => {
    showToast('This feature will be available soon!', 'info');
  };

  return (
    <div className="p-8 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        Toast Notifications
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={showSuccessToast}
          className="p-4 rounded-lg flex items-center gap-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 backdrop-blur-sm"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium">Success Toast</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={showErrorToast}
          className="p-4 rounded-lg flex items-center gap-3 bg-gradient-to-r from-red-500/30 to-pink-500/30 border border-red-500/50 backdrop-blur-sm"
        >
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="font-medium">Error Toast</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={showWarningToast}
          className="p-4 rounded-lg flex items-center gap-3 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-500/50 backdrop-blur-sm"
        >
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="font-medium">Warning Toast</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={showInfoToast}
          className="p-4 rounded-lg flex items-center gap-3 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 border border-blue-500/50 backdrop-blur-sm"
        >
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Info Toast</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ToastDemo; 