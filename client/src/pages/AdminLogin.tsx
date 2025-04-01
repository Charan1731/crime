import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    setIsLoading(true);
    try {
      await adminLogin(fullCode);
      navigate('/view-crimes');
    } catch (error) {
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value && newCode.every(digit => digit)) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const newCode = [...code];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });
    setCode(newCode);

    // Focus last input or first empty input
    const lastFilledIndex = newCode.findIndex(digit => !digit);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,1))]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE4MjAzQSIgc3RvcC1vcGFjaXR5PSIwLjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9InRyYW5zcGFyZW50Ii8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-xl rounded-xl transform rotate-3"></div>
        <div className="relative p-8 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50"></div>
              <Shield className="w-16 h-16 text-indigo-400 relative" />
            </motion.div>
            <h2 className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Admin Access</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-300">
                  Enter 6-digit Admin Code
                </label>
              </div>
              <motion.div 
                className="flex justify-between gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInput(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:bg-white/20 transition-all duration-300 shadow-lg"
                    required
                    autoFocus={index === 0}
                  />
                ))}
              </motion.div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || code.some(digit => !digit)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-indigo-500/25 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Access Dashboard
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;