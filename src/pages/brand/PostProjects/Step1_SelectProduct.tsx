import React, { useState, useRef, useEffect } from "react";
import { productCategories, supplierTypes } from "./mockData";
import type { ProductCategory, SupplierType } from "./types";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface Props {
  onNext: () => void;
  selectedProduct: ProductCategory | null;
  setSelectedProduct: (p: ProductCategory | null) => void;
  selectedSupplierType?: SupplierType;
  setSelectedSupplierType?: (s: SupplierType) => void;
}

const Step1_SelectProduct: React.FC<Props> = ({ 
  onNext, 
  selectedProduct, 
  setSelectedProduct,
  selectedSupplierType: propSelectedSupplierType,
  setSelectedSupplierType: propSetSelectedSupplierType
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [localSelectedSupplierType, setLocalSelectedSupplierType] = useState<SupplierType>(supplierTypes[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLDivElement>(null);
  const iconRotateX = useMotionValue(0);
  const iconRotateY = useMotionValue(0);
  const iconScale = useMotionValue(1);
  
  // Use either prop state or local state
  const selectedSupplierType = propSelectedSupplierType || localSelectedSupplierType;
  const setSelectedSupplierType = propSetSelectedSupplierType || setLocalSelectedSupplierType;
  
  const filtered = productCategories.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSupplierSelect = (supplier: SupplierType) => {
    setSelectedSupplierType(supplier);
    setShowDropdown(false);
  };
  
  const handleIconMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate rotation based on mouse position relative to center
    const rotateX = ((mouseY - centerY) / (rect.height / 2)) * 15;
    const rotateY = ((centerX - mouseX) / (rect.width / 2)) * 15;
    
    iconRotateX.set(rotateX);
    iconRotateY.set(rotateY);
    iconScale.set(1.1);
  };
  
  const handleIconMouseLeave = () => {
    iconRotateX.set(0);
    iconRotateY.set(0);
    iconScale.set(1);
  };

  // Apply perspective transform to create 3D effect
  const iconTransform = useTransform(
    [iconRotateX, iconRotateY, iconScale],
    ([rotX, rotY, scale]) => `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`
  );

  return (
    <div className="flex flex-row w-full min-h-screen">
      <div className="flex-1 flex flex-col justify-center p-12">
        <div className="w-full bg-background rounded-none shadow-none p-0 border-0">
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              className="mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              style={{ transform: iconTransform }}
              onMouseMove={handleIconMouseMove}
              onMouseLeave={handleIconMouseLeave}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/90 to-primary/30 flex items-center justify-center shadow-lg relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-white opacity-10"
                  animate={{ 
                    background: [
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
                      "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)"
                    ]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                />
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-white"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </motion.svg>
              </div>
            </motion.div>
            <motion.h2 
              className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.1,
                type: "spring",
                stiffness: 100
              }}
            >
              Post a Project
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              With few easy steps you can get great manufacturers to signal interest in making any product.
            </motion.p>
          </div>
          
          <motion.div 
            className="mb-4 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-1">Find a...</label>
            <div className="relative" ref={dropdownRef}>
              <motion.div 
                className="w-full border rounded px-3 py-2 bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
                whileHover={{ 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
                whileTap={{ scale: 0.99 }}
              >
                <span>{selectedSupplierType.name}</span>
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  animate={{ rotate: showDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "anticipate" }}
                >
                  <path d="m6 9 6 6 6-6"/>
                </motion.svg>
              </motion.div>
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    className="absolute w-full mt-1 border rounded shadow-lg bg-background z-10"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {supplierTypes.map((supplier, index) => (
                      <motion.div
                        key={supplier.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                          selectedSupplierType.id === supplier.id ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleSupplierSelect(supplier)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.05 }}
                        whileHover={{ x: 4, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                      >
                        {supplier.name}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>
          </motion.div>
          
          <motion.div 
            className="mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            ref={productSearchRef}
          >
            <label className="block text-sm font-medium mb-1">For</label>
            <div className="relative">
              <motion.input
                className="w-full border rounded px-3 py-2 bg-muted focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                placeholder="Search by product or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowProductSuggestions(true)}
                whileFocus={{ 
                  boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
              />
              {search && (
                <motion.button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearch("")}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              )}
            </div>
            <div className="mt-2 max-h-40 relative overflow-hidden">
              <motion.div 
                className="max-h-40 rounded bg-background border hide-scrollbar"
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: filtered.length && showProductSuggestions ? "auto" : 0, 
                  opacity: filtered.length && showProductSuggestions ? 1 : 0,
                  borderColor: filtered.length && showProductSuggestions ? "rgba(var(--border-rgb), 1)" : "transparent"
                }}
                transition={{ duration: 0.3 }}
                style={{
                  overflowY: "auto",
                  scrollbarWidth: "none", /* Firefox */
                  msOverflowStyle: "none" /* IE and Edge */
                }}
              >
                {filtered.map((p, index) => (
                  <motion.div
                    key={p.id}
                    className={`flex items-center px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${selectedProduct?.id === p.id ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowProductSuggestions(false);
                    }}
                    whileHover={{ x: 5, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                    transition={{ duration: 0.2 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.05 } 
                    }}
                  >
                    <motion.span 
                      className="mr-2 inline-block"
                      whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {p.type === "CATEGORY" ? "📦" : "🥤"}
                    </motion.span>
                    <span>{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.type}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold py-2 px-4 rounded mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            disabled={!selectedProduct}
            onClick={onNext}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            whileHover={{ 
              scale: selectedProduct ? 1.02 : 1,
              boxShadow: selectedProduct ? "0 4px 20px rgba(var(--primary-rgb), 0.3)" : "none"
            }}
            whileTap={{ scale: selectedProduct ? 0.98 : 1 }}
          >
            <motion.span 
              className="absolute inset-0 bg-white opacity-0"
              whileHover={{ 
                opacity: selectedProduct ? 0.2 : 0,
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)",
                  "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {selectedProduct ? "Next" : "Select a product to continue"}
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-12 min-h-screen bg-muted/40">
        <motion.div 
          className="w-80 h-80 bg-background rounded-xl shadow-lg flex flex-col items-center justify-center border border-border relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.6, 
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ 
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            y: -5
          }}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="absolute inset-0 bg-primary/5 rounded-xl"
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0) 70%)",
                "radial-gradient(circle at 80% 80%, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0) 70%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          />
          
          <AnimatePresence mode="wait">
          {selectedProduct ? (
              <motion.div 
                key="selected"
                className="flex flex-col items-center relative z-10"
                initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 20 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4 relative"
                  whileHover={{ 
                    rotate: [0, 5, -5, 0],
                    scale: 1.05,
                    boxShadow: "0 8px 20px rgba(var(--primary-rgb), 0.2)"
                  }}
                  transition={{ duration: 1 }}
                >
                  <motion.span 
                    className="text-4xl"
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                    }}
                  >
                    {selectedProduct.type === "CATEGORY" ? "📦" : "🥤"}
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{
                      boxShadow: [
                        "0 0 0 0px rgba(var(--primary-rgb), 0.3)",
                        "0 0 0 10px rgba(var(--primary-rgb), 0)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>
                
                <motion.div 
                  className="text-lg font-semibold text-center"
                  animate={{ 
                    background: [
                      "linear-gradient(90deg, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0.6) 100%)",
                      "linear-gradient(90deg, rgba(var(--primary-rgb), 0.6) 0%, rgba(var(--primary-rgb), 0.8) 100%)"
                    ],
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  {selectedProduct.name}
                </motion.div>
                
                <motion.div 
                  className="text-muted-foreground text-center mt-1"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {selectedProduct.type}
                </motion.div>
                
                <motion.div 
                  className="text-sm text-muted-foreground text-center mt-4 px-3 py-1 rounded-full bg-primary/5"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                >
                  For: {selectedSupplierType.name}
                </motion.div>
                
                <motion.div 
                  className="text-xs text-primary mt-3 px-2 py-1 rounded-full border border-primary/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  6/7/2025
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="text-muted-foreground text-center flex flex-col items-center relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mb-4 text-muted-foreground/50"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.02, 1, 1.02, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>
                </motion.svg>
                Select a product or category
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Global styles for hiding scrollbars */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Add CSS variable for primary color RGB values */
        :root {
          --primary-rgb: 0, 112, 243;
          --border-rgb: 226, 232, 240;
        }
      `}</style>
    </div>
  );
};

export default Step1_SelectProduct;
