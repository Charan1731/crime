import React from 'react';
import { motion } from 'framer-motion';
import ToastDemo from '../components/ToastDemo';

const ToastDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Toast Component Demo
            </h1>
            <p className="text-gray-400">
              This showcase demonstrates the custom Toast notification system designed to match the application's UI theme.
              The Toast component features different types of notifications: success, error, warning, and info.
            </p>
          </div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg"></div>
            <ToastDemo />
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Implementation Details</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span> 
                <span>Uses Framer Motion for smooth animations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span> 
                <span>Context API for global toast management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span> 
                <span>Styled with Tailwind CSS using the app's design system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span> 
                <span>Glass-morphism design with backdrop blur effects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span> 
                <span>Customizable duration, type, and message</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ToastDemoPage; 