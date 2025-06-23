import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Heart, 
  Info,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Package,
  Clock,
  Award,
  Trash2,
  Building2,
  Star,
  Globe,
  RefreshCw,
  Grid3X3,
  List
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductFavorites } from "@/contexts/ProductFavoriteContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { foodProductApi } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

// Define the Product interface to match both API data structure and UI needs
interface Product {
  _id: string;        // MongoDB ID from API
  name: string;
  productName?: string;
  category: string;
  manufacturer: string;
  manufacturerName?: string;
  image: string;
  price: string;
  pricePerUnit?: number;
  rating: number;
  productType: string;
  description: string;
  minOrderQuantity: number;
  leadTime: string;
  leadTimeUnit?: string;
  sustainable: boolean;
  sku?: string;
  unitType?: string;
  currentAvailable?: number;
  ingredients?: string[];
  flavorType?: string[];
  usage?: string[];
  packagingSize?: string;
  shelfLife?: string;
  manufacturerRegion?: string;
  createdAt?: string;
  updatedAt?: string;
}

// For product favorites context
interface ProductFavorites {
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (product: any) => void;
  favorites: any[];
}

// Sort options based on actual data
const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "newest", label: "Newest First" }
];

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
      duration: 0.8
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 40, 
    scale: 0.92,
    filter: "blur(8px)",
    rotateX: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25,
      duration: 0.3 
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const headerVariants = {
  hidden: { 
    opacity: 0, 
    y: -40,
    scale: 0.95,
    filter: "blur(10px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 0.9,
      duration: 1.0,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  }
};

const filterVariants = {
  hidden: { 
    opacity: 0, 
    x: -40, 
    scale: 0.9,
    filter: "blur(8px)",
    rotateY: -15
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    rotateY: 0,
    transition: { 
      type: "spring", 
      stiffness: 120,
      damping: 20,
      mass: 0.7,
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
  exit: { 
    opacity: 0, 
    x: -40,
    scale: 0.9,
    filter: "blur(8px)",
    rotateY: -15,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  }
};

// New animation variants for enhanced interactions
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

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  tap: { 
    scale: 0.95, 
    y: 0,
    transition: { duration: 0.1 }
  }
};

const cardVariants = {
  rest: { 
    scale: 1, 
    y: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
  },
  hover: { 
    scale: 1.03, 
    y: -12,
    rotateX: 5,
    rotateY: 2,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      duration: 0.4
    }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const fadeInUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      duration: 0.6
    }
  }
};

const pulseVariants = {
  rest: { scale: 1 },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};

const slideInVariants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 25 
    } 
  }
};

// Helper function to safely convert ID values for consistent comparison
const safeId = (id: string | number | undefined): string => {
  return id?.toString() || "";
};

// Add a mock findMatchingProducts function to the foodProductApi object
const mockFindMatchingProducts = async (productId: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    data: [
      { _id: "match1", name: "Matching Product 1" },
      { _id: "match2", name: "Matching Product 2" },
      { _id: "match3", name: "Matching Product 3" },
    ]
  };
};

if (foodProductApi) {
  // @ts-ignore - Adding mock method for demonstration
  foodProductApi.findMatchingProducts = mockFindMatchingProducts;
}

const Products = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([]);
  const [selectedFlavorTypes, setSelectedFlavorTypes] = useState<string[]>([]);
  const [selectedUsages, setSelectedUsages] = useState<string[]>([]);
  const [selectedManufacturerRegions, setSelectedManufacturerRegions] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedShelfLives, setSelectedShelfLives] = useState<string[]>([]);
  const [selectedPackagingSizes, setSelectedPackagingSizes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [sustainableOnly, setSustainableOnly] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [categoryList, setCategoryList] = useState<string[]>(["All Categories"]);
  const [unitTypeList, setUnitTypeList] = useState<string[]>([]);
  const [flavorTypeList, setFlavorTypeList] = useState<string[]>([]);
  const [usageList, setUsageList] = useState<string[]>([]);
  const [manufacturerRegionList, setManufacturerRegionList] = useState<string[]>([]);
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const [shelfLifeList, setShelfLifeList] = useState<string[]>([]);
  const [packagingSizeList, setPackagingSizeList] = useState<string[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const {
    favorites: favoritedProducts,
    isFavorite,
    toggleFavorite
  } = useProductFavorites();

  // Page title effect
  useEffect(() => {
    document.title = "Browse Products - CPG Matchmaker";
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await foodProductApi.getCategories();
        if (response.data) {
          const categories = response.data as unknown as string[];
          // Only add "All Categories" if it's not already in the list
          const categoryList = categories.includes("All Categories") 
            ? categories 
            : ["All Categories", ...categories];
          setCategoryList(categoryList);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  // Fetch all filter options and total count
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch all products to get unique filter values and total count
        const response = await foodProductApi.getFoodProducts({ limit: 1000 }); // Get more products to extract unique values
        
        if (response.data?.products) {
          const allProducts = response.data.products as unknown as Product[];
          setTotalProductsCount(response.data.total || allProducts.length);
          
          // Extract unique values for each filter
          const uniqueUnitTypes = [...new Set(allProducts.map(p => p.unitType).filter(Boolean))];
          const uniqueFlavorTypes = [...new Set(allProducts.flatMap(p => p.flavorType || []).filter(Boolean))];
          const uniqueUsages = [...new Set(allProducts.flatMap(p => p.usage || []).filter(Boolean))];
          const uniqueManufacturerRegions = [...new Set(allProducts.map(p => p.manufacturerRegion).filter(Boolean))];
          const uniqueIngredients = [...new Set(allProducts.flatMap(p => p.ingredients || []).filter(Boolean))];
          const uniqueShelfLives = [...new Set(allProducts.map(p => p.shelfLife).filter(Boolean))];
          const uniquePackagingSizes = [...new Set(allProducts.map(p => p.packagingSize).filter(Boolean))];
          
          setUnitTypeList(uniqueUnitTypes);
          setFlavorTypeList(uniqueFlavorTypes);
          setUsageList(uniqueUsages);
          setManufacturerRegionList(uniqueManufacturerRegions);
          setIngredientsList(uniqueIngredients);
          setShelfLifeList(uniqueShelfLives);
          setPackagingSizeList(uniquePackagingSizes);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update search params when search term changes
  useEffect(() => {
    if (searchTerm) {
      searchParams.set("q", searchTerm);
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams);
  }, [searchTerm, searchParams, setSearchParams]);

  // Check for product ID in URL params
  useEffect(() => {
    if (searchParams.get("productId") && !isLoading) {
      const productId = searchParams.get("productId") || "";
      fetchProductById(productId);
    }

    if (searchParams.get("view") === "favorites") {
      setShowFavoritesOnly(true);
      document.title = "My Favorites - CPG Matchmaker";
    }
  }, [searchParams, isLoading]);

  // Fetch product by ID
  const fetchProductById = async (productId: string) => {
    try {
      const response = await foodProductApi.getFoodProductById(productId);
      if (response.data) {
        setSelectedProduct(response.data as unknown as Product);
        setShowProductDetails(true);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  // Fetch products with filters
  const fetchProducts = async () => {
    setIsLoading(true);
    
    try {
      const params: any = {
        page: pagination.page,
        limit: 9,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (activeCategory !== "All Categories") {
        params.category = activeCategory;
      }

      if (selectedUnitTypes.length > 0) {
        params.unitType = selectedUnitTypes;
      }

      if (selectedFlavorTypes.length > 0) {
        params.flavorType = selectedFlavorTypes;
      }

      if (selectedUsages.length > 0) {
        params.usage = selectedUsages;
      }

      if (selectedManufacturerRegions.length > 0) {
        params.manufacturerRegion = selectedManufacturerRegions;
      }

      if (selectedIngredients.length > 0) {
        params.ingredients = selectedIngredients;
      }

      if (selectedShelfLives.length > 0) {
        params.shelfLife = selectedShelfLives;
      }

      if (selectedPackagingSizes.length > 0) {
        params.packagingSize = selectedPackagingSizes;
      }

      if (sustainableOnly) {
        params.sustainable = true;
      }
      
      if (sortBy !== "name-asc") {
        params.sortBy = sortBy;
      }
      
      if (showFavoritesOnly) {
        const favorites = favoritedProducts.map(fav => fav._id || fav.id);
        const response = await foodProductApi.getFoodProducts(params);
        
        if (response.data?.products) {
          const apiProducts = response.data.products as unknown as Product[];
          const filteredProducts = apiProducts.filter(
            product => favorites.some(fav => safeId(fav) === safeId(product._id))
          );

          setProducts(filteredProducts);
          setPagination({
            page: response.data.page || 1,
            pages: response.data.pages || 1,
            total: filteredProducts.length,
          });
        }
      } else {
        const response = await foodProductApi.getFoodProducts(params);
        
        if (response.data?.products) {
          const apiProducts = response.data.products as unknown as Product[];
          setProducts(apiProducts);
          setPagination({
            page: response.data.page || 1,
            pages: response.data.pages || 1,
            total: response.data.total || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [
    searchTerm, 
    activeCategory, 
    selectedUnitTypes,
    selectedFlavorTypes,
    selectedUsages,
    selectedManufacturerRegions,
    selectedIngredients,
    selectedShelfLives,
    selectedPackagingSizes,
    sortBy, 
    sustainableOnly,
    pagination.page,
    showFavoritesOnly,
  ]);

  // Toggle filter selections
  const toggleSelection = (value: string, currentSelection: string[], setSelection: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelection(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory("All Categories");
    setSelectedUnitTypes([]);
    setSelectedFlavorTypes([]);
    setSelectedUsages([]);
    setSelectedManufacturerRegions([]);
    setSelectedIngredients([]);
    setSelectedShelfLives([]);
    setSelectedPackagingSizes([]);
    setSearchTerm("");
    setSustainableOnly(false);
    setShowFavoritesOnly(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProducts();
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Toggle favorites view
  const toggleFavoritesView = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly) {
      searchParams.set("view", "favorites");
    } else {
      searchParams.delete("view");
    }
    setSearchParams(searchParams);
  };

  // Handle product details click
  const handleProductDetailsClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Function to handle finding matching products
  const handleFindMatching = async (productId: string): Promise<void> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Using mock method for demonstration
      const response = await foodProductApi.findMatchingProducts(productId);
      
      toast({
        title: "Matching Products Found",
        description: `Found ${response?.data?.length || 0} matching products for your selection.`,
      });
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find matching products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are active filters
  const hasActiveFilters = activeCategory !== "All Categories" || 
                          selectedUnitTypes.length > 0 ||
                          selectedFlavorTypes.length > 0 ||
                          selectedUsages.length > 0 ||
                          selectedManufacturerRegions.length > 0 ||
                          selectedIngredients.length > 0 ||
                          selectedShelfLives.length > 0 ||
                          selectedPackagingSizes.length > 0 ||
                          sustainableOnly || 
                          showFavoritesOnly;

  // Add effect for scroll position detection
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Page navigation
  const goToPage = (page: number) => {
    setPagination(prev => {
      const newPage = Math.max(1, Math.min(page, prev.pages));
      return { ...prev, page: newPage };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render product list based on view type
  const renderProducts = () => {
    if (isLoading) {
      return (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[...Array(6)].map((_, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="relative overflow-hidden group"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="rounded-xl overflow-hidden border border-muted/50 group bg-card/40 backdrop-blur-sm">
                <motion.div 
                  className="h-48 w-full bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30 relative"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: "200% 200%"
                  }}
                />
                <div className="p-6 space-y-4">
                  <motion.div 
                    className="h-6 w-3/4 rounded-lg bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 0.1
                    }}
                    style={{
                      backgroundSize: "200% 200%"
                    }}
                  />
                  <motion.div 
                    className="h-4 w-1/2 rounded-lg bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 0.2
                    }}
                    style={{
                      backgroundSize: "200% 200%"
                    }}
                  />
                  <div className="flex gap-2 mb-4">
                    <motion.div 
                      className="h-6 w-20 rounded-full bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.3
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    />
                    <motion.div 
                      className="h-6 w-20 rounded-full bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.4
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <motion.div 
                      className="h-8 w-16 rounded-lg bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 1.0,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.5
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    />
                    <motion.div 
                      className="h-10 w-28 rounded-lg bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.6
                      }}
                      style={{
                        backgroundSize: "200% 200%"
                      }}
                    />
                  </div>
                </div>
                
                {/* Shimmer overlay effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: idx * 0.1
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }
    
    return renderLoadedProducts();
  };

  // Extract the loaded products rendering to a separate function for clarity
  const renderLoadedProducts = () => {
    if (products.length === 0) {
      return (
        <motion.div 
          className="text-center py-24 bg-gradient-to-br from-muted/20 via-card/40 to-muted/20 rounded-2xl border border-muted/30 shadow-xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 25, 
            duration: 0.6 
          }}
        >
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <ShoppingBag className="w-20 h-20 text-muted-foreground/40" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-2xl font-semibold text-foreground/70 mb-3">
                {t('no-products-found')}
              </p>
              <p className="text-base text-muted-foreground max-w-md">
                {t('adjust-filters')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.4, 
                type: "spring", 
                stiffness: 200, 
                damping: 25 
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="hover:bg-primary hover:text-primary-foreground rounded-xl px-6 py-3 shadow-lg border-2 border-primary/20 hover:border-primary transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {t('clear-all-filters')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    if (viewMode === "grid") {
      return (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div 
                  key={product._id}
                  layout
                  variants={cardVariants}
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  whileTap="tap"
                  custom={index}
                  transition={{ 
                    layout: { type: "spring", stiffness: 300, damping: 30 }
                  }}
                  style={{ 
                    perspective: "1000px",
                    transformStyle: "preserve-3d" 
                  }}
                >
                  <ProductCard
                    key={product._id}
                    product={product}
                    onFindMatching={handleFindMatching}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {/* Enhanced Pagination controls */}
          {pagination.pages > 1 && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 25, 
                delay: 0.3 
              }}
            >
              <div className="flex gap-3 items-center bg-card/60 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-muted/30">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-6 h-12 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-5 w-5 mr-2 -rotate-90" />
                    {t('previous')}
                  </Button>
                </motion.div>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum = 1;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    if (pageNum >= 1 && pageNum <= pagination.pages) {
                      return (
                        <motion.div
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant={pagination.page === pageNum ? "default" : "outline"}
                            size="icon"
                            onClick={() => goToPage(pageNum)}
                            className={cn(
                              "w-12 h-12 rounded-xl shadow-lg transition-all duration-300",
                              pagination.page === pageNum && "shadow-xl scale-110"
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
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
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
      );
    } else {
      // Enhanced List view
      return (
        <>
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div 
                  key={product._id} 
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25, 
                    delay: index * 0.05 
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                  }}
                  className="flex flex-col sm:flex-row gap-6 p-6 border border-muted/30 rounded-2xl hover:border-primary/30 bg-card/60 backdrop-blur-sm shadow-lg transition-all duration-300"
                >
                  <motion.div 
                    className="w-full sm:w-40 h-40 bg-muted/30 rounded-xl flex items-center justify-center relative group overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    {product.sustainable && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div 
                              className="absolute top-3 left-3 bg-green-100 text-green-800 rounded-full p-2 shadow-lg"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatType: "reverse" 
                              }}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sustainable Product</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <h3 className="font-semibold text-xl mb-1">{product.name}</h3>
                        <p className="text-base text-muted-foreground">{product.manufacturer}</p>
                      </motion.div>
                      <motion.div 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.button 
                          onClick={() => toggleFavorite(product)}
                          className={cn(
                            "p-3 rounded-full transition-all duration-300 shadow-lg",
                            isFavorite(product._id) 
                              ? "text-red-500 bg-red-50 hover:bg-red-100" 
                              : "text-muted-foreground bg-muted/30 hover:bg-muted/50"
                          )}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="h-5 w-5" fill={isFavorite(product._id) ? "currentColor" : "none"} />
                        </motion.button>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="flex flex-wrap items-center gap-3 mb-4 mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Badge className="shadow-sm">{product.category}</Badge>
                      <Badge variant="outline" className="shadow-sm">{product.productType}</Badge>
                      <span className="text-sm text-muted-foreground bg-muted/30 rounded-full px-3 py-1">
                        {t('min-order-units', { quantity: product.minOrderQuantity })}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-4 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('lead-time-weeks', { time: product.leadTime, unit: product.leadTimeUnit })}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        {t('rating', { value: product.rating })}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-between items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="font-semibold text-xl text-primary">{product.price}</p>
                      <div className="flex gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProductDetailsClick(product)}
                            className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            {t('details-button')}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="sm"
                            onClick={() => handleFindMatching(product._id)}
                            className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {t('match-button')}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {/* Enhanced Pagination controls */}
          {pagination.pages > 1 && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 25, 
                delay: 0.3 
              }}
            >
              <div className="flex gap-3 items-center bg-card/60 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-muted/30">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-6 h-12 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-5 w-5 mr-2 -rotate-90" />
                    {t('previous')}
                  </Button>
                </motion.div>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum = 1;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    if (pageNum >= 1 && pageNum <= pagination.pages) {
                      return (
                        <motion.div
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant={pagination.page === pageNum ? "default" : "outline"}
                            size="icon"
                            onClick={() => goToPage(pageNum)}
                            className={cn(
                              "w-12 h-12 rounded-xl shadow-lg transition-all duration-300",
                              pagination.page === pageNum && "shadow-xl scale-110"
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
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
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
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 pt-24 pb-12 max-w-[1600px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Enhanced Header Section */}
        <motion.div 
          className="text-center mb-12 space-y-8"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-6">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, scale: 0.8, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20, 
                duration: 1.2,
                delay: 0.2
              }}
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
            >
              {t('browse-products')}
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20, 
                delay: 0.4,
                duration: 0.8
              }}
            >
              {t('browse-products-description')}
            </motion.p>
            
            {totalProductsCount > 0 && (
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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Package className="h-5 w-5 text-primary" />
                </motion.div>
                <span className="font-medium">{totalProductsCount.toLocaleString()} products founds</span>
              </motion.div>
            )}
            
            {/* Floating decoration elements */}
            <motion.div
              className="absolute top-20 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-32 right-1/4 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"
              animate={{
                y: [0, 15, 0],
                x: [0, -15, 0],
                scale: [1, 0.9, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </motion.div>
        </motion.div>
          
        {/* Enhanced Control Bar */}
        <motion.div 
          className="mb-8 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Search Bar */}
          <motion.div 
            variants={itemVariants} 
            className="relative max-w-5xl mx-auto"
          >
            <motion.div
              className="relative"
              variants={searchBarVariants}
              initial="unfocused"
              whileFocus="focused"
              whileHover="focused"
            >
              <motion.div
                className="absolute left-4 top-1/4 transform -translate-y-1/2 text-muted-foreground"
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
                placeholder={t('search-placeholder')}
                className="pl-14 pr-14 h-18 text-lg rounded-2xl border-2 border-transparent focus:border-primary/40 bg-card/60 backdrop-blur-sm shadow-xl focus:shadow-2xl transition-all duration-300"
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
                      <motion.div
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-muted rounded-full h-12 w-12 shadow-lg hover:shadow-xl"
                          onClick={() => handleSearch("")}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Search input glow effect */}
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
            className="flex flex-wrap items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-3 rounded-xl h-12 px-6 shadow-lg hover:shadow-xl bg-card/60 backdrop-blur-sm border-muted/30"
                >
                  <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </motion.div>
                  Refresh
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleFavoritesView}
                  className={cn(
                    "flex items-center gap-3 rounded-xl h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-sm border-muted/30",
                    showFavoritesOnly && "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  <motion.div
                    animate={showFavoritesOnly ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={showFavoritesOnly ? { duration: 0.6, repeat: Infinity, repeatType: "reverse" } : { duration: 0.3 }}
                  >
                    <Heart className={cn(
                      "h-5 w-5 transition-all duration-300",
                      (favoritedProducts.length > 0 || showFavoritesOnly) ? "fill-current text-red-500" : ""
                    )} />
                  </motion.div>
                  {t('favorites')}
                  <AnimatePresence>
                    {favoritedProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Badge variant="secondary" className="bg-background/20 ml-1 shadow-sm">
                          {favoritedProducts.length}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-sm border-muted/30",
                    showFilters && "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  <motion.div
                    animate={showFilters ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Filter className="h-5 w-5" />
                  </motion.div>
                  {t('filters')}
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary shadow-sm">
                          Active
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <motion.div 
                className="flex items-center bg-muted/30 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-muted/30"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg h-10 w-10 shadow-sm"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg h-10 w-10 shadow-sm"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Sort Dropdown */}
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-56 bg-card/60 backdrop-blur-sm rounded-xl h-12 shadow-lg border-muted/30 hover:shadow-xl transition-all duration-300">
                    <ArrowUpDown className="h-5 w-5 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-muted/30">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Active Filters */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div 
              className="mb-8 bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-muted/30 shadow-xl"
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="flex flex-wrap items-center gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span 
                  className="text-sm font-medium text-foreground/70 flex items-center gap-3 bg-muted/30 rounded-full px-4 py-2"
                  variants={slideInVariants}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                  </motion.div>
                  {t('active-filters')}
                </motion.span>
                
                {showFavoritesOnly && (
                  <motion.div
                    variants={slideInVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all duration-300">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </motion.div>
                      {t('favorites-only')}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-red-200/50 rounded-full" onClick={() => setShowFavoritesOnly(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                )}
            
                {activeCategory && activeCategory !== "All Categories" && (
                  <motion.div
                    variants={slideInVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-all duration-300">
                      <Package className="h-4 w-4" />
                      {activeCategory}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-blue-200/50 rounded-full" onClick={() => setActiveCategory("All Categories")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                )}

                {selectedUnitTypes.map((type, index) => (
                  <motion.div
                    key={`unit-${type}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-all duration-300">
                      <Award className="h-4 w-4" />
                      {type}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-purple-200/50 rounded-full" onClick={() => toggleSelection(type, selectedUnitTypes, setSelectedUnitTypes)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedFlavorTypes.map((type, index) => (
                  <motion.div
                    key={`flavor-${type}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 transition-all duration-300">
                      <Star className="h-4 w-4" />
                      {type}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-yellow-200/50 rounded-full" onClick={() => toggleSelection(type, selectedFlavorTypes, setSelectedFlavorTypes)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedUsages.map((usage, index) => (
                  <motion.div
                    key={`usage-${usage}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-all duration-300">
                      <Building2 className="h-4 w-4" />
                      {usage}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-indigo-200/50 rounded-full" onClick={() => toggleSelection(usage, selectedUsages, setSelectedUsages)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedManufacturerRegions.map((region, index) => (
                  <motion.div
                    key={`region-${region}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-all duration-300">
                      <Globe className="h-4 w-4" />
                      {region}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-green-200/50 rounded-full" onClick={() => toggleSelection(region, selectedManufacturerRegions, setSelectedManufacturerRegions)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedIngredients.map((ingredient, index) => (
                  <motion.div
                    key={`ingredient-${ingredient}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-all duration-300">
                      <Package className="h-4 w-4" />
                      {ingredient}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-orange-200/50 rounded-full" onClick={() => toggleSelection(ingredient, selectedIngredients, setSelectedIngredients)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedShelfLives.map((shelfLife, index) => (
                  <motion.div
                    key={`shelf-${shelfLife}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition-all duration-300">
                      <Clock className="h-4 w-4" />
                      {shelfLife}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-teal-200/50 rounded-full" onClick={() => toggleSelection(shelfLife, selectedShelfLives, setSelectedShelfLives)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}

                {selectedPackagingSizes.map((size, index) => (
                  <motion.div
                    key={`packaging-${size}`}
                    variants={slideInVariants}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 transition-all duration-300">
                      <Package className="h-4 w-4" />
                      {size}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-pink-200/50 rounded-full" onClick={() => toggleSelection(size, selectedPackagingSizes, setSelectedPackagingSizes)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                ))}
                
                {sustainableOnly && (
                  <motion.div
                    variants={slideInVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-2 rounded-xl h-10 px-4 shadow-lg bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-all duration-300">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.div>
                      {t('sustainable-only')}
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Button size="sm" variant="ghost" className="h-auto p-0 ml-1 hover:bg-emerald-200/50 rounded-full" onClick={() => setSustainableOnly(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Badge>
                  </motion.div>
                )}
                
                <motion.div
                  variants={slideInVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="text-sm rounded-xl px-4 py-2 hover:bg-destructive/10 hover:text-destructive border border-destructive/20 shadow-lg transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                    </motion.div>
                    {t('clear-all')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Filter sidebar and product grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Filter sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="xl:col-span-1 space-y-6 bg-card/40 backdrop-blur-sm p-6 rounded-2xl shadow-sm border h-fit sticky top-24"
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    {t('filters')}
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
                
                {/* Filter Summary */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4 text-primary" />
                    Filter Summary
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Total Database: {totalProductsCount} products</div>
                    <div>Current Results: {products.length} products</div>
                    <div>Active Filters: {hasActiveFilters ? 'Yes' : 'None'}</div>
                  </div>
                </div>

                {/* Sustainability Filter */}
                <div className="space-y-1 border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-medium">{t('filters-sustainability')}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={sustainableOnly ? "default" : "outline"}
                      size="sm"
                      className={`py-1 px-3 h-auto text-xs rounded-xl transition-all duration-200 ${sustainableOnly ? "bg-green-600 text-white hover:bg-green-700" : "hover:border-primary/40"}`}
                      onClick={() => setSustainableOnly(!sustainableOnly)}
                    >
                      {t('sustainable-only')}
                    </Button>
                  </div>
                </div>
                
                {/* Categories Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Categories
                  </h4>
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.map((category) => {
                        const count = products.filter(p => p.category === category || category === "All Categories").length;
                        return (
                          <SelectItem key={category} value={category}>
                            <div className="flex justify-between items-center w-full">
                              <span>{category}</span>
                              {category !== "All Categories" && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {count}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Type Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Unit Type ({unitTypeList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {unitTypeList.map((type) => {
                      const count = products.filter(p => p.unitType === type).length;
                      const isSelected = selectedUnitTypes.includes(type);
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(type, selectedUnitTypes, setSelectedUnitTypes)}
                          >
                            {type}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Flavor Type Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Flavor Type ({flavorTypeList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {flavorTypeList.map((type) => {
                      const count = products.filter(p => p.flavorType?.includes(type)).length;
                      const isSelected = selectedFlavorTypes.includes(type);
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(type, selectedFlavorTypes, setSelectedFlavorTypes)}
                          >
                            {type}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Usage Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Usage ({usageList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {usageList.map((usage) => {
                      const count = products.filter(p => p.usage?.includes(usage)).length;
                      const isSelected = selectedUsages.includes(usage);
                      return (
                        <div key={usage} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(usage, selectedUsages, setSelectedUsages)}
                          >
                            {usage}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Manufacturer Region Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Manufacturer Region ({manufacturerRegionList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {manufacturerRegionList.map((region) => {
                      const count = products.filter(p => p.manufacturerRegion === region).length;
                      const isSelected = selectedManufacturerRegions.includes(region);
                      return (
                        <div key={region} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(region, selectedManufacturerRegions, setSelectedManufacturerRegions)}
                          >
                            {region}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ingredients Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Ingredients ({ingredientsList.slice(0, 20).length}+)
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {ingredientsList.slice(0, 20).map((ingredient) => {
                      const count = products.filter(p => p.ingredients?.includes(ingredient)).length;
                      const isSelected = selectedIngredients.includes(ingredient);
                      return (
                        <div key={ingredient} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(ingredient, selectedIngredients, setSelectedIngredients)}
                          >
                            {ingredient}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shelf Life Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Shelf Life ({shelfLifeList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {shelfLifeList.map((shelfLife) => {
                      const count = products.filter(p => p.shelfLife === shelfLife).length;
                      const isSelected = selectedShelfLives.includes(shelfLife);
                      return (
                        <div key={shelfLife} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(shelfLife, selectedShelfLives, setSelectedShelfLives)}
                          >
                            {shelfLife}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Packaging Size Filter */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Packaging Size ({packagingSizeList.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {packagingSizeList.map((size) => {
                      const count = products.filter(p => p.packagingSize === size).length;
                      const isSelected = selectedPackagingSizes.includes(size);
                      return (
                        <div key={size} className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-xs h-8"
                            onClick={() => toggleSelection(size, selectedPackagingSizes, setSelectedPackagingSizes)}
                          >
                            {size}
                          </Button>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 hover:bg-destructive hover:text-destructive-foreground rounded-xl"
                  onClick={clearFilters}
                >
                  {t('clear-all-filters')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Products grid */}
          <div className={`${showFilters ? 'xl:col-span-4' : 'xl:col-span-5'}`}>
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid" className="m-0">
                {renderProducts()}
              </TabsContent>
              
              <TabsContent value="list" className="m-0">
                {renderProducts()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
      
      {/* Product Details Dialog */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="sm:max-w-3xl overflow-hidden bg-background/95 backdrop-blur-sm border border-primary/20 shadow-2xl">
          <AnimatePresence>
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  duration: 0.5
                }}
              >
                <DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {selectedProduct.name}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                      {t('by-manufacturer', { manufacturer: selectedProduct.manufacturer })}
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
                  {/* Product Image */}
                  <motion.div 
                    className="bg-muted/30 rounded-2xl relative overflow-hidden flex items-center justify-center h-[280px] shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 30 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="object-contain max-h-[240px] max-w-[90%]"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    />
                    {selectedProduct.sustainable && (
                      <motion.div 
                        className="absolute top-4 left-4 bg-green-100 text-green-800 rounded-full p-2 shadow-lg"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <CheckCircle2 className="h-6 w-6" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Product details */}
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 30 }}
                  >
                    <motion.p 
                      className="text-foreground/80 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {selectedProduct.description}
                    </motion.p>
                    
                    <motion.div 
                      className="flex items-center gap-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2 text-amber-500 bg-amber-50 rounded-lg px-3 py-2">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="font-semibold text-sm">{selectedProduct.rating}</span>
                      </div>
                      
                      <Badge className="shadow-sm">{selectedProduct.category}</Badge>
                      <Badge variant="outline" className="shadow-sm">{selectedProduct.productType}</Badge>
                    </motion.div>
                  
                    <motion.div 
                      className="grid grid-cols-2 gap-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="font-bold text-xl text-primary">{selectedProduct.price}</p>
                      </div>
                      
                      {selectedProduct.minOrderQuantity && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">{t('minimum-order')}</p>
                          <p className="font-semibold text-blue-700">{selectedProduct.minOrderQuantity} {selectedProduct.unitType || t('units')}</p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Specifications */}
                <motion.div 
                  className="mt-8 border-t border-muted/30 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Specifications
                  </h3>
                  <div className="bg-muted/20 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {selectedProduct.sku && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">SKU:</span>
                        <span className="text-sm font-medium">{selectedProduct.sku}</span>
                      </motion.div>
                    )}
                    
                    {selectedProduct.leadTime && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">{t('lead-time')}:</span>
                        <span className="text-sm font-medium">{selectedProduct.leadTime} {selectedProduct.leadTimeUnit}</span>
                      </motion.div>
                    )}
                  
                    {selectedProduct.currentAvailable !== undefined && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">{t('availability')}:</span>
                        <span className="text-sm font-medium">
                          {selectedProduct.currentAvailable} {selectedProduct.unitType || t('units')}
                        </span>
                      </motion.div>
                    )}
                    
                    {selectedProduct.sustainable && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">Sustainability:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {t('sustainable-product')}
                        </Badge>
                      </motion.div>
                    )}
                    
                    {selectedProduct.manufacturerRegion && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">Region:</span>
                        <span className="text-sm font-medium">{selectedProduct.manufacturerRegion}</span>
                      </motion.div>
                    )}
                    
                    {selectedProduct.shelfLife && (
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground">Shelf life:</span>
                        <span className="text-sm font-medium">{selectedProduct.shelfLife}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                {/* Ingredients section if available - FIXED LINTER ERROR */}
                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      {t('ingredients')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.ingredients.map((ingredient, idx) => (
                        <motion.div
                          key={`ingredient-${idx}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + idx * 0.05, duration: 0.3 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <Badge variant="outline" className="text-xs px-3 py-1 shadow-sm hover:shadow-md transition-all duration-200">
                            {ingredient}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Action buttons */}
                <motion.div 
                  className="flex justify-between items-center mt-8 pt-6 border-t border-muted/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => toggleFavorite(selectedProduct)}
                      className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        animate={isFavorite(selectedProduct._id) ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={isFavorite(selectedProduct._id) ? { duration: 0.6, repeat: Infinity, repeatType: "reverse" } : { duration: 0.3 }}
                      >
                        <Heart 
                          className="h-5 w-5 mr-2" 
                          fill={isFavorite(selectedProduct._id) ? "currentColor" : "none"} 
                        />
                      </motion.div>
                      {isFavorite(selectedProduct._id) ? t('saved') : t('save')}
                    </Button>
                  </motion.div>
                  
                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => setShowProductDetails(false)}
                        className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <X className="h-5 w-5 mr-2" />
                        {t('close')}
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleFindMatching(selectedProduct._id)}
                      >
                        {t('find-match')}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Enhanced Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4
            }}
          >
            <motion.button
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border border-white/20"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              whileHover={{ 
                scale: 1.1, 
                rotate: 10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  "0 20px 40px -12px rgba(0, 0, 0, 0.25)",
                  "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                  "0 20px 40px -12px rgba(0, 0, 0, 0.25)"
                ]
              }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <ChevronUp className="h-6 w-6" />
              </motion.div>
              
              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.5, 2], opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle background animation effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>
    </div>
  );
};

export default Products;