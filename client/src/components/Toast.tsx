import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  isVisible
}) => {
  const [visible, setVisible] = useState(isVisible);
  
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && duration !== Infinity) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };
  
  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/30 to-emerald-500/30';
      case 'error':
        return 'from-red-500/30 to-pink-500/30';
      case 'warning':
        return 'from-yellow-500/30 to-amber-500/30';
      case 'info':
      default:
        return 'from-blue-500/30 via-purple-500/30 to-pink-500/30';
    }
  };
  
  const getBorder = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/50';
      case 'error':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
      default:
        return 'border-blue-500/50';
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-50 w-full max-w-sm"
        >
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient()} blur-xl rounded-lg`}></div>
            <div className={`relative p-4 rounded-lg backdrop-blur-xl bg-black/70 border ${getBorder()} shadow-xl`}>
              <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1 text-white text-sm">{message}</div>
                <button 
                  onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 