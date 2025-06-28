import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PauseProjectPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const PauseProjectPopup: React.FC<PauseProjectPopupProps> = ({
  visible,
  onClose,
  onConfirm,
  isDarkMode,
}) => {
  // Log when component renders and visible prop changes
  useEffect(() => {
    console.log("PauseProjectPopup rendered with visible:", visible);
  }, [visible]);

  const handleConfirm = () => {
    console.log("PauseProjectPopup: Confirm pause clicked");
    onConfirm();
    onClose();
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
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-amber-300" : "text-amber-600"}`}>
                <AlertTriangle size={20} className={isDarkMode ? "text-amber-300" : "text-amber-500"} />
                Pause Project
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
                Are you sure you want to pause this project? 
              </p>
              <p className="mb-4">
                When paused:
              </p>
              <ul className="list-disc pl-5 mb-5 space-y-1">
                <li>Your project will be temporarily hidden from new manufacturers</li>
                <li>Existing communications with manufacturers will remain active</li>
                <li>You can resume the project at any time</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirm}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Pause Project
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PauseProjectPopup;
