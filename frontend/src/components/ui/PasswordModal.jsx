import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onConfirm, collectionName }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
    setPassword('');
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-red-500/20 text-red-400">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Delete Collection</h2>
                  <p className="text-sm text-gray-400">Authentication required</p>
                </div>
              </div>

              {/* Collection name */}
              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">You are about to delete:</p>
                <p className="font-semibold text-white">{collectionName}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter password to confirm"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This action cannot be undone. All data will be permanently deleted.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    Delete Collection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;
