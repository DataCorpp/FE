import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, ChevronDown, Check, Package, Droplet, Coffee, Apple, Leaf, Beef, Pizza, Milk, Cherry } from "lucide-react";

// Types for the different supplier categories
type SupplierCategory = "packaging" | "ingredients" | "consultants";

interface SupplierConnectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface SelectedService {
  id: string;
  name: string;
}

interface PackagingOption {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
}

interface IngredientOption {
  id: string;
  name: string;
  icon: JSX.Element;
  category: string;
}

const SupplierConnectPopup: React.FC<SupplierConnectPopupProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentCategory, setCurrentCategory] = useState<SupplierCategory>("packaging");
  const [searchValue, setSearchValue] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Sample data for packaging options
  const packagingOptions: PackagingOption[] = [
    { 
      id: "bottle", 
      name: "Bottle", 
      icon: <Package size={18} />, 
      description: "Glass or plastic containers with narrow necks"
    },
    { 
      id: "can", 
      name: "Can", 
      icon: <Package size={18} />, 
      description: "Metal containers for beverages or foods"
    },
    { 
      id: "box", 
      name: "Box", 
      icon: <Package size={18} />, 
      description: "Cardboard or rigid containers"
    },
    { 
      id: "pouch", 
      name: "Pouch", 
      icon: <Package size={18} />, 
      description: "Flexible packaging with sealed edges"
    },
    { 
      id: "jar", 
      name: "Jar", 
      icon: <Package size={18} />, 
      description: "Wide-mouth containers with threaded lids"
    },
    { 
      id: "wrapper", 
      name: "Wrapper", 
      icon: <Package size={18} />, 
      description: "Flexible films or papers for wrapping products"
    },
    { 
      id: "tray", 
      name: "Tray", 
      icon: <Package size={18} />, 
      description: "Flat containers with raised edges"
    }
  ];

  // Sample data for ingredient categories
  const ingredientCategories = [
    { id: "sweeteners", name: "Sweeteners", icon: <Coffee size={18} /> },
    { id: "preservatives", name: "Preservatives", icon: <Droplet size={18} /> },
    { id: "colors", name: "Colors & Flavors", icon: <Cherry size={18} /> },
    { id: "fruits", name: "Fruits & Vegetables", icon: <Apple size={18} /> },
    { id: "herbs", name: "Herbs & Spices", icon: <Leaf size={18} /> },
    { id: "proteins", name: "Proteins", icon: <Beef size={18} /> },
    { id: "dairy", name: "Dairy", icon: <Milk size={18} /> },
    { id: "grains", name: "Grains & Flours", icon: <Pizza size={18} /> }
  ];

  // Sample data for ingredients
  const ingredientOptions: IngredientOption[] = [
    { id: "sugar", name: "Sugar", icon: <Coffee size={18} />, category: "sweeteners" },
    { id: "honey", name: "Honey", icon: <Coffee size={18} />, category: "sweeteners" },
    { id: "stevia", name: "Stevia", icon: <Coffee size={18} />, category: "sweeteners" },
    
    { id: "salt", name: "Salt", icon: <Droplet size={18} />, category: "preservatives" },
    { id: "vinegar", name: "Vinegar", icon: <Droplet size={18} />, category: "preservatives" },
    { id: "citric_acid", name: "Citric Acid", icon: <Droplet size={18} />, category: "preservatives" },
    
    { id: "vanilla", name: "Vanilla", icon: <Cherry size={18} />, category: "colors" },
    { id: "cocoa", name: "Cocoa", icon: <Cherry size={18} />, category: "colors" },
    { id: "caramel", name: "Caramel", icon: <Cherry size={18} />, category: "colors" },
    
    { id: "apple", name: "Apple", icon: <Apple size={18} />, category: "fruits" },
    { id: "banana", name: "Banana", icon: <Apple size={18} />, category: "fruits" },
    { id: "orange", name: "Orange", icon: <Apple size={18} />, category: "fruits" },
    
    { id: "cinnamon", name: "Cinnamon", icon: <Leaf size={18} />, category: "herbs" },
    { id: "mint", name: "Mint", icon: <Leaf size={18} />, category: "herbs" },
    { id: "basil", name: "Basil", icon: <Leaf size={18} />, category: "herbs" },
    
    { id: "beef", name: "Beef", icon: <Beef size={18} />, category: "proteins" },
    { id: "chicken", name: "Chicken", icon: <Beef size={18} />, category: "proteins" },
    { id: "soy", name: "Soy Protein", icon: <Beef size={18} />, category: "proteins" },
    
    { id: "milk", name: "Milk", icon: <Milk size={18} />, category: "dairy" },
    { id: "cheese", name: "Cheese", icon: <Milk size={18} />, category: "dairy" },
    { id: "yogurt", name: "Yogurt", icon: <Milk size={18} />, category: "dairy" },
    
    { id: "wheat", name: "Wheat Flour", icon: <Pizza size={18} />, category: "grains" },
    { id: "rice", name: "Rice Flour", icon: <Pizza size={18} />, category: "grains" },
    { id: "corn", name: "Corn Flour", icon: <Pizza size={18} />, category: "grains" }
  ];

  // Sample data for consultant services
  const consultantServices = [
    { id: "formulation", name: "Formulation", description: "Development of product recipes and formulas" },
    { id: "commercialization", name: "Commercialization", description: "Market analysis and go-to-market strategies" },
    { id: "label", name: "Label Creation and Compliance", description: "Regulatory compliance and package design" },
    { id: "cost", name: "Cost Optimization", description: "Process efficiency and cost reduction analysis" },
    { id: "supply", name: "Supply Chain And Logistics", description: "Supply chain management and distribution planning" },
    { id: "quality", name: "Quality Assurance", description: "Quality control and testing procedures" },
    { id: "safety", name: "Food Safety", description: "Safety protocols and certification assistance" },
    { id: "shelf", name: "Shelf Life Extension", description: "Methods to improve product longevity" },
  ];

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter ingredients based on search
  const filteredIngredients = ingredientOptions.filter(
    ingredient => ingredient.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Filter packaging options based on search
  const filteredPackaging = packagingOptions.filter(
    pkg => pkg.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group ingredients by category
  const groupedIngredients = ingredientOptions.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, IngredientOption[]>);

  // Handle popup close and reset states
  const handleClose = () => {
    onClose();
    // Reset states after animation completes
    setTimeout(() => {
      setCurrentCategory("packaging");
      setSearchValue("");
      setSelectedIngredients([]);
      setSelectedServices([]);
      setSelectedPackaging("");
      setShowOptions(false);
    }, 300);
  };

  // Go to next category
  const handleNext = () => {
    if (currentCategory === "packaging") {
      setCurrentCategory("ingredients");
      setSearchValue("");
      setShowOptions(false);
    } else if (currentCategory === "ingredients") {
      setCurrentCategory("consultants");
      setSearchValue("");
      setShowOptions(false);
    } else {
      onComplete();
      handleClose();
    }
  };

  // Skip the current category
  const handleSkip = () => {
    handleNext();
  };

  // Add or remove an ingredient
  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSearchValue("");
  };

  // Toggle service selection
  const toggleService = (service: SelectedService) => {
    const exists = selectedServices.some(s => s.id === service.id);
    
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Select packaging option
  const selectPackaging = (packageId: string) => {
    setSelectedPackaging(packageId);
    setSearchValue(packagingOptions.find(p => p.id === packageId)?.name || "");
    setShowOptions(false);
  };

  // Handle search focus
  const handleSearchFocus = () => {
    if (currentCategory === "consultants") {
      setIsDropdownOpen(true);
    } else {
      setShowOptions(true);
    }
  };

  // Get selected packaging name
  const getSelectedPackagingName = () => {
    const pkg = packagingOptions.find(p => p.id === selectedPackaging);
    return pkg ? pkg.name : "";
  };

  // Variants for animations
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 500 }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const cardVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      rotateY: 5,
      rotateX: 5,
      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    selected: {
      backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
      color: isDarkMode ? "#93c5fd" : "#1d4ed8"
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div 
            className={`w-full max-w-xl rounded-xl shadow-2xl ${
              isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white"
            } overflow-hidden no-scrollbar`}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Progress indicator */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-4 text-sm w-full">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className={`ml-2 font-medium ${
                      isDarkMode ? "text-blue-300" : "text-green-600"
                    }`}>
                      Product
                    </span>
                  </div>
                  
                  <div className="flex-grow h-0.5 bg-gray-200"></div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentCategory === "packaging" 
                        ? isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                        : currentCategory === "ingredients" || currentCategory === "consultants"
                          ? isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                          : isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentCategory === "packaging" ? "•" : 
                       (currentCategory === "ingredients" || currentCategory === "consultants") ? 
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12"></polyline>
                       </svg> : "2"}
                    </div>
                    <span className={`ml-2 font-medium ${
                      currentCategory === "packaging" 
                        ? isDarkMode ? "text-blue-300" : "text-green-600"
                        : currentCategory === "ingredients" || currentCategory === "consultants"
                          ? isDarkMode ? "text-blue-300" : "text-green-600"
                          : isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Packaging
                    </span>
                  </div>
                  
                  <div className="flex-grow h-0.5 bg-gray-200"></div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentCategory === "ingredients" 
                        ? isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                        : currentCategory === "consultants"
                          ? isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                          : isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentCategory === "ingredients" ? "•" : 
                       currentCategory === "consultants" ? 
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12"></polyline>
                       </svg> : "3"}
                    </div>
                    <span className={`ml-2 font-medium ${
                      currentCategory === "ingredients" 
                        ? isDarkMode ? "text-blue-300" : "text-green-600"
                        : currentCategory === "consultants"
                          ? isDarkMode ? "text-blue-300" : "text-green-600"
                          : isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Ingredients
                    </span>
                  </div>
                  
                  <div className="flex-grow h-0.5 bg-gray-200"></div>
                  
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentCategory === "consultants" 
                        ? isDarkMode ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                        : isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentCategory === "consultants" ? "•" : "4"}
                    </div>
                    <span className={`ml-2 font-medium ${
                      currentCategory === "consultants" 
                        ? isDarkMode ? "text-blue-300" : "text-green-600"
                        : isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Consultants
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleClose}
                  className={`p-1 rounded-full hover:bg-gray-100 ml-2 ${
                    isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-gray-500"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Main content with animations */}
            <AnimatePresence mode="wait">
              {/* Packaging */}
              {currentCategory === "packaging" && (
                <motion.div
                  key="packaging"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-8 pb-8"
                >
                  <h2 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    In addition to manufacturers, would you also like us to connect you with packaging suppliers?
                  </h2>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Your Packaging
                    </label>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={handleSearchFocus}
                        placeholder="Select packaging type..."
                        className={`w-full px-4 py-2 rounded-md border ${
                          isDarkMode 
                            ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                            : "bg-white border-gray-300 focus:border-blue-500"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      <div 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowOptions(!showOptions)}
                      >
                        <motion.div
                          animate={{ rotate: showOptions ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={18} className={isDarkMode ? "text-slate-400" : "text-gray-400"} />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Packaging Options */}
                    <AnimatePresence>
                      {showOptions && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`mt-1 rounded-md border shadow-lg max-h-56 overflow-y-auto no-scrollbar ${
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="p-2">
                            {(searchValue.length > 0 ? filteredPackaging : packagingOptions).map((pkg, index) => (
                              <motion.div
                                key={pkg.id}
                                custom={index}
                                variants={listItemVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ 
                                  scale: 1.02, 
                                  backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)" 
                                }}
                                className={`flex items-center p-2 rounded-md cursor-pointer mb-1 ${
                                  selectedPackaging === pkg.id
                                    ? isDarkMode 
                                      ? "bg-blue-900/30 text-blue-200 border-l-2 border-blue-500" 
                                      : "bg-blue-50 text-blue-800 border-l-2 border-blue-500"
                                    : isDarkMode 
                                      ? "text-slate-200 hover:bg-slate-700" 
                                      : "text-gray-800 hover:bg-gray-50"
                                }`}
                                onClick={() => selectPackaging(pkg.id)}
                              >
                                <div className={`mr-3 p-1.5 rounded-full ${
                                  selectedPackaging === pkg.id 
                                    ? isDarkMode ? "bg-blue-800" : "bg-blue-100" 
                                    : isDarkMode ? "bg-slate-700" : "bg-gray-100"
                                }`}>
                                  {pkg.icon}
                                </div>
                                <div className="flex-1">
                                  <div className={`font-medium ${
                                    selectedPackaging === pkg.id 
                                      ? isDarkMode ? "text-blue-300" : "text-blue-700" 
                                      : isDarkMode ? "text-slate-200" : "text-gray-800"
                                  }`}>{pkg.name}</div>
                                  <div className={`text-xs ${
                                    isDarkMode ? "text-slate-400" : "text-gray-500"
                                  }`}>{pkg.description}</div>
                                </div>
                                {selectedPackaging === pkg.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className={`p-1 rounded-full ${isDarkMode ? "bg-blue-700" : "bg-blue-500"}`}
                                  >
                                    <Check size={14} className="text-white" />
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Selected Packaging Preview */}
                  {selectedPackaging && (
                    <motion.div 
                      className={`mb-6 rounded-lg p-4 ${
                        isDarkMode ? "bg-slate-800" : "bg-gray-50"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ perspective: "1000px" }}
                    >
                      <motion.div
                        className={`flex items-center ${
                          isDarkMode ? "text-slate-200" : "text-gray-800"
                        }`}
                        whileHover={{
                          rotateX: 5,
                          rotateY: 5,
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className={`mr-4 p-3 rounded-full ${
                          isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                        }`} style={{ transform: "translateZ(20px)" }}>
                          {packagingOptions.find(p => p.id === selectedPackaging)?.icon}
                        </div>
                        <div style={{ transform: "translateZ(10px)" }}>
                          <div className="font-semibold">
                            {getSelectedPackagingName()}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}>
                            {packagingOptions.find(p => p.id === selectedPackaging)?.description}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleNext}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } transition-colors relative overflow-hidden`}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: isDarkMode 
                          ? "0 8px 25px rgba(37, 99, 235, 0.5)" 
                          : "0 8px 25px rgba(59, 130, 246, 0.5)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span 
                        className="absolute inset-0 w-full h-full bg-white"
                        style={{ mixBlendMode: "soft-light", opacity: 0 }}
                        animate={{ 
                          background: [
                            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)",
                            "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)"
                          ],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 4
                        }}
                      />
                      Yes, find me suppliers
                    </motion.button>
                    <motion.button
                      onClick={handleSkip}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                      } transition-colors`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      No thanks
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {/* Ingredients */}
              {currentCategory === "ingredients" && (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-8 pb-8"
                >
                  <h2 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    In addition to manufacturers, would you like us to connect you with ingredient suppliers?
                  </h2>
                  
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>
                    *Only recommended if you prefer to directly source ingredients
                  </p>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Your Ingredient
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={handleSearchFocus}
                        placeholder="Search ingredients..."
                        className={`w-full px-4 py-2 rounded-md border ${
                          isDarkMode 
                            ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                            : "bg-white border-gray-300 focus:border-blue-500"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      <div 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowOptions(!showOptions)}
                      >
                        <motion.div
                          animate={{ rotate: showOptions ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={18} className={isDarkMode ? "text-slate-400" : "text-gray-400"} />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Ingredient Categories and Options */}
                    <AnimatePresence>
                      {showOptions && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`mt-1 rounded-md border shadow-lg max-h-56 overflow-y-auto no-scrollbar ${
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                          }`}
                        >
                          {searchValue.length > 0 ? (
                            // Search results
                            <div className="p-2">
                              {filteredIngredients.map((ingredient, index) => (
                                <motion.div
                                  key={ingredient.id}
                                  custom={index}
                                  variants={listItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  whileHover={{ 
                                    scale: 1.02, 
                                    backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)" 
                                  }}
                                  className={`flex items-center p-2 rounded-md cursor-pointer mb-1 ${
                                    selectedIngredients.includes(ingredient.id)
                                      ? isDarkMode 
                                        ? "bg-blue-900/30 text-blue-200 border-l-2 border-blue-500" 
                                        : "bg-blue-50 text-blue-800 border-l-2 border-blue-500"
                                      : isDarkMode 
                                        ? "text-slate-200 hover:bg-slate-700" 
                                        : "text-gray-800 hover:bg-gray-50"
                                  }`}
                                  onClick={() => toggleIngredient(ingredient.id)}
                                >
                                  <div className={`mr-3 p-1.5 rounded-full ${
                                    selectedIngredients.includes(ingredient.id) 
                                      ? isDarkMode ? "bg-blue-800" : "bg-blue-100" 
                                      : isDarkMode ? "bg-slate-700" : "bg-gray-100"
                                  }`}>
                                    {ingredient.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium ${
                                      selectedIngredients.includes(ingredient.id) 
                                        ? isDarkMode ? "text-blue-300" : "text-blue-700" 
                                        : isDarkMode ? "text-slate-200" : "text-gray-800"
                                    }`}>{ingredient.name}</div>
                                    <div className={`text-xs ${
                                      isDarkMode ? "text-slate-400" : "text-gray-500"
                                    }`}>{ingredientCategories.find(c => c.id === ingredient.category)?.name}</div>
                                  </div>
                                  {selectedIngredients.includes(ingredient.id) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                      className={`p-1 rounded-full ${isDarkMode ? "bg-blue-700" : "bg-blue-500"}`}
                                    >
                                      <Check size={14} className="text-white" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            // Grouped by category
                            <div className="p-2">
                              {ingredientCategories.map((category, catIndex) => (
                                <div key={category.id} className="mb-2">
                                  <div className={`text-xs font-semibold mb-1 ${
                                    isDarkMode ? "text-slate-400" : "text-gray-500"
                                  }`}>
                                    {category.name}
                                  </div>
                                  {ingredientOptions
                                    .filter(i => i.category === category.id)
                                    .map((ingredient, index) => (
                                      <motion.div
                                        key={ingredient.id}
                                        custom={catIndex * 10 + index}
                                        variants={listItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover={{ 
                                          scale: 1.02, 
                                          backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)" 
                                        }}
                                        className={`flex items-center p-2 rounded-md cursor-pointer mb-1 ${
                                          selectedIngredients.includes(ingredient.id)
                                            ? isDarkMode 
                                              ? "bg-blue-900/30 text-blue-200 border-l-2 border-blue-500" 
                                              : "bg-blue-50 text-blue-800 border-l-2 border-blue-500"
                                            : isDarkMode 
                                              ? "text-slate-200 hover:bg-slate-700" 
                                              : "text-gray-800 hover:bg-gray-50"
                                        }`}
                                        onClick={() => toggleIngredient(ingredient.id)}
                                      >
                                        <div className={`mr-3 p-1.5 rounded-full ${
                                          selectedIngredients.includes(ingredient.id) 
                                            ? isDarkMode ? "bg-blue-800" : "bg-blue-100" 
                                            : isDarkMode ? "bg-slate-700" : "bg-gray-100"
                                        }`}>
                                          {ingredient.icon}
                                        </div>
                                        <div className="flex-1">
                                          <div className={`font-medium ${
                                            selectedIngredients.includes(ingredient.id) 
                                              ? isDarkMode ? "text-blue-300" : "text-blue-700" 
                                              : isDarkMode ? "text-slate-200" : "text-gray-800"
                                          }`}>{ingredient.name}</div>
                                        </div>
                                        {selectedIngredients.includes(ingredient.id) && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            className={`p-1 rounded-full ${isDarkMode ? "bg-blue-700" : "bg-blue-500"}`}
                                          >
                                            <Check size={14} className="text-white" />
                                          </motion.div>
                                        )}
                                      </motion.div>
                                    ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Selected Ingredients */}
                  {selectedIngredients.length > 0 ? (
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-6"
                      layout
                    >
                      {selectedIngredients.map(ingredientId => {
                        const ingredient = ingredientOptions.find(i => i.id === ingredientId);
                        if (!ingredient) return null;
                        
                        return (
                          <motion.div 
                            key={ingredientId}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                              isDarkMode
                                ? "bg-slate-700 text-slate-200"
                                : "bg-gray-100 text-gray-800"
                            }`}
                            style={{ perspective: "500px", transformStyle: "preserve-3d" }}
                            whileHover={{
                              scale: 1.05,
                              rotateY: 5,
                              boxShadow: isDarkMode 
                                ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
                                : "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                          >
                            <span className="mr-1">{ingredient.icon}</span>
                            <span>{ingredient.name}</span>
                            <motion.button
                              onClick={() => toggleIngredient(ingredientId)}
                              className={`ml-2 p-0.5 rounded-full ${
                                isDarkMode 
                                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" 
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              }`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    // Default "Salt" ingredient for demo
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                          isDarkMode
                            ? "bg-slate-700 text-slate-200"
                            : "bg-gray-100 text-gray-800"
                        }`}
                        whileHover={{
                          scale: 1.05,
                          rotateY: 5,
                          boxShadow: isDarkMode 
                            ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
                            : "0 4px 12px rgba(0, 0, 0, 0.1)"
                        }}
                        style={{ perspective: "500px", transformStyle: "preserve-3d" }}
                      >
                        <Droplet size={14} className="mr-1" />
                        Salt
                        <motion.button
                          className={`ml-2 p-0.5 rounded-full ${
                            isDarkMode 
                              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600" 
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleNext}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } transition-colors relative overflow-hidden`}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: isDarkMode 
                          ? "0 8px 25px rgba(37, 99, 235, 0.5)" 
                          : "0 8px 25px rgba(59, 130, 246, 0.5)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span 
                        className="absolute inset-0 w-full h-full bg-white"
                        style={{ mixBlendMode: "soft-light", opacity: 0 }}
                        animate={{ 
                          background: [
                            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)",
                            "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)"
                          ],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 4
                        }}
                      />
                      Yes, find me suppliers
                    </motion.button>
                    <motion.button
                      onClick={handleSkip}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                      } transition-colors`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      No thanks
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {/* Consultants */}
              {currentCategory === "consultants" && (
                <motion.div
                  key="consultants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-8 pb-8"
                >
                  <h2 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Would you like us to also connect you with product consultants for your project?
                  </h2>
                  
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}>
                    Consultants offer specialized services and can help with everything from R&D and formulation to compliance and logistics planning.
                  </p>
                  
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      What services would you like to request?
                    </label>
                    
                    {/* Service cards with 3D effect */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4" style={{ perspective: "1000px" }}>
                      {consultantServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          style={{ transformStyle: "preserve-3d" }}
                          variants={cardVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                          custom={index}
                          className={`p-4 rounded-lg cursor-pointer border ${
                            selectedServices.some(s => s.id === service.id)
                              ? isDarkMode 
                                ? "bg-blue-900/30 border-blue-600 shadow-inner shadow-blue-900/20" 
                                : "bg-blue-50 border-blue-200"
                              : isDarkMode 
                                ? "bg-slate-800 border-slate-700 hover:border-slate-600" 
                                : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => toggleService(service)}
                        >
                          <motion.div 
                            className="flex items-start gap-3"
                            style={{ transform: "translateZ(10px)" }}
                          >
                            <div className={`p-2 rounded-full ${
                              selectedServices.some(s => s.id === service.id)
                                ? isDarkMode ? "bg-blue-800" : "bg-blue-100"
                                : isDarkMode ? "bg-slate-700" : "bg-gray-100"
                            }`}>
                              {selectedServices.some(s => s.id === service.id) ? (
                                <Check className={`${isDarkMode ? "text-blue-200" : "text-blue-600"}`} size={18} />
                              ) : (
                                <motion.div 
                                  className={`w-[18px] h-[18px] rounded-full border-2 ${
                                    isDarkMode ? "border-slate-500" : "border-gray-300"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${
                                selectedServices.some(s => s.id === service.id)
                                  ? isDarkMode ? "text-blue-300" : "text-blue-700"
                                  : isDarkMode ? "text-slate-200" : "text-gray-800"
                              }`}>
                                {service.name}
                              </div>
                              <div className={`text-xs mt-1 ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}>
                                {service.description}
                              </div>
                            </div>
                          </motion.div>
                          
                          {/* 3D hover effect glow */}
                          <motion.div 
                            className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
                            style={{ 
                              background: isDarkMode 
                                ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)" 
                                : "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)",
                              transformStyle: "preserve-3d",
                              transform: "translateZ(-10px)"
                            }}
                            animate={{ 
                              opacity: selectedServices.some(s => s.id === service.id) ? 1 : 0 
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selected Services Summary */}
                  {selectedServices.length > 0 && (
                    <motion.div 
                      className={`p-4 rounded-lg mb-6 ${
                        isDarkMode ? "bg-slate-800" : "bg-gray-50"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}>
                        Selected Services ({selectedServices.length})
                      </div>
                      <motion.div className="flex flex-wrap gap-2" layout>
                        {selectedServices.map(service => (
                          <motion.div 
                            key={service.id}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                              isDarkMode
                                ? "bg-blue-900/30 text-blue-200"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            <span>{service.name}</span>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleService(service)}
                              className="ml-2 p-0.5 rounded-full hover:bg-blue-200/30"
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleNext}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } transition-colors relative overflow-hidden`}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: isDarkMode 
                          ? "0 8px 25px rgba(37, 99, 235, 0.5)" 
                          : "0 8px 25px rgba(59, 130, 246, 0.5)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span 
                        className="absolute inset-0 w-full h-full bg-white"
                        style={{ mixBlendMode: "soft-light", opacity: 0 }}
                        animate={{ 
                          background: [
                            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)",
                            "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)"
                          ],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 4
                        }}
                      />
                      Yes, find me suppliers
                    </motion.button>
                    <motion.button
                      onClick={handleSkip}
                      className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                        isDarkMode
                          ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                      } transition-colors`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      No thanks
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupplierConnectPopup; 