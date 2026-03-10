'use client';

import { useState } from 'react';

interface DeleteConfirmProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  trigger: React.ReactNode;
}

export function DeleteConfirm({ title, message, onConfirm, trigger }: DeleteConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      // Error handling is done by the parent via toast
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <span onClick={() => setIsOpen(true)}>{trigger}</span>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-overlay-50" 
            onClick={() => !isDeleting && setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-surface-alt border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-text-secondary mb-6">{message}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-status-no text-text-primary rounded-lg hover:bg-status-no/80 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
