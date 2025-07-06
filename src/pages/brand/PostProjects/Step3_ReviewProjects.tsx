import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { foodProductApi, projectApi, Project as ApiProject } from "../../../lib/api";
import type { ProductCategory, SupplierType } from "./types";
import "@/styles/theme-variables.css";
import { ChevronLeft, Plus, Eye, Edit, XCircle, ChevronDown, ChevronUp, X, Check, AlertTriangle, Search, Calendar, Package, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Status helper functions for consistent mapping between BE and UI
const getStatusDisplayName = (status: string): string => {
  switch(status) {
    case 'draft': return 'Research Phase';
    case 'active': return 'Active';
    case 'in_review': return 'In Review';
    case 'paused': return 'Paused';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
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
  onNext: (projectId?: string | number) => void;
  onBack: () => void;
  onNewProject: () => void;
  selectedProduct?: ProductCategory | null;
  selectedSupplierType?: SupplierType | null;
  projectData?: any;
}

interface Project {
  id: number;
  _id?: string; // Store original MongoDB ObjectId for API calls
  name: string;
  created: string;
  status: string;
  details: string;
  units?: string;
  volume?: string;
  description?: string;
  anonymous?: boolean;
  selectedProduct?: ProductCategory;
  selectedSupplierType?: SupplierType;
  image?: string;
  packagingObjects?: Array<{
    id: number;
    name: string;
    material: string;
  }>;
  packaging?: string[];
  locationList?: string[];
  allergen?: string[];
  certification?: string[];
  additional?: string;
  hideFromCurrent?: boolean;
}

// Update the ApiProject interface reference to include additional fields
interface ApiProjectExtended {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'in_review' | 'paused' | 'completed' | 'cancelled';
  selectedProduct?: {
    id: string;
    name: string;
    type: 'PRODUCT' | 'CATEGORY' | 'FOODTYPE';
    image?: string;
  };
  selectedSupplierType?: SupplierType;
  volume: string;
  units: string;
  packaging?: string[];
  packagingObjects?: Array<{
    id: number;
    name: string;
    material: string;
  }>;
  locationList?: string[];
  location?: string[];
  allergen?: string[];
  certification?: string[];
  additional?: string;
  anonymous?: boolean;
  hideFromCurrent?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Helper functions for category/product display (consistent with Step1 & Step2)
const getCategoryIcon = (categoryName: string): string => {
  const categoryIcons: Record<string, string> = {
    'Dressing': '🥗',
    'Instant Food': '🍜',
    'Miso': '🥣',
    'Sauce': '🫙',
    'Seasoning Mix': '🧂',
    'Soy Sauce': '🥢',
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
    'Chocolate': '🍫',
    'Other': '📦',
    'Paper': '📄',
    'Bag': '👜',
    'Packaging': '📦'
  };
  
  const matchedKey = Object.keys(categoryIcons).find(key => 
    categoryName.toLowerCase().includes(key.toLowerCase())
  );
  
  return categoryIcons[matchedKey || 'Other'];
};

const getCategoryImage = (categoryName: string): string => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#74b9ff'];
  const colorIndex = categoryName.length % colors.length;
  const color = colors[colorIndex];
  const encodedName = encodeURIComponent(categoryName.replace(/\s+/g, '+'));
  
  return `https://via.placeholder.com/300x300/${color.substring(1)}/ffffff?text=${encodedName}&font=Arial`;
};

// Deprecated - using getStatusColor and getStatusDisplayName instead
const statusColor = getStatusColor;
const statusText = getStatusDisplayName;

const Step3_ReviewProjects: React.FC<Props> = ({ 
  onNext, 
  onBack, 
  onNewProject,
  selectedProduct,
  selectedSupplierType,
  projectData
}) => {
  // Toast notifications
  const { toast } = useToast();
  
  // API States
  const [projects, setProjects] = useState<Project[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [projectDetailsVisible, setProjectDetailsVisible] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Popup states
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  // Product search states
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productInputFocused, setProductInputFocused] = useState(false);
  
  // Load API data
  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load real projects and food types in parallel
        const [projectsRes, foodTypesRes] = await Promise.all([
          projectApi.getProjects({ limit: 10 }).catch(() => null), // Load real projects
          foodProductApi.getFoodTypes() // Load food types instead of products
        ]);
        
        // Handle real projects data
        if (projectsRes?.success && projectsRes.data?.projects) {
          // Convert API projects to local Project format
          const apiProjects: Project[] = projectsRes.data.projects.map((apiProject: ApiProjectExtended) => ({
            id: parseInt(apiProject._id.slice(-6), 16), // Convert MongoDB ObjectId to number for display
            _id: apiProject._id, // Store original MongoDB ObjectId for API calls
            name: apiProject.name,
            created: new Date(apiProject.createdAt).toISOString().split('T')[0],
            status: apiProject.status === 'in_review' ? 'in_review' : 
                   apiProject.status === 'completed' ? 'completed' :
                   apiProject.status === 'cancelled' ? 'info_required' : apiProject.status,
            details: getProjectStatusDetails(apiProject.status),
            volume: apiProject.volume,
            units: apiProject.units,
            description: apiProject.description,
            anonymous: apiProject.anonymous,
            selectedProduct: apiProject.selectedProduct ? {
              id: parseInt(apiProject.selectedProduct.id),
              name: apiProject.selectedProduct.name,
              type: apiProject.selectedProduct.type,
              image: apiProject.selectedProduct.image
            } : undefined,
            selectedSupplierType: apiProject.selectedSupplierType,
            image: apiProject.selectedProduct?.image,
            packagingObjects: apiProject.packagingObjects,
            packaging: apiProject.packaging,
            locationList: apiProject.locationList,
            allergen: apiProject.allergen,
            certification: apiProject.certification,
            additional: apiProject.additional,
            hideFromCurrent: apiProject.hideFromCurrent
          }));
          
          // Add current project if it was just created
          if (selectedProduct && projectData) {
            const currentProject: Project = {
              id: projectData.projectId ? parseInt(projectData.projectId.slice(-6), 16) : Date.now(),
              _id: projectData.projectId, // Store the original MongoDB ObjectId if available
              name: selectedProduct.name,
              created: new Date().toISOString().split('T')[0],
              status: "in_review",
              details: "Keep an eye out – we may email you for additional project details",
              volume: projectData.volume || "10K - 50K",
              units: projectData.units || "Units",
              description: projectData.description || "Manufacturing project created from your selection",
              anonymous: projectData.anonymous || false,
              selectedProduct: selectedProduct,
              selectedSupplierType: selectedSupplierType,
              image: selectedProduct.image,
              packagingObjects: projectData.packagingObjects || [],
              packaging: projectData.packaging || [],
              locationList: projectData.locationList || ["Global"],
              allergen: projectData.allergen || [],
              certification: projectData.certification || [],
              additional: projectData.additional || "",
              hideFromCurrent: projectData.hideFromCurrent || false
            };
            
            // Add to beginning of list if not already there
            const existingProject = apiProjects.find(p => p.name === currentProject.name);
            if (!existingProject) {
              apiProjects.unshift(currentProject);
            }
          }
          
          setProjects(apiProjects);
        } else {
          // Fallback to mock data if API fails
          const mockProjects: Project[] = [
            {
              id: 1,
              name: selectedProduct?.name || "Chocolate Bar",
              created: new Date().toISOString().split('T')[0],
              status: "in_review",
              details: "Keep an eye out – we may email you for additional project details",
              volume: projectData?.volume || "10K - 50K",
              units: projectData?.units || "Units",
              description: projectData?.description || "Manufacturing project created from your selection",
              anonymous: projectData?.anonymous || false,
              selectedProduct: selectedProduct,
              selectedSupplierType: selectedSupplierType,
              image: selectedProduct?.image,
              packagingObjects: projectData?.packagingObjects || [],
              packaging: projectData?.packaging || [],
              locationList: projectData?.locationList || ["Global"],
              allergen: projectData?.allergen || [],
              certification: projectData?.certification || [],
              additional: projectData?.additional || "",
              hideFromCurrent: projectData?.hideFromCurrent || false
            }
          ];
          setProjects(mockProjects);
        }
        
        // Handle food types for suggestions
        if (foodTypesRes.data?.success && foodTypesRes.data?.data && Array.isArray(foodTypesRes.data.data)) {
          // Convert food types to product suggestions format
          const foodTypes = foodTypesRes.data.data;
          const foodTypeSuggestions = foodTypes.map((foodType, index) => ({
            id: index + 1000, // offset to avoid ID conflicts
            name: foodType,
            type: "CATEGORY",
            category: "Food Type"
          }));
          setProductSuggestions(foodTypeSuggestions);
        }
        
      } catch (err) {
        console.error('Error loading projects data:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectsData();
  }, [selectedProduct, selectedSupplierType, projectData]);

  // Helper function to get project status details
  const getProjectStatusDetails = (status: string): string => {
    const statusDetails = {
      'draft': 'Project is being prepared',
      'active': 'Project is actively seeking manufacturers',
      'in_review': 'Keep an eye out – we may email you for additional project details',
      'paused': 'Project has been temporarily paused',
      'completed': 'Project has been successfully completed',
      'cancelled': 'Please check your email – our team has requested additional project details'
    };
    return statusDetails[status as keyof typeof statusDetails] || 'Project status updated';
  };
  
  // Filter product suggestions based on search query
  const filteredProducts = productSearchQuery.trim() === ""
    ? productSuggestions
    : productSuggestions.filter(product => 
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
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
    console.log("Navigating to project detail with ID:", projectId);
    // Check if we have the MongoDB ObjectId
    const project = projects.find(p => p.id === projectId);
    const mongoId = project?._id;
    if (mongoId) {
      console.log("Found MongoDB ObjectId:", mongoId);
      onNext(mongoId); // Truyền MongoDB ObjectId dưới dạng chuỗi
    } else {
      console.log("No MongoDB ObjectId found, using display ID:", projectId);
      onNext(projectId);
    }
  };
  
  // Show edit popup
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditedProject({
      ...project,
      packagingObjects: project.packagingObjects || [],
      packaging: project.packaging || [],
      locationList: project.locationList || ["Global"],
      allergen: project.allergen || [],
      certification: project.certification || [],
      additional: project.additional || "",
      hideFromCurrent: project.hideFromCurrent || false
    });
    setProductSearchQuery(project.name); // Initialize the search field with current project name
    setEditPopupVisible(true);
  };
  
  // Show cancel popup
  const handleCancelProject = (project: Project) => {
    setSelectedProject(project);
    setCancelPopupVisible(true);
  };
  
  // Show delete popup
  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeletePopupVisible(true);
  };
  
  // Handle product selection from suggestions
  const handleProductSelect = (product: any) => {
    if (editedProject) {
      // Update both name and selectedProduct
      setEditedProject({
        ...editedProject, 
        name: product.name,
        selectedProduct: {
          id: product.id,
          name: product.name,
          type: product.type || 'CATEGORY',
          image: product.image
        }
      });
    }
    setProductSearchQuery(product.name);
    setShowProductSuggestions(false);
  };
  
  // Submit edited project
  const handleSubmitEdit = async () => {
    if (!editedProject || !selectedProject) return;
    
    try {
      // Check if we have the original MongoDB ObjectId
      const projectId = selectedProject._id || selectedProject.id.toString();
      
      if (!projectId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to update project: Invalid project ID"
        });
        return;
      }
      
      // Update project via API - match the ProjectData interface structure
      const updateData = {
        name: editedProject.name,
        description: editedProject.description || '',
        volume: editedProject.volume || '10K - 50K',
        units: editedProject.units || 'Units',
        anonymous: editedProject.anonymous || false,
        // Include these fields from the original project to maintain data consistency
        selectedProduct: editedProject.selectedProduct ? {
          id: editedProject.selectedProduct.id.toString(),
          name: editedProject.selectedProduct.name,
          type: editedProject.selectedProduct.type as 'PRODUCT' | 'CATEGORY' | 'FOODTYPE',
          image: editedProject.selectedProduct.image
        } : undefined,
        selectedSupplierType: editedProject.selectedSupplierType,
        packaging: editedProject.packaging || [],
        packagingObjects: editedProject.packagingObjects || [],
        location: editedProject.locationList || ["Global"],
        allergen: editedProject.allergen || [],
        certification: editedProject.certification || [],
        additional: editedProject.additional || '',
        hideFromCurrent: editedProject.hideFromCurrent || false
      };
      
      console.log("Updating project with ID:", projectId, "Data:", updateData);
      
      const response = await projectApi.updateProject(projectId, updateData);
      
      if (response.success) {
        // Update local projects list with all the updated fields
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === selectedProject.id 
              ? { 
                  ...p, 
                  name: editedProject.name,
                  description: editedProject.description,
                  volume: editedProject.volume,
                  units: editedProject.units,
                  anonymous: editedProject.anonymous,
                  selectedProduct: editedProject.selectedProduct,
                  selectedSupplierType: editedProject.selectedSupplierType,
                  packaging: editedProject.packaging,
                  packagingObjects: editedProject.packagingObjects,
                  locationList: editedProject.locationList,
                  allergen: editedProject.allergen,
                  certification: editedProject.certification,
                  additional: editedProject.additional,
                  hideFromCurrent: editedProject.hideFromCurrent
                }
              : p
          )
        );
        
        // Show success message with matching information if available
        if (response.data?.project?.matchingManufacturers) {
          const matchCount = response.data.project.matchingManufacturers.length;
          toast({
            title: "Project updated successfully!",
            description: `Found ${matchCount} matching partners for your project.`
          });
        } else {
        toast({
          title: "Success",
          description: "Project updated successfully!"
        });
        }
        
        console.log("Project updated successfully:", response.data);
      } else {
        console.error("API returned success: false", response);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update project: Unknown error"
        });
      }
      
    } catch (error: any) {
      console.error("Error updating project:", error);
      const errorMessage = error.message || error.response?.data?.message || "Unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update project: ${errorMessage}`
      });
    } finally {
    setEditPopupVisible(false);
    setSelectedProject(null);
    setEditedProject(null);
    }
  };
  
  // Confirm project cancellation
  const handleConfirmCancel = async () => {
    if (!selectedProject) return;
    
    try {
      // Check if we have the original MongoDB ObjectId
      const projectId = selectedProject._id || selectedProject.id.toString();
      
      if (!projectId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to cancel project: Invalid project ID"
        });
        return;
      }
      
      console.log("Cancelling project with ID:", projectId);
      
      // Update project status to cancelled via API
      const response = await projectApi.updateProjectStatus(
        projectId, 
        'cancelled',
        'Project cancelled by user'
      );
      
      if (response.success) {
        // Update local projects list
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === selectedProject.id 
              ? { ...p, status: 'info_required', details: 'Project has been cancelled' }
              : p
          )
        );
        console.log("Project cancelled successfully");
        toast({
          title: "Success",
          description: "Project cancelled successfully!"
        });
      } else {
        console.error("API returned success: false", response);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel project: Unknown error"
        });
      }
      
    } catch (error: any) {
      console.error("Error cancelling project:", error);
      const errorMessage = error.message || error.response?.data?.message || "Unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to cancel project: ${errorMessage}`
      });
    } finally {
    setCancelPopupVisible(false);
    setSelectedProject(null);
    }
  };
  
  // Confirm project deletion
  const handleConfirmDelete = async () => {
    if (!selectedProject) return;
    
    try {
      // Check if we have the original MongoDB ObjectId
      const projectId = selectedProject._id || selectedProject.id.toString();
      
      if (!projectId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to delete project: Invalid project ID"
        });
        return;
      }
      
      console.log("Deleting project with ID:", projectId);
      
      // Delete project via API
      const response = await projectApi.deleteProject(projectId);
      
      if (response.success) {
        // Remove project from local projects list
        setProjects(prevProjects => 
          prevProjects.filter(p => p.id !== selectedProject.id)
        );
        console.log("Project deleted successfully");
        toast({
          title: "Success",
          description: "Project deleted successfully!"
        });
      } else {
        console.error("API returned success: false", response);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete project: Unknown error"
        });
      }
      
    } catch (error: any) {
      console.error("Error deleting project:", error);
      const errorMessage = error.message || error.response?.data?.message || "Unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete project: ${errorMessage}`
      });
    } finally {
      setDeletePopupVisible(false);
      setSelectedProject(null);
    }
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
                All Projects
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
            {loading ? (
              <motion.div 
                className="py-16 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div
                  className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-muted-foreground">Loading projects...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="py-16 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} flex items-center justify-center mb-4`}>
                  <AlertTriangle className={`h-10 w-10 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`} />
                </div>
                <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Error Loading Projects</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>{error}</p>
                <motion.button
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Retry
                </motion.button>
              </motion.div>
            ) : projects.length === 0 ? (
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
                        } rounded-full flex items-center justify-center overflow-hidden border border-primary/10`}
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
                        {proj.selectedProduct?.type === 'PRODUCT' && proj.selectedProduct?.image ? (
                          <img 
                            src={proj.selectedProduct.image}
                            alt={proj.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-2xl">${getCategoryIcon(proj.name)}</span>`;
                              }
                            }}
                          />
                        ) : (
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
                            {getCategoryIcon(proj.name)}
                        </motion.span>
                        )}
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
                            {getStatusDisplayName(proj.status)}
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
                              {proj.selectedProduct?.type && (
                                <div className="flex justify-between mb-3">
                                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Type:</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    proj.selectedProduct.type === 'PRODUCT' 
                                      ? isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                                      : isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {proj.selectedProduct.type}
                                  </span>
                                </div>
                              )}
                              {proj.selectedSupplierType && (
                                <div className="flex justify-between mb-3">
                                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Looking for:</span>
                                  <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.selectedSupplierType.name}</span>
                                </div>
                              )}
                              <div className="flex justify-between mb-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Status:</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(proj.status, isDarkMode)}`}>
                                  {getStatusDisplayName(proj.status)}
                                </span>
                              </div>
                              <div className="flex justify-between mb-3">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Created:</span>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.created}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>Volume:</span>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{proj.volume || "10K - 50K"} {proj.units || "Units"}</span>
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
                                <motion.button
                                  className={`flex items-center gap-1.5 text-xs ${
                                    isDarkMode 
                                      ? 'bg-red-900/60 text-red-200 hover:bg-red-900/80' 
                                      : 'bg-red-200 text-red-700 hover:bg-red-300'
                                  } px-3 py-1.5 rounded-md`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteProject(proj)}
                                >
                                  <Trash2 size={14} />
                                  Delete Project
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
                                onClick={() => handleProductSelect(product)}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(243, 244, 246, 1)' }}
                              >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {product.image ? (
                                    <img 
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `<span class="text-xl">${getCategoryIcon(product.name)}</span>`;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span className="text-xl">{getCategoryIcon(product.name)}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{product.name}</div>
                                  <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {product.category || product.type || 'PRODUCT'}
                                  </div>
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
                      placeholder="Enter project description"
                    />
                  </div>
                  
                  {/* Additional Requirements */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Additional Requirements
                    </label>
                    <textarea 
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      rows={2}
                      value={editedProject.additional || ""}
                      onChange={(e) => setEditedProject({...editedProject, additional: e.target.value})}
                      placeholder="Enter any additional requirements..."
                    />
                  </div>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
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
                      <option value="100K - 500K">100K - 500K</option>
                      <option value="500K - 1M">500K - 1M</option>
                      <option value="1M - 5M">1M - 5M</option>
                      <option value="5M - 10M">5M - 10M</option>
                      <option value="10M+">10M+</option>
                    </select>
                  </div>
                  
                    <div className="w-1/3">
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
                  </div>
                  
                  {/* Project Visibility Options */}
                  <div className="flex flex-col space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Hide project from current manufacturers
                    </label>
                      <motion.div 
                        className={`w-11 h-6 rounded-full p-1 cursor-pointer flex items-center ${
                          editedProject.hideFromCurrent ? 'bg-primary justify-end' : 'bg-gray-300 justify-start dark:bg-slate-700'
                        }`}
                        onClick={() => setEditedProject({...editedProject, hideFromCurrent: !editedProject.hideFromCurrent})}
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
                      <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Post project anonymously
                    </label>
                      <motion.div 
                        className={`w-11 h-6 rounded-full p-1 cursor-pointer flex items-center ${
                          editedProject.anonymous ? 'bg-primary justify-end' : 'bg-gray-300 justify-start dark:bg-slate-700'
                        }`}
                        onClick={() => setEditedProject({...editedProject, anonymous: !editedProject.anonymous})}
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
      
      {/* Delete Project Popup */}
      <AnimatePresence>
        {deletePopupVisible && selectedProject && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setDeletePopupVisible(false)}
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
                      Delete Project
                    </h3>
                    <motion.button 
                      className="text-gray-400 hover:text-gray-500"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeletePopupVisible(false)}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                      isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-600'
                    }`}>
                      <Trash2 size={24} />
                    </div>
                    
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Permanently Delete Project?
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        This will permanently delete the project "{selectedProject.name}" and all associated data. This action cannot be undone.
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
                      onClick={() => setDeletePopupVisible(false)}
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
                      onClick={handleConfirmDelete}
                    >
                      <span className="flex items-center gap-1.5">
                        <Trash2 size={16} />
                        Yes, delete permanently
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
          --secondary-rgb: 100, 116, 139;
          --foreground-rgb: 2, 8, 23;
          --border-rgb: 226, 232, 240;
          --muted-rgb: 241, 245, 249;
        }
        
        [data-theme="dark"] {
          --foreground-rgb: 248, 250, 252;
          --border-rgb: 39, 39, 42;
          --muted-rgb: 39, 39, 42;
        }
        
        .project-card {
          transition: all 0.3s ease-in-out;
        }
        
        .project-detail-panel {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
        
        /* Manufacturing Projects specific styles */
        .manufacturing-project-header {
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.05) 100%);
        }
        
        .manufacturing-project-icon {
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2) 0%, rgba(var(--primary-rgb), 0.05) 100%);
        }
      `}</style>
    </div>
  );
};

export default Step3_ReviewProjects;