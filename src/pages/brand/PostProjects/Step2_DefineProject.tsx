import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductCategory, SupplierType } from "./types";
import { foodProductApi, projectApi } from "../../../lib/api";
import SupplierConnectPopup from "./SupplierConnectPopup";

interface Props {
  onNext: () => void;
  onBack: () => void;
  projectData: any;
  setProjectData: (d: any) => void;
  selectedProduct?: ProductCategory | null;
  selectedSupplierType?: SupplierType | null;
}

// Static options that don't need API
const volumeOptions = ["1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K - 1M", "1M - 5M", "5M - 10M", "10M+"];
const statusOptions = [
  { id: 1, name: "Research phase", description: "Still figuring out product details", serverStatus: "draft" },
  { id: 2, name: "Ready for production", description: "Product is defined and ready to manufacture", serverStatus: "active" },
  { id: 3, name: "Launched", description: "Product is already in the market", serverStatus: "completed" }
];
const unitOptions = ["Units", "Pieces", "Cases", "Pallets", "Containers", "Kilograms", "Pounds", "Liters", "Gallons"];

const Step2_DefineProject: React.FC<Props> = ({ 
  onNext, 
  onBack, 
  projectData, 
  setProjectData,
  selectedProduct,
  selectedSupplierType
}) => {
  // API States
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [popularCountries, setPopularCountries] = useState<string[]>([]);
  const [allergenOptions, setAllergenOptions] = useState<string[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Helper functions for category/product display (updated to match Step1)
  const getCategoryIcon = (categoryName: string): string => {
    const categoryIcons: Record<string, string> = {
      'Dressing': '🥗',
      'Instant Food': '🍜',
      'Miso': '🥣',
      'Sauce': '🫙',
      'Seasoning Mix': '🧂',
      'Soy Sauce': '🍯',
      'Teriyaki': '🍖', 'Ponzu': '🍋',
      'Marinade': '🍖', 'Seasoning': '🧂',
      'Ramen': '🍜', 'Udon': '🍜', 'Soba': '🍜', 'Noodles': '🍜',
      'Rice': '🍚', 'Sake': '🍶', 'Beer': '🍺', 'Wine': '🍷',
      'Tea': '🍵', 'Coffee': '☕', 'Juice': '🧃', 'Water': '💧',
      'Beverages': '🥤', 'Beverage': '🥤', 'Drink': '🥤',
      'Snacks': '🍿', 'Snack': '🍿',
      'Dairy': '🥛', 'Milk': '🥛',
      'Bakery': '🍞', 'Bread': '🍞',
      'Meat': '🥩', 'Seafood': '🐟', 'Fish': '🐟',
      'Vegetables': '🥬', 'Vegetable': '🥬',
      'Fruits': '🍎', 'Fruit': '🍎',
      'Condiments': '🍯', 'Spices': '🌶️', 'Spice': '🌶️',
      'Cereals': '🥣', 'Cereal': '🥣',
      'Confectionery': '🍬', 'Candy': '🍬', 'Sweet': '🍬',
      'Frozen': '🧊', 'Canned': '🥫', 'Organic': '🌱', 'Health': '💚',
      'Baby Food': '🍼', 'Pet Food': '🐕',
      'Chocolate': '🍫', 'Other': '📦'
    };
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    const matchedKey = Object.keys(categoryIcons).find(key => 
      categoryName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(categoryName.toLowerCase())
    );
    return categoryIcons[matchedKey || 'Other'];
  };
  
  const getCategoryImage = (categoryName: string): string => {
    // 8 attractive color combinations for food types
    const colors = [
      '#ff6b6b', // Coral Red
      '#4ecdc4', // Turquoise  
      '#45b7d1', // Sky Blue
      '#96ceb4', // Mint Green
      '#ffeaa7', // Warm Yellow
      '#dda0dd', // Plum
      '#ff9ff3', // Pink
      '#74b9ff'  // Blue
    ];
    const colorIndex = categoryName.length % colors.length;
    const color = colors[colorIndex];
    const encodedName = encodeURIComponent(categoryName.replace(/\s+/g, '+'));
    
    return `https://via.placeholder.com/300x300/${color.substring(1)}/ffffff?text=${encodedName}&font=Arial`;
  };

  // Refs for dropdowns
  const unitsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const packagingRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  
  // Dropdown states
  const [showUnitsDropdown, setShowUnitsDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPackagingDropdown, setShowPackagingDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // Search states for autocomplete fields
  const [packagingSearch, setPackagingSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  
  // Requirements panel states
  const [showAllergenPanel, setShowAllergenPanel] = useState(false);
  const [showCertificationPanel, setShowCertificationPanel] = useState(false);
  const [showAdditionalPanel, setShowAdditionalPanel] = useState(false);
  
  // Initialize with selected product data
  const [localData, setLocalData] = useState({
    selectedProduct: selectedProduct,
    selectedSupplierType: selectedSupplierType,
    description: projectData.description || (selectedProduct ? `I want to find manufacturers for ${selectedProduct.name} production. Looking for ${selectedSupplierType?.name || 'manufacturing partners'} with expertise in this food type.` : ""),
    volume: projectData.volume || volumeOptions[1],
    units: projectData.units || unitOptions[0],
    status: projectData.status || statusOptions[0].name,
    statusObject: projectData.statusObject || statusOptions[0],
    packaging: projectData.packaging || "",
    packagingObjects: projectData.packagingObjects || [],
    location: projectData.location || "Global",
    locationList: projectData.locationList || ["Global"],
    allergen: projectData.allergen || [],
    certification: projectData.certification || [],
    additional: projectData.additional || "",
    hideFromCurrent: projectData.hideFromCurrent || false,
    anonymous: projectData.anonymous || false,
  });

  const [showSupplierPopup, setShowSupplierPopup] = useState(false);

  // Load API data
  useEffect(() => {
    const loadApiData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls - replace with real endpoints when backend is ready
        const packagingData = [
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
        
        const countriesData = ["United States", "Canada", "Mexico", "China", "India", "United Kingdom", "Germany", "France", "Brazil", "Australia", "Japan", "Global"];
        
        // Expanded allergen options
        const allergensData = [
          "No Allergens", "Gluten Free", "Dairy Free", "Nut Free", "Soy Free", "Egg Free", "Vegan", "Vegetarian", "Kosher", "Halal", "Shellfish Free", "Fish Free", "Peanut Free", "Tree Nut Free", "Sesame Free", "Mustard Free", "Celery Free", "Lupin Free", "Mollusk Free", "Sulfite Free", "Corn Free", "Wheat Free", "Sugar Free", "Low Sodium", "Low Fat", "Low Carb"
        ];
        
        // Expanded certification options
        const certificationsData = [
          "ISO 9001", "ISO 22000", "FSSC 22000", "BRC", "SQF", "IFS", "HACCP", "Organic", "Non-GMO", "Fair Trade", "USDA Organic", "EU Organic", "JAS Organic", "Halal", "Kosher", "Gluten-Free Certified", "Vegan Certified", "Vegetarian Certified", "GMP", "FDA Registered", "BPA Free", "Rainforest Alliance", "RSPO", "MSC", "ASC", "ISO 14001", "ISO 45001", "Sedex", "SMETA", "AIB International", "Canada Organic", "Bio Suisse", "Demeter", "Naturland", "SQF Level 2", "SQF Level 3"
        ];
        
        // TODO: Replace with real API calls when backend endpoints are ready
        // const packagingRes = await projectApi.getPackagingOptions();
        // const countriesRes = await projectApi.getCountries();  
        // const allergensRes = await projectApi.getAllergens();
        // const certificationsRes = await projectApi.getCertifications();
        
        setPackagingOptions(packagingData);
        setPopularCountries(countriesData);
        setAllergenOptions(allergensData);
        setCertificationOptions(certificationsData);
        
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiData();
  }, []);

  // Filter packaging options based on search
  const filteredPackaging = packagingSearch.trim() === "" 
    ? packagingOptions 
    : packagingOptions.filter(p => 
        p.name.toLowerCase().includes(packagingSearch.toLowerCase()) || 
        p.material.toLowerCase().includes(packagingSearch.toLowerCase())
      );
  
  // Filter locations based on search
  const filteredLocations = locationSearch.trim() === ""
    ? popularCountries
    : popularCountries.filter(c => 
        c.toLowerCase().includes(locationSearch.toLowerCase())
      );

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (unitsRef.current && !unitsRef.current.contains(event.target as Node)) {
        setShowUnitsDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (packagingRef.current && !packagingRef.current.contains(event.target as Node)) {
        setShowPackagingDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (field: string, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusSelect = (status: typeof statusOptions[0]) => {
    setLocalData(prev => ({ ...prev, status: status.name, statusObject: status }));
    setShowStatusDropdown(false);
  };

  const handleUnitSelect = (unit: string) => {
    setLocalData(prev => ({ ...prev, units: unit }));
    setShowUnitsDropdown(false);
  };

  const handlePackagingSelect = (packaging: typeof packagingOptions[0]) => {
    // Add to packaging list if not already there
    if (!localData.packagingObjects.some(p => p.id === packaging.id)) {
      const newPackagingObjects = [...localData.packagingObjects, packaging];
      setLocalData(prev => ({ 
        ...prev, 
        packagingObjects: newPackagingObjects,
        packaging: newPackagingObjects.map(p => p.name).join(", ")
      }));
    }
    setPackagingSearch("");
    setShowPackagingDropdown(false);
  };

  const removePackaging = (id: number) => {
    const newPackagingObjects = localData.packagingObjects.filter(p => p.id !== id);
    setLocalData(prev => ({
      ...prev,
      packagingObjects: newPackagingObjects,
      packaging: newPackagingObjects.map(p => p.name).join(", ")
    }));
  };

  const handleLocationSelect = (location: string) => {
    if (!localData.locationList.includes(location)) {
      const newLocationList = [...localData.locationList, location];
      setLocalData(prev => ({
        ...prev,
        locationList: newLocationList,
        location: newLocationList.join(", ")
      }));
    }
    setLocationSearch("");
    setShowLocationDropdown(false);
  };

  const removeLocation = (location: string) => {
    const newLocationList = localData.locationList.filter(l => l !== location);
    setLocalData(prev => ({
      ...prev,
      locationList: newLocationList,
      location: newLocationList.join(", ")
    }));
  };

  const toggleAllergen = (allergen: string) => {
    if (localData.allergen.includes(allergen)) {
      setLocalData(prev => ({
        ...prev,
        allergen: prev.allergen.filter((a: string) => a !== allergen)
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        allergen: [...prev.allergen, allergen]
      }));
    }
  };

  const toggleCertification = (certification: string) => {
    if (localData.certification.includes(certification)) {
      setLocalData(prev => ({
        ...prev,
        certification: prev.certification.filter((c: string) => c !== certification)
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        certification: [...prev.certification, certification]
      }));
    }
  };

  const handleNext = () => {
    setProjectData(localData);
    setShowSupplierPopup(true);
  };

  // After popup is complete, create project and continue to next step
  const handleSupplierPopupComplete = async () => {
    try {
      // Check if user is authenticated first
      try {
        const userResponse = await fetch('/api/users/me', {
          credentials: 'include'
        });
        if (!userResponse.ok) {
          throw new Error('User not authenticated');
        }
        console.log('User is authenticated');
      } catch (authError) {
        console.error('Authentication check failed:', authError);
        alert('You need to login to create a project. Please login and try again.');
        return;
      }

      // Validate required fields
      if (!localData.description.trim()) {
        alert('Please provide a project description');
        return;
      }

      // Get server status from selected status
      const serverStatus = localData.statusObject?.serverStatus || 'draft';

      // Prepare project data for API
      const projectData = {
        name: selectedProduct?.name || localData.description.split(' ').slice(0, 5).join(' '),
        description: localData.description,
        selectedProduct: selectedProduct ? {
          id: selectedProduct.id.toString(),
          name: selectedProduct.name,
          type: selectedProduct.type,
          image: selectedProduct.image
        } : undefined,
        selectedSupplierType: selectedSupplierType,
        volume: localData.volume,
        units: localData.units,
        packaging: localData.packagingObjects.map(p => p.name),
        packagingObjects: localData.packagingObjects,
        location: localData.locationList,
        allergen: localData.allergen,
        certification: localData.certification,
        additional: localData.additional,
        anonymous: localData.anonymous,
        hideFromCurrent: localData.hideFromCurrent,
        status: serverStatus // Send server status to API
      };

      console.log('Creating project with data:', projectData);

      // Create project via API
      const response = await projectApi.createProject(projectData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Project created successfully:', response.data);
        // Update local project data with created project info
        setProjectData({
          ...localData,
          projectId: response.data.project._id,
          matchingCount: response.data.matchingCount
        });
        onNext();
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
      
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      // Better error handling based on error type
      if (error.message?.includes('Not authorized') || error.message?.includes('401')) {
        alert('You need to login to create a project. Please login and try again.');
      } else if (error.message?.includes('validation') || error.message?.includes('400')) {
        alert('Please check your project details and try again.');
      } else {
        alert(`Failed to create project: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  return (
    <div className="flex flex-row w-full min-h-screen">
      <div className="flex-1 flex flex-col justify-center p-12">
        <motion.div 
          className="w-full bg-background rounded-none shadow-none p-0 border-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            Post Project
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Connect with verified partners (Manufacturers, Suppliers, Packaging Services, etc.) to bring your project to life.
          </motion.p>
          
          {/* Selected Product/Category Summary */}
          {selectedProduct && (
            <motion.div 
              className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  <span className="text-xl">{getCategoryIcon(selectedProduct.name)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Looking for {selectedSupplierType?.name || 'Partners'}
                  </p>
                </div>
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Category
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Project Description */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-1">Project Details & Manufacturing Requirements*</label>
            <motion.textarea
              className="w-full border rounded px-3 py-2 bg-muted focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              rows={3}
              placeholder={selectedProduct 
                ? `Describe your ${selectedProduct.name} manufacturing requirements - production capacity, quality standards, certifications needed, timeline, packaging specifications, and any other important details...`
                : "Describe your food manufacturing requirements - food type specifications, production capacity, quality standards, certifications needed, timeline, packaging requirements, etc."
              }
              value={localData.description}
              onChange={e => handleChange("description", e.target.value)}
              whileFocus={{ 
                boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                borderColor: "rgba(var(--primary-rgb), 0.5)"
              }}
            />
          </motion.div>
          
          {/* Volume and Units */}
          <motion.div 
            className="flex gap-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Estimated annual volume*</label>
              <motion.select
                className="w-full border rounded px-3 py-2 bg-muted focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                value={localData.volume}
                onChange={e => handleChange("volume", e.target.value)}
                whileFocus={{ 
                  boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
                whileTap={{ scale: 0.99 }}
              >
                {volumeOptions.map(opt => <option key={opt}>{opt}</option>)}
              </motion.select>
            </div>
            
            {/* Units Dropdown */}
            <div className="w-32 relative" ref={unitsRef}>
              <label className="block text-sm font-medium mb-1">Units</label>
              <motion.div 
                className="w-full border rounded px-3 py-2 bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setShowUnitsDropdown(!showUnitsDropdown)}
                whileHover={{ 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
                whileTap={{ scale: 0.99 }}
              >
                <span>{localData.units}</span>
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
                  animate={{ rotate: showUnitsDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "anticipate" }}
                >
                  <path d="m6 9 6 6 6-6"/>
                </motion.svg>
              </motion.div>
              
              <AnimatePresence>
                {showUnitsDropdown && (
                  <motion.div 
                    className="absolute w-full mt-1 border rounded shadow-lg bg-background z-10 max-h-40 overflow-y-auto hide-scrollbar"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {unitOptions.map((unit, index) => (
                      <motion.div
                        key={unit}
                        className={`px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                          localData.units === unit ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleUnitSelect(unit)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ x: 4, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                      >
                        {unit}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Product Status */}
          <motion.div 
            className="mb-4 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            ref={statusRef}
          >
            <label className="block text-sm font-medium mb-1">Product status*</label>
            <motion.div 
              className="w-full border rounded px-3 py-2 bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              whileHover={{ 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderColor: "rgba(var(--primary-rgb), 0.5)"
              }}
              whileTap={{ scale: 0.99 }}
            >
              <span>{localData.status}</span>
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
                animate={{ rotate: showStatusDropdown ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
              >
                <path d="m6 9 6 6 6-6"/>
              </motion.svg>
            </motion.div>
            
            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div 
                  className="absolute w-full mt-1 border rounded shadow-lg bg-background z-10"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {statusOptions.map((status, index) => (
                    <motion.div
                      key={status.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                        localData.status === status.name ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleStatusSelect(status)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                    >
                      <div className="font-medium">{status.name}</div>
                      <div className="text-xs text-muted-foreground">{status.description}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Packaging Format */}
          <motion.div 
            className="mb-4 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            ref={packagingRef}
          >
            <label className="block text-sm font-medium mb-1">Packaging Format*</label>
            <motion.div className="relative">
              <motion.input
                className="w-full border rounded px-3 py-2 bg-muted focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                placeholder="Search by packaging format or material"
                value={packagingSearch}
                onChange={e => setPackagingSearch(e.target.value)}
                onFocus={() => setShowPackagingDropdown(true)}
                whileFocus={{ 
                  boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
              />
              {packagingSearch && (
                <motion.button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setPackagingSearch("")}
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
            </motion.div>
            
            {/* Selected packaging items */}
            {localData.packagingObjects.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2 mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {localData.packagingObjects.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    className="bg-primary/10 rounded-full px-3 py-1 text-xs flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>{pkg.name} ({pkg.material})</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => removePackaging(pkg.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <AnimatePresence>
              {showPackagingDropdown && filteredPackaging.length > 0 && (
                <motion.div 
                  className="absolute w-full mt-1 border rounded shadow-lg bg-background z-10 max-h-40 overflow-y-auto hide-scrollbar"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {filteredPackaging.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      className="px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handlePackagingSelect(pkg)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                    >
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-xs text-muted-foreground">Material: {pkg.material}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Supplier Location */}
          <motion.div 
            className="mb-4 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            ref={locationRef}
          >
            <label className="block text-sm font-medium mb-1">Supplier Location (Optional)</label>
            <motion.div className="relative">
              <motion.input
                className="w-full border rounded px-3 py-2 bg-muted focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                placeholder="Select countries"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                onFocus={() => setShowLocationDropdown(true)}
                whileFocus={{ 
                  boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                  borderColor: "rgba(var(--primary-rgb), 0.5)"
                }}
              />
              {locationSearch && (
                <motion.button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setLocationSearch("")}
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
            </motion.div>
            
            {/* Selected locations */}
            {localData.locationList.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2 mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {localData.locationList.map((location, index) => (
                  <motion.div
                    key={location}
                    className="bg-primary/10 rounded-full px-3 py-1 text-xs flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>{location}</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => removeLocation(location)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <AnimatePresence>
              {showLocationDropdown && filteredLocations.length > 0 && (
                <motion.div 
                  className="absolute w-full mt-1 border rounded shadow-lg bg-background z-10 max-h-40 overflow-y-auto hide-scrollbar"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {filteredLocations.map((location, index) => (
                    <motion.div
                      key={location}
                      className={`px-3 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                        localData.locationList.includes(location) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleLocationSelect(location)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                    >
                      {location}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Requirements Buttons */}
          <motion.div 
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <motion.button
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                showAllergenPanel || localData.allergen.length > 0 
                  ? "bg-primary/20 text-primary border-primary border" 
                  : "bg-muted border border-muted-foreground/20"
              }`}
              type="button"
              onClick={() => setShowAllergenPanel(!showAllergenPanel)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showAllergenPanel || localData.allergen.length > 0 ? <path d="M5 12h14"></path> : <><path d="M12 5v14"></path><path d="M5 12h14"></path></>}
                </svg>
                Allergen Requirements {localData.allergen.length > 0 && `(${localData.allergen.length})`}
              </span>
            </motion.button>
            
            <motion.button
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                showCertificationPanel || localData.certification.length > 0 
                  ? "bg-primary/20 text-primary border-primary border" 
                  : "bg-muted border border-muted-foreground/20"
              }`}
              type="button"
              onClick={() => setShowCertificationPanel(!showCertificationPanel)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showCertificationPanel || localData.certification.length > 0 ? <path d="M5 12h14"></path> : <><path d="M12 5v14"></path><path d="M5 12h14"></path></>}
                </svg>
                Certification Requirements {localData.certification.length > 0 && `(${localData.certification.length})`}
              </span>
            </motion.button>
            
            <motion.button
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                showAdditionalPanel || localData.additional 
                  ? "bg-primary/20 text-primary border-primary border" 
                  : "bg-muted border border-muted-foreground/20"
              }`}
              type="button"
              onClick={() => setShowAdditionalPanel(!showAdditionalPanel)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showAdditionalPanel || localData.additional ? <path d="M5 12h14"></path> : <><path d="M12 5v14"></path><path d="M5 12h14"></path></>}
                </svg>
                Additional requirement
              </span>
            </motion.button>
          </motion.div>
          
          {/* Allergen Requirements Panel */}
          <AnimatePresence>
            {showAllergenPanel && (
              <motion.div 
                className="mb-4 p-4 border rounded-md bg-muted/30"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium mb-2 text-sm">Allergen Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map((allergen, index) => (
                    <motion.button
                      key={allergen}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        localData.allergen.includes(allergen)
                          ? "bg-primary/20 text-primary border-primary"
                          : "bg-muted border-muted-foreground/20"
                      }`}
                      onClick={() => toggleAllergen(allergen)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {allergen}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Certification Requirements Panel */}
          <AnimatePresence>
            {showCertificationPanel && (
              <motion.div 
                className="mb-4 p-4 border rounded-md bg-muted/30"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium mb-2 text-sm">Certification Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {certificationOptions.map((certification, index) => (
                    <motion.button
                      key={certification}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        localData.certification.includes(certification)
                          ? "bg-primary/20 text-primary border-primary"
                          : "bg-muted border-muted-foreground/20"
                      }`}
                      onClick={() => toggleCertification(certification)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {certification}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Additional Requirements Panel */}
          <AnimatePresence>
            {showAdditionalPanel && (
              <motion.div 
                className="mb-4 p-4 border rounded-md bg-muted/30"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium mb-2 text-sm">Additional Requirements</h3>
                <motion.textarea
                  className="w-full border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                  rows={3}
                  placeholder="Enter any additional requirements..."
                  value={localData.additional}
                  onChange={e => handleChange("additional", e.target.value)}
                  whileFocus={{ 
                    boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
                    borderColor: "rgba(var(--primary-rgb), 0.5)"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Project Visibility Options */}
          <motion.div 
            className="flex flex-col space-y-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="flex items-center justify-between">
              <label className="text-sm">Hide project from current manufacturers</label>
              <motion.div 
                className={`w-11 h-6 rounded-full p-1 cursor-pointer flex items-center ${
                  localData.hideFromCurrent ? 'bg-primary justify-end' : 'bg-gray-300 justify-start dark:bg-slate-700'
                }`}
                onClick={() => handleChange("hideFromCurrent", !localData.hideFromCurrent)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full" 
                  layout
                  transition={{ 
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                  }}
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Post project anonymously</label>
              <motion.div 
                className={`w-11 h-6 rounded-full p-1 cursor-pointer flex items-center ${
                  localData.anonymous ? 'bg-primary justify-end' : 'bg-gray-300 justify-start dark:bg-slate-700'
                }`}
                onClick={() => handleChange("anonymous", !localData.anonymous)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full" 
                  layout
                  transition={{ 
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Buttons */}
          <motion.div 
            className="flex gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.button
              className="flex-1 bg-muted text-foreground font-bold py-2 px-4 rounded transition-all border border-border"
              onClick={onBack}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--muted-rgb), 0.8)" }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold py-2 px-4 rounded transition-all relative overflow-hidden"
              onClick={handleNext}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(var(--primary-rgb), 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span 
                className="absolute inset-0 bg-white opacity-0"
                whileHover={{ 
                  opacity: 0.2,
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)",
                    "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)"
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Post Project
            </motion.button>
          </motion.div>
        </motion.div>
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
          
          {loading ? (
          <motion.div 
              className="flex flex-col items-center justify-center relative z-10 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
          >
            <motion.div 
                className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-muted-foreground">Loading project data...</p>
            </motion.div>
          ) : selectedProduct ? (
            <motion.div 
              className="flex flex-col items-center relative z-10 p-8 h-full justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Large Food Type Image */}
              <motion.div 
                className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden border-2 border-primary/10 shadow-2xl"
              whileHover={{ 
                  rotate: [0, 2, -2, 0],
                scale: 1.05,
                  boxShadow: "0 25px 50px rgba(var(--primary-rgb), 0.4)"
              }}
              transition={{ duration: 1 }}
            >
                {selectedProduct.type === 'PRODUCT' && selectedProduct.image ? (
                  <>
                    <motion.img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover rounded-3xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      onError={(e) => {
                        // Hide image and show fallback icon instead
                        e.currentTarget.style.display = 'none';
                        const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                      }}
                    />
                    <motion.div
                      className="w-full h-full rounded-3xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${(() => {
                          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#74b9ff'];
                          const colorIndex = selectedProduct.name.length % colors.length;
                          return colors[colorIndex] + '30, ' + colors[colorIndex] + '60';
                        })()})`,
                        display: 'none' // Hidden by default, shown if image fails
                      }}
                    >
                      <span className="text-6xl select-none">
                        {getCategoryIcon(selectedProduct.name)}
                      </span>
                    </motion.div>
                  </>
                ) : (
                  // For CATEGORY, FOODTYPE, or PRODUCT without image - show icon with gradient
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
                )}
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
              
              {/* Supplier Type Info */}
              <motion.div 
                className="text-sm text-muted-foreground text-center px-6 py-3 rounded-full bg-primary/5 border border-primary/20 mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
              >
                🔍 Looking for: <span className="font-medium">{selectedSupplierType?.name || 'Manufacturer'}</span>
          </motion.div>
              
              {/* Project Status */}
              {localData.status && (
                <motion.div 
                  className="text-sm text-primary px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                >
                  📋 Status: <span className="font-semibold">{localData.status}</span>
                </motion.div>
              )}
              
              {/* Volume Info */}
              {localData.volume && (
                <motion.div 
                  className="text-xs text-primary px-3 py-1.5 rounded-full border border-primary/20 bg-background/50"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  📦 Volume: {localData.volume} {localData.units}
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Empty state when no product selected
            <motion.div 
              className="text-muted-foreground text-center flex flex-col items-center relative z-10 p-8 h-full justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
        </motion.div>
      </div>
      
      {/* Supplier Connect Popup */}
      <SupplierConnectPopup 
        isOpen={showSupplierPopup} 
        onClose={() => setShowSupplierPopup(false)} 
        onComplete={handleSupplierPopupComplete}
      />
      
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

export default Step2_DefineProject;
