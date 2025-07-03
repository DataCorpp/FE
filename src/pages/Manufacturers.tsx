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
  Package
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useManufacturerFavorites } from "@/contexts/ManufacturerFavoriteContext";
import { toast } from "sonner";
import ManufacturerDetails from "@/components/ManufacturerDetails";
import { cn } from "@/lib/utils";
import { createClampedBlurVariants } from "@/hooks/use-safe-blur";
import { enhancedFuzzySearch, quickSearch } from "@/utils/searchUtils";

// API configuration - Fixed to match backend API structure
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
  establish?: number;
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

// Add these new interfaces for categorized filters
interface CategoryItem {
  id: string;
  label: string;
  count: number;
  originalValues: string[];
}

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
  const [establishYearRange, setEstablishYearRange] = useState([1500, new Date().getFullYear()]);
  const [sortBy, setSortBy] = useState("name-asc");
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(true); // Default to advanced search
  
  // Available filter options from API
  const [industries, setIndustries] = useState<string[]>([]);
  // Replace string arrays with categorized arrays
  const [locations, setLocations] = useState<CategoryItem[]>([]);
  const [certifications, setCertifications] = useState<CategoryItem[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // UI states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { favorites } = useManufacturerFavorites();
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
      certification: apiManufacturer.manufacturerSettings?.certifications?.join("; ") || 
                     (apiManufacturer.certificates ? 
                       (Array.isArray(apiManufacturer.certificates) ? 
                         apiManufacturer.certificates.join("; ") : 
                         apiManufacturer.certificates) : 
                       "Not specified"),
      establishedYear: apiManufacturer.establish || new Date(apiManufacturer.createdAt).getFullYear(),
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

  // Helper function to categorize certifications
  const categorizeCertifications = useCallback((rawCertifications: string[]): CategoryItem[] => {
    // Common certification categories
    const categories: Record<string, { pattern: RegExp, label: string }> = {
      organic: { pattern: /organic|usda|eco/i, label: "Organic" },
      iso9001: { pattern: /iso\s*9001|iso9001/i, label: "ISO 9001" },
      iso14001: { pattern: /iso\s*14001|iso14001/i, label: "ISO 14001" },
      kosher: { pattern: /kosher/i, label: "Kosher" },
      halal: { pattern: /halal/i, label: "Halal" },
      haccp: { pattern: /haccp/i, label: "HACCP" },
      gmp: { pattern: /gmp|good\s*manufacturing\s*practice/i, label: "GMP" },
      fda: { pattern: /fda|food\s*and\s*drug/i, label: "FDA" },
      fairtrade: { pattern: /fair\s*trade|fairtrade/i, label: "Fair Trade" },
      nonGMO: { pattern: /non\s*gmo|no\s*gmo/i, label: "Non-GMO" },
      glutenFree: { pattern: /gluten\s*free/i, label: "Gluten Free" },
      vegan: { pattern: /vegan/i, label: "Vegan" },
      sustainable: { pattern: /sustainable|sustainability/i, label: "Sustainable" }
    };

    // Initialize result with "Other" category
    const result: Record<string, CategoryItem> = {
      other: {
        id: "other",
        label: "Other",
        count: 0,
        originalValues: []
      }
    };

    // Initialize all categories with zero count
    Object.keys(categories).forEach(key => {
      result[key] = {
        id: key,
        label: categories[key].label,
        count: 0,
        originalValues: []
      };
    });

    // Categorize each certification
    rawCertifications.forEach(cert => {
      let matched = false;
      for (const [key, category] of Object.entries(categories)) {
        if (category.pattern.test(cert)) {
          result[key].count++;
          result[key].originalValues.push(cert);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        result.other.count++;
        result.other.originalValues.push(cert);
      }
    });

    // Convert to array and remove empty categories
    return Object.values(result)
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);

  // Helper function to categorize locations by specific city/country (second last part of address)
  const categorizeLocations = useCallback((rawLocations: string[]): CategoryItem[] => {
    const locationCounts: Record<string, { count: number; addresses: string[] }> = {};

    rawLocations.forEach((location) => {
      if (!location) return;

      const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
      let city = '';
      if (parts.length >= 2) {
        // Use the second last part (e.g., 123 St, Tokyo, Japan -> Tokyo)
        city = parts[parts.length - 2];
      } else {
        // Fallback to the only/last part
        city = parts[parts.length - 1] || location;
      }

      if (!city) return;

      if (!locationCounts[city]) {
        locationCounts[city] = {
          count: 1,
          addresses: [location],
        };
      } else {
        locationCounts[city].count += 1;
        locationCounts[city].addresses.push(location);
      }
    });

    const locationItems: CategoryItem[] = Object.entries(locationCounts).map(([city, data]) => ({
      id: city,
      label: city,
      count: data.count,
      originalValues: data.addresses,
    }));

    return locationItems.sort((a, b) => b.count - a.count);
  }, []);

  // Apply filters function - update to work with categories
  const applyFilters = useCallback((manufacturersList: Manufacturer[]) => {
    let filtered = manufacturersList;

    // Search filter - use either advanced or quick search based on setting
    if (searchTerm && searchTerm.trim()) {
      if (useAdvancedSearch) {
        // Use enhanced fuzzy search for robust, cross-field matching that tolerates messy user input
        filtered = enhancedFuzzySearch(
          filtered,
          searchTerm,
          ['name', 'description', 'industry', 'location', 'certification'],
          {
            threshold: 0.15,  // More permissive threshold for fuzzy matching
            boostExact: true,
            maxResults: 500   // Plenty of headroom for client-side filtering
          }
        );
      } else {
        // Use simple multi-term search (all terms must match at least one field)
        filtered = quickSearch(filtered, searchTerm, [
          'name', 'description', 'industry', 'location', 'certification'
        ]);
      }
    }

    // Industry filter
    if (selectedIndustry !== "all") {
      filtered = filtered.filter(manufacturer => 
        manufacturer.industry === selectedIndustry
      );
    }

    // Location filter - updated to work with categorized locations
    if (selectedLocation !== "all") {
      const locationCategory = locations.find(cat => cat.id === selectedLocation);
      if (locationCategory) {
      filtered = filtered.filter(manufacturer => 
          locationCategory.originalValues.some(location => 
            manufacturer.location.includes(location)
          )
      );
      }
    }

    // Certification filter - updated to work with categorized certifications
    if (selectedCertification !== "all") {
      const certCategory = certifications.find(cat => cat.id === selectedCertification);
      if (certCategory) {
      filtered = filtered.filter(manufacturer => 
        manufacturer.certification && 
          certCategory.originalValues.some(cert => 
            manufacturer.certification.toLowerCase().includes(cert.toLowerCase())
          )
      );
      }
    }

    // Establishment year range filter
    if (establishYearRange[0] > 1500 || establishYearRange[1] < new Date().getFullYear()) {
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

    return filtered;
  }, [searchTerm, selectedIndustry, selectedLocation, selectedCertification, establishYearRange, showFavoritesOnly, favorites, useAdvancedSearch, locations, certifications]);

  // Load filter options - updated to use categorization
  const loadFilterOptions = useCallback(async () => {
    try {
      setLoadingFilters(true);
      
      // Load all manufacturers first to extract unique values
      const response = await fetch(`${API_BASE_URL}/users/manufacturers?page=1&limit=1000`);
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
          
          // Extract unique locations and categorize them
          const uniqueLocations = [...new Set(
            manufacturersData
              .map((m: ApiManufacturer) => m.address)
              .filter((location: string) => location && location.trim())
              .sort()
          )] as string[];
          setLocations(categorizeLocations(uniqueLocations));
          
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
          setCertifications(categorizeCertifications(uniqueCertifications));
          
          // Calculate establishment year range from actual data
          const establishYears = manufacturersData
            .map((m: ApiManufacturer) => m.establish || new Date(m.createdAt).getFullYear())
            .filter((year: number) => year > 0);
          
          if (establishYears.length > 0) {
            const minYear = Math.min(...establishYears);
            const maxYear = Math.max(...establishYears);
            // Update the range if we have actual data, otherwise keep default
            if (minYear < 1500 || maxYear > new Date().getFullYear()) {
              setEstablishYearRange([Math.max(minYear, 1500), Math.min(maxYear, new Date().getFullYear())]);
            }
          }
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
  }, [categorizeLocations, categorizeCertifications]);

  // Load manufacturers from API
  const loadManufacturers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build search parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Load all for client-side filtering
      });
      
      // Add search parameters if available
      if (searchTerm && searchTerm.trim()) {
        params.set('q', searchTerm.trim());
        // Don't send advanced search parameter since backend doesn't need it anymore
        // We'll handle advanced filtering on the frontend side
      }
      
      // Add industry filter if selected
      if (selectedIndustry && selectedIndustry !== 'all') {
        params.set('industry', selectedIndustry);
      }
      
      // Add location filter if selected
      if (selectedLocation && selectedLocation !== 'all') {
        params.set('location', selectedLocation);
      }
      
      // Add year range filters if adjusted
      if (establishYearRange[0] > 1500) {
        params.set('establish_gte', establishYearRange[0].toString());
      }
      
      if (establishYearRange[1] < new Date().getFullYear()) {
        params.set('establish_lte', establishYearRange[1].toString());
      }
      
      console.log(`[REQUEST] Fetching manufacturers with params: ${params.toString()}`);
      const response = await fetch(`${API_BASE_URL}/users/manufacturers?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.manufacturers) {
        const convertedManufacturers = data.manufacturers.map(convertApiToUI);
        console.log(`[SERVER] Fetched ${data.manufacturers.length} manufacturers`);
        setManufacturers(convertedManufacturers);
        setTotalCount(data.total || convertedManufacturers.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load manufacturers');
      setManufacturers([]);
      // Show a toast notification for the error
      toast.error('Error loading manufacturers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [convertApiToUI, searchTerm, selectedIndustry, selectedLocation, establishYearRange]);

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
  
  // Debounced search effect
  useEffect(() => {
    // Only trigger search if term is at least 2 characters
    if (searchTerm.trim().length >= 2 || (searchTerm.trim().length === 0 && document.activeElement?.id !== 'search-input')) {
      const debounceTimer = setTimeout(() => {
        console.log(`[SEARCH] Debounced search for: "${searchTerm}"`);
        loadManufacturers();
      }, 500); // 500ms debounce time
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, loadManufacturers, useAdvancedSearch]);

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
    setEstablishYearRange([1500, new Date().getFullYear()]);
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
    establishYearRange[0] !== 1500 || establishYearRange[1] !== new Date().getFullYear() || showFavoritesOnly;

  const displayedManufacturers = getPaginatedResults();

  // Update the Location Filter UI to show individual locations with counts
  const LocationFilter = (
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
        <SelectContent className="rounded-xl max-h-60 overflow-y-auto">
          <SelectItem value="all">
            All Locations ({manufacturers.length})
          </SelectItem>
          
          {/* Show individual locations with counts */}
          {locations.map((locationCategory) => (
            <SelectItem 
              key={locationCategory.id} 
              value={locationCategory.id} 
              className="hover:bg-primary/10"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-500"></div>
                  <span className="font-medium">{locationCategory.label}</span>
                </div>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {locationCategory.count}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Show address details when a location is selected */}
      {selectedLocation !== "all" && (
        <div className="bg-muted/40 rounded-xl p-3 text-xs">
          <p className="text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Manufacturers in this location:</span>
          </p>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
            {locations.find(l => l.id === selectedLocation)?.originalValues.slice(0, 5).map((address, idx) => (
              <div key={idx} className="flex items-start gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1"></div>
                <span className="leading-tight">{address}</span>
              </div>
            ))}
            {(locations.find(l => l.id === selectedLocation)?.originalValues.length || 0) > 5 && (
              <div className="text-muted-foreground italic text-center pt-1">
                And {(locations.find(l => l.id === selectedLocation)?.originalValues.length || 0) - 5} more addresses...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Update the Certification Filter UI with improved categorization
  const CertificationFilter = (
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
          
          {/* Display certification categories with counts */}
          {certifications.map((certCategory) => (
            <SelectItem 
              key={certCategory.id} 
              value={certCategory.id} 
              className="hover:bg-primary/10"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  {certCategory.id === 'organic' && <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>}
                  {certCategory.id === 'iso9001' && <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>}
                  {certCategory.id === 'iso14001' && <div className="h-2.5 w-2.5 rounded-full bg-cyan-500"></div>}
                  {certCategory.id === 'kosher' && <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>}
                  {certCategory.id === 'halal' && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>}
                  {certCategory.id === 'haccp' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>}
                  {certCategory.id === 'gmp' && <div className="h-2.5 w-2.5 rounded-full bg-purple-500"></div>}
                  {certCategory.id === 'fda' && <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>}
                  {certCategory.id === 'fairtrade' && <div className="h-2.5 w-2.5 rounded-full bg-teal-500"></div>}
                  {certCategory.id === 'nonGMO' && <div className="h-2.5 w-2.5 rounded-full bg-lime-500"></div>}
                  {certCategory.id === 'glutenFree' && <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>}
                  {certCategory.id === 'vegan' && <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>}
                  {certCategory.id === 'sustainable' && <div className="h-2.5 w-2.5 rounded-full bg-sky-500"></div>}
                  {certCategory.id === 'other' && <div className="h-2.5 w-2.5 rounded-full bg-gray-500"></div>}
                  
                  <span className="truncate font-medium">{certCategory.label}</span>
                </div>
                <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                  {certCategory.count}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCertification !== "all" && (
        <div className="bg-muted/40 rounded-xl p-3 text-xs">
          <p className="text-muted-foreground mb-2 flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>Includes manufacturers with:</span>
          </p>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
            {certifications.find(c => c.id === selectedCertification)?.originalValues.slice(0, 5).map((cert, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/70"></div>
                <span className="truncate font-medium">{cert}</span>
              </div>
            ))}
            {(certifications.find(c => c.id === selectedCertification)?.originalValues.length || 0) > 5 && (
              <div className="text-muted-foreground italic text-center pt-1">
                And {(certifications.find(c => c.id === selectedCertification)?.originalValues.length || 0) - 5} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

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
                  id="search-input"
                  type="text"
                  placeholder={t('search-manufacturers-placeholder')}
                  className="pl-14 pr-14 h-18 text-base rounded-2xl border-2 border-transparent focus:border-primary/30 bg-card/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search manufacturers"
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
              
              {/* Advanced Search Toggle */}
              <div className="flex items-center justify-end mt-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="advanced-search" className="text-xs text-muted-foreground cursor-pointer">
                    {useAdvancedSearch ? "Advanced Search: ON" : "Advanced Search: OFF"}
                  </Label>
                  <button
                    onClick={() => setUseAdvancedSearch(!useAdvancedSearch)}
                    className={cn(
                      "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none",
                      useAdvancedSearch ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out",
                        useAdvancedSearch ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                  {searchTerm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-muted/50 text-xs px-2 py-1 rounded-md text-muted-foreground"
                    >
                      {filteredManufacturers.length} results
                    </motion.div>
                  )}
                </div>
              </div>
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
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Filter Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Total</span>
                          <Badge variant="outline" className="font-semibold bg-background/50">
                            {manufacturers.length}
                          </Badge>
                      </div>
                        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Filtered</span>
                          <Badge variant="outline" className={cn(
                            "font-semibold", 
                            filteredManufacturers.length < manufacturers.length 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-background/50"
                          )}>
                            {filteredManufacturers.length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Industries</span>
                          <Badge variant="outline" className="font-semibold bg-background/50">
                            {industries.length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Locations</span>
                          <Badge variant="outline" className="font-semibold bg-background/50">
                            {locations.length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 col-span-2">
                          <span className="text-muted-foreground">Certifications</span>
                          <Badge variant="outline" className="font-semibold bg-background/50">
                            {certifications.length}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Active filters summary */}
                      {hasActiveFilters && (
                        <div className="border-t border-muted pt-2 mt-1">
                          <div className="text-xs font-medium mb-1.5 text-muted-foreground">Active Filters:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedIndustry !== "all" && (
                              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                                <Building className="h-3 w-3" />
                                <span>{selectedIndustry}</span>
                              </Badge>
                            )}
                            {selectedLocation !== "all" && (
                              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                                <MapPin className="h-3 w-3" />
                                <span>{locations.find(l => l.id === selectedLocation)?.label}</span>
                              </Badge>
                            )}
                            {selectedCertification !== "all" && (
                              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                                <Award className="h-3 w-3" />
                                <span>{certifications.find(c => c.id === selectedCertification)?.label}</span>
                              </Badge>
                            )}
                            {(establishYearRange[0] > 1500 || establishYearRange[1] < new Date().getFullYear()) && (
                              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                                <Calendar className="h-3 w-3" />
                                <span>{establishYearRange[0]} - {establishYearRange[1]}</span>
                              </Badge>
                            )}
                            {showFavoritesOnly && (
                              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                                <Heart className="h-3 w-3 fill-current" />
                                <span>Favorites</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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
                    
                    {/* Location Filter - Using the updated component */}
                    {LocationFilter}
                    
                    {/* Certification Filter - Using the updated component */}
                    {CertificationFilter}
                    
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
                            min={1500}
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

