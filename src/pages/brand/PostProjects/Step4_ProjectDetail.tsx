import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Settings, MapPin, Award, Factory, Calendar, Package, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

// Import from index files
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "../../../contexts/ThemeContext";

// Project components
import { ProjectManufacturers, ProjectDetailsInfo } from "./components/project-details";
import { EditProjectPopup, PauseProjectPopup, CancelProjectPopup } from "./components/popups";
import { useProjectDetails } from "./components/hooks";
import type { ProductCategory, SupplierType } from "./types";

// Status helper functions for consistent mapping between BE and UI
const getStatusDisplayName = (status: string): string => {
  switch(status) {
    case 'draft': return 'Research Phase';
    case 'active': return 'Active';
    case 'in_review': return 'In Review';
    case 'paused': return 'Paused';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'info_required': return 'Info Required';
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
};

const getStatusColor = (status: string, isDark = false): string => {
  switch(status) {
    case 'active':
      return isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700";
    case 'paused':
      return isDark ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-700";
    case 'completed':
      return isDark ? "bg-green-800/60 text-green-300" : "bg-green-100 text-green-500";
    case 'info_required':
    case 'cancelled':
      return isDark ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-600";
    case 'draft':
      return isDark ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-700";
    case 'in_review':
      return isDark ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-700";
    default:
      return "";
  }
};

interface Props {
  onBack: () => void;
  projectId?: string | number;
  selectedProduct?: ProductCategory | null;
  selectedSupplierType?: SupplierType | null;
  projectData?: any;
}

const Step4_ProjectDetail: React.FC<Props> = ({ onBack, projectId, selectedProduct, selectedSupplierType, projectData }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { toast } = useToast();
  const {
    projectDetails,
    loading,
    error,
    editedProject,
    setEditedProject,
    projectStatus,
    handleEditProject,
    handleSaveChanges,
    handlePauseProject,
    handleCancelProject,
    handleConfirmPause,
    handleConfirmCancel,
    handleResumeProject,
    manufacturers,
  } = useProjectDetails(projectId, selectedProduct, selectedSupplierType, projectData);
  
  // Log để kiểm tra
  console.log("Step4_ProjectDetail rendered with projectId:", projectId);
  console.log("projectId type:", typeof projectId);
  console.log("selectedProduct:", selectedProduct);
  console.log("selectedSupplierType:", selectedSupplierType);
  console.log("projectData:", projectData);
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<"manufacturers" | "details">("manufacturers");
  
  // Popup visibility states
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [pausePopupVisible, setPausePopupVisible] = useState(false);
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);
  
  // Log popup state changes
  useEffect(() => {
    console.log("EditPopupVisible state changed:", editPopupVisible);
  }, [editPopupVisible]);

  useEffect(() => {
    console.log("PausePopupVisible state changed:", pausePopupVisible);
  }, [pausePopupVisible]);

  useEffect(() => {
    console.log("CancelPopupVisible state changed:", cancelPopupVisible);
  }, [cancelPopupVisible]);
  
  // Options dropdown state
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Log projectStatus when it changes
  useEffect(() => {
    console.log("projectStatus changed:", projectStatus);
  }, [projectStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Kiểm tra xem người dùng có đang click vào dropdown hay không
      const dropdownElement = document.querySelector('.options-dropdown');
      if (showOptionsDropdown && dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setShowOptionsDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsDropdown]);
  
  // Check for error in manufacturer loading as well
  const hasManufacturerError = manufacturers && manufacturers.length === 0 && !loading;

  // Early return for loading and error states
  if (loading) {
    return (
      <div className={`flex flex-col w-full min-h-screen items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col w-full min-h-screen items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} flex items-center justify-center mb-4`}>
          <AlertTriangle className={`h-8 w-8 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`} />
        </div>
        <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Error Loading Project</h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md text-center mb-4`}>{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className={`flex flex-col w-full min-h-screen items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} flex items-center justify-center mb-4`}>
          <AlertTriangle className={`h-8 w-8 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-500'}`} />
        </div>
        <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No Project Data Available</h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md text-center mb-4`}>
          Could not load project details. ProjectID: {projectId || "None"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex flex-col w-full min-h-screen max-w-full overflow-x-hidden">
      <div className={`flex-1 p-4 md:p-8 lg:p-12 ${isDarkMode ? "bg-slate-900" : "bg-white"} w-full`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full mx-auto"
        >
          {/* Header and project info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Back button + project title */}
            <div className="flex items-center gap-3">
              <button 
                className={`p-2 rounded-full ${isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
                onClick={onBack}
              >
                <ChevronLeft className={isDarkMode ? "text-slate-200" : "text-slate-700"} size={20} />
              </button>
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {projectDetails.name}
              </h1>
              <span 
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(projectStatus, isDarkMode)}`}
              >
                {getStatusDisplayName(projectStatus)}
              </span>
            </div>
            
            
            {/* Options dropdown */}
            <div className="relative">
              <button 
                className={`p-2 rounded-full ${isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
              >
                <Settings className={isDarkMode ? "text-slate-200" : "text-slate-700"} size={20} />
              </button>
              
              {showOptionsDropdown && (
                <div 
                  className={`options-dropdown absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                    isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"
                  }`}
                >
                  <div className="py-1">
                    <button 
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => {
                        console.log("Edit button clicked, projectStatus:", projectStatus);
                        handleEditProject();
                        console.log("Setting timeout to show EditProjectPopup");
                        setTimeout(() => {
                          console.log("Timeout triggered, showing EditProjectPopup");
                          setEditPopupVisible(true);
                        }, 300);
                        setShowOptionsDropdown(false);
                      }}
                    >
                      Edit Project
                    </button>
                    
                    {/* Display Pause button for active projects */}
                    {projectStatus === 'active' && (
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode ? "text-yellow-300 hover:bg-slate-700" : "text-yellow-600 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          console.log("Pause button clicked, projectStatus:", projectStatus);
                          handlePauseProject();
                          console.log("Setting timeout to show PauseProjectPopup");
                          setTimeout(() => {
                            console.log("Timeout triggered, showing PauseProjectPopup");
                            setPausePopupVisible(true);
                          }, 300);
                          setShowOptionsDropdown(false);
                        }}
                      >
                        Pause Project
                      </button>
                    )}
                    
                    {/* Display Resume button for paused projects */}
                    {projectStatus === 'paused' && (
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode ? "text-green-300 hover:bg-slate-700" : "text-green-600 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          console.log("Resume button clicked, projectStatus:", projectStatus);
                          handleResumeProject();
                          setShowOptionsDropdown(false);
                        }}
                      >
                        Resume Project
                      </button>
                    )}
                    
                    {/* Show Cancel for any non-completed/cancelled project */}
                    {(projectStatus !== 'cancelled' && projectStatus !== 'completed') && (
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode ? "text-red-300 hover:bg-slate-700" : "text-red-600 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          console.log("Cancel button clicked, projectStatus:", projectStatus);
                          handleCancelProject();
                          console.log("Setting timeout to show CancelProjectPopup");
                          setTimeout(() => {
                            console.log("Timeout triggered, showing CancelProjectPopup");
                            setCancelPopupVisible(true);
                          }, 300);
                          setShowOptionsDropdown(false);
                        }}
                      >
                        Cancel Project
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Project summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Volume card */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Package className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={18} />
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Volume
                </h3>
              </div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {projectDetails.volume} {projectDetails.volumeUnit}
              </p>
            </div>
            
            {/* Supplier type card */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Factory className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} size={18} />
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Looking For
                </h3>
              </div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {projectDetails.supplierType?.name || 'Manufacturer'}
              </p>
            </div>
            
            {/* Manufacturer matches card */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className={isDarkMode ? 'text-green-400' : 'text-green-600'} size={18} />
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Matches Found
                </h3>
              </div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {manufacturers?.length || 0} Manufacturers
              </p>
            </div>
          </div>
          
          {/* Tabs navigation */}
          <div className="flex gap-8 mb-8 border-b border-border pb-2">
            <button
              className={`pb-2 text-sm font-medium transition-colors relative ${
                activeTab === "manufacturers" 
                  ? isDarkMode ? "text-blue-300" : "text-blue-600" 
                  : isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("manufacturers")}
            >
              Matching Manufacturers
              {activeTab === "manufacturers" && (
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`}
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
            
            <button
              className={`pb-2 text-sm font-medium transition-colors relative ${
                activeTab === "details" 
                  ? isDarkMode ? "text-blue-300" : "text-blue-600" 
                  : isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Project Details
              {activeTab === "details" && (
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`}
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
          </div>
          
          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "manufacturers" ? (
              <motion.div
                key="manufacturers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectManufacturers 
                  manufacturers={manufacturers} 
                  projectDetails={projectDetails} 
                  isDarkMode={isDarkMode}
                />
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectDetailsInfo 
                  projectDetails={projectDetails} 
                  isDarkMode={isDarkMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Popups */}
      <AnimatePresence>
        {editPopupVisible && (
          <EditProjectPopup 
            visible={editPopupVisible}
            onClose={() => setEditPopupVisible(false)}
            editedProject={editedProject}
            setEditedProject={setEditedProject}
            onSave={handleSaveChanges}
            isDarkMode={isDarkMode}
          />
        )}

        {pausePopupVisible && (
          <PauseProjectPopup 
            visible={pausePopupVisible}
            onClose={() => setPausePopupVisible(false)}
            onConfirm={handleConfirmPause}
            isDarkMode={isDarkMode}
          />
        )}
        
        {cancelPopupVisible && (
          <CancelProjectPopup 
            visible={cancelPopupVisible}
            onClose={() => setCancelPopupVisible(false)}
            onConfirm={handleConfirmCancel}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step4_ProjectDetail;