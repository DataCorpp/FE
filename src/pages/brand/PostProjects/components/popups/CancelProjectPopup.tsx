import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CancelProjectPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const CancelProjectPopup: React.FC<CancelProjectPopupProps> = ({
  visible,
  onClose,
  onConfirm,
  isDarkMode,
}) => {
  const [reason, setReason] = useState("");

  // Log when component renders and visible prop changes
  useEffect(() => {
    console.log("CancelProjectPopup rendered with visible:", visible);
  }, [visible]);

  const handleConfirm = () => {
    console.log("CancelProjectPopup: Confirm cancel clicked");
    onConfirm();
    onClose();
    setReason(""); // Reset the reason after confirmation
  };

  // Always render the component and let AnimatePresence handle visibility
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md rounded-xl p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                <AlertTriangle size={20} className={isDarkMode ? "text-red-400" : "text-red-600"} />
                Cancel Project
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-black"}
              >
                <X size={20} />
              </Button>
            </div>

            <div className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <p className="mb-4">
                Are you sure you want to cancel this project? This action cannot be undone.
              </p>
              <p className="mb-4">
                When cancelled:
              </p>
              <ul className="list-disc pl-5 mb-5 space-y-1">
                <li>Your project will be permanently archived</li>
                <li>All manufacturers will be notified that the project is no longer active</li>
                <li>You cannot reactivate this project (you'll need to create a new one)</li>
              </ul>

              <div className="mt-5">
                <label
                  htmlFor="cancel-reason"
                  className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                >
                  Reason for cancellation (optional)
                </label>
                <Textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling this project..."
                  className={isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Go Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirm}
              >
                Cancel Project
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelProjectPopup;
