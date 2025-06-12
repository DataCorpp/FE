import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "./mockData";
import { useTheme } from "@/contexts/ThemeContext";
import "@/styles/theme-variables.css";
import { ChevronLeft, Plus, Eye, Edit, XCircle, ChevronDown, ChevronUp, X, Check, AlertTriangle, Search } from "lucide-react";

// Add product suggestions data
const productSuggestions = [
  { id: 1, name: "Chocolate Bar", type: "PRODUCT", icon: "🍫" },
  { id: 2, name: "Energy Drink", type: "PRODUCT", icon: "🥤" },
  { id: 3, name: "Protein Bar", type: "PRODUCT", icon: "🍫" },
  { id: 4, name: "Organic Snacks", type: "CATEGORY", icon: "🥜" },
  { id: 5, name: "Coffee Beans", type: "PRODUCT", icon: "☕" },
  { id: 6, name: "Vitamin Supplements", type: "CATEGORY", icon: "💊" },
  { id: 7, name: "Fruit Juice", type: "PRODUCT", icon: "🧃" },
  { id: 8, name: "Granola Bars", type: "PRODUCT", icon: "🥣" },
  { id: 9, name: "Herbal Tea", type: "PRODUCT", icon: "🍵" },
  { id: 10, name: "Plant-based Milk", type: "CATEGORY", icon: "🥛" }
];

// Add packaging suggestions
const packagingSuggestions = [
  { id: 1, name: "Plastic Bag", material: "Plastic" },
  { id: 2, name: "Paper Bag", material: "Paper" },
  { id: 3, name: "Box", material: "Cardboard" },
  { id: 4, name: "Bottle", material: "Glass" },
  { id: 5, name: "Bottle", material: "Plastic" },
  { id: 6, name: "Jar", material: "Glass" },
  { id: 7, name: "Pouch", material: "Flexible Plastic" },
  { id: 8, name: "Can", material: "Aluminum" },
  { id: 9, name: "Sachet", material: "Foil" }
];

// Add ingredient suggestions
const ingredientSuggestions = [
  { id: 1, name: "Cocoa Mass", category: "Chocolate" },
  { id: 2, name: "Sugar", category: "Sweeteners" },
  { id: 3, name: "Cocoa Butter", category: "Chocolate" },
  { id: 4, name: "Sea Salt", category: "Additives" },
  { id: 5, name: "Almonds", category: "Nuts" },
  { id: 6, name: "Vanilla Extract", category: "Flavorings" },
  { id: 7, name: "Milk Powder", category: "Dairy" },
  { id: 8, name: "Lecithin", category: "Emulsifiers" },
  { id: 9, name: "Natural Flavors", category: "Flavorings" },
  { id: 10, name: "Organic Cane Sugar", category: "Sweeteners" }
];

// Add consultant service suggestions
const consultantSuggestions = [
  { id: 1, name: "Formulation", specialty: "Product Development" },
  { id: 2, name: "Packaging Design", specialty: "Design" },
  { id: 3, name: "Regulatory Compliance", specialty: "Legal" },
  { id: 4, name: "Quality Assurance", specialty: "Operations" },
  { id: 5, name: "Supply Chain Management", specialty: "Operations" },
  { id: 6, name: "Marketing Strategy", specialty: "Marketing" },
  { id: 7, name: "Shelf Life Testing", specialty: "Quality" },
  { id: 8, name: "Nutritional Analysis", specialty: "Science" },
  { id: 9, name: "Export Documentation", specialty: "Legal" },
  { id: 10, name: "Sensory Testing", specialty: "Quality" }
];

interface Props {
  onNext: (projectId?: number) => void; // Modified to accept project ID
  onBack: () => void;
  onNewProject: () => void;
}

interface Project {
  id: number;
  name: string;
  created: string;
  status: string;
  details: string;
  units?: string;
  volume?: string;
  description?: string;
  anonymous?: boolean;
}

const statusColor = (status: string, isDark = false) => {
  switch (status) {
    case "in_review":
      return isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700";
    case "closed":
      return isDark ? "bg-slate-800/60 text-slate-300" : "bg-gray-100 text-gray-500";
    case "info_required":
      return isDark ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-600";
    default:
      return "";
  }
};

const statusText = (status: string) => {
  switch (status) {
    case "in_review":
      return "In review";
    case "closed":
      return "Closed";
    case "info_required":
      return "Info required";
    default:
      return status;
  }
};

const Step3_ReviewProjects: React.FC<Props> = ({ onNext, onBack, onNewProject }) => {
  const [projectDetailsVisible, setProjectDetailsVisible] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // New state for popups
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  // New state for product name suggestions
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productInputFocused, setProductInputFocused] = useState(false);
  
  // Filter product suggestions based on search query
  const filteredProducts = productSearchQuery.trim() === ""
    ? productSuggestions
    : productSuggestions.filter(product => 
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
      );

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Add click outside handler for suggestions dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest('.product-search-container')) {
        setShowProductSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewProject = (projectId: number) => {
    if (projectDetailsVisible === projectId) {
      setProjectDetailsVisible(null);
    } else {
      setProjectDetailsVisible(projectId);
    }
  };

  const handleNewProject = () => {
    onNewProject();
  };

  // Navigate to project details
  const navigateToProjectDetail = (projectId: number) => {
    onNext(projectId);
  };
  
  // Show edit popup
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditedProject({...project});
    setProductSearchQuery(project.name); // Initialize the search field with current project name
    setEditPopupVisible(true);
  };
  
  // Show cancel popup
  const handleCancelProject = (project: Project) => {
    setSelectedProject(project);
    setCancelPopupVisible(true);
  };
  
  // Handle product selection from suggestions
  const handleProductSelect = (productName: string) => {
    if (editedProject) {
      setEditedProject({...editedProject, name: productName});
    }
    setProductSearchQuery(productName);
    setShowProductSuggestions(false);
  };
  
  // Submit edited project
  const handleSubmitEdit = () => {
    // In a real app, you would update the project data here
    console.log("Edited project:", editedProject);
    setEditPopupVisible(false);
    setSelectedProject(null);
    setEditedProject(null);
  };
  
  // Confirm project cancellation
  const handleConfirmCancel = () => {
    // In a real app, you would handle project cancellation here
    console.log("Cancelled project:", selectedProject);
    setCancelPopupVisible(false);
    setSelectedProject(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    })
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: prefersReducedMotion ? 0.1 : 0.5,
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const detailsVariants = {
    closed: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      overflow: "hidden"
    },
    open: {
      opacity: 1,
      height: "auto",
      marginTop: 16,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const detailItemVariants = {
    closed: { y: -10, opacity: 0 },
    open: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };
  
  // Popup animation variants
  const popupVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Suggestions dropdown animation variants
  const suggestionsVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' },
    exit: { opacity: 0, y: -10, height: 0 }
  };
  
  // Backdrop variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className={`flex flex-col w-full min-h-screen max-w-full overflow-x-hidden ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}`}>
      <div className="flex-1 p-4 md:p-8 lg:p-12 w-full">
        <motion.div 
          className="w-full mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <motion.button
                className={`flex items-center py-2 px-4 rounded-md ${
                  isDarkMode 
                    ? "bg-slate-800 text-white hover:bg-slate-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="mr-1" size={16} />
                Back
              </motion.button>
              
              <motion.h2 
                className={`text-3xl font-bold ${
                  isDarkMode 
                    ? "bg-gradient-to-r from-blue-400 to-blue-600" 
                    : "bg-gradient-to-r from-blue-500 to-blue-700"
                } bg-clip-text text-transparent`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Projects
              </motion.h2>
            </div>
            
            <motion.button
              className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium ${
                isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleNewProject}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Plus size={16} />
              New Project
            </motion.button>
          </motion.div>
          
          <motion.div 
            className={`divide-y divide-border rounded-lg border overflow-hidden ${
              isDarkMode 
                ? 'bg-slate-800/50 shadow-xl shadow-slate-900/30 border-slate-700' 
                : 'bg-white shadow-sm border-slate-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {projects.length === 0 ? (
              <motion.div 
                className="py-16 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div 
                  className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mb-4`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.div>
                <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No projects yet</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Create your first project to get started</p>
              </motion.div>
            ) : (
              projects.map((proj, index) => (
                <motion.div 
                  key={proj.id} 
                  className={`relative overflow-hidden transition-colors ${
                    projectDetailsVisible === proj.id 
                      ? isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                      : isDarkMode ? 'hover:bg-slate-700/70' : 'hover:bg-slate-50'
                  }`}
                  custom={index}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  layoutId={`project-container-${proj.id}`}
                  style={{ perspective: "1000px" }}
                >
                  {/* Main project row */}
                  <div className="py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <motion.div 
                      className="flex items-center gap-4"
                      layoutId={`project-header-${proj.id}`}
                      variants={itemVariants}
                    >
                      <motion.div 
                        className={`w-12 h-12 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-blue-900/30 to-slate-800' 
                            : 'bg-gradient-to-br from-primary/20 to-primary/5'
                        } rounded-full flex items-center justify-center`}
                        whileHover={{ 
                          rotate: [0, 5, -5, 0],
                          scale: 1.05,
                          boxShadow: isDarkMode 
                            ? "0 8px 20px rgba(30, 64, 175, 0.3)"
                            : "0 8px 20px rgba(var(--primary-rgb), 0.2)"
                        }}
                        transition={{ duration: 1 }}
                        layoutId={`project-icon-${proj.id}`}
                        variants={itemVariants}
                      >
                        <motion.span 
                          className="text-2xl"
                          animate={{ 
                            rotateY: prefersReducedMotion ? 0 : [0, 360],
                            scale: prefersReducedMotion ? 1 : [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
                            scale: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                          }}
                        >
                          {proj.name === "Chocolate Bar" ? "🍫" : "🥤"}
                        </motion.span>
                      </motion.div>
                      <div>
                        <motion.div 
                          className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                          layoutId={`project-name-${proj.id}`}
                          variants={itemVariants}
                        >
                          {proj.name}
                        </motion.div>
                        <motion.div 
                          className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}
                          layoutId={`project-date-${proj.id}`}
                          variants={itemVariants}
                        >
                          Created {proj.created}
                        </motion.div>
                        <motion.div 
                          className="text-xs mt-1 flex flex-wrap items-center gap-1"
                          layoutId={`project-status-${proj.id}`}
                          variants={itemVariants}
                        >
                          <motion.span 
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor(proj.status, isDarkMode)} mr-1`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {statusText(proj.status)}
                          </motion.span>
                          <span className={isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}>{proj.details}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-4 md:mt-0 flex gap-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <motion.button 
                        className={`flex items-center gap-1.5 ${
                          projectDetailsVisible === proj.id
                            ? isDarkMode 
                              ? 'bg-blue-900/30 text-blue-200 border-blue-800/60' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            : isDarkMode
                              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' 
                              : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                        } font-medium py-1.5 px-3 rounded-md transition-all border text-sm`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewProject(proj.id)}
                      >
                        {projectDetailsVisible === proj.id ? (
                          <>
                            <ChevronUp size={16} />
                            <span>Hide Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            <span>Show Details</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button 
                        className={`flex items-center gap-1.5 ${
                          isDarkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } font-medium py-1.5 px-3 rounded-md transition-all text-sm`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateToProjectDetail(proj.id)}
                      >
                        <Eye size={16} />
                        <span>View Project</span>
                      </motion.button>
                    </motion.div>
                  </div>
                  
                  {/* Project Details Panel */}
                  <AnimatePresence>
                    {projectDetailsVisible === proj.id && (
                      <motion.div 
                        className={`mx-6 mb-6 rounded-lg border overflow-hidden ${
                          isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white'
                        }`}
                        variants={detailsVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        layout
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                          <motion.div variants={detailItemVariants}>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Project Details</h4>
                            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-muted/30'}`}>
                              <div className="flex justify-between mb-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Product:</span>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.name}</span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Status:</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(proj.status, isDarkMode)}`}>
                                  {statusText(proj.status)}
                                </span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Created:</span>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.created}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Volume:</span>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.volume || "10K - 50K"}</span>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div variants={detailItemVariants}>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Status</h4>
                            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-muted/30'}`}>
                              <div className={`text-xs mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{proj.details}</div>
                              <div className="flex flex-wrap gap-2">
                                <motion.button
                                  className={`flex items-center gap-1.5 text-xs ${
                                    isDarkMode 
                                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  } px-3 py-1.5 rounded-md`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => navigateToProjectDetail(proj.id)}
                                >
                                  <Eye size={14} />
                                  View Project
                                </motion.button>
                                <motion.button
                                  className={`flex items-center gap-1.5 text-xs ${
                                    isDarkMode 
                                      ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  } px-3 py-1.5 rounded-md`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditProject(proj)}
                                >
                                  <Edit size={14} />
                                  Edit Project
                                </motion.button>
                                <motion.button
                                  className={`flex items-center gap-1.5 text-xs ${
                                    isDarkMode 
                                      ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' 
                                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                                  } px-3 py-1.5 rounded-md`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCancelProject(proj)}
                                >
                                  <XCircle size={14} />
                                  Cancel Project
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Edit Project Popup */}
      <AnimatePresence>
        {editPopupVisible && editedProject && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setEditPopupVisible(false)}
            />
            
            <div className="modal-container">
              <motion.div 
                className={`modal-content ${
                  isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                } rounded-lg shadow-xl`}
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Edit Project
                    </h3>
                    <motion.button 
                      className="text-gray-400 hover:text-gray-500"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditPopupVisible(false)}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
              
                <div className="p-5">
                  <div className="mb-4 relative product-search-container">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Product Name
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className={`w-full px-3 py-2 rounded-md ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                        value={productSearchQuery}
                        onChange={(e) => {
                          setProductSearchQuery(e.target.value);
                          setShowProductSuggestions(true);
                          if (editedProject) {
                            setEditedProject({...editedProject, name: e.target.value});
                          }
                        }}
                        onFocus={() => {
                          setProductInputFocused(true);
                          setShowProductSuggestions(true);
                        }}
                        placeholder="Search for a product..."
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Search size={18} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {showProductSuggestions && filteredProducts.length > 0 && (
                        <motion.div 
                          className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
                            isDarkMode ? 'bg-slate-700' : 'bg-white'
                          } border ${
                            isDarkMode ? 'border-slate-600' : 'border-gray-200'
                          } overflow-hidden max-h-60 overflow-y-auto`}
                          variants={suggestionsVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="py-1">
                            {filteredProducts.map((product, index) => (
                              <motion.div
                                key={product.id}
                                className={`px-3 py-2.5 flex items-center gap-2 cursor-pointer ${
                                  isDarkMode 
                                    ? 'hover:bg-slate-600 text-slate-200' 
                                    : 'hover:bg-gray-100 text-gray-800'
                                } transition-colors`}
                                onClick={() => handleProductSelect(product.name)}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(243, 244, 246, 1)' }}
                              >
                                <span className="text-xl">{product.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium">{product.name}</div>
                                  <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{product.type}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Volume
                    </label>
                    <select 
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      value={editedProject.volume || "10K - 50K"}
                      onChange={(e) => setEditedProject({...editedProject, volume: e.target.value})}
                    >
                      <option value="1K - 10K">1K - 10K</option>
                      <option value="10K - 50K">10K - 50K</option>
                      <option value="50K - 100K">50K - 100K</option>
                      <option value="100K+">100K+</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Units
                    </label>
                    <select 
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      value={editedProject.units || "Units"}
                      onChange={(e) => setEditedProject({...editedProject, units: e.target.value})}
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Cases">Cases</option>
                      <option value="Pallets">Pallets</option>
                      <option value="Containers">Containers</option>
                      <option value="Kilograms">Kilograms</option>
                      <option value="Pounds">Pounds</option>
                      <option value="Liters">Liters</option>
                      <option value="Gallons">Gallons</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea 
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      rows={3}
                      value={editedProject.description || ""}
                      onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                      placeholder="Enter product description"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className={`w-4 h-4 ${
                          isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                        } focus:ring-blue-500/20 rounded transition-all`}
                        checked={editedProject.anonymous || false}
                        onChange={(e) => setEditedProject({...editedProject, anonymous: e.target.checked})}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Post project anonymously
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <motion.button
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditPopupVisible(false)}
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmitEdit}
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* Cancel Project Popup */}
      <AnimatePresence>
        {cancelPopupVisible && selectedProject && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setCancelPopupVisible(false)}
            />
            
            <div className="modal-container">
              <motion.div 
                className={`modal-content ${
                  isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                } rounded-lg shadow-xl`}
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Cancel Project
                    </h3>
                    <motion.button 
                      className="text-gray-400 hover:text-gray-500"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCancelPopupVisible(false)}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                      isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-500'
                    }`}>
                      <AlertTriangle size={24} />
                    </div>
                    
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Are you sure?
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        This will permanently cancel the project "{selectedProject.name}". This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <motion.button
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCancelPopupVisible(false)}
                    >
                      No, keep project
                    </motion.button>
                    
                    <motion.button
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmCancel}
                    >
                      <span className="flex items-center gap-1.5">
                        <XCircle size={16} />
                        Yes, cancel project
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* Global styles for consistency */}
      <style>{`
        :root {
          --primary-rgb: 0, 112, 243;
          --border-rgb: 226, 232, 240;
          --muted-rgb: 241, 245, 249;
        }
        
        .project-card {
          transition: all var(--duration-normal) ease-in-out;
        }
        
        .project-detail-panel {
          box-shadow: 0 4px 12px rgba(var(--slate-850-rgb), 0.1);
        }
        
        /* Fix for popup centering */
        .modal-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          inset: 0;
          z-index: 50;
        }
        
        .modal-content {
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default Step3_ReviewProjects;
