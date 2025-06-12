import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  ChevronDown, 
  Package, 
  Coffee, 
  Leaf, 
  Info, 
  User, 
  Calendar,
  BarChart3,
  MapPin,
  Droplet,
  Clock,
  ChevronRight,
  Edit,
  X,
  MoreVertical,
  Pause,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Search
} from "lucide-react";

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

const Step4_ProjectDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // State management
  const [activeTab, setActiveTab] = useState<"manufacturers" | "details">("manufacturers");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Add state for edit popup
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [editedProject, setEditedProject] = useState<any>(null);
  
  // Add new state variables for service edit popups
  const [packagingEditPopupVisible, setPackagingEditPopupVisible] = useState(false);
  const [ingredientsEditPopupVisible, setIngredientsEditPopupVisible] = useState(false);
  const [consultantsEditPopupVisible, setConsultantsEditPopupVisible] = useState(false);
  const [editedServiceData, setEditedServiceData] = useState<any>(null);
  
  // Add state for options dropdown
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Add state for contact manufacturer popup
  const [contactManufacturerVisible, setContactManufacturerVisible] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [contactFormData, setContactFormData] = useState({
    subject: '',
    message: '',
    contactMethod: 'email' as 'email' | 'phone' | 'message',
    attachFiles: false,
    // Email-specific fields
    ccEmail: '',
    bccEmail: '',
    // Phone-specific fields
    phoneNumber: '',
    callTime: '',
    callDate: '',
    // Message-specific fields
    urgent: false,
    responseExpected: true
  });
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);
  
  // Add states for pause and cancel confirmation popups
  const [pausePopupVisible, setPausePopupVisible] = useState(false);
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);
  const [pauseInProgress, setPauseInProgress] = useState(false);
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [pauseSuccess, setPauseSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Add state for project status
  const [projectStatus, setProjectStatus] = useState<"active" | "paused" | "cancelled">("active");
  
  // Add refs for dropdowns
  const productSearchRef = useRef<HTMLDivElement>(null);
  const packagingSearchRef = useRef<HTMLDivElement>(null);
  const ingredientsSearchRef = useRef<HTMLDivElement>(null);
  const consultantsSearchRef = useRef<HTMLDivElement>(null);

  // Add state for product search in edit form
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  
  // Add state for packaging search
  const [packagingSearchQuery, setPackagingSearchQuery] = useState("");
  const [showPackagingSuggestions, setShowPackagingSuggestions] = useState(false);
  
  // Add state for ingredients search
  const [ingredientsSearchQuery, setIngredientsSearchQuery] = useState("");
  const [showIngredientsSuggestions, setShowIngredientsSuggestions] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  // Add state for consultants search
  const [consultantsSearchQuery, setConsultantsSearchQuery] = useState("");
  const [showConsultantsSuggestions, setShowConsultantsSuggestions] = useState(false);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);

  // Filter product suggestions based on search query
  const filteredProducts = productSearchQuery.trim() === ""
    ? productSuggestions
    : productSuggestions.filter(product => 
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
      );
      
  // Filter packaging suggestions
  const filteredPackaging = packagingSearchQuery.trim() === ""
    ? packagingSuggestions
    : packagingSuggestions.filter(pkg => 
        pkg.name.toLowerCase().includes(packagingSearchQuery.toLowerCase()) ||
        pkg.material.toLowerCase().includes(packagingSearchQuery.toLowerCase())
      );
      
  // Filter ingredients suggestions
  const filteredIngredients = ingredientsSearchQuery.trim() === ""
    ? ingredientSuggestions
    : ingredientSuggestions.filter(ingredient => 
        ingredient.name.toLowerCase().includes(ingredientsSearchQuery.toLowerCase()) ||
        ingredient.category.toLowerCase().includes(ingredientsSearchQuery.toLowerCase())
      );
      
  // Filter consultants suggestions
  const filteredConsultants = consultantsSearchQuery.trim() === ""
    ? consultantSuggestions
    : consultantSuggestions.filter(consultant => 
        consultant.name.toLowerCase().includes(consultantsSearchQuery.toLowerCase()) ||
        consultant.specialty.toLowerCase().includes(consultantsSearchQuery.toLowerCase())
      );

  // Add click outside handlers for all dropdowns
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
      if (packagingSearchRef.current && !packagingSearchRef.current.contains(event.target as Node)) {
        setShowPackagingSuggestions(false);
      }
      if (ingredientsSearchRef.current && !ingredientsSearchRef.current.contains(event.target as Node)) {
        setShowIngredientsSuggestions(false);
      }
      if (consultantsSearchRef.current && !consultantsSearchRef.current.contains(event.target as Node)) {
        setShowConsultantsSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle selections from suggestions
  const handleProductSelect = (productName: string) => {
    if (editedProject) {
      setEditedProject({...editedProject, name: productName});
    }
    setProductSearchQuery(productName);
    setShowProductSuggestions(false);
  };
  
  const handlePackagingSelect = (packagingName: string) => {
    if (editedServiceData) {
      setEditedServiceData({...editedServiceData, serviceName: packagingName});
    }
    setPackagingSearchQuery(packagingName);
    setShowPackagingSuggestions(false);
  };
  
  const handleIngredientSelect = (ingredientName: string) => {
    if (!selectedIngredients.includes(ingredientName)) {
      const newSelectedIngredients = [...selectedIngredients, ingredientName];
      setSelectedIngredients(newSelectedIngredients);
      
      if (editedServiceData) {
        setEditedServiceData({
          ...editedServiceData, 
          serviceName: newSelectedIngredients.join(", ")
        });
      }
    }
    setIngredientsSearchQuery("");
  };
  
  const handleConsultantSelect = (consultantName: string) => {
    if (!selectedConsultants.includes(consultantName)) {
      const newSelectedConsultants = [...selectedConsultants, consultantName];
      setSelectedConsultants(newSelectedConsultants);
      
      if (editedServiceData) {
        setEditedServiceData({
          ...editedServiceData, 
          serviceName: newSelectedConsultants.join(", ")
        });
      }
    }
    setConsultantsSearchQuery("");
  };
  
  const removeIngredient = (ingredient: string) => {
    const newSelectedIngredients = selectedIngredients.filter(i => i !== ingredient);
    setSelectedIngredients(newSelectedIngredients);
    
    if (editedServiceData) {
      setEditedServiceData({
        ...editedServiceData, 
        serviceName: newSelectedIngredients.join(", ")
      });
    }
  };
  
  const removeConsultant = (consultant: string) => {
    const newSelectedConsultants = selectedConsultants.filter(c => c !== consultant);
    setSelectedConsultants(newSelectedConsultants);
    
    if (editedServiceData) {
      setEditedServiceData({
        ...editedServiceData, 
        serviceName: newSelectedConsultants.join(", ")
      });
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };
  
  // Handle edit button click
  const handleEditProject = () => {
    setEditedProject({...projectDetails});
    setProductSearchQuery(projectDetails.name); // Initialize search with current name
    setEditPopupVisible(true);
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, you would update the project data here
    console.log("Saving changes:", editedProject);
    setEditPopupVisible(false);
  };
  
  // Add handler functions for edit buttons
  const handleEditPackaging = () => {
    setEditedServiceData({
      ...projectDetails,
      serviceType: "Packaging",
      serviceName: projectDetails.packaging
    });
    setPackagingSearchQuery(projectDetails.packaging);
    setPackagingEditPopupVisible(true);
  };

  const handleEditIngredients = () => {
    setEditedServiceData({
      ...projectDetails,
      serviceType: "Ingredients",
      serviceName: projectDetails.ingredients.join(", ")
    });
    setSelectedIngredients([...projectDetails.ingredients]);
    setIngredientsSearchQuery("");
    setIngredientsEditPopupVisible(true);
  };

  const handleEditConsultants = () => {
    setEditedServiceData({
      ...projectDetails,
      serviceType: "Consultants",
      serviceName: projectDetails.consultants.join(", ")
    });
    setSelectedConsultants([...projectDetails.consultants]);
    setConsultantsSearchQuery("");
    setConsultantsEditPopupVisible(true);
  };

  // Add handler for contact manufacturer button
  const handleContactManufacturer = (manufacturer: any) => {
    setSelectedManufacturer(manufacturer);
    setContactManufacturerVisible(true);
    // Reset form state
    setContactFormData({
      subject: `RE: Chocolate Bar Project`,
      message: '',
      contactMethod: 'email',
      attachFiles: false,
      // Email-specific fields
      ccEmail: '',
      bccEmail: '',
      // Phone-specific fields
      phoneNumber: '',
      callTime: '',
      callDate: '',
      // Message-specific fields
      urgent: false,
      responseExpected: true
    });
    setContactFormSuccess(false);
  };

  // Handle contact form changes
  const handleContactFormChange = (field: string, value: any) => {
    setContactFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle contact form submit
  const handleContactFormSubmit = () => {
    setContactFormSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Contact form submitted:", contactFormData);
      setContactFormSubmitting(false);
      setContactFormSuccess(true);
    }, 1500);
  };

  // Handle contact form close
  const handleCloseContactForm = () => {
    // If form was successful, just close it
    if (contactFormSuccess) {
      setContactManufacturerVisible(false);
      return;
    }
    
    // Otherwise confirm before closing
    if (contactFormData.message && !confirm("Are you sure you want to close this form? Your message will be lost.")) {
      return;
    }
    setContactManufacturerVisible(false);
  };

  // Add handler function for saving service edits
  const handleSaveServiceChanges = () => {
    console.log("Saving service changes:", editedServiceData);
    // In a real app, you would update the service data here
    
    // Close all service edit popups
    setPackagingEditPopupVisible(false);
    setIngredientsEditPopupVisible(false);
    setConsultantsEditPopupVisible(false);
  };
  
  // Add handlers for pause and cancel project with confirmation
  const handlePauseProject = () => {
    setPausePopupVisible(true);
    setShowOptionsDropdown(false);
  };

  const handleCancelProject = () => {
    setCancelPopupVisible(true);
    setShowOptionsDropdown(false);
  };

  // Add handlers for confirming pause and cancel actions
  const handleConfirmPause = () => {
    setPauseInProgress(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      console.log("Pausing project confirmed");
      setPauseInProgress(false);
      setPauseSuccess(true);
      
      // After showing success message, close popup and update status
      setTimeout(() => {
        setPausePopupVisible(false);
        setPauseSuccess(false);
        setProjectStatus("paused");
      }, 1500);
    }, 1000);
  };

  const handleConfirmCancel = () => {
    setCancelInProgress(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      console.log("Canceling project confirmed");
      setCancelInProgress(false);
      setCancelSuccess(true);
      
      // After showing success message, close popup and update status
      setTimeout(() => {
        setCancelPopupVisible(false);
        setCancelSuccess(false);
        setProjectStatus("cancelled");
      }, 1500);
    }, 1000);
  };
  
  // Add handler to resume a paused project
  const handleResumeProject = () => {
    // Simulate API call
    console.log("Resuming project");
    setProjectStatus("active");
  };
  
  // Sample manufacturer data
  const manufacturers = [
    {
      id: "manu1",
      name: "Premier Foods Inc.",
      match: 98,
      location: "California, USA",
      expertise: ["Chocolate", "Confectionery", "Organic"],
      capacity: "50K - 250K units/month",
      experience: "15+ years",
      imageUrl: "https://images.unsplash.com/photo-1523294587484-bae6cc870010"
    },
    {
      id: "manu2",
      name: "Global Sweets Manufacturing",
      match: 92,
      location: "Ontario, Canada",
      expertise: ["Chocolate", "Sugar-free", "Vegan"],
      capacity: "100K - 500K units/month",
      experience: "8+ years",
      imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
    },
    {
      id: "manu3",
      name: "EcoTreats Ltd.",
      match: 87,
      location: "Brussels, Belgium",
      expertise: ["Organic", "Sustainable", "Fair Trade"],
      capacity: "25K - 100K units/month",
      experience: "12+ years",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
    }
  ];
  
  // Project details
  const projectDetails = {
    name: "Chocolate Bar",
    status: "In review",
    date: "Jun 05, 2025",
    description: "Organic dark chocolate bar with sea salt and almond pieces. Ethically sourced cocoa with minimal processing.",
    units: "10K - 50K units",
    packaging: "Plastic Bag",
    ingredients: ["Cocoa Mass", "Sugar", "Cocoa Butter", "Sea Salt", "Almonds"],
    consultants: ["Formulation", "Packaging Design", "Regulatory Compliance"]
  };
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    })
  };
  
  const hoverVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, 
      boxShadow: isDarkMode 
        ? "0 10px 30px rgba(0, 0, 0, 0.3)" 
        : "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };
  
  const expansionVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        height: { duration: 0.3 },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    }
  };
  
  const rotateVariants = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 180, transition: { duration: 0.3 } }
  };
  
  const tabVariants = {
    inactive: { opacity: 0.7, y: 0 },
    active: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  const tagVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: (i: number) => ({ 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: i * 0.05,
        duration: 0.2
      }
    })
  };
  
  // Animation variants for popup
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
  
  // Add Suggestions dropdown animation variants
  const suggestionsVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' },
    exit: { opacity: 0, y: -10, height: 0 }
  };
  
  // Render manufacturer cards
  const renderManufacturers = () => (
    <div className="space-y-6 w-full">
      <motion.div 
        className={`rounded-lg overflow-hidden ${
          isDarkMode ? "bg-slate-800" : "bg-gray-50"
        } p-6 mb-6`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
          }`}>
            <Info size={18} />
          </div>
          <div className="ml-3">
            <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Manufacturer Matching
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              We've identified 3 manufacturers that match your project requirements
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {manufacturers.map((manufacturer, index) => (
            <motion.div
              key={manufacturer.id}
              custom={index}
              variants={{
                ...cardVariants,
                ...hoverVariants
              }}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`rounded-lg overflow-hidden border ${
                isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
              } p-0`}
              style={{ perspective: "1000px" }}
            >
              <div className="flex flex-col md:flex-row">
                <div 
                  className="w-full md:w-1/4 h-48 md:h-auto bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${manufacturer.imageUrl})`,
                    minHeight: "120px"
                  }}
                ></div>
                
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-bold text-lg ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {manufacturer.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <MapPin size={14} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                        <span className={`text-sm ml-1 ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}>
                          {manufacturer.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-center rounded-full w-12 h-12 ${
                      manufacturer.match > 95
                        ? isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                        : manufacturer.match > 85
                          ? isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                          : isDarkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      <span className="font-bold text-sm">{manufacturer.match}%</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {manufacturer.expertise.map((skill, i) => (
                        <motion.span
                          key={skill}
                          custom={i}
                          variants={tagVariants}
                          initial="initial"
                          animate="animate"
                          className={`px-2 py-1 rounded-full text-xs ${
                            isDarkMode
                              ? "bg-slate-800 text-slate-300 border border-slate-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <BarChart3 size={14} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                        <span className={`text-sm ml-1 ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}>
                          Capacity: {manufacturer.capacity}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                        <span className={`text-sm ml-1 ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}>
                          Experience: {manufacturer.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isDarkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      onClick={() => handleContactManufacturer(manufacturer)}
                    >
                      Contact Manufacturer
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={expandedSections.includes(manufacturer.id) ? "expanded" : "collapsed"}
                variants={expansionVariants}
                className={`overflow-hidden ${
                  isDarkMode ? "bg-slate-800 border-t border-slate-700" : "bg-gray-50 border-t border-gray-200"
                }`}
              >
                <div className="p-5">
                  <h4 className={`font-medium mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                    Additional Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className={`text-sm font-medium mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}>
                        Certifications
                      </h5>
                      <ul className={`list-disc list-inside text-sm ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}>
                        <li>USDA Organic</li>
                        <li>Fair Trade Certified</li>
                        <li>Non-GMO Project Verified</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className={`text-sm font-medium mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}>
                        Production Capabilities
                      </h5>
                      <ul className={`list-disc list-inside text-sm ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}>
                        <li>Custom formulation</li>
                        <li>Packaging design</li>
                        <li>Private labeling</li>
                        <li>Shipping and logistics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <button
                onClick={() => toggleSection(manufacturer.id)}
                className={`w-full py-2 px-5 text-sm font-medium flex items-center justify-center ${
                  isDarkMode ? "bg-slate-800 text-slate-300" : "bg-gray-50 text-gray-600"
                } border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}
              >
                <span>
                  {expandedSections.includes(manufacturer.id) ? "Hide details" : "Show details"}
                </span>
                <motion.div
                  className="ml-2"
                  animate={expandedSections.includes(manufacturer.id) ? "expanded" : "collapsed"}
                  variants={rotateVariants}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
  
  // Render project details
  const renderProjectDetails = () => (
    <div className="w-full">
      <motion.div 
        className={`rounded-lg overflow-hidden ${
          isDarkMode ? "bg-slate-800" : "bg-gray-50"
        } p-6 mb-6`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <h3 className={`text-lg font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Project Overview
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Product Name
                </h4>
                <p className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {projectDetails.name}
                </p>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Status
                </h4>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    projectDetails.status === "In review" 
                      ? "bg-yellow-400" 
                      : "bg-green-400"
                  }`}></span>
                  <p className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {projectDetails.status}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Created On
                </h4>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  <p className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {projectDetails.date}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Production Volume
                </h4>
                <p className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {projectDetails.units}
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h3 className={`text-lg font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Product Details
            </h3>
            
            {/* Packaging Section */}
            <div className="mb-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("packaging")}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                  }`}>
                    <Package size={16} />
                  </div>
                  <h4 className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Packaging
                  </h4>
                </div>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mr-3 p-1.5 rounded-md text-sm ${
                      isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPackaging();
                    }}
                  >
                    <Edit size={14} />
                  </motion.button>
                  <motion.div
                    animate={expandedSections.includes("packaging") ? "expanded" : "collapsed"}
                    variants={rotateVariants}
                  >
                    <ChevronDown size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={expandedSections.includes("packaging") ? "expanded" : "collapsed"}
                variants={expansionVariants}
                className="overflow-hidden mt-2"
              >
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? "bg-slate-900" : "bg-white"
                }`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? "bg-slate-800" : "bg-gray-100"
                    }`}>
                      <Package size={20} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {projectDetails.packaging}
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}>
                        Standard packaging option
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Selected Suppliers
                    </h5>
                    
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              EcoPack Solutions
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Primary
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Location: California, USA
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Lead Time: 3-4 weeks
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              GreenWrap Inc.
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                          }`}>
                            Alternative
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Location: Oregon, USA
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Lead Time: 2-3 weeks
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Ingredients Section */}
            <div className="mb-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("ingredients")}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                  }`}>
                    <Coffee size={16} />
                  </div>
                  <h4 className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Ingredients
                  </h4>
                </div>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mr-3 p-1.5 rounded-md text-sm ${
                      isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditIngredients();
                    }}
                  >
                    <Edit size={14} />
                  </motion.button>
                  <motion.div
                    animate={expandedSections.includes("ingredients") ? "expanded" : "collapsed"}
                    variants={rotateVariants}
                  >
                    <ChevronDown size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={expandedSections.includes("ingredients") ? "expanded" : "collapsed"}
                variants={expansionVariants}
                className="overflow-hidden mt-2"
              >
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? "bg-slate-900" : "bg-white"
                }`}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {projectDetails.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={ingredient}
                        custom={index}
                        variants={tagVariants}
                        initial="initial"
                        animate="animate"
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center px-3 py-1.5 rounded-full ${
                          isDarkMode 
                            ? "bg-slate-800 text-slate-200" 
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {index === 0 && <Coffee size={14} className="mr-1" />}
                        {index === 1 && <Droplet size={14} className="mr-1" />}
                        {index === 2 && <Leaf size={14} className="mr-1" />}
                        {index > 2 && <div className="w-3.5 h-3.5 mr-1"></div>}
                        {ingredient}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Selected Suppliers
                    </h5>
                    
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              Organic Cocoa Traders
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Primary
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Location: Ghana
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Materials: Cocoa Mass, Cocoa Butter
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              Natural Ingredients Co.
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Primary
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Location: California, USA
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Materials: Sugar, Sea Salt, Almonds
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              Fair Trade Suppliers Ltd.
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                          }`}>
                            Alternative
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Location: Peru
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Materials: Cocoa Mass, Cocoa Butter
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Consultants Section */}
            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("consultants")}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-600"
                  }`}>
                    <User size={16} />
                  </div>
                  <h4 className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Consultants
                  </h4>
                </div>
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mr-3 p-1.5 rounded-md text-sm ${
                      isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditConsultants();
                    }}
                  >
                    <Edit size={14} />
                  </motion.button>
                  <motion.div
                    animate={expandedSections.includes("consultants") ? "expanded" : "collapsed"}
                    variants={rotateVariants}
                  >
                    <ChevronDown size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={expandedSections.includes("consultants") ? "expanded" : "collapsed"}
                variants={expansionVariants}
                className="overflow-hidden mt-2"
              >
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? "bg-slate-900" : "bg-white"
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {projectDetails.consultants.map((consultant, index) => (
                      <motion.div
                        key={consultant}
                        custom={index}
                        variants={tagVariants}
                        initial="initial"
                        animate="animate"
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: isDarkMode 
                            ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
                            : "0 4px 12px rgba(0, 0, 0, 0.1)" 
                        }}
                        className={`flex items-center p-3 rounded-lg ${
                          isDarkMode 
                            ? "bg-slate-800 text-slate-200" 
                            : "bg-gray-100 text-gray-800"
                        }`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                          isDarkMode ? "bg-slate-700 text-purple-300" : "bg-white text-purple-600"
                        }`} style={{ transform: "translateZ(5px)" }}>
                          <User size={14} />
                        </div>
                        <span style={{ transform: "translateZ(2px)" }}>{consultant}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}>
                      Selected Consultants
                    </h5>
                    
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-purple-300" : "bg-gray-200 text-purple-600"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              FoodTech Consultancy Group
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Lead Consultant
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Expertise: Formulation, Regulatory
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Contact: John Smith
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-purple-300" : "bg-gray-200 text-purple-600"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              PackDesign Studios
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Specialist
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Expertise: Packaging Design
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Contact: Sarah Johnson
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-slate-700 text-purple-300" : "bg-gray-200 text-purple-600"
                            }`}>
                              <User size={14} />
                            </div>
                            <span className={`ml-2 font-medium text-sm ${
                              isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}>
                              Compliance Partners
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-600"
                          }`}>
                            Specialist
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Expertise: Regulatory Compliance
                          </div>
                          <div className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Contact: Michael Wong
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center py-2 px-4 rounded-md ${
                  isDarkMode 
                    ? "bg-slate-800 text-white hover:bg-slate-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={onBack}
              >
                <ChevronRight className="mr-1 rotate-180" size={16} />
                All Projects
              </motion.button>
              
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDarkMode ? "bg-slate-800" : "bg-gray-100"
                  }`}
                >
                  <span className="text-2xl">🍫</span>
                </motion.div>
                <div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`font-semibold text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Chocolate Bar
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Jun 05, 2025
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      projectStatus === "active" 
                        ? isDarkMode 
                          ? "bg-green-900/30 text-green-300" 
                          : "bg-green-100 text-green-600"
                        : projectStatus === "paused"
                          ? isDarkMode 
                            ? "bg-blue-900/30 text-blue-300" 
                            : "bg-blue-100 text-blue-600"
                          : isDarkMode
                            ? "bg-red-900/30 text-red-300"
                            : "bg-red-100 text-red-600"
                    }`}>
                      {projectStatus === "active" ? "Active" : 
                       projectStatus === "paused" ? "Paused" : "Cancelled"}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {projectStatus !== "cancelled" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={() => {
                    if (projectStatus === "paused") {
                      handleResumeProject();
                    } else {
                      setShowOptionsDropdown(!showOptionsDropdown);
                    }
                  }}
                >
                  {projectStatus === "paused" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Resume Project
                    </>
                  ) : (
                    <>
                      <MoreVertical size={16} />
                      Options
                    </>
                  )}
                </motion.button>
              )}
              
              {projectStatus === "cancelled" && (
                <div className={`px-4 py-2 rounded-md text-sm ${
                  isDarkMode ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-gray-500"
                }`}>
                  Project Cancelled
                </div>
              )}
              
              <AnimatePresence>
                {showOptionsDropdown && projectStatus === "active" && (
                  <motion.div 
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 overflow-hidden ${
                      isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"
                    }`}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-1">
                      <motion.button
                        className={`flex w-full items-center px-4 py-2 text-sm ${
                          isDarkMode 
                            ? "text-slate-200 hover:bg-slate-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          handleEditProject();
                        }}
                        whileHover={{ x: 4 }}
                      >
                        <Edit size={14} className="mr-2" />
                        Edit Project
                      </motion.button>
                      
                      <motion.button
                        className={`flex w-full items-center px-4 py-2 text-sm ${
                          isDarkMode 
                            ? "text-slate-200 hover:bg-slate-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={handlePauseProject}
                        whileHover={{ x: 4 }}
                      >
                        <Pause size={14} className="mr-2" />
                        Pause Project
                      </motion.button>
                      
                      <motion.button
                        className={`flex w-full items-center px-4 py-2 text-sm ${
                          isDarkMode 
                            ? "text-red-300 hover:bg-slate-700" 
                            : "text-red-600 hover:bg-gray-100"
                        }`}
                        onClick={handleCancelProject}
                        whileHover={{ x: 4 }}
                      >
                        <XCircle size={14} className="mr-2" />
                        Cancel Project
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex gap-8 mb-8 border-b border-border pb-2">
            <motion.button
              variants={tabVariants}
              animate={activeTab === "manufacturers" ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-semibold pb-2 relative ${
                activeTab === "manufacturers"
                  ? isDarkMode ? "text-white" : "text-gray-900"
                  : isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("manufacturers")}
            >
              Manufacturers
              {activeTab === "manufacturers" && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    isDarkMode ? "bg-blue-500" : "bg-yellow-400"
                  }`}
                />
              )}
            </motion.button>
            
            <motion.button
              variants={tabVariants}
              animate={activeTab === "details" ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`font-semibold pb-2 relative ${
                activeTab === "details"
                  ? isDarkMode ? "text-white" : "text-gray-900"
                  : isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Project Details
              {activeTab === "details" && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    isDarkMode ? "bg-blue-500" : "bg-yellow-400"
                  }`}
                />
              )}
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === "manufacturers" ? (
              <motion.div
                key="manufacturers"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                {renderManufacturers()}
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderProjectDetails()}
              </motion.div>
            )}
          </AnimatePresence>
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
                  <div className="mb-4 relative" ref={productSearchRef}>
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
                        onFocus={() => setShowProductSuggestions(true)}
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
                      value={editedProject.units?.split(' ')[0] || "10K - 50K"}
                      onChange={(e) => {
                        const unitPart = editedProject.units?.split(' ').slice(1).join(' ') || 'units';
                        setEditedProject({...editedProject, units: `${e.target.value} ${unitPart}`});
                      }}
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
                      value={editedProject.units?.split(' ').slice(1).join(' ')?.toLowerCase() || "units"}
                      onChange={(e) => {
                        const volumePart = editedProject.units?.split(' ')[0] || '10K - 50K';
                        setEditedProject({...editedProject, units: `${volumePart} ${e.target.value}`});
                      }}
                    >
                      <option value="units">Units</option>
                      <option value="pieces">Pieces</option>
                      <option value="cases">Cases</option>
                      <option value="pallets">Pallets</option>
                      <option value="containers">Containers</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pounds">Pounds</option>
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
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
                      value={editedProject.description}
                      onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
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
                      onClick={handleSaveChanges}
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

      {/* Service Edit Popups */}
      <AnimatePresence>
        {(packagingEditPopupVisible || ingredientsEditPopupVisible || consultantsEditPopupVisible) && editedServiceData && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                setPackagingEditPopupVisible(false);
                setIngredientsEditPopupVisible(false);
                setConsultantsEditPopupVisible(false);
              }}
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
                      Edit {editedServiceData.serviceType}
                    </h3>
                    <motion.button 
                      className="text-gray-400 hover:text-gray-500"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setPackagingEditPopupVisible(false);
                        setIngredientsEditPopupVisible(false);
                        setConsultantsEditPopupVisible(false);
                      }}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-5">
                  {/* Packaging Edit Form */}
                  {packagingEditPopupVisible && (
                    <div className="mb-4 relative" ref={packagingSearchRef}>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Packaging Type
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className={`w-full px-3 py-2 rounded-md ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                          value={packagingSearchQuery}
                          onChange={(e) => {
                            setPackagingSearchQuery(e.target.value);
                            setShowPackagingSuggestions(true);
                            if (editedServiceData) {
                              setEditedServiceData({...editedServiceData, serviceName: e.target.value});
                            }
                          }}
                          onFocus={() => setShowPackagingSuggestions(true)}
                          placeholder="Search for packaging type..."
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Search size={18} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {showPackagingSuggestions && filteredPackaging.length > 0 && (
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
                              {filteredPackaging.map((pkg, index) => (
                                <motion.div
                                  key={pkg.id}
                                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer ${
                                    isDarkMode 
                                      ? 'hover:bg-slate-600 text-slate-200' 
                                      : 'hover:bg-gray-100 text-gray-800'
                                  } transition-colors`}
                                  onClick={() => handlePackagingSelect(pkg.name)}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(243, 244, 246, 1)' }}
                                >
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                      isDarkMode ? 'bg-slate-600 text-blue-300' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      <Package size={16} />
                                    </div>
                                    <div className="font-medium">{pkg.name}</div>
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {pkg.material}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Ingredients Edit Form */}
                  {ingredientsEditPopupVisible && (
                    <div className="mb-4 relative" ref={ingredientsSearchRef}>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Ingredients
                      </label>
                      
                      {/* Selected Ingredients */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedIngredients.map((ingredient, index) => (
                          <motion.div
                            key={`selected-${ingredient}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`flex items-center px-3 py-1.5 rounded-full ${
                              isDarkMode 
                                ? 'bg-slate-700 text-slate-200' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {index === 0 && <Coffee size={14} className="mr-1" />}
                            {index === 1 && <Droplet size={14} className="mr-1" />}
                            {index === 2 && <Leaf size={14} className="mr-1" />}
                            {index > 2 && <div className="w-3.5 h-3.5 mr-1"></div>}
                            <span className="truncate max-w-[150px]">{ingredient}</span>
                            <button 
                              className={`ml-2 p-0.5 rounded-full ${
                                isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                              }`}
                              onClick={() => removeIngredient(ingredient)}
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Search Input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          className={`w-full px-3 py-2 rounded-md ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                          value={ingredientsSearchQuery}
                          onChange={(e) => {
                            setIngredientsSearchQuery(e.target.value);
                            setShowIngredientsSuggestions(true);
                          }}
                          onFocus={() => setShowIngredientsSuggestions(true)}
                          placeholder="Search for ingredients..."
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Search size={18} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {showIngredientsSuggestions && filteredIngredients.length > 0 && (
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
                            style={{ maxWidth: "100%" }}
                          >
                            <div className="py-1">
                              {filteredIngredients.map((ingredient, index) => (
                                <motion.div
                                  key={ingredient.id}
                                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer ${
                                    selectedIngredients.includes(ingredient.name)
                                      ? isDarkMode 
                                        ? 'bg-blue-800/30 text-blue-300' 
                                        : 'bg-blue-50 text-blue-700'
                                      : isDarkMode 
                                        ? 'hover:bg-slate-600 text-slate-200' 
                                        : 'hover:bg-gray-100 text-gray-800'
                                  } transition-colors`}
                                  onClick={() => handleIngredientSelect(ingredient.name)}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={selectedIngredients.includes(ingredient.name) ? {} : { x: 5, backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(243, 244, 246, 1)' }}
                                >
                                  <div className="flex items-center min-w-0 flex-1">
                                    {ingredient.category === "Chocolate" && <Coffee size={14} className="flex-shrink-0 mr-2" />}
                                    {ingredient.category === "Nuts" && <Leaf size={14} className="flex-shrink-0 mr-2" />}
                                    {ingredient.category === "Additives" && <Droplet size={14} className="flex-shrink-0 mr-2" />}
                                    {!["Chocolate", "Nuts", "Additives"].includes(ingredient.category) && <div className="w-3.5 h-3.5 flex-shrink-0 mr-2"></div>}
                                    <div className="font-medium truncate">{ingredient.name}</div>
                                  </div>
                                  <div className={`text-xs truncate ml-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {ingredient.category}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Consultants Edit Form */}
                  {consultantsEditPopupVisible && (
                    <div className="mb-4 relative" ref={consultantsSearchRef}>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Consultants
                      </label>
                      
                      {/* Selected Consultants */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedConsultants.map((consultant, index) => (
                          <motion.div
                            key={`selected-${consultant}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`flex items-center px-3 py-1.5 rounded-full ${
                              isDarkMode 
                                ? 'bg-slate-700 text-slate-200' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <User size={14} className="flex-shrink-0 mr-1" />
                            <span className="truncate max-w-[150px]">{consultant}</span>
                            <button 
                              className={`ml-2 p-0.5 rounded-full ${
                                isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                              }`}
                              onClick={() => removeConsultant(consultant)}
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Search Input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          className={`w-full px-3 py-2 rounded-md ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                          value={consultantsSearchQuery}
                          onChange={(e) => {
                            setConsultantsSearchQuery(e.target.value);
                            setShowConsultantsSuggestions(true);
                          }}
                          onFocus={() => setShowConsultantsSuggestions(true)}
                          placeholder="Search for consultants..."
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Search size={18} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {showConsultantsSuggestions && filteredConsultants.length > 0 && (
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
                            style={{ maxWidth: "100%" }}
                          >
                            <div className="py-1">
                              {filteredConsultants.map((consultant, index) => (
                                <motion.div
                                  key={consultant.id}
                                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer ${
                                    selectedConsultants.includes(consultant.name)
                                      ? isDarkMode 
                                        ? 'bg-purple-800/30 text-purple-300' 
                                        : 'bg-purple-50 text-purple-700'
                                      : isDarkMode 
                                        ? 'hover:bg-slate-600 text-slate-200' 
                                        : 'hover:bg-gray-100 text-gray-800'
                                  } transition-colors`}
                                  onClick={() => handleConsultantSelect(consultant.name)}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={selectedConsultants.includes(consultant.name) ? {} : { x: 5, backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(243, 244, 246, 1)' }}
                                >
                                  <div className="flex items-center min-w-0 flex-1">
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-2 ${
                                      isDarkMode ? 'bg-slate-600 text-purple-300' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                      <User size={14} />
                                    </div>
                                    <div className="font-medium truncate">{consultant.name}</div>
                                  </div>
                                  <div className={`text-xs truncate ml-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {consultant.specialty}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Common Fields for All Service Types */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Product Name
                    </label>
                    <input 
                      type="text" 
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      value={editedServiceData.name}
                      onChange={(e) => setEditedServiceData({...editedServiceData, name: e.target.value})}
                    />
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
                      value={editedServiceData.units?.split(' ')[0] || "10K - 50K"}
                      onChange={(e) => {
                        const unitPart = editedServiceData.units?.split(' ').slice(1).join(' ') || 'units';
                        setEditedServiceData({...editedServiceData, units: `${e.target.value} ${unitPart}`});
                      }}
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
                      value={editedServiceData.units?.split(' ').slice(1).join(' ')?.toLowerCase() || "units"}
                      onChange={(e) => {
                        const volumePart = editedServiceData.units?.split(' ')[0] || '10K - 50K';
                        setEditedServiceData({...editedServiceData, units: `${volumePart} ${e.target.value}`});
                      }}
                    >
                      <option value="units">Units</option>
                      <option value="pieces">Pieces</option>
                      <option value="cases">Cases</option>
                      <option value="pallets">Pallets</option>
                      <option value="containers">Containers</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pounds">Pounds</option>
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
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
                      value={editedServiceData.description}
                      onChange={(e) => setEditedServiceData({...editedServiceData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className={`w-4 h-4 ${
                          isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                        } focus:ring-blue-500/20 rounded transition-all`}
                        checked={editedServiceData.anonymous}
                        onChange={(e) => setEditedServiceData({...editedServiceData, anonymous: e.target.checked})}
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
                      onClick={() => {
                        setPackagingEditPopupVisible(false);
                        setIngredientsEditPopupVisible(false);
                        setConsultantsEditPopupVisible(false);
                      }}
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
                      onClick={handleSaveServiceChanges}
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

      {/* Contact Manufacturer Popup */}
      <AnimatePresence>
        {contactManufacturerVisible && selectedManufacturer && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCloseContactForm}
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
                onClick={e => e.stopPropagation()}
              >
                {!contactFormSuccess ? (
                  <>
                    <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Contact {selectedManufacturer.name}
                        </h3>
                        <motion.button 
                          className="text-gray-400 hover:text-gray-500"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleCloseContactForm}
                        >
                          <X size={20} />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center mb-5">
                        <div 
                          className={`w-12 h-12 rounded-md bg-cover bg-center mr-3`}
                          style={{ backgroundImage: `url(${selectedManufacturer.imageUrl})` }}
                        ></div>
                        <div>
                          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedManufacturer.name}
                          </h4>
                          <div className="flex items-center">
                            <MapPin size={12} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                            <span className={`text-xs ml-1 ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}>
                              {selectedManufacturer.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Method Selection */}
                      <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          Contact Method
                        </label>
                        <div className="flex gap-2">
                          <motion.button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 ${
                              contactFormData.contactMethod === 'email' 
                                ? isDarkMode 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-blue-500 text-white'
                                : isDarkMode 
                                  ? 'bg-slate-700 text-slate-300' 
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleContactFormChange('contactMethod', 'email')}
                          >
                            <Mail size={14} />
                            Email
                          </motion.button>
                          <motion.button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 ${
                              contactFormData.contactMethod === 'phone' 
                                ? isDarkMode 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-yellow-300 text-gray-800'
                                : isDarkMode 
                                  ? 'bg-slate-700 text-slate-300' 
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleContactFormChange('contactMethod', 'phone')}
                          >
                            <Phone size={14} />
                            Phone
                          </motion.button>
                          <motion.button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 ${
                              contactFormData.contactMethod === 'message' 
                                ? isDarkMode 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-yellow-300 text-gray-800'
                                : isDarkMode 
                                  ? 'bg-slate-700 text-slate-300' 
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleContactFormChange('contactMethod', 'message')}
                          >
                            <MessageSquare size={14} />
                            Message
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Email-specific UI */}
                      {contactFormData.contactMethod === 'email' && (
                        <>
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              To
                            </label>
                            <div className={`w-full px-3 py-2 rounded-md ${
                              isDarkMode 
                                ? 'bg-slate-700/50 border-slate-600 text-white' 
                                : 'bg-gray-100 border-gray-300 text-gray-700'
                            } border focus:outline-none transition-all cursor-not-allowed`}>
                              {selectedManufacturer.name} &lt;contact@{selectedManufacturer.name.toLowerCase().replace(/\s+/g, '')}.com&gt;
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Subject
                            </label>
                            <input 
                              type="text" 
                              className={`w-full px-3 py-2 rounded-md ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                              value={contactFormData.subject}
                              onChange={(e) => handleContactFormChange("subject", e.target.value)}
                              placeholder="RE: Chocolate Bar Project"
                            />
                          </div>
                          
                          <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                CC
                              </label>
                              <input 
                                type="text" 
                                className={`w-full px-3 py-2 rounded-md ${
                                  isDarkMode 
                                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                value={contactFormData.ccEmail}
                                onChange={(e) => handleContactFormChange("ccEmail", e.target.value)}
                                placeholder="colleague@example.com"
                              />
                            </div>
                            <div className="flex-1">
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                BCC
                              </label>
                              <input 
                                type="text" 
                                className={`w-full px-3 py-2 rounded-md ${
                                  isDarkMode 
                                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                value={contactFormData.bccEmail}
                                onChange={(e) => handleContactFormChange("bccEmail", e.target.value)}
                                placeholder="manager@example.com"
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Message
                            </label>
                            <textarea 
                              className={`w-full px-3 py-2 rounded-md ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                              rows={5}
                              value={contactFormData.message}
                              onChange={(e) => handleContactFormChange("message", e.target.value)}
                              placeholder="Compose your email message here..."
                            />
                          </div>
                          
                          <div className="flex flex-col gap-2 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className={`w-4 h-4 ${
                                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                                } focus:ring-blue-500/20 rounded transition-all`}
                                checked={contactFormData.attachFiles}
                                onChange={(e) => handleContactFormChange("attachFiles", e.target.checked)}
                              />
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                Attach project specification documents
                              </span>
                            </label>
                            
                            {contactFormData.attachFiles && (
                              <div className={`mt-2 p-3 border rounded-md ${
                                isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                  </svg>
                                  <span className="text-sm">ChocolateBarSpec_v1.2.pdf</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                    <line x1="7" y1="2" x2="7" y2="22"></line>
                                    <line x1="17" y1="2" x2="17" y2="22"></line>
                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                    <line x1="2" y1="7" x2="7" y2="7"></line>
                                    <line x1="2" y1="17" x2="7" y2="17"></line>
                                    <line x1="17" y1="17" x2="22" y2="17"></line>
                                    <line x1="17" y1="7" x2="22" y2="7"></line>
                                  </svg>
                                  <span className="text-sm">Project_Timeline.xlsx</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Phone-specific UI */}
                      {contactFormData.contactMethod === 'phone' && (
                        <>
                          <div className="mb-4">
                            <div className={`p-4 mb-4 rounded-md ${
                              isDarkMode ? 'bg-slate-700/50 border border-slate-600' : 'bg-yellow-50 border border-yellow-100'
                            }`}>
                              <h4 className={`text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-slate-200' : 'text-yellow-800'
                              }`}>Manufacturer's Available Hours</h4>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-slate-300' : 'text-yellow-700'
                              }`}>
                                Monday - Friday: 9:00 AM - 5:00 PM ({selectedManufacturer.location.split(',')[1]?.trim() || 'Local'} time)
                              </p>
                            </div>
                            
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Your Phone Number
                            </label>
                            <input 
                              type="tel" 
                              className={`w-full px-3 py-2 rounded-md ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                              value={contactFormData.phoneNumber}
                              onChange={(e) => handleContactFormChange("phoneNumber", e.target.value)}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Schedule a Call
                            </label>
                            <div className="flex gap-4 mb-2">
                              <div className="flex-1">
                                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                  Date
                                </label>
                                <input 
                                  type="date" 
                                  className={`w-full px-3 py-2 rounded-md ${
                                    isDarkMode 
                                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                  value={contactFormData.callDate}
                                  onChange={(e) => handleContactFormChange("callDate", e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div className="flex-1">
                                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                  Time
                                </label>
                                <input 
                                  type="time" 
                                  className={`w-full px-3 py-2 rounded-md ${
                                    isDarkMode 
                                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                  value={contactFormData.callTime}
                                  onChange={(e) => handleContactFormChange("callTime", e.target.value)}
                                />
                              </div>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              The manufacturer will confirm this time or suggest alternatives.
                            </p>
                          </div>
                          
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Call Agenda
                            </label>
                            <textarea 
                              className={`w-full px-3 py-2 rounded-md ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                              rows={3}
                              value={contactFormData.message}
                              onChange={(e) => handleContactFormChange("message", e.target.value)}
                              placeholder="Brief description of what you'd like to discuss on the call..."
                            />
                          </div>
                        </>
                      )}

                      {/* Message-specific UI */}
                      {contactFormData.contactMethod === 'message' && (
                        <>
                          <div className={`mb-4 p-4 rounded-md ${
                            isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className={`text-sm font-medium ${
                                isDarkMode ? 'text-slate-300' : 'text-gray-700'
                              }`}>
                                Direct Message to {selectedManufacturer.name}
                              </h4>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600'
                              }`}>
                                Online
                              </div>
                            </div>
                            
                            <div className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                              isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                            }`}>
                              <p className="text-sm">Hello, thank you for your interest in our services. How can we help with your Chocolate Bar project?</p>
                              <div className={`text-right mt-1 text-xs ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-500'
                              }`}>
                                Today, 10:24 AM
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              Your Message
                            </label>
                            <textarea 
                              className={`w-full px-3 py-2 rounded-md ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                              rows={4}
                              value={contactFormData.message}
                              onChange={(e) => handleContactFormChange("message", e.target.value)}
                              placeholder="Type your message here..."
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <motion.button
                              className={`text-xs px-3 py-1.5 rounded-full ${
                                isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800'
                              } border-0`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleContactFormChange("message", "I'm interested in your manufacturing capabilities for my project.")}
                            >
                              I'm interested in your manufacturing capabilities
                            </motion.button>
                            <motion.button
                              className={`text-xs px-3 py-1.5 rounded-full ${
                                isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800'
                              } border-0`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleContactFormChange("message", "Can you provide pricing information for my project requirements?")}
                            >
                              Request pricing information
                            </motion.button>
                            <motion.button
                              className={`text-xs px-3 py-1.5 rounded-full ${
                                isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800'
                              } border-0`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleContactFormChange("message", "What's your minimum order quantity for this type of product?")}
                            >
                              Ask about MOQ
                            </motion.button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className={`w-4 h-4 ${
                                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                                } focus:ring-blue-500/20 rounded transition-all`}
                                checked={contactFormData.urgent}
                                onChange={(e) => handleContactFormChange("urgent", e.target.checked)}
                              />
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                Mark as urgent
                              </span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                              <input
                                type="checkbox"
                                className={`w-4 h-4 ${
                                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                                } focus:ring-blue-500/20 rounded transition-all`}
                                checked={contactFormData.responseExpected}
                                onChange={(e) => handleContactFormChange("responseExpected", e.target.checked)}
                              />
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                Notify me of response
                              </span>
                            </label>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end gap-3 mt-6">
                        <motion.button
                          className={`py-2 px-4 rounded-md text-sm font-medium ${
                            isDarkMode 
                              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCloseContactForm}
                        >
                          Cancel
                        </motion.button>
                        
                        <motion.button
                          className={`py-2 px-4 rounded-md text-sm font-medium flex items-center gap-2 ${
                            isDarkMode 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          } ${contactFormSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          whileHover={{ scale: contactFormSubmitting ? 1 : 1.05 }}
                          whileTap={{ scale: contactFormSubmitting ? 1 : 0.95 }}
                          onClick={handleContactFormSubmit}
                          disabled={contactFormSubmitting || !contactFormData.message.trim() || (contactFormData.contactMethod === 'phone' && !contactFormData.phoneNumber.trim())}
                        >
                          {contactFormSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {contactFormData.contactMethod === 'email' ? 'Sending...' : 
                               contactFormData.contactMethod === 'phone' ? 'Scheduling...' : 'Sending...'}
                            </>
                          ) : (
                            <>
                              {contactFormData.contactMethod === 'email' && <Mail size={14} />}
                              {contactFormData.contactMethod === 'phone' && <Phone size={14} />}
                              {contactFormData.contactMethod === 'message' && <Send size={14} />}
                              {contactFormData.contactMethod === 'email' ? 'Send Email' : 
                               contactFormData.contactMethod === 'phone' ? 'Schedule Call' : 'Send Message'}
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center">
                    <motion.div 
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600'
                      }`}
                      initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Message Sent!
                    </h3>
                    <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Your message has been sent to {selectedManufacturer.name}.<br />
                      They will contact you shortly.
                    </p>
                    <motion.button
                      className={`py-2 px-4 rounded-md text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-yellow-300 text-gray-800 hover:bg-yellow-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseContactForm}
                    >
                      Close
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Pause Project Confirmation Popup */}
      <AnimatePresence>
        {pausePopupVisible && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => !pauseInProgress && setPausePopupVisible(false)}
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
                      {pauseSuccess ? "Success" : "Pause Project"}
                    </h3>
                    {!pauseInProgress && !pauseSuccess && (
                      <motion.button 
                        className="text-gray-400 hover:text-gray-500"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPausePopupVisible(false)}
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <div className="p-5">
                  {pauseSuccess ? (
                    <div className="flex flex-col items-center text-center">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </motion.div>
                      <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Project Paused
                      </h3>
                      <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Your project has been paused successfully. You can resume it at any time.
                      </p>
                    </div>
                  ) : pauseInProgress ? (
                    <div className="flex flex-col items-center text-center py-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                      </motion.div>
                      <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Pausing Project...
                      </h3>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Please wait while we process your request.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Pause size={24} />
                        </div>
                        
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Pause this project?
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            Pausing will temporarily hide this project from manufacturers. You can resume it at any time.
                          </p>
                        </div>
                      </div>
                      
                      <div className={`p-4 mb-6 rounded-md ${
                        isDarkMode ? 'bg-slate-700/50 border border-slate-600' : 'bg-blue-50 border border-blue-100'
                      }`}>
                        <h5 className={`text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-slate-200' : 'text-blue-700'
                        }`}>What happens when you pause?</h5>
                        <ul className={`text-xs ${
                          isDarkMode ? 'text-slate-300' : 'text-blue-600'
                        } space-y-1 list-disc pl-4`}>
                          <li>Project will be hidden from manufacturers</li>
                          <li>Ongoing communications will remain accessible</li>
                          <li>No charges will be incurred during the pause period</li>
                          <li>You can resume the project at any time</li>
                        </ul>
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
                          onClick={() => setPausePopupVisible(false)}
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
                          onClick={handleConfirmPause}
                        >
                          <span className="flex items-center gap-1.5">
                            <Pause size={16} />
                            Yes, pause project
                          </span>
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Project Confirmation Popup */}
      <AnimatePresence>
        {cancelPopupVisible && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => !cancelInProgress && setCancelPopupVisible(false)}
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
                      {cancelSuccess ? "Success" : "Cancel Project"}
                    </h3>
                    {!cancelInProgress && !cancelSuccess && (
                      <motion.button 
                        className="text-gray-400 hover:text-gray-500"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCancelPopupVisible(false)}
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <div className="p-5">
                  {cancelSuccess ? (
                    <div className="flex flex-col items-center text-center">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </motion.div>
                      <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Project Cancelled
                      </h3>
                      <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Your project has been cancelled successfully. You can create a new project at any time.
                      </p>
                    </div>
                  ) : cancelInProgress ? (
                    <div className="flex flex-col items-center text-center py-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                      </motion.div>
                      <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cancelling Project...
                      </h3>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Please wait while we process your request.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                          isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'
                        }`}>
                          <XCircle size={24} />
                        </div>
                        
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Cancel this project?
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            This will permanently cancel the project. Any ongoing communications with manufacturers will be terminated. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      
                      <div className={`p-4 mb-6 rounded-md ${
                        isDarkMode ? 'bg-slate-700/50 border border-slate-600' : 'bg-red-50 border border-red-100'
                      }`}>
                        <h5 className={`text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-slate-200' : 'text-red-700'
                        }`}>What happens when you cancel?</h5>
                        <ul className={`text-xs ${
                          isDarkMode ? 'text-slate-300' : 'text-red-600'
                        } space-y-1 list-disc pl-4`}>
                          <li>All manufacturer communications will be terminated</li>
                          <li>Your project will be archived and no longer accessible</li>
                          <li>Any pending orders or agreements will be cancelled</li>
                          <li>This action cannot be undone</li>
                        </ul>
                      </div>
                      
                      <div className={`p-4 mb-6 rounded-md bg-yellow-100 border border-yellow-200 ${
                        isDarkMode ? 'bg-yellow-900/30 border-yellow-800/30 text-yellow-300' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                      }`}>
                        <div className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          <div>
                            <h5 className="text-sm font-medium">Consider pausing instead</h5>
                            <p className="text-xs mt-1">
                              If you might resume this project later, pausing is recommended instead of cancelling.
                            </p>
                          </div>
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
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* CSS for modal positioning */}
      <style>{`
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

export default Step4_ProjectDetail;