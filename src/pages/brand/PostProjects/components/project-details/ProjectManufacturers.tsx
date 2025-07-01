import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Building, Globe, Mail, Phone, MapPin, Award, ChevronDown, ChevronUp, Info, MessageSquare, Calendar, Factory, Filter, ArrowUpDown, Star, StarHalf, Users, Briefcase, Layers, Search, RefreshCw, Share2, Download, Printer, Plus, Minus, BarChart3, Clipboard, CheckCircle2, Package } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { projectApi } from "../../../../../lib/api";
import ContactManufacturerForm from "../popups/ContactManufacturerForm";
import { Badge } from "../../../../../components/ui/badge";
import { Tooltip } from "../../../../../components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../components/ui/popover";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { Label } from "../../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";

// Define more specific types
interface Manufacturer {
  id: string;
  name?: string;
  companyName?: string;
  logo?: string;
  avatar?: string;
  location?: string;
  address?: string;
  description?: string;
  companyDescription?: string;
  establish?: number | string;
  establishYear?: number | string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  certificates?: string[] | string;
  manufacturerSettings?: {
    certifications?: string[];
    productionCapacity?: number | string;
    [key: string]: any;
  };
  matchScore?: number;
  matchDetails?: Record<string, any>;
  status?: string;
  [key: string]: any;
}

interface ProjectManufacturersProps {
  manufacturers: Manufacturer[];
  projectDetails: any;
  isDarkMode: boolean;
}

// Filter options
type SortOption = 'matchScore' | 'name' | 'location' | 'status';
type FilterOption = 'all' | 'contacted' | 'responded' | 'notContacted' | 'highMatch' | 'hasCertifications';

// Component to display match quality as a visual bar with enhanced visuals
const MatchQualityBar: React.FC<{ score: number; isDarkMode: boolean; showLabel?: boolean }> = ({ 
  score, 
  isDarkMode,
  showLabel = true 
}) => {
  // Normalize score to percentage
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Determine color based on score with gradient effect
  const getColor = () => {
    if (normalizedScore >= 80) return isDarkMode ? 'from-green-500 to-green-400' : 'from-green-600 to-green-500';
    if (normalizedScore >= 60) return isDarkMode ? 'from-blue-500 to-blue-400' : 'from-blue-600 to-blue-500';
    if (normalizedScore >= 40) return isDarkMode ? 'from-yellow-500 to-yellow-400' : 'from-yellow-600 to-yellow-500';
    return isDarkMode ? 'from-orange-500 to-orange-400' : 'from-orange-600 to-orange-500';
  };

  // Get text color for score
  const getTextColor = () => {
    if (normalizedScore >= 80) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (normalizedScore >= 60) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (normalizedScore >= 40) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-orange-400' : 'text-orange-600';
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>Match Score</span>
          <span className={`font-medium ${getTextColor()}`}>{normalizedScore}%</span>
        </div>
      )}
      <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} relative`}
        >
          {normalizedScore > 75 && (
            <motion.div 
              className="absolute inset-0 opacity-30 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Match criteria display component with enhanced visuals
const MatchCriteria: React.FC<{ 
  criteria: string, 
  matches: boolean, 
  isDarkMode: boolean,
  importance?: 'high' | 'medium' | 'low',
  tooltip?: string
}> = ({ 
  criteria, 
  matches, 
  isDarkMode,
  importance = 'medium',
  tooltip
}) => {
  // Get background color based on match status and importance
  const getBgColor = () => {
    if (matches) {
      if (importance === 'high') {
        return isDarkMode ? 'bg-green-900/20' : 'bg-green-50';
      } else if (importance === 'medium') {
        return isDarkMode ? 'bg-green-900/10' : 'bg-green-50/80';
      }
      return isDarkMode ? 'bg-green-900/5' : 'bg-green-50/60';
    } else {
      return isDarkMode ? 'bg-transparent' : 'bg-transparent';
    }
  };

  const content = (
    <div className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors ${getBgColor()}`}>
      {matches ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Check className={isDarkMode ? 'text-green-400' : 'text-green-600'} size={16} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <X className={isDarkMode ? 'text-red-400' : 'text-red-600'} size={16} />
        </motion.div>
      )}
      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {criteria}
      </span>
      {importance === 'high' && (
        <Badge variant="outline" className={`ml-auto text-[10px] py-0 h-4 ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          Critical
        </Badge>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-[200px]">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Utility: Convert productionCapacity to range label
function getCapacityRangeLabel(capacity?: number | string): string {
  if (!capacity) return "N/A";
  if (typeof capacity === "string" && isNaN(Number(capacity))) return capacity; // đã là range string
  const value = typeof capacity === "string" ? Number(capacity) : capacity;
  if (value < 100000) return "Below 100K";
  if (value < 500000) return "100K - 500K";
  if (value < 1000000) return "500K - 1M";
  if (value < 5000000) return "1M - 5M";
  if (value < 10000000) return "5M - 10M";
  return "1M+";
}

// Helper: Parse volume range string (e.g. "100K - 500K") to min/max number
function parseVolumeRange(volume?: string): { min: number, max: number } | null {
  if (!volume) return null;
  // Normalize
  const cleaned = volume.replace(/\s|\+/g, '');
  // e.g. "100K-500K", "1M-5M", "10M+"
  // Support both dash and en dash
  const match = cleaned.match(/(\d+(?:\.?\d+)?)([KkMm]?)(?:[-–](\d+(?:\.?\d+)?)([KkMm]?))?/);
  if (!match) return null;
  const num = (n: string, unit: string) => {
    let v = parseFloat(n);
    if (unit.toUpperCase() === 'K') v *= 1e3;
    if (unit.toUpperCase() === 'M') v *= 1e6;
    return v;
  };
  const min = num(match[1], match[2] || '');
  let max = min;
  if (match[3]) max = num(match[3], match[4] || '');
  else if (cleaned.endsWith('+')) max = Infinity;
  return { min, max };
}

const ProjectManufacturers: React.FC<ProjectManufacturersProps> = ({ manufacturers, projectDetails, isDarkMode }) => {
  // Core state
  const [expandedManufacturer, setExpandedManufacturer] = useState<string | null>(null);
  const [contactFormVisible, setContactFormVisible] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [contactStatus, setContactStatus] = useState<Record<string, string>>({});
  
  // UI state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("matchScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Animation state
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Helper to render nested match detail values safely
  const formatMatchValue = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'object') {
      if ('details' in val) {
        return val.details;
      }
      if ('score' in val && 'maxScore' in val) {
        return `${val.score}/${val.maxScore}`;
      }
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };
  
  // Toggle selection of a manufacturer for comparison
  const toggleManufacturerSelection = (manufacturerId: string) => {
    setSelectedManufacturers(prev => {
      if (prev.includes(manufacturerId)) {
        return prev.filter(id => id !== manufacturerId);
      } else {
        // Limit to 3 manufacturers for comparison
        if (prev.length < 3) {
          return [...prev, manufacturerId];
        }
        return prev;
      }
    });
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      toggleSortDirection();
    } else {
      setSortBy(option);
      setSortDirection("desc");
    }
  };
  
  // Filter and sort manufacturers
  const filteredAndSortedManufacturers = useMemo(() => {
    // Start with search filter
    let result = manufacturers.filter(manufacturer => {
      const searchTermLower = searchTerm.toLowerCase();
      const name = (manufacturer.name || manufacturer.companyName || "").toLowerCase();
      const location = (manufacturer.location || manufacturer.address || "").toLowerCase();
      const description = (manufacturer.description || manufacturer.companyDescription || "").toLowerCase();
      
      return (
        name.includes(searchTermLower) ||
        location.includes(searchTermLower) ||
        description.includes(searchTermLower)
      );
    });
    
    // Apply category filter
    if (filterOption !== "all") {
      switch (filterOption) {
        case "contacted":
          result = result.filter(m => 
            contactStatus[m.id] === "contacted" || m.status === "contacted"
          );
          break;
        case "responded":
          result = result.filter(m => 
            contactStatus[m.id] === "responded" || m.status === "responded"
          );
          break;
        case "notContacted":
          result = result.filter(m => 
            !contactStatus[m.id] && m.status !== "contacted" && m.status !== "responded"
          );
          break;
        case "highMatch":
          result = result.filter(m => {
            const score = typeof m.matchScore === 'number' 
              ? Math.min(Math.max(m.matchScore * 100, 0), 100) 
              : m.matchScore;
            return score >= 70;
          });
          break;
        case "hasCertifications":
          result = result.filter(m => {
            return (
              (Array.isArray(m.certificates) && m.certificates.length > 0) ||
              (m.manufacturerSettings?.certifications && 
               Array.isArray(m.manufacturerSettings.certifications) && 
               m.manufacturerSettings.certifications.length > 0)
            );
          });
          break;
      }
    }
    
    // Apply tab filter
    if (activeTab === "selected" && selectedManufacturers.length > 0) {
      result = result.filter(m => selectedManufacturers.includes(m.id));
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case "matchScore":
          valueA = typeof a.matchScore === 'number' ? a.matchScore : 0;
          valueB = typeof b.matchScore === 'number' ? b.matchScore : 0;
          break;
        case "name":
          valueA = (a.name || a.companyName || "").toLowerCase();
          valueB = (b.name || b.companyName || "").toLowerCase();
          break;
        case "location":
          valueA = (a.location || a.address || "").toLowerCase();
          valueB = (b.location || b.address || "").toLowerCase();
          break;
        case "status":
          valueA = contactStatus[a.id] || a.status || "notContacted";
          valueB = contactStatus[b.id] || b.status || "notContacted";
          break;
        default:
          valueA = a[sortBy];
          valueB = b[sortBy];
      }
      
      // Handle string comparison
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Handle number comparison
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  }, [manufacturers, searchTerm, sortBy, sortDirection, filterOption, contactStatus, selectedManufacturers, activeTab]);

  // Function to contact a manufacturer
  const handleContactManufacturer = async (manufacturerId: string, message: string) => {
    if (!projectDetails?.id) return;
    try {
      const response = await projectApi.contactManufacturer(String(projectDetails.id), manufacturerId, { message });
      console.log('Contact manufacturer response:', response);

      // Update contact status for this manufacturer
      setContactStatus(prev => ({
        ...prev,
        [manufacturerId]: 'contacted'
      }));

      // Optionally update manufacturer list status locally
      // Success toast/notification can be placed here
    } catch (error) {
      console.error('Error contacting manufacturer:', error);
      // Error notification would go here
    }
  };

  // Toggle manufacturer details
  const toggleManufacturerDetails = (manufacturerId: string) => {
    if (expandedManufacturer === manufacturerId) {
      setExpandedManufacturer(null);
    } else {
      setExpandedManufacturer(manufacturerId);
    }
  };

  // Open contact form for a manufacturer
  const openContactForm = (manufacturer: any) => {
    setSelectedManufacturer(manufacturer);
    setContactFormVisible(true);
  };

  // Get manufacturer status label
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'contacted':
        return 'Contacted';
      case 'responded':
        return 'Responded';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Contacted';
    }
  };

  // Get manufacturer status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'contacted':
        return isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'responded':
        return isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700';
      case 'rejected':
        return isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700';
      default:
        return isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700';
    }
  };

  // Function to get match quality text based on score
  const getMatchQualityText = (score?: number) => {
    if (!score && score !== 0) return 'Unknown';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Very Good Match';
    if (score >= 60) return 'Good Match';
    if (score >= 50) return 'Moderate Match';
    if (score >= 40) return 'Fair Match';
    return 'Basic Match';
  };

  // Function to get match quality color based on score
  const getMatchQualityColor = (score?: number) => {
    if (!score && score !== 0) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    if (score >= 80) return isDarkMode ? 'text-green-300' : 'text-green-600';
    if (score >= 70) return isDarkMode ? 'text-green-400' : 'text-green-500';
    if (score >= 60) return isDarkMode ? 'text-blue-300' : 'text-blue-600';
    if (score >= 50) return isDarkMode ? 'text-blue-400' : 'text-blue-500';
    if (score >= 40) return isDarkMode ? 'text-yellow-300' : 'text-yellow-600';
    return isDarkMode ? 'text-gray-400' : 'text-gray-500';
  };

  // Check if we have manufacturers
  if (!manufacturers || manufacturers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-8 rounded-lg border text-center ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex justify-center mb-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            className={`p-3 rounded-full ${
              isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
            }`}
          >
            <AlertTriangle className={`h-6 w-6 ${
              isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
          </motion.div>
        </div>
        <h3 className={`text-lg font-medium mb-2 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          No Matching Manufacturers Found
        </h3>
        <p className={`mb-4 max-w-md mx-auto ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          We couldn't find any manufacturers that match your project requirements. Try adjusting your project details or check back later.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              // This would navigate back to project details editing
              console.log("Navigate to edit project details");
            }}
          >
            <RefreshCw size={14} />
            Adjust Project Details
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              // This would refresh the search
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            <Search size={14} />
            Search Again
          </Button>
        </div>
      </motion.div>
    );
  }
  
  // Check if we have filtered results
  if (filteredAndSortedManufacturers.length === 0) {
    return (
      <>
        {/* Search and filter UI */}
        <div className={`mb-6 rounded-lg border p-4 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <Input
                ref={searchInputRef}
                placeholder="Search manufacturers..."
                className={`pl-9 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  <SelectItem value="highMatch">High Match Score</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="notContacted">Not Contacted</SelectItem>
                  <SelectItem value="hasCertifications">Has Certifications</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchTerm("");
                  setFilterOption("all");
                  setSortBy("matchScore");
                  setSortDirection("desc");
                }}
                title="Reset filters"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* No results message */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-lg border text-center ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <Search className={`h-6 w-6 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
            </div>
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            No Results Found
          </h3>
          <p className={`mb-4 max-w-md mx-auto ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            No manufacturers match your current search criteria. Try adjusting your filters or search terms.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setSearchTerm("");
              setFilterOption("all");
            }}
          >
            <RefreshCw size={14} />
            Reset Filters
          </Button>
        </motion.div>
      </>
    );
  }

  return (
    <div>
      {/* Search, filter, and sort controls */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`mb-6 rounded-lg border p-4 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <Input
              ref={searchInputRef}
              placeholder="Search manufacturers..."
              className={`pl-9 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                <SelectItem value="highMatch">High Match Score</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="notContacted">Not Contacted</SelectItem>
                <SelectItem value="hasCertifications">Has Certifications</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchTerm("");
                setFilterOption("all");
                setSortBy("matchScore");
                setSortDirection("desc");
              }}
              title="Reset filters"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
        
        {/* Sort and view options */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={sortBy === "matchScore" ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSortChange("matchScore")}
            >
              Match Score {sortBy === "matchScore" && (sortDirection === "desc" ? "↓" : "↑")}
            </Badge>
            <Badge 
              variant={sortBy === "name" ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSortChange("name")}
            >
              Name {sortBy === "name" && (sortDirection === "desc" ? "↓" : "↑")}
            </Badge>
            <Badge 
              variant={sortBy === "location" ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSortChange("location")}
            >
              Location {sortBy === "location" && (sortDirection === "desc" ? "↓" : "↑")}
            </Badge>
            <Badge 
              variant={sortBy === "status" ? "default" : "outline"}
              className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSortChange("status")}
            >
              Status {sortBy === "status" && (sortDirection === "desc" ? "↓" : "↑")}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="selected" disabled={selectedManufacturers.length === 0}>
                  Selected ({selectedManufacturers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              variant="outline"
              size="sm"
              disabled={selectedManufacturers.length < 2}
              onClick={() => setIsComparing(!isComparing)}
              className="gap-1"
            >
              <BarChart3 size={14} />
              {isComparing ? "Hide Comparison" : "Compare"}
            </Button>
          </div>
        </div>
        
        {/* Comparison info */}
        {selectedManufacturers.length > 0 && (
          <div className={`mt-3 pt-3 flex items-center justify-between text-xs ${
            isDarkMode ? 'border-t border-slate-700 text-slate-400' : 'border-t border-slate-200 text-slate-500'
          }`}>
            <div>
              {selectedManufacturers.length} manufacturer{selectedManufacturers.length !== 1 ? 's' : ''} selected
              {selectedManufacturers.length >= 2 && ' (you can compare up to 3)'}
            </div>
            {selectedManufacturers.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setSelectedManufacturers([])}
              >
                Clear selection
              </Button>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Manufacturer comparison view */}
      <AnimatePresence>
        {isComparing && selectedManufacturers.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 overflow-hidden rounded-lg border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Manufacturer Comparison
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsComparing(false)}>
                  <X size={14} />
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`w-full min-w-[600px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <thead>
                    <tr className={isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <th className="text-left py-2 px-3 font-medium">Criteria</th>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        return (
                          <th key={id} className="text-left py-2 px-3 font-medium">
                            {manufacturer?.name || manufacturer?.companyName || 'Manufacturer'}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Match score */}
                    <tr className={isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <td className="py-3 px-3 font-medium">Match Score</td>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        const matchScore = typeof manufacturer?.matchScore === 'number' 
                          ? Math.min(Math.max(manufacturer.matchScore * 100, 0), 100) 
                          : manufacturer?.matchScore || 0;
                        return (
                          <td key={id} className="py-3 px-3">
                            <MatchQualityBar score={matchScore} isDarkMode={isDarkMode} />
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Location */}
                    <tr className={isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <td className="py-3 px-3 font-medium">Location</td>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        return (
                          <td key={id} className="py-3 px-3">
                            {manufacturer?.location || manufacturer?.address || 'Not specified'}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Industry */}
                    <tr className={isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <td className="py-3 px-3 font-medium">Industry</td>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        return (
                          <td key={id} className="py-3 px-3">
                            {manufacturer?.industry || 'Not specified'}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Certifications */}
                    <tr className={isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <td className="py-3 px-3 font-medium">Certifications</td>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        const certifications = Array.isArray(manufacturer?.certificates) 
                          ? manufacturer?.certificates 
                          : Array.isArray(manufacturer?.manufacturerSettings?.certifications)
                            ? manufacturer?.manufacturerSettings?.certifications
                            : (manufacturer?.certificates ? [manufacturer.certificates] : []);
                        
                        return (
                          <td key={id} className="py-3 px-3">
                            {certifications.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {certifications.slice(0, 2).map((cert, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {cert}
                                  </Badge>
                                ))}
                                {certifications.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{certifications.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              'None'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Status */}
                    <tr>
                      <td className="py-3 px-3 font-medium">Status</td>
                      {selectedManufacturers.map(id => {
                        const manufacturer = manufacturers.find(m => m.id === id);
                        const status = contactStatus[id] || manufacturer?.status;
                        return (
                          <td key={id} className="py-3 px-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <div className="flex flex-col items-center">
              <div className="relative h-12 w-12">
                <motion.div
                  className={`absolute inset-0 rounded-full ${isDarkMode ? 'border-t-blue-400 border-blue-800/30' : 'border-t-blue-600 border-blue-200'} border-4`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className={`mt-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Loading manufacturers...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Results count */}
      {!isLoading && filteredAndSortedManufacturers.length > 0 && (
        <div className={`mb-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Showing {filteredAndSortedManufacturers.length} manufacturer{filteredAndSortedManufacturers.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
          {filterOption !== 'all' && ` (filtered by ${filterOption.replace(/([A-Z])/g, ' $1').toLowerCase()})`}
        </div>
      )}
      
      {/* Manufacturer cards */}
      <div className="space-y-4">
        {filteredAndSortedManufacturers.map((manufacturer) => {
          // Get the status (from state or manufacturer object)
          const status = contactStatus[manufacturer.id] || manufacturer.status;
          
          // Get the match score (normalize to 0-100 scale)
          const matchScore = typeof manufacturer.matchScore === 'number' 
            ? Math.min(Math.max(manufacturer.matchScore * 100, 0), 100) 
            : manufacturer.matchScore;
            
          // Check if manufacturer is selected for comparison
          const isSelected = selectedManufacturers.includes(manufacturer.id);
          
          return (
            <motion.div
              key={manufacturer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg border overflow-hidden transition-all ${
                isDarkMode 
                  ? `bg-slate-800 ${isSelected ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-700'} hover:shadow-slate-700/10` 
                  : `bg-white ${isSelected ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-200'} hover:shadow-lg`
              }`}
            >
              {/* Manufacturer header */}
              <div className="p-4 relative group">
                {/* Selection checkbox */}
                <div className={`absolute top-0 right-0 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleManufacturerSelection(manufacturer.id)}
                    id={`select-${manufacturer.id}`}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Manufacturer logo/avatar */}
                    {manufacturer.logo || manufacturer.avatar ? (
                      <div className="relative">
                        <img 
                          src={manufacturer.logo || manufacturer.avatar} 
                          alt={manufacturer.name}
                          className={`w-14 h-14 rounded-full object-cover border ${
                            isSelected ? 'border-blue-500' : isDarkMode ? 'border-slate-600' : 'border-slate-200'
                          }`}
                        />
                        {matchScore >= 80 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                            <Star className="w-3 h-3 text-white" fill="white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                      }`}>
                        <Building className={`w-6 h-6 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                      </div>
                    )}
                    
                    {/* Manufacturer name and location */}
                    <div>
                      <h3 className={`font-medium text-lg ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {manufacturer.name || manufacturer.companyName}
                      </h3>
                      
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                        {(manufacturer.location || manufacturer.address) && (
                          <div className="flex items-center gap-1">
                            <MapPin className={`w-3 h-3 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                            <span className={`text-xs ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {manufacturer.location || manufacturer.address}
                            </span>
                          </div>
                        )}
                        
                        {manufacturer.industry && (
                          <div className="flex items-center gap-1">
                            <Factory className={`w-3 h-3 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                            <span className={`text-xs ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {manufacturer.industry}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Match score and status */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center ml-0 sm:ml-auto">
                    {/* Match quality */}
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <span className={`text-sm font-medium ${getMatchQualityColor(matchScore)}`}>
                                {getMatchQualityText(matchScore)}
                              </span>
                              <Award className={`w-4 h-4 ${getMatchQualityColor(matchScore)}`} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              This manufacturer matches {matchScore}% of your project requirements
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Status badge */}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                </div>
                
                {/* Match score bar */}
                <div className="mt-4">
                  <MatchQualityBar score={matchScore || 0} isDarkMode={isDarkMode} />
                </div>
                
                {/* Quick info badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {manufacturer.establish || manufacturer.establishYear ? (
                    <Badge variant="outline" className="gap-1">
                      <Calendar size={12} />
                      <span>Est. {manufacturer.establish || manufacturer.establishYear}</span>
                    </Badge>
                  ) : null}

                  {/* Capacity badge */}
                  {manufacturer.manufacturerSettings?.productionCapacity && (
                    <Badge variant="outline" className="gap-1">
                      <Package size={12} />
                      <span>
                        Capacity: {getCapacityRangeLabel(manufacturer.manufacturerSettings.productionCapacity)}
                      </span>
                    </Badge>
                  )}
                  {/* Certificates badge giữ nguyên */}
                  {Array.isArray(manufacturer.certificates) && manufacturer.certificates.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 size={12} />
                      <span>{manufacturer.certificates.length} Certification{manufacturer.certificates.length !== 1 ? 's' : ''}</span>
                    </Badge>
                  )}
                </div>
                
                {/* Expand/collapse and contact buttons */}
                <div className="flex justify-between mt-5">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`gap-1 ${
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                      onClick={() => toggleManufacturerDetails(manufacturer.id)}
                    >
                      {expandedManufacturer === manufacturer.id ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Show Details</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => toggleManufacturerSelection(manufacturer.id)}
                    >
                      {isSelected ? (
                        <>
                          <Minus size={14} />
                          <span>Deselect</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Select</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="default"
                    className={`gap-1 ${
                      status === 'contacted' || status === 'responded' 
                        ? 'opacity-70 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={status === 'contacted' || status === 'responded'}
                    onClick={() => openContactForm(manufacturer)}
                  >
                    <MessageSquare size={14} />
                    {status === 'contacted' ? 'Contacted' : status === 'responded' ? 'Responded' : 'Contact'}
                  </Button>
                </div>
              </div>
              
              {/* Expanded details */}
              <AnimatePresence>
                {expandedManufacturer === manufacturer.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border-t ${
                      isDarkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}
                    >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left column */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <h4 className={`text-sm font-medium mb-4 flex items-center gap-1 ${
                          isDarkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          <Building size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                          <span>Company Information</span>
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Description */}
                          {(manufacturer.description || manufacturer.companyDescription) && (
                            <div className={`p-3 rounded-md ${
                              isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50'
                            }`}>
                              <h5 className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                About
                              </h5>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                              } line-clamp-4 hover:line-clamp-none transition-all duration-200`}>
                                {manufacturer.description || manufacturer.companyDescription || 'No description available'}
                              </p>
                            </div>
                          )}
                          
                          {/* Contact information */}
                          <div className={`p-3 rounded-md ${
                            isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50'
                          }`}>
                            <h5 className={`text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                              Contact Information
                            </h5>
                            <div className="space-y-3">
                              {/* Website */}
                              {manufacturer.website && (
                                <div className="flex items-center gap-2 group">
                                  <div className={`p-1.5 rounded-md ${
                                    isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:text-blue-400' : 'bg-slate-200 text-slate-500 group-hover:text-blue-600'
                                  } transition-colors`}>
                                    <Globe className="w-4 h-4" />
                                  </div>
                                  <a 
                                    href={manufacturer.website.startsWith('http') ? manufacturer.website : `https://${manufacturer.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm ${
                                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                    } truncate max-w-[200px] sm:max-w-[250px]`}
                                    title={manufacturer.website}
                                  >
                                    {manufacturer.website.replace(/^https?:\/\//i, '')}
                                  </a>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText(manufacturer.website);
                                      // Show toast or feedback
                                    }}
                                  >
                                    <Clipboard className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* Email */}
                              {manufacturer.email && (
                                <div className="flex items-center gap-2 group">
                                  <div className={`p-1.5 rounded-md ${
                                    isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:text-blue-400' : 'bg-slate-200 text-slate-500 group-hover:text-blue-600'
                                  } transition-colors`}>
                                    <Mail className="w-4 h-4" />
                                  </div>
                                  <a 
                                    href={`mailto:${manufacturer.email}`}
                                    className={`text-sm ${
                                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                    } truncate max-w-[200px] sm:max-w-[250px]`}
                                    title={manufacturer.email}
                                  >
                                    {manufacturer.email}
                                  </a>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText(manufacturer.email);
                                      // Show toast or feedback
                                    }}
                                  >
                                    <Clipboard className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* Phone */}
                              {manufacturer.phone && (
                                <div className="flex items-center gap-2 group">
                                  <div className={`p-1.5 rounded-md ${
                                    isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:text-blue-400' : 'bg-slate-200 text-slate-500 group-hover:text-blue-600'
                                  } transition-colors`}>
                                    <Phone className="w-4 h-4" />
                                  </div>
                                  <a 
                                    href={`tel:${manufacturer.phone}`}
                                    className={`text-sm ${
                                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                    } truncate max-w-[200px] sm:max-w-[250px]`}
                                    title={manufacturer.phone}
                                  >
                                    {manufacturer.phone}
                                  </a>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText(manufacturer.phone);
                                      // Show toast or feedback
                                    }}
                                  >
                                    <Clipboard className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Certifications */}
                          {(manufacturer.certificates || manufacturer.manufacturerSettings?.certifications) && (
                            <div className={`p-3 rounded-md ${
                              isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50'
                            }`}>
                              <h5 className={`text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                Certifications
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(manufacturer.certificates) 
                                  ? manufacturer.certificates 
                                  : Array.isArray(manufacturer.manufacturerSettings?.certifications)
                                    ? manufacturer.manufacturerSettings.certifications
                                    : (manufacturer.certificates ? [manufacturer.certificates] : [])
                                ).map((cert: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className={`text-xs py-1 ${
                                      isDarkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                                    } transition-colors`}
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Right column - Match details */}
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <h4 className={`text-sm font-medium mb-4 flex items-center gap-1 ${
                          isDarkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          <Info size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                          <span>Why We Matched</span>
                        </h4>
                        
                        <div className={`p-3 rounded-md space-y-3 ${
                          isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50'
                        }`}>
                          {/* Display match criteria with enhanced visuals */}
                          <MatchCriteria 
                            criteria="Specializes in your product category" 
                            matches={manufacturer.matchDetails?.industry?.score > 15} 
                            isDarkMode={isDarkMode}
                            importance="high"
                            tooltip="This manufacturer specializes in products similar to yours"
                          />
                          
                          <MatchCriteria 
                            criteria="Has required certifications" 
                            matches={
                              projectDetails?.certification?.length > 0 ? 
                              manufacturer.matchDetails?.certifications?.score > 10 : 
                              true
                            } 
                            isDarkMode={isDarkMode}
                            importance="high"
                            tooltip="The manufacturer has the certifications required for your product"
                          />
                          
                          <MatchCriteria 
                            criteria="Production capacity meets your volume" 
                            matches={manufacturer.matchDetails?.capacity?.score > 9} 
                            isDarkMode={isDarkMode}
                            importance="medium"
                            tooltip="Can handle your production volume requirements"
                          />
                          
                          <MatchCriteria 
                            criteria="Location preference" 
                            matches={manufacturer.matchDetails?.location?.score > 7} 
                            isDarkMode={isDarkMode}
                            importance="medium"
                            tooltip="Located in your preferred region"
                          />
                          
                          {/* Show packaging match if project has packaging requirements */}
                          {projectDetails?.packaging?.length > 0 && (
                            <MatchCriteria 
                              criteria="Packaging compatibility" 
                              matches={manufacturer.matchDetails?.packaging?.score > 5} 
                              isDarkMode={isDarkMode}
                              importance="medium"
                              tooltip="Manufacturer can provide your required packaging types"
                            />
                          )}
                          
                          {/* Show allergen match if project has allergen requirements */}
                          {projectDetails?.allergen?.length > 0 && (
                            <MatchCriteria 
                              criteria="Allergen requirements" 
                              matches={manufacturer.matchDetails?.allergen?.score > 5} 
                              isDarkMode={isDarkMode}
                              importance="medium"
                              tooltip="Manufacturer's products meet your allergen requirements"
                            />
                          )}
                        </div>
                        
                        {/* Show match details if available */}
                        <div className={`mt-4 p-3 rounded-md ${isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                          <h5 className={`text-sm font-medium mb-3 flex items-center gap-1 ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            <BarChart3 size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                            <span>Detailed Match Factors</span>
                          </h5>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800">
                            {(() => {
                              // Build detailedMatchFactors from the backend matchDetails
                              const details: { label: string, value: string }[] = [];
                              
                              // Use the match details from the backend if available
                              if (manufacturer.matchDetails) {
                                // Location
                                if (manufacturer.matchDetails.location) {
                                  details.push({ 
                                    label: 'Location', 
                                    value: manufacturer.matchDetails.location.details || 
                                           (Array.isArray(projectDetails?.location) ? 
                                             projectDetails.location.join(', ') : 
                                             projectDetails?.location || 'Global location requested')
                                  });
                                }
                                
                                // Certifications
                                if (manufacturer.matchDetails.certifications) {
                                  details.push({ 
                                    label: 'Certifications', 
                                    value: manufacturer.matchDetails.certifications.details || 
                                           (projectDetails?.certification?.length > 0 ? 
                                             Array.isArray(projectDetails.certification) ? 
                                               projectDetails.certification.join(', ') : 
                                               String(projectDetails.certification) : 
                                             'No certifications required for project')
                                  });
                                }
                                
                                // Industry
                                if (manufacturer.matchDetails.industry) {
                                  details.push({ 
                                    label: 'Industry', 
                                    value: manufacturer.matchDetails.industry.details || 
                                           'General food manufacturing match'
                                  });
                                }
                                
                                // Capacity
                                if (manufacturer.matchDetails.capacity) {
                                  details.push({ 
                                    label: 'Capacity', 
                                    value: manufacturer.matchDetails.capacity.details || 
                                           `Manufacturer capacity: ${manufacturer.manufacturerSettings?.productionCapacity || 'Unknown'}`
                                  });
                                }
                                
                                // Packaging - new from backend
                                if (manufacturer.matchDetails.packaging) {
                                  details.push({
                                    label: 'Packaging',
                                    value: manufacturer.matchDetails.packaging.details || 
                                           'Packaging compatibility information not available'
                                  });
                                }
                                
                                // Allergen - new from backend
                                if (manufacturer.matchDetails.allergen) {
                                  details.push({
                                    label: 'Allergen',
                                    value: manufacturer.matchDetails.allergen.details || 
                                           'Allergen compatibility information not available'
                                  });
                                }
                                
                                // Additional - new from backend
                                if (manufacturer.matchDetails.additional) {
                                  details.push({
                                    label: 'Additional',
                                    value: manufacturer.matchDetails.additional.details || 
                                           'No specific keyword matches found'
                                  });
                                }
                                
                                // Add any other match details that might be present
                                Object.entries(manufacturer.matchDetails).forEach(([key, value]) => {
                                  // Skip keys we've already processed
                                  if (['location', 'certifications', 'industry', 'capacity', 
                                       'packaging', 'allergen', 'additional'].includes(key)) {
                                    return;
                                  }
                                  
                                  // Format the key name for display
                                  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                  details.push({ 
                                    label: formattedKey, 
                                    value: formatMatchValue(value) 
                                  });
                                });
                              } else {
                                // Fallback if no match details are available
                                details.push({ label: 'Match Details', value: 'No detailed matching information available' });
                              }
                              
                              return details.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start py-1 border-b border-dashed last:border-0 dark:border-slate-700 border-slate-200">
                                  <span className={`text-xs flex-shrink-0 mr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</span>
                                  <span className={`text-xs font-medium text-right break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.value}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Contact form popup */}
      <AnimatePresence>
        {contactFormVisible && selectedManufacturer && (
          <ContactManufacturerForm
            visible={contactFormVisible}
            onClose={() => setContactFormVisible(false)}
            projectId={projectDetails?.id}
            manufacturer={{
              id: selectedManufacturer.id,
              name: selectedManufacturer.name || selectedManufacturer.companyName || 'Manufacturer',
              email: selectedManufacturer.email,
              phone: selectedManufacturer.phone,
              website: selectedManufacturer.website
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectManufacturers;
