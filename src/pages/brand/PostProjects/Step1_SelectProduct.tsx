import React, { useState, useRef, useEffect } from "react";
import { foodProductApi, projectApi } from "../../../lib/api";
import type { ProductCategory, SupplierType } from "./types";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface Props {
  onNext: () => void;
  selectedProduct: ProductCategory | null;
  setSelectedProduct: (p: ProductCategory | null) => void;
  selectedSupplierType?: SupplierType;
  setSelectedSupplierType?: (s: SupplierType) => void;
}

// Static supplier types (these are business logic constants)
const supplierTypes: SupplierType[] = [
  { id: 1, name: "Manufacturer" },
  { id: 2, name: "Packaging Supplier" },
  { id: 3, name: "Ingredient Supplier" },
  { id: 4, name: "Secondary Packager" },
  { id: 5, name: "Packaging Services" },
];

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
  
  // API states
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLDivElement>(null);
  const iconRotateX = useMotionValue(0);
  const iconRotateY = useMotionValue(0);
  const iconScale = useMotionValue(1);
  
  // Use either prop state or local state
  const selectedSupplierType = propSelectedSupplierType || localSelectedSupplierType;
  const setSelectedSupplierType = propSetSelectedSupplierType || setLocalSelectedSupplierType;
  
  // Function to get default category icon/image
  const getCategoryIcon = (categoryName: string): string => {
    const categoryIcons: Record<string, string> = {
      'Dressing': '🥗',
      'Instant Food': '🍜',
      'Miso': '🥣',
      'Sauce': '🫙',
      'Seasoning Mix': '🧂',
      'Soy Sauce': '🍯',
      'Beverages': '🥤',
      'Beverage': '🥤',
      'Drink': '🥤',
      'Snacks': '🍿',
      'Snack': '🍿',
      'Dairy': '🥛',
      'Milk': '🥛',
      'Bakery': '🍞',
      'Bread': '🍞',
      'Meat': '🥩',
      'Seafood': '🐟',
      'Fish': '🐟',
      'Vegetables': '🥬',
      'Vegetable': '🥬',
      'Fruits': '🍎',
      'Fruit': '🍎',
      'Condiments': '🍯',
      'Spices': '🌶️',
      'Spice': '🌶️',
      'Cereals': '🥣',
      'Cereal': '🥣',
      'Confectionery': '🍬',
      'Candy': '🍬',
      'Sweet': '🍬',
      'Frozen': '🧊',
      'Canned': '🥫',
      'Organic': '🌱',
      'Health': '💚',
      'Baby Food': '🍼',
      'Pet Food': '🐕',
      'Chocolate': '🍫',
      'Coffee': '☕',
      'Tea': '🍵',
      'Other': '📦'
    };
    
    // Find matching category (case insensitive)
    const matchedKey = Object.keys(categoryIcons).find(key => 
      categoryName.toLowerCase().includes(key.toLowerCase())
    );
    
    return categoryIcons[matchedKey || 'Other'];
  };
  
  // Function to get default category image URL
  const getCategoryImage = (categoryName: string): string => {
    // Create a more attractive placeholder for categories
    const colors = [
      'ff6b6b/ffffff', // Red
      '4ecdc4/ffffff', // Teal  
      '45b7d1/ffffff', // Blue
      '96ceb4/ffffff', // Green
      'ffeaa7/333333', // Yellow
      'dda0dd/ffffff', // Plum
      'ff9ff3/ffffff', // Pink
      '74b9ff/ffffff', // Light Blue
    ];
    
    // Use category name to consistently pick a color
    const colorIndex = categoryName.length % colors.length;
    const color = colors[colorIndex];
    const encodedName = encodeURIComponent(categoryName.replace(/\s+/g, '+'));
    
    return `https://via.placeholder.com/300x300/${color}?text=${encodedName}&font=Arial`;
  };
  
  // Function to get display image for any product/category
  const getDisplayImage = (item: ProductCategory): string => {
    if (item.type === 'PRODUCT' && item.image) {
      return item.image;
    } else if (item.type === 'CATEGORY') {
      return getCategoryImage(item.name);
    }
    // Fallback for products without image
    return getCategoryImage(item.name);
  };
  
  // Function to get display icon for any product/category
  const getDisplayIcon = (item: ProductCategory): string => {
    if (item.type === 'CATEGORY') {
      return getCategoryIcon(item.name);
    }
    return '🥤'; // Default product icon
  };
  
  // Combine categories and products into a unified ProductCategory format
  const productCategories: ProductCategory[] = [
    // Food Types (like Soy Sauce, Miso, etc.)
    ...foodTypes.map((foodType, index) => ({
      id: index + 1000, // offset to avoid ID conflicts
      name: foodType,
      type: "CATEGORY" as const
    }))
  ];
  

  
  const filtered = productCategories.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load food types, manufacturers, and project analytics in parallel
        const [foodTypesRes, manufacturersRes, analyticsRes] = await Promise.all([
          foodProductApi.getFoodTypes(),
          foodProductApi.getManufacturers(),
          projectApi.getProjectAnalytics().catch(() => null) // Optional - don't fail if analytics unavailable
        ]);
        
        // Handle food types
        if (foodTypesRes.data?.success && foodTypesRes.data?.data && Array.isArray(foodTypesRes.data.data)) {
          setFoodTypes(foodTypesRes.data.data);
        }
        
        // Handle manufacturers
        if (manufacturersRes.data?.data && Array.isArray(manufacturersRes.data.data)) {
          setManufacturers(manufacturersRes.data.data);
        }
        
        // Optional: Use analytics data to show user insights
        if (analyticsRes?.data) {
          console.log('User project analytics:', analyticsRes.data);
          // Could show user stats like "You have X active projects" in UI
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle click outside
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-row w-full min-h-screen">
        <div className="flex-1 flex flex-col justify-center items-center p-12">
          <motion.div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-12 min-h-screen bg-muted/40">
          <div className="w-80 h-80 bg-background rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-row w-full min-h-screen">
        <div className="flex-1 flex flex-col justify-center items-center p-12">
          <div className="text-red-500 mb-4">⚠️ Error</div>
          <p className="text-muted-foreground text-center">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-12 min-h-screen bg-muted/40">
          <div className="w-80 h-80 bg-background rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-muted-foreground">Please retry</div>
          </div>
        </div>
      </div>
    );
  }

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
              Post Project
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Connect with verified partners (Manufacturers, Suppliers, Packaging Services, etc.) to bring your project to life.
            </motion.p>
          </div>
          
          <motion.div 
            className="mb-4 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-1">Looking for...</label>
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
                placeholder="Search by category (e.g., Sauce, Packaging, Beverage, etc.)..."
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
                    <div className="mr-3 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0 bg-background">
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${(() => {
                            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#74b9ff'];
                            const colorIndex = p.name.length % colors.length;
                            return colors[colorIndex] + '20, ' + colors[colorIndex] + '50';
                          })()})`
                        }}
                      >
                        <span className="text-base select-none">
                          {getCategoryIcon(p.name)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        {p.type === 'PRODUCT' || p.type === 'FOODTYPE' || p.type === 'CATEGORY' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                            Category
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary/30 text-secondary-foreground font-medium">
                            Category
                          </span>
                        )}
                      </div>
                    </div>
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
            {selectedProduct ? "Next" : "Select a category to continue"}
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-muted/40">
        <motion.div 
          className="w-[480px] h-[600px] bg-background rounded-2xl shadow-xl flex flex-col border border-border relative overflow-hidden"
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
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
            y: -8
          }}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="absolute inset-0 bg-primary/5 rounded-2xl"
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
                className="flex flex-col items-center relative z-10 p-8 h-full justify-center"
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
                {/* Large Product/Category Image */}
                <motion.div 
                  className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden border-2 border-primary/10 shadow-2xl"
                  whileHover={{ 
                    rotate: [0, 2, -2, 0],
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(var(--primary-rgb), 0.4)"
                  }}
                  transition={{ duration: 1 }}
                >
                  <motion.div
                    className="w-full h-full rounded-3xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${(() => {
                        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#74b9ff'];
                        const colorIndex = selectedProduct.name.length % colors.length;
                        return colors[colorIndex] + '30, ' + colors[colorIndex] + '60';
                      })()})`
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-6xl select-none">
                      {getCategoryIcon(selectedProduct.name)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-primary/10"
                    animate={{
                      boxShadow: [
                        "0 0 0 0px rgba(var(--primary-rgb), 0.3)",
                        "0 0 0 20px rgba(var(--primary-rgb), 0)"
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>
                
                {/* Product/Category Name */}
                <motion.h3 
                  className="text-2xl font-bold text-center mb-3 px-4 leading-tight"
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
                  style={{ 
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }}
                >
                  {selectedProduct.name}
                </motion.h3>
                
                {/* Type Badge */}
                <motion.div 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm mb-6 font-medium"
                  style={{
                    backgroundColor: 'rgba(var(--secondary-rgb), 0.15)',
                    color: 'rgb(var(--foreground-rgb))',
                    border: '1px solid rgba(var(--secondary-rgb), 0.3)'
                  }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="mr-2">
                    {getCategoryIcon(selectedProduct.name)}
                  </span>
                  Category
                </motion.div>
                
                {/* Looking For Info */}
                <motion.div 
                  className="text-sm text-muted-foreground text-center px-6 py-3 rounded-full bg-primary/5 border border-primary/20 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                >
                  🔍 Looking for: <span className="font-medium">{selectedSupplierType.name}</span>
                </motion.div>
                
                {/* Manufacturer Matches */}
                {manufacturers.length > 0 && (
                  <motion.div 
                    className="text-sm text-primary px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-4"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    🏭 <span className="font-semibold">{manufacturers.length}</span> potential matches found
                  </motion.div>
                )}
                
                {/* Date */}
                <motion.div 
                  className="text-xs text-primary px-3 py-1.5 rounded-full border border-primary/20 bg-background/50"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  📅 {new Date().toLocaleDateString()}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="text-muted-foreground text-center flex flex-col items-center relative z-10 p-8 h-full justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="80" 
                  height="80" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mb-6 text-muted-foreground/50"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.02, 1, 1.02, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </motion.svg>
                <div className="text-xl font-semibold mb-3">Select a Category</div>
                <div className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Choose a category to find matching partners (manufacturers, suppliers, packaging services, etc.) for your project.
                </div>
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
          --secondary-rgb: 100, 116, 139;
          --foreground-rgb: 15, 23, 42;
        }
        
        /* Dark mode overrides */
        .dark {
          --primary-rgb: 59, 130, 246;
          --border-rgb: 71, 85, 105;
          --secondary-rgb: 148, 163, 184;
          --foreground-rgb: 248, 250, 252;
        }
      `}</style>
    </div>
  );
};

export default Step1_SelectProduct;
