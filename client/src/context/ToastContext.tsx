import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  duration: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
    duration: 3000
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    setToast({
      message,
      type,
      isVisible: true,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider; 