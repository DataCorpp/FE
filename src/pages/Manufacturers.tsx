import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ManufacturerCard from "@/components/ManufacturerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Filter, 
  MapPin, 
  X, 
  SlidersHorizontal, 
  Heart,
  ArrowUpDown,
  Calendar,
  Building,
  Building2,
  Award,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Star,
  Package
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useManufacturerFavorites } from "@/contexts/ManufacturerFavoriteContext";
import { useManufacturerCompare } from "@/contexts/ManufacturerCompareContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ManufacturerDetails from "@/components/ManufacturerDetails";
import { cn } from "@/lib/utils";
import { manufacturerApi } from "@/lib/api";
import { createSafeBlurVariants, createClampedBlurVariants } from "@/hooks/use-safe-blur";

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Updated interface to match User model from backend exactly
export interface ApiManufacturer {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  status: string;
  profileComplete: boolean;
  lastLogin: string;
  phone?: string;
  website?: string;
  websiteUrl?: string;
  address?: string;
  description?: string;
  companyDescription?: string;
  industry?: string;
  certificates?: string | string[];
  avatar?: string;
  connectionPreferences?: {
    connectWith: string[];
    industryInterests: string[];
    interests: string[];
    lookingFor: string[];
  };
  manufacturerSettings?: {
    productionCapacity: number;
    certifications: string[];
    preferredCategories: string[];
    minimumOrderValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Simplified interface for UI components - only using actual DB fields
interface Manufacturer {
  id: number;
  name: string;
  location: string;
  logo: string;
  industry: string;
  certification: string;
  establishedYear: number;
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  description?: string;
}

// Sort options based on actual data
const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "establish-desc", label: "Newest First" },
  { value: "establish-asc", label: "Oldest First" },
  { value: "industry-asc", label: "Industry A-Z" },
  { value: "location-asc", label: "Location A-Z" }
];

// Enhanced animation variants with improved physics
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
      ease: [0.23, 1, 0.32, 1],
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 32, 
    scale: 0.94,
    ...createClampedBlurVariants('md', 'none').hidden
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    ...createClampedBlurVariants('md', 'none').visible,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      mass: 0.9,
      duration: 0.8,
      // Prevent overshoot that could cause negative values
      restDelta: 0.001,
      restSpeed: 0.001
    }
  },
  hover: {
    y: -12,
    scale: 1.03,
    filter: "blur(0px)", // Explicitly set to avoid interpolation issues
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 18,
      mass: 0.6
    }
  }
};

const headerVariants = {
  hidden: { 
    opacity: 0, 
    y: -32,
    scale: 0.96
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1]
    } 
  }
};

const filterVariants = {
  hidden: { 
    opacity: 0, 
    x: -32, 
    scale: 0.92,
    ...createClampedBlurVariants('md', 'none').hidden
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    ...createClampedBlurVariants('md', 'none').visible,
    transition: { 
      type: "spring", 
      stiffness: 280,
      damping: 24,
      mass: 0.8,
      duration: 0.7,
      // Prevent overshoot that could cause negative values
      restDelta: 0.001,
      restSpeed: 0.001
    } 
  },
  exit: { 
    opacity: 0, 
    x: -32,
    scale: 0.92,
    ...createClampedBlurVariants('md', 'none').hidden,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    } 
  }
};

// Add search bar focus and hover animation variants
const searchBarVariants = {
  unfocused: {
    scale: 1,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  focused: {
    scale: 1.02,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};

// Add new smooth transition variants
const smoothFadeVariants = {
  hidden: { 
    opacity: 0,
    y: 16
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05
    }
  }
};

const Manufacturers = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for manufacturers data
  const [apiManufacturers, setApiManufacturers] = useState<ApiManufacturer[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCertification, setSelectedCertification] = useState<string>("all");
  const [establishYearRange, setEstablishYearRange] = useState([1950, new Date().getFullYear()]);
  const [sortBy, setSortBy] = useState("name-asc");
  
  // Available filter options from API
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // UI states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { favorites, toggleFavorite } = useManufacturerFavorites();
  const { compareItems, toggleCompare, clearCompare } = useManufacturerCompare();
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Page title effect
  useEffect(() => {
    document.title = "Manufacturers - CPG Matchmaker";
  }, []);

  // Function to convert API manufacturer to UI format - using User model fields
  const convertApiToUI = useCallback((apiManufacturer: ApiManufacturer): Manufacturer => {
    return {
      id: parseInt(apiManufacturer._id.slice(-8), 16) || Math.random(), // Use last 8 chars of ObjectId
      name: apiManufacturer.companyName || apiManufacturer.name,
      location: apiManufacturer.address || "Not specified",
      logo: apiManufacturer.avatar || "/placeholder-logo.png",
      industry: apiManufacturer.industry || "Not specified",
      certification: apiManufacturer.manufacturerSettings?.certifications?.join(", ") || 
                     (apiManufacturer.certificates ? 
                       (Array.isArray(apiManufacturer.certificates) ? 
                         apiManufacturer.certificates.join(", ") : 
                         apiManufacturer.certificates) : 
                       "Not specified"),
      establishedYear: new Date(apiManufacturer.createdAt).getFullYear(),
      contact: {
        email: apiManufacturer.email,
        phone: apiManufacturer.phone,
        website: apiManufacturer.websiteUrl || apiManufacturer.website
      },
      description: apiManufacturer.companyDescription || apiManufacturer.description
    };
  }, []);

  // Apply sorting function - moved before loadManufacturers to fix hoisting issue
  const applySorting = useCallback((data: Manufacturer[], sortOption: string): Manufacturer[] => {
    const sortedData = [...data];
    
    switch (sortOption) {
      case 'name-asc':
        return sortedData.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sortedData.sort((a, b) => b.name.localeCompare(a.name));
      case 'establish-asc':
        return sortedData.sort((a, b) => a.establishedYear - b.establishedYear);
      case 'establish-desc':
        return sortedData.sort((a, b) => b.establishedYear - a.establishedYear);
      case 'industry-asc':
        return sortedData.sort((a, b) => a.industry.localeCompare(b.industry));
      case 'location-asc':
        return sortedData.sort((a, b) => a.location.localeCompare(b.location));
      default:
        return sortedData;
    }
  }, []);

  // Apply filters function
  const applyFilters = useCallback((manufacturersList: Manufacturer[]) => {
    let filtered = manufacturersList;

    // Search filter - search in name, description, and industry
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(manufacturer => 
        manufacturer.name.toLowerCase().includes(term) ||
        (manufacturer.description && manufacturer.description.toLowerCase().includes(term)) ||
        manufacturer.industry.toLowerCase().includes(term) ||
        manufacturer.location.toLowerCase().includes(term)
      );
    }

    // Industry filter
    if (selectedIndustry !== "all") {
      filtered = filtered.filter(manufacturer => 
        manufacturer.industry === selectedIndustry
      );
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(manufacturer => 
        manufacturer.location === selectedLocation
      );
    }

    // Certification filter
    if (selectedCertification !== "all") {
      filtered = filtered.filter(manufacturer => 
        manufacturer.certification && 
        manufacturer.certification.toLowerCase().includes(selectedCertification.toLowerCase())
      );
    }

    // Establishment year range filter
    if (establishYearRange[0] > 1950 || establishYearRange[1] < new Date().getFullYear()) {
      filtered = filtered.filter(manufacturer => {
        const year = manufacturer.establishedYear;
        return year >= establishYearRange[0] && year <= establishYearRange[1];
      });
    }

    // Favorites filter
    if (showFavoritesOnly) {
      const favoriteIds = favorites.map(fav => fav.id);
      filtered = filtered.filter(manufacturer => 
        favoriteIds.includes(manufacturer.id)
      );
    }

    // console.log(`Filtered manufacturers: ${filtered.length} out of ${manufacturersList.length}`);
    return filtered;
  }, [searchTerm, selectedIndustry, selectedLocation, selectedCertification, establishYearRange, showFavoritesOnly, favorites]);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      setLoadingFilters(true);
      
      // Load all manufacturers first to extract unique values
      const response = await fetch(`${API_BASE_URL}/api/users/manufacturers?page=1&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.manufacturers) {
          const manufacturersData = data.manufacturers;
          
          // Extract unique industries
          const uniqueIndustries = [...new Set(
            manufacturersData
              .map((m: ApiManufacturer) => m.industry)
              .filter((industry: string) => industry && industry.trim())
              .sort()
          )] as string[];
          setIndustries(uniqueIndustries);
          
          // Extract unique locations
          const uniqueLocations = [...new Set(
            manufacturersData
              .map((m: ApiManufacturer) => m.address)
              .filter((location: string) => location && location.trim())
              .sort()
          )] as string[];
          setLocations(uniqueLocations);
          
          // Extract unique certifications - handle both single and multiple certs
          const uniqueCertifications = [...new Set(
            manufacturersData
              .flatMap((m: ApiManufacturer) => {
                if (!m.certificates) return [];
                if (Array.isArray(m.certificates)) {
                  return (m.certificates as string[]).map(cert => cert.trim());
                } else {
                  return [(m.certificates as string).trim()];
                }
              })
              .sort()
          )] as string[];
          setCertifications(uniqueCertifications);
          
          // console.log('Filter options loaded:', {
          //   industries: uniqueIndustries.length,
          //   locations: uniqueLocations.length,
          //   certifications: uniqueCertifications.length
          // });
        }
      }
      
    } catch (error) {
      console.error('Error loading filter options:', error);
      // Fallback to empty arrays
      setIndustries([]);
      setLocations([]);
      setCertifications([]);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // Load manufacturers from API
  const loadManufacturers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Load all for client-side filtering
      });
      
      const response = await fetch(`${API_BASE_URL}/api/users/manufacturers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.manufacturers) {
        const convertedManufacturers = data.manufacturers.map(convertApiToUI);
        // console.log('Loaded manufacturers:', convertedManufacturers.length, convertedManufacturers); // Debug log
        setManufacturers(convertedManufacturers);
        setTotalCount(data.total || convertedManufacturers.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load manufacturers');
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  }, [convertApiToUI]);

  // Search and filter functions - Updated to match SearchPanel interface
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query || "");
    setCurrentPage(1);
  }, []);

  const handleIndustryFilter = useCallback((industry: string) => {
    setSelectedIndustry(industry === "" ? "all" : industry);
    setCurrentPage(1);
  }, []);

  const handleLocationFilter = useCallback((location: string) => {
    setSelectedLocation(location === "" ? "all" : location);
    setCurrentPage(1);
  }, []);

  // Initial load
  useEffect(() => {
    loadFilterOptions();
    loadManufacturers();
  }, [loadFilterOptions, loadManufacturers]);

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    if (manufacturers.length > 0) {
      const filtered = applyFilters(manufacturers);
      const sorted = applySorting(filtered, sortBy);
      // console.log('Filtered and sorted manufacturers:', filtered.length, sorted.length); // Debug log
      setFilteredManufacturers(sorted);
      
      // Update pagination
      const itemsPerPage = 12;
      const newTotalPages = Math.ceil(sorted.length / itemsPerPage);
      setTotalPages(newTotalPages);
      
      // Adjust current page if necessary
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    } else {
      setFilteredManufacturers([]);
    }
  }, [manufacturers, applyFilters, applySorting, sortBy, currentPage]);

  // Update search params
  useEffect(() => {
    const manufacturerId = searchParams.get("id");
    if (manufacturerId) {
      const manufacturer = manufacturers.find(m => m.id === parseInt(manufacturerId));
      if (manufacturer) {
        setSelectedManufacturer(manufacturer);
        setShowDetails(true);
      }
    }

    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    
    if (showFavoritesOnly) {
      params.set("favorites", "true");
    } else {
      params.delete("favorites");
    }
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, showFavoritesOnly, searchParams, setSearchParams, manufacturers]);

  // Check for favorites query parameter
  useEffect(() => {
    const showFavorites = searchParams.get("favorites") === "true";
    if (showFavorites) {
      setShowFavoritesOnly(true);
    }
  }, [searchParams]);

  // Scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedIndustry("all");
    setSelectedLocation("all");
    setSelectedCertification("all");
    setSearchTerm("");
    setEstablishYearRange([1950, new Date().getFullYear()]);
    setSortBy("name-asc");
    setShowFavoritesOnly(false);
    setCurrentPage(1);
    toast.success('Filters cleared');
  }, []);

  const toggleFavoritesView = useCallback(() => {
    if (showFavoritesOnly) {
      clearFilters();
    }
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(1);
  }, [showFavoritesOnly, clearFilters]);

  const handleViewDetails = useCallback((id: number) => {
    const manufacturer = manufacturers.find(m => m.id === id);
    if (manufacturer) {
      setSelectedManufacturer(manufacturer);
      setShowDetails(true);
    }
  }, [manufacturers]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    loadManufacturers();
    loadFilterOptions();
    toast.success('Data refreshed');
  }, [loadManufacturers, loadFilterOptions]);

  // Get paginated results
  const getPaginatedResults = useCallback(() => {
    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    return filteredManufacturers.slice(startIndex, endIndex);
  }, [filteredManufacturers, currentPage]);

  const hasActiveFilters = selectedIndustry !== "all" || selectedLocation !== "all" || selectedCertification !== "all" || searchTerm || 
    establishYearRange[0] !== 1950 || establishYearRange[1] !== new Date().getFullYear() || showFavoritesOnly;

  const displayedManufacturers = getPaginatedResults();

  // Debug info
  // console.log('Debug info:', {
  //   totalManufacturers: manufacturers.length,
  //   filteredManufacturers: filteredManufacturers.length,
  //   displayedManufacturers: displayedManufacturers.length,
  //   currentPage,
  //   totalPages,
  //   hasActiveFilters,
  //   filters: {
  //     searchTerm,
  //     selectedIndustry,
  //     selectedLocation,
  //     establishYearRange,
  //     showFavoritesOnly
  //   }
  // });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/10">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 pt-20 pb-12 max-w-[1600px]"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="w-full">
          {/* Enhanced Header Section */}
          <motion.div 
            className="text-center mb-12 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/120 to-accent">
                {t('manufacturers-title')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t('manufacturers-description')}
              </p>
              {filteredManufacturers.length > 0 && (
                <motion.div 
                className="flex items-center justify-center gap-3 text-sm text-muted-foreground bg-card/40 backdrop-blur-sm rounded-full px-6 py-3 border border-muted/30 mx-auto w-fit"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20, 
                  delay: 0.6,
                  duration: 0.8
                }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">{filteredManufacturers.length} manufacturers founds</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
            
          {/* Enhanced Control Bar */}
          <motion.div 
            className="mb-8 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Search Bar */}
            <motion.div variants={itemVariants} className="relative max-w-5xl mx-auto">
              <motion.div
                className="relative"
                variants={searchBarVariants}
                initial="unfocused"
                whileHover="focused"
                whileFocus="focused"
              >
                <motion.div
                  className="absolute left-4 top-1/4 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                  animate={{
                    scale: searchTerm ? 0.9 : 1,
                    color: searchTerm ? "#6366f1" : "#64748b"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>

                <Input
                  type="search"
                  placeholder={t('search-manufacturers-placeholder')}
                  className="pl-14 pr-14 h-18 text-base rounded-2xl border-2 border-transparent focus:border-primary/30 bg-card/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <AnimatePresence>
                    {searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-muted rounded-full h-10 w-10"
                          onClick={() => handleSearch("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 -z-10"
                  animate={{
                    opacity: searchTerm ? 0.3 : 0,
                    scale: searchTerm ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>

            {/* Control Row */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground rounded-xl h-10 px-4"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleFavoritesView}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground rounded-xl h-10 px-4",
                    showFavoritesOnly && "bg-primary text-primary-foreground"
                  )}
                >
                  <Heart className={cn(
                    "h-4 w-4 transition-all",
                    (favorites.length > 0 || showFavoritesOnly) ? "fill-current" : ""
                  )} />
                  {t('favorites-button')}
                  {favorites.length > 0 && (
                    <Badge variant="secondary" className="bg-background/20 ml-1">
                      {favorites.length}
                    </Badge>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground rounded-xl h-10 px-4",
                    showFilters && "bg-primary text-primary-foreground"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  {t('filters-heading')}
                  {/* {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 bg-background/20">
                      Active
                    </Badge>
                  )} */}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-muted/50 rounded-xl p-1">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg h-9 w-9"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg h-9 w-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-52 bg-card/60 backdrop-blur-sm rounded-xl h-10">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Active Filters */}
          {/* <AnimatePresence>
            {hasActiveFilters && (
              <motion.div 
                className="mb-8 flex flex-wrap items-center gap-3 bg-card/40 backdrop-blur-sm p-6 rounded-2xl border shadow-sm"
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <span className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('active-filters')}
                </span>
                
                {showFavoritesOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <Heart className="h-3 w-3" />
                    {t('favorites-only')}
                    <Button size="sm" variant="ghost" className="h-auto p-0 ml-1" onClick={() => setShowFavoritesOnly(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              
                {selectedIndustry && selectedIndustry !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <Building className="h-3 w-3" />
                    {selectedIndustry}
                    <Button size="sm" variant="ghost" className="h-auto p-0 ml-1" onClick={() => setSelectedIndustry("all")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              
                {selectedLocation && selectedLocation !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <MapPin className="h-3 w-3" />
                    {selectedLocation}
                    <Button size="sm" variant="ghost" className="h-auto p-0 ml-1" onClick={() => setSelectedLocation("all")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {selectedCertification && selectedCertification !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <Award className="h-3 w-3" />
                    {selectedCertification}
                    <Button size="sm" variant="ghost" className="h-auto p-0 ml-1" onClick={() => setSelectedCertification("all")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {(establishYearRange[0] !== 1950 || establishYearRange[1] !== new Date().getFullYear()) && (
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <Calendar className="h-3 w-3" />
                    {establishYearRange[0]} - {establishYearRange[1]}
                    <Button size="sm" variant="ghost" className="h-auto p-0 ml-1" onClick={() => setEstablishYearRange([1950, new Date().getFullYear()])}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="text-xs hover:bg-destructive hover:text-destructive-foreground rounded-lg h-8 px-3"
                >
                  {t('clear-all')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence> */}
          
          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Enhanced Filter Sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  variants={filterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="xl:col-span-1 space-y-6 bg-card/40 backdrop-blur-sm p-6 rounded-2xl shadow-sm border h-fit sticky top-24"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      {t('filters-heading')}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="xl:hidden rounded-full"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Filter Summary */}
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Package className="h-4 w-4 text-primary" />
                        Filter Summary
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Total: {manufacturers.length} manufacturers</div>
                        <div>Filtered: {filteredManufacturers.length} results</div>
                        <div>Industries: {industries.length}</div>
                        <div>Locations: {locations.length}</div>
                        <div>Certifications: {certifications.length}</div>
                      </div>
                    </div>

                    {/* Industry Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        Industry
                        {loadingFilters && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </Label>
                      <Select 
                        value={selectedIndustry} 
                        onValueChange={setSelectedIndustry}
                        disabled={loadingFilters}
                      >
                        <SelectTrigger className="w-full rounded-xl transition-all duration-200 hover:border-primary/40">
                          <SelectValue placeholder={loadingFilters ? "Loading..." : "All Industries"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">
                            All Industries ({manufacturers.length})
                          </SelectItem>
                          {industries.map((industry) => {
                            const count = manufacturers.filter(m => m.industry === industry).length;
                            return (
                              <SelectItem key={industry} value={industry} className="hover:bg-primary/10">
                                <div className="flex items-center justify-between w-full">
                                  <span>{industry}</span>
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {count}
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Location Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Location
                        {loadingFilters && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </Label>
                      <Select 
                        value={selectedLocation} 
                        onValueChange={setSelectedLocation}
                        disabled={loadingFilters}
                      >
                        <SelectTrigger className="w-full rounded-xl transition-all duration-200 hover:border-primary/40">
                          <SelectValue placeholder={loadingFilters ? "Loading..." : "All Locations"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">
                            All Locations ({manufacturers.length})
                          </SelectItem>
                          {locations.map((location) => {
                            const count = manufacturers.filter(m => m.location === location).length;
                            return (
                              <SelectItem key={location} value={location} className="hover:bg-primary/10">
                                <div className="flex items-center justify-between w-full">
                                  <span>{location}</span>
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {count}
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Certification Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Certification
                        {loadingFilters && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </Label>
                      <Select 
                        value={selectedCertification} 
                        onValueChange={setSelectedCertification}
                        disabled={loadingFilters}
                      >
                        <SelectTrigger className="w-full rounded-xl transition-all duration-200 hover:border-primary/40">
                          <SelectValue placeholder={loadingFilters ? "Loading..." : "All Certifications"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-60">
                          <SelectItem value="all">
                            All Certifications ({manufacturers.length})
                          </SelectItem>
                          {certifications.map((certification) => {
                            const count = manufacturers.filter(m => 
                              m.certification && m.certification.toLowerCase().includes(certification.toLowerCase())
                            ).length;
                            return (
                              <SelectItem key={certification} value={certification} className="hover:bg-primary/10">
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate">{certification}</span>
                                  <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                                    {count}
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Establishment Year Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Established Year
                      </Label>
                      <div className="pt-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium min-w-[3rem]">{establishYearRange[0]}</span>
                          <Slider
                            value={establishYearRange}
                            onValueChange={setEstablishYearRange}
                            min={1950}
                            max={new Date().getFullYear()}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium min-w-[3rem]">{establishYearRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-destructive hover:text-destructive-foreground rounded-xl"
                    onClick={clearFilters}
                  >
                    {t('clear-all-filters')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Manufacturers Grid */}
            <motion.div 
              className={`${showFilters ? 'xl:col-span-4' : 'xl:col-span-5'}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                <motion.div 
                  className="flex items-center justify-center py-20"
                  variants={smoothFadeVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                      <div className="absolute inset-0 h-16 w-16 mx-auto border-4 border-primary/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-foreground">Loading manufacturers...</p>
                      <p className="text-sm text-muted-foreground">Please wait while we fetch the latest data</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                  className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-2xl border shadow-sm"
                  variants={smoothFadeVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="space-y-6">
                    <div className="relative">
                      <AlertCircle className="h-20 w-20 mx-auto text-destructive" />
                      <div className="absolute inset-0 h-20 w-20 mx-auto border-4 border-destructive/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-semibold text-destructive">Error Loading Manufacturers</p>
                      <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                      <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        onClick={handleRefresh} 
                        className="hover:bg-primary/90 rounded-xl transition-all duration-300"
                        size="lg"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="rounded-xl transition-all duration-300"
                        size="lg"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : displayedManufacturers.length > 0 ? (
                <>
                  <motion.div 
                    className={cn(
                      "gap-6",
                      viewMode === 'grid' 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr" 
                        : "space-y-4"
                    )}
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence mode="popLayout">
                      {displayedManufacturers.map((manufacturer, index) => (
                        <motion.div
                          key={manufacturer.id}
                          layout
                          layoutId={`manufacturer-${manufacturer.id}`}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          whileHover="hover"
                          transition={{ 
                            layout: { type: "spring", stiffness: 300, damping: 25 },
                            delay: index * 0.02 
                          }}
                          className={cn(
                            "h-full",
                            viewMode === 'grid' ? "min-h-[480px]" : ""
                          )}
                          style={{ 
                            gridRowEnd: viewMode === 'grid' ? 'span 1' : 'auto' 
                          }}
                        >
                          <ManufacturerCard 
                            manufacturer={manufacturer}
                            onViewDetails={handleViewDetails}
                            viewMode={viewMode}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <motion.div 
                      className="flex justify-center mt-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
                    >
                      <div className="flex gap-3 items-center bg-card/60 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-muted/30">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-6 h-12 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="h-5 w-5 mr-2 -rotate-90" />
                            {t('previous')}
                          </Button>
                        </motion.div>

                        <div className="flex gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = 1;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            if (pageNum >= 1 && pageNum <= totalPages) {
                              return (
                                <motion.div key={pageNum} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                      "w-12 h-12 rounded-xl shadow-lg transition-all duration-300",
                                      currentPage === pageNum && "shadow-xl scale-110"
                                    )}
                                  >
                                    {pageNum}
                                  </Button>
                                </motion.div>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-6 h-12 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('next')}
                            <ChevronUp className="h-5 w-5 ml-2 rotate-90" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-2xl border shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {showFavoritesOnly ? (
                    <>
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                      <p className="text-xl font-medium text-foreground/70 mb-2">
                        {t('no-favorite-manufacturers')}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {t('add-manufacturers-favorites')}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowFavoritesOnly(false)}
                        className="rounded-xl"
                      >
                        {t('view-all-manufacturers')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Building className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                      <p className="text-xl font-medium text-foreground/70 mb-2">
                        {t('no-manufacturers-found')}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {t('adjust-filters-or-search')}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="rounded-xl"
                      >
                        {t('clear-all-filters')}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Enhanced Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm bg-primary/90 border border-primary/0"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ChevronUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Manufacturer Details Modal */}
      {selectedManufacturer && (
        <ManufacturerDetails
          manufacturer={selectedManufacturer}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedManufacturer(null);
          }}
        />
      )}
    </div>
  );
};

export default Manufacturers;
