import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, Filter, Eye, Edit, Trash2, MoreHorizontal, AlertTriangle, Calendar, Target, TrendingUp, Settings, Users, Zap, Clock, Wrench, RotateCcw, Play, Pause, CheckCircle, AlertCircle, Loader2, Activity, Award, Package, Building, Beaker, Wheat, Package2, PlusCircle, X, FileText, BarChart, Pencil, RefreshCw, Factory, PauseCircle, MoreVertical, Info, DollarSign, PackageCheck, Box, ArrowLeft, Star, CalendarCheck, InfoIcon, Layers, LinkIcon, Save, Tag, UploadCloud, User, ExternalLink, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Leaf } from "lucide-react";
import { 
  BaseProduct, 
  CreateProductData, 
  UpdateProductData, 
  ProductFormData,
  ProductionProduct,
  ProductApiData,
  ProductionLine,
  BatchInfo,
  FoodProductData,
  NaturalProductData,
  HealthyProductData,
  BeverageProductData,
  PackagingProductData,
  OtherProductData,
  ProductFormSubmitHandler,
  ProductUpdateHandler,
  ProductCreateHandler,
  ProductDeleteHandler
} from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProductFormFoodBeverage from '@/components/form/ProductFormFood';
import ProductFormNaturalProduct from '@/components/form/ProductFormNaturalProduct';
import ProductFormHealthyProduct from '@/components/form/ProductFormHealthyProduct';
import { ProductFormBeverage } from '@/components/form/ProductFormBeverage';
import { ProductFormPackaging } from '@/components/form/ProductFormPackaging';
import { ProductFormOther } from '@/components/form/ProductFormOther';
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { productService, type Product as ApiProduct } from "@/services/productService";
import ManufacturerLayout from "@/components/layouts/ManufacturerLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@radix-ui/react-dropdown-menu";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { toBaseProduct, toFormData } from "@/utils/productAdapters";

// Global style to hide scrollbars
const styles = `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.2);
    border-radius: 6px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.4);
  }
  
  * {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
  }
  
  .enhanced-input:focus-within {
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
    border-color: hsl(var(--primary));
    transform: translateY(-1px);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .enhanced-input.error {
    box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.2);
    border-color: hsl(var(--destructive));
  }
  
  .inventory-level-low {
    color: hsl(var(--destructive));
  }
  
  .inventory-level-medium {
    color: hsl(var(--warning));
  }
  
  .inventory-level-high {
    color: hsl(var(--success));
  }
  
  .product-form-container {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .product-form-container:hover {
    background-color: hsl(var(--background) / 0.5);
  }
  
  /* Enhanced animation styles */
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    40% { transform: translateY(-12px); }
    60% { transform: translateY(-7px); }
    80% { transform: translateY(-3px); }
  }
  
  @keyframes float {
    0% { transform: translateY(0) rotate(0); }
    25% { transform: translateY(-5px) rotate(1deg); }
    50% { transform: translateY(0) rotate(0); }
    75% { transform: translateY(5px) rotate(-1deg); }
    100% { transform: translateY(0) rotate(0); }
  }

  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .image-upload-area {
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    border-radius: 12px;
  }
  
  .image-upload-area:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
  }
  
  .upload-icon-animation {
    animation: float 5s ease infinite;
  }
  
  .form-field-animation {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform, opacity;
  }
  
  .form-field-animation:focus-within {
    transform: scale(1.01) translateY(-2px);
  }
  
  .submit-button-hover {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .submit-button-hover::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      hsl(var(--primary) / 0.2), 
      hsl(var(--primary) / 0.2), 
      transparent
    );
    transform: translateX(-100%);
  }
  
  .submit-button-hover:hover::after {
    animation: shimmer 1.5s infinite;
  }
  
  .shimmer-effect {
    background: linear-gradient(90deg,
      hsl(var(--background) / 0.1),
      hsl(var(--background) / 0.3),
      hsl(var(--background) / 0.1)
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .card-hover-effect {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .card-hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
    border-color: hsl(var(--primary) / 0.5);
  }
  
  .product-card-animation {
    animation: fadeIn 0.5s forwards;
  }
  
  .badge-pulse {
    animation: pulse 2s infinite;
  }
  
  .stat-number {
    position: relative;
    display: inline-block;
    transition: all 0.3s ease;
  }
  
  .stat-number:hover {
    transform: scale(1.1);
  }
  
  .hover-scale-subtle {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .hover-scale-subtle:hover {
    transform: scale(1.03);
  }
  
  .hover-scale-medium {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .hover-scale-medium:hover {
    transform: scale(1.05);
  }
  
  .tab-transition {
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  /* Custom scrollable dialog content */
  .scrollable-dialog-content {
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .scrollable-dialog-content .dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
`;

// Use shared types from @/types/product
type Product = BaseProduct;
type ProductData = ProductApiData;

// Empty products array to be filled from the database
const initialProducts: Product[] = [];

// Define sort options with better typing
type SortOption = {
  label: string;
  value: string;
  key: keyof Product | ((product: Product) => string | number);
  direction?: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Name (A-Z)', value: 'name-asc', key: 'name', direction: 'asc' },
  { label: 'Name (Z-A)', value: 'name-desc', key: 'name', direction: 'desc' },
  { label: 'Price (Low to High)', value: 'price-asc', key: 'pricePerUnit', direction: 'asc' },
  { label: 'Price (High to Low)', value: 'price-desc', key: 'pricePerUnit', direction: 'desc' },
  { label: 'Created Date (Newest)', value: 'created-desc', key: 'createdAt', direction: 'desc' },
  { label: 'Created Date (Oldest)', value: 'created-asc', key: 'createdAt', direction: 'asc' },
  { label: 'Stock (High to Low)', value: 'stock-desc', key: 'currentAvailable', direction: 'desc' },
  { label: 'Stock (Low to High)', value: 'stock-asc', key: 'currentAvailable', direction: 'asc' },
  { label: 'Category (A-Z)', value: 'category-asc', key: 'category', direction: 'asc' },
  { label: 'Daily Capacity (High to Low)', value: 'capacity-desc', key: 'dailyCapacity', direction: 'desc' },
];

// Define comprehensive category options
const PRODUCT_CATEGORIES = [
  'all',
  'Food Products',
  'Beverage Products',
  'Natural Products',
  'Health & Wellness',
  'Packaging Materials',
  'Raw Materials',
  'Finished Goods',
  'Components',
  'Ingredients',
  'Supplements',
  'Organic Products',
  'Beverages',
  'Snacks',
  'Dairy Products',
  'Meat & Poultry',
  'Seafood',
  'Bakery Items',
  'Confectionery',
  'Condiments & Sauces',
  'Spices & Seasonings',
  'Oils & Fats',
  'Grains & Cereals',
  'Fruits & Vegetables',
  'Nuts & Seeds',
  'Personal Care',
  'Cosmetics',
  'Cleaning Products',
  'Industrial Materials',
  'Textiles',
  'Electronics Components',
  'Automotive Parts',
  'Construction Materials',
  'Agricultural Products',
  'Chemicals',
  'Pharmaceuticals',
  'Medical Devices',
  'Laboratory Equipment',
  'Machinery Parts',
  'Tools & Equipment',
  'Safety Products',
  'Environmental Products',
  'Sustainable Materials',
  'Eco-Friendly Products',
  'Biodegradable Items',
  'Recyclable Materials'
];

// Define comprehensive status options with descriptions
const DETAILED_PRODUCT_STATUSES = [
  { value: 'all', label: 'All Statuses', description: 'Show all products regardless of status' },
  { value: 'Active', label: 'Active', description: 'Products currently in production and available' },
  { value: 'Active - Sustainable', label: 'Active - Sustainable', description: 'Active products with eco-friendly features' },
  { value: 'Active - Premium', label: 'Active - Premium', description: 'High-value active products' },
  { value: 'Active - Standard', label: 'Active - Standard', description: 'Regular active products' },
  { value: 'Low Stock', label: 'Low Stock', description: 'Products below reorder point' },
  { value: 'Critical Stock', label: 'Critical Stock', description: 'Products with critically low inventory' },
  { value: 'Out of Stock', label: 'Out of Stock', description: 'Products currently unavailable' },
  { value: 'Below MOQ', label: 'Below MOQ', description: 'Products below minimum order quantity' },
  { value: 'Discontinued', label: 'Discontinued', description: 'Products no longer in production' },
  { value: 'In Development', label: 'In Development', description: 'Products under development' },
  { value: 'Pending Approval', label: 'Pending Approval', description: 'Products awaiting approval' },
  { value: 'Quality Hold', label: 'Quality Hold', description: 'Products on quality hold' },
  { value: 'Seasonal', label: 'Seasonal', description: 'Seasonal products' },
  { value: 'Limited Edition', label: 'Limited Edition', description: 'Limited time products' },
  { value: 'Pre-Launch', label: 'Pre-Launch', description: 'Products preparing for launch' },
  { value: 'Prototype', label: 'Prototype', description: 'Prototype stage products' },
  { value: 'Testing', label: 'Testing', description: 'Products under testing' },
  { value: 'Recalled', label: 'Recalled', description: 'Products under recall' },
  { value: 'Expired', label: 'Expired', description: 'Products past expiration' },
  { value: 'Maintenance', label: 'Under Maintenance', description: 'Products under maintenance' },
  { value: 'Archived', label: 'Archived', description: 'Archived products' }
];

// Enhanced product status logic with more granular statuses
const getProductStatus = (product: Product): string => {
  const currentStock = product.currentAvailable || 0;
  const reorderPoint = product.reorderPoint || 0;
  const minOrder = product.minOrderQuantity || 0;
  const price = product.pricePerUnit || 0;

  // Check for critical conditions first
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= (reorderPoint * 0.3)) return 'Critical Stock';
  if (currentStock <= reorderPoint) return 'Low Stock';
  if (currentStock < minOrder) return 'Below MOQ';
  if (product.sustainable) return 'Active - Sustainable';
  return 'Active';
};

// Define all possible product statuses
const PRODUCT_STATUSES = [
  'all',
  'Active',
  'Active - Sustainable', 
  'Low Stock',
  'Out of Stock',
  'Below MOQ',
  'Discontinued',
  'In Development'
];

export const Production = () => {
  const { isAuthenticated, user, role } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  // Authentication check using session API
  React.useEffect(() => {
    const checkAuthSession = async () => {
      if (!isAuthenticated) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            // Session invalid, redirect to login
            navigate("/auth?type=signin");
            return;
          }
          
          // Session is valid, user context should handle the rest
        } catch (error) {
          console.error('Error checking authentication session:', error);
          navigate("/auth?type=signin");
        }
      }
    };

    checkAuthSession();
  }, [isAuthenticated, navigate]);

  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [isReverseSorted, setIsReverseSorted] = useState(false);
  const [newlyCreatedProductId, setNewlyCreatedProductId] = useState<string | null>(null);

  // Production line state
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [lineStatusFilter, setLineStatusFilter] = useState("all");
  const [lineTypeFilter, setLineTypeFilter] = useState("all");
  const [isRefreshingLines, setIsRefreshingLines] = useState(false);
  const [activeBatches, setActiveBatches] = useState<Record<number, BatchInfo>>({});
  const [efficiencyHistory, setEfficiencyHistory] = useState<Record<number, { timestamp: string; value: number }[]>>({});
  const [lineUtilization, setLineUtilization] = useState<Record<number, number>>({});
  const [isRealTimeMonitoring, setIsRealTimeMonitoring] = useState(false);

  // Production line functions
  const refreshProductionLines = async () => {
    setIsRefreshingLines(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch production lines from API
      console.log('Refreshing production lines...');
    } catch (error) {
      console.error('Error refreshing production lines:', error);
      toast({
        title: "Error",
        description: "Failed to refresh production lines.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingLines(false);
    }
  };

  const handleAddProductionLine = () => {
    // Open dialog or navigate to add production line form
    console.log('Add production line clicked');
    toast({
      title: "Feature Coming Soon",
      description: "Production line management is under development.",
    });
  };

  const handleViewLineDetails = (line: ProductionLine) => {
    console.log('View line details:', line);
    toast({
      title: "Feature Coming Soon",
      description: "Line details view is under development.",
    });
  };

  const handleScheduleMaintenance = (line: ProductionLine) => {
    console.log('Schedule maintenance for:', line);
    toast({
      title: "Feature Coming Soon",
      description: "Maintenance scheduling is under development.",
    });
  };

  const handleAssignProduct = (line: ProductionLine) => {
    console.log('Assign product to:', line);
    toast({
      title: "Feature Coming Soon",
      description: "Product assignment is under development.",
    });
  };

  const handleToggleLineStatus = (line: ProductionLine) => {
    console.log('Toggle line status:', line);
    toast({
      title: "Feature Coming Soon",
      description: "Line status management is under development.",
    });
  };

  const handleCompleteBatch = (lineId: number) => {
    console.log('Complete batch for line:', lineId);
    toast({
      title: "Feature Coming Soon",
      description: "Batch completion is under development.",
    });
  };

  const handleStartNewBatch = (line: ProductionLine, productId: number, targetQuantity: number) => {
    console.log('Start new batch:', { line, productId, targetQuantity });
    toast({
      title: "Feature Coming Soon",
      description: "Batch starting is under development.",
    });
  };

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthenticated || role !== "manufacturer") {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch products using the backend API structure with session
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/products?limit=100`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Backend returns { products, page, pages, total }
        const basicProducts = data.products || [];
        
        if (basicProducts.length > 0) {
          // For each product, fetch detailed information from respective collection
          const productsWithDetails = await Promise.all(
            basicProducts.map(async (basicProduct: { _id: string; productName: string; manufacturerName: string; type: string }) => {
              try {
                // Get detailed product info using the details endpoint
                const detailsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/products/${basicProduct._id}/details`, {
                  method: 'GET',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (detailsResponse.ok) {
                  const detailsData = await detailsResponse.json();
                  const productDetails = detailsData.productDetails;
                  const productRef = detailsData.productReference;
                  
                  // Transform combined data to match UI expectations
                  const transformedProduct: Product = {
                    // Use reference data for basic info
                    id: parseInt(basicProduct._id.slice(-8), 16),
                    _id: basicProduct._id,
                    name: basicProduct.productName || productRef.productName,
                    brand: basicProduct.manufacturerName || productRef.manufacturerName,
                    
                    // Use details data for specific product info
                    category: productDetails.category || 'Food Products',
                    description: productDetails.description || '',
                    pricePerUnit: productDetails.pricePerUnit || 0,
                                         image: productDetails.image || '/4301793_article_good_manufacture_merchandise_production_icon.svg',
                    productType: productRef.type === 'food' ? 'Food Product' : productRef.type,
                    
                    // Production fields from FoodProduct
                    minOrderQuantity: productDetails.minOrderQuantity || 1000,
                    dailyCapacity: productDetails.dailyCapacity || 5000,
                    currentAvailable: productDetails.currentAvailable || 0,
                    unitType: productDetails.unitType || 'units',
                    leadTime: productDetails.leadTime || '1-2',
                    leadTimeUnit: productDetails.leadTimeUnit || 'weeks',
                    sustainable: productDetails.sustainable || false,
                    sku: productDetails.sku || `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
                    
                    // Manufacturing info
                    manufacturer: productDetails.manufacturer || productRef.manufacturerName,
                    originCountry: productDetails.originCountry || '',
                    manufacturerRegion: productDetails.manufacturerRegion || '',
                    priceCurrency: productDetails.priceCurrency || 'USD',
                    
                    // Food-specific fields (if available)
                    ...(productRef.type === 'food' && {
                      foodType: productDetails.foodType,
                      flavorType: productDetails.flavorType || [],
                      ingredients: productDetails.ingredients || [],
                      allergens: productDetails.allergens || [],
                      usage: productDetails.usage || [],
                      packagingType: productDetails.packagingType,
                      packagingSize: productDetails.packagingSize,
                      shelfLife: productDetails.shelfLife,
                      storageInstruction: productDetails.storageInstruction,
                      
                      // Create nested structure for backwards compatibility
                      foodProductData: {
                        flavorType: productDetails.flavorType || [],
                        ingredients: productDetails.ingredients || [],
                        usage: productDetails.usage || [],
                        packagingSize: productDetails.packagingSize || '',
                        shelfLife: productDetails.shelfLife || '',
                        manufacturerRegion: productDetails.manufacturerRegion || '',
                        foodType: productDetails.foodType || '',
                        allergens: productDetails.allergens || [],
                      }
                    }),
                    
                    // Calculated fields
                    reorderPoint: Math.floor((productDetails.minOrderQuantity || 1000) * 0.5),
                    lastProduced: new Date().toISOString(),
                    
                    // Timestamps
                    createdAt: productDetails.createdAt || new Date().toISOString(),
                    updatedAt: productDetails.updatedAt || new Date().toISOString(),
                  };
                  
                  return transformedProduct;
        } else {
                  // Fallback to basic product info if details fetch fails
                  console.warn(`Failed to fetch details for product ${basicProduct._id}`);
                  return {
                    id: parseInt(basicProduct._id.slice(-8), 16),
                    _id: basicProduct._id,
                    name: basicProduct.productName,
                    brand: basicProduct.manufacturerName,
                    category: 'Uncategorized',
                    description: '',
                    price: 0,
                    image: '/4301793_article_good_manufacture_merchandise_production_icon.svg',
                    productType: basicProduct.type === 'food' ? 'Food Product' : basicProduct.type,
                    minOrderQuantity: 1000,
                    dailyCapacity: 5000,
                    currentAvailable: 0,
                    unitType: 'units',
                    pricePerUnit: 0,
                    leadTime: '1-2',
                    leadTimeUnit: 'weeks',
                    sustainable: false,
                    sku: `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
                    manufacturer: basicProduct.manufacturerName,
                    reorderPoint: 500,
                    lastProduced: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  } as Product;
                }
              } catch (error) {
                console.error(`Error fetching details for product ${basicProduct._id}:`, error);
                // Return basic product info as fallback
                return {
                  id: parseInt(basicProduct._id.slice(-8), 16),
                  _id: basicProduct._id,
                  name: basicProduct.productName,
                  brand: basicProduct.manufacturerName,
                  category: 'Uncategorized',
                  description: '',
                  price: 0,
                  image: '/4301793_article_good_manufacture_merchandise_production_icon.svg',
                  productType: basicProduct.type === 'food' ? 'Food Product' : basicProduct.type,
                  minOrderQuantity: 1000,
                  dailyCapacity: 5000,
                  currentAvailable: 0,
                  unitType: 'units',
                  pricePerUnit: 0,
                  leadTime: '1-2',
                  leadTimeUnit: 'weeks',
                  sustainable: false,
                  sku: `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
                  manufacturer: basicProduct.manufacturerName,
                  reorderPoint: 500,
                  lastProduced: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as Product;
              }
            })
          );
          
          setProducts(productsWithDetails);
          console.log(`[SERVER] Fetched ${productsWithDetails.length} products`);
        } else {
          setProducts([]);
          console.log(`[SERVER] Production.tsx: Fetched 0 products`);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Check if it's a connection error
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          toast({
            title: "Backend Server Unavailable",
            description: "Please ensure the backend server is running on port 3000. Run 'cd BE && npm run dev' in a terminal.",
            variant: "destructive",
          });
        } else {
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again later.",
          variant: "destructive",
        });
        }
        
        // Set empty array on error
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

      fetchProducts();
  }, [isAuthenticated, role, toast]);

  // Enhanced search logic - searches multiple fields
  const searchProducts = (products: Product[], query: string): Product[] => {
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase().trim();
    
    return products.filter((product) => {
      // Basic product info
      const basicMatch = [
        product.name,
        product.sku,
        product.description,
        product.category,
        product.productType,
        product.unitType,
        product.manufacturer,
        product.brand,
      ].some(field => field?.toLowerCase().includes(searchTerm));

      // Price and numeric fields
      const numericMatch = [
        product.pricePerUnit?.toString(),
        product.currentAvailable?.toString(),
        product.dailyCapacity?.toString(),
        product.minOrderQuantity?.toString(),
      ].some(field => field?.includes(searchTerm));

      // Food-specific search
      let specificMatch = false;
      if (product.foodType || product.flavorType || product.ingredients) {
        specificMatch = [
          product.foodType,
          ...(product.flavorType || []),
          ...(product.ingredients || []),
          ...(product.allergens || []),
          ...(product.usage || []),
          product.packagingSize,
          product.shelfLife,
          product.manufacturerRegion,
        ].some(field => field?.toLowerCase().includes(searchTerm));
      }
      
      // Backwards compatibility - search in nested structures
      if (product.foodProductData) {
        specificMatch = specificMatch || [
          ...(product.foodProductData.flavorType || []),
          ...(product.foodProductData.ingredients || []),
          ...(product.foodProductData.usage || []),
          product.foodProductData.packagingSize,
          product.foodProductData.shelfLife,
          product.foodProductData.manufacturerRegion,
          product.foodProductData.foodType,
        ].some(field => field?.toLowerCase().includes(searchTerm));
      }

      return basicMatch || numericMatch || specificMatch;
    });
  };

  // Enhanced sorting logic with better typing
  const sortProducts = (products: Product[], sortOption: string): Product[] => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortOption);
    if (!option) return products;

    const sorted = [...products].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (typeof option.key === 'function') {
        aValue = option.key(a);
        bValue = option.key(b);
      } else {
        aValue = a[option.key] as string | number;
        bValue = b[option.key] as string | number;
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return option.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return option.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle date comparison
      const dateA = new Date(aValue as string | number | Date).getTime();
      const dateB = new Date(bValue as string | number | Date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return option.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Default string comparison
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();
      return option.direction === 'asc' 
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    return isReverseSorted ? sorted.reverse() : sorted;
  };

  // Memoized filtered and sorted products for performance
  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // Apply search filter
    result = searchProducts(result, searchQuery);

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => {
        const productStatus = getProductStatus(product);
        return productStatus === statusFilter;
      });
    }

    // Apply sorting
    result = sortProducts(result, sortBy);

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy, isReverseSorted]);

  // Get unique categories from products with enhanced options
  const categories = useMemo(() => {
    const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    // Combine predefined categories with actual product categories
    const allCategories = ['all', ...new Set([...PRODUCT_CATEGORIES.slice(1), ...productCategories])];
    return allCategories.filter(category => category && typeof category === 'string');
  }, [products]);

  // Get available statuses with enhanced options
  const availableStatuses = useMemo(() => {
    const productStatuses = [...new Set(products.map(p => getProductStatus(p)))];
    // Get all possible status values from DETAILED_PRODUCT_STATUSES
    const allStatuses = DETAILED_PRODUCT_STATUSES.map(status => status.value);
    // Combine with actual product statuses
    const combinedStatuses = ['all', ...new Set([...productStatuses, ...allStatuses.slice(1)])];
    return combinedStatuses;
  }, [products]);

  useEffect(() => {
    document.title = "Product Management - CPG Matchmaker";

    // If not authenticated or not a manufacturer, redirect
    if (!isAuthenticated) {
      navigate("/auth?type=signin");
    } else if (role !== "manufacturer") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, role]);

  useEffect(() => {
    // Create style element for hiding scrollbars
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    // Cleanup on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Early return with loading state - must be after all hooks
  if (!isAuthenticated || role !== "manufacturer") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Type for creating new products
type CreateProductData = Omit<
  Product,
  "_id" | "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku"
>;

// Type for updating products
type UpdateProductData = Product;

// Create a new product
  const handleCreateProduct = async (
    formData: CreateProductData,
    originalFormData?: ProductFormData // Optional parameter để nhận dữ liệu gốc từ form
  ) => {
    setIsLoading(true);
    
    // === DEBUG: Kiểm tra dữ liệu đầu vào ===
    console.log('=== HANDLE CREATE PRODUCT DEBUG ===');
    console.log('Form Data:', originalFormData || formData);  // validate từ đây
    console.log('Product Name:', (originalFormData?.name || formData.name)?.trim());
    console.log('Manufacturer Name:', (originalFormData?.manufacturerName || formData.manufacturerName)?.trim());
    console.log('User company name:', user?.companyName);
    console.log('Product Type:', originalFormData?.productType || formData.productType);
    console.log('Category:', originalFormData?.category || formData.category);
    console.log('Price per unit:', originalFormData?.pricePerUnit || formData.pricePerUnit);
    console.log('Description length:', (originalFormData?.description || formData.description)?.length || 0);
    console.log('=== END DEBUG ===');
    
    // === FRONTEND VALIDATION: Kiểm tra dữ liệu bắt buộc từ form gốc ===
    const sourceData = originalFormData || formData;
    const productName = sourceData.name?.trim();
    const manufacturerName = sourceData.manufacturerName?.trim() || user?.companyName?.trim();
    
    console.log('=== FRONTEND VALIDATION ===');
    console.log('Validating user input (formData):', sourceData);
    console.log('Trimmed Product Name:', `"${productName}"`);
    console.log('Trimmed Manufacturer Name:', `"${manufacturerName}"`);
    
    // Kiểm tra các field bắt buộc
    if (!productName || !manufacturerName) {
      console.error('=== VALIDATION FAILED ===');
      console.error('Product Name empty:', !productName);
      console.error('Manufacturer Name empty:', !manufacturerName);
      
      toast({
        title: t('production-error', "Error"),
        description: "Please enter full product name and manufacturer.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Kiểm tra các field quan trọng khác
    if (!sourceData.category?.trim()) {
      toast({
        title: t('production-error', "Error"),
        description: "Please select a product category.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!sourceData.description?.trim()) {
      toast({
        title: t('production-error', "Error"),
        description: "Please provide a product description.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!sourceData.pricePerUnit || sourceData.pricePerUnit <= 0) {
      toast({
        title: t('production-error', "Error"),
        description: "Please enter a valid price per unit.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!sourceData.productType?.trim()) {
      toast({
        title: t('production-error', "Error"),
        description: "Please select a product type.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    console.log('=== FRONTEND VALIDATION PASSED ===');
    
    try {
      // Prepare data for API
      const productData = {
        // Basic product info
        name: formData.name,
        brand: user?.companyName || formData.brand || 'Unknown',
        category: formData.category,
        description: formData.description,
        price: Number(formData.pricePerUnit),
        image: formData.image || '/4301793_article_good_manufacture_merchandise_production_icon.svg',
        productType: formData.productType,
        
        // Manufacturing details
        manufacturer: user?.companyName || 'Unknown',
        originCountry: formData.originCountry || 'Unknown',
        manufacturerRegion: formData.manufacturerRegion,
        
        // Production details
        minOrderQuantity: formData.minOrderQuantity,
        dailyCapacity: formData.dailyCapacity,
        currentAvailable: formData.currentAvailable,
        unitType: formData.unitType,
        pricePerUnit: Number(formData.pricePerUnit),
        priceCurrency: formData.priceCurrency || 'USD',
        leadTime: formData.leadTime,
        leadTimeUnit: formData.leadTimeUnit,
        sustainable: formData.sustainable,
        
        // Food-specific data
        ...(formData.productType === 'food' && {
          foodType: formData.foodType || formData.foodProductData?.foodType,
          flavorType: formData.flavorType || formData.foodProductData?.flavorType || [],
          ingredients: formData.ingredients || formData.foodProductData?.ingredients || [],
          allergens: formData.allergens || formData.foodProductData?.allergens || [],
          usage: formData.usage || formData.foodProductData?.usage || [],
          packagingType: formData.packagingType,
          packagingSize: formData.packagingSize || formData.foodProductData?.packagingSize,
          shelfLife: formData.shelfLife || formData.foodProductData?.shelfLife,
          storageInstruction: formData.storageInstruction,
        }),
        
        // Set type for backend
        type: formData.productType === 'Food Product' ? 'food' : 
              formData.productType === 'Beverage Product' ? 'beverage' :
              formData.productType === 'Healthy Product' ? 'health' : 'other',
              
        // Backend expects these fields
          manufacturerName: user?.companyName || 'Unknown',
        productName: formData.name,
      };
      
      // === DEBUG: Kiểm tra dữ liệu gửi lên API ===
      console.log('=== API PAYLOAD DEBUG ===');
      console.log('Product data to send to API:', productData);
      console.log('API productName:', productData.productName);
      console.log('API manufacturerName:', productData.manufacturerName);
      console.log('API name:', productData.name);
      console.log('API manufacturer:', productData.manufacturer);
      console.log('=== END API PAYLOAD DEBUG ===');
      
                // Use the product service to create product - đảm bảo sử dụng pricePerUnit
      productData.price = productData.pricePerUnit; // Tương thích ngược với API cũ
      const response = await productService.createProduct(productData);
      
      if (response.success) {
        // Transform response to match UI expectations
        const responseData = response.data;
        
        // Debug response data structure
        console.log('API response data:', responseData);
        
        // Safely handle _id which might be undefined
        const transformedProduct: Product = {
          id: responseData && responseData._id ? parseInt(responseData._id.slice(-8), 16) : Math.floor(Math.random() * 10000),
          _id: responseData && responseData._id ? responseData._id : `temp_${Date.now()}`,
          name: responseData?.name || productData.name,
          brand: responseData?.brand || productData.manufacturerName,
          category: responseData?.category || productData.category,
          description: responseData?.description || productData.description,
          price: responseData?.price || productData.pricePerUnit,
          image: responseData?.image || productData.image,
          productType: responseData?.productType || productData.productType,
          minOrderQuantity: responseData?.minOrderQuantity || productData.minOrderQuantity || 1000,
          dailyCapacity: responseData?.dailyCapacity || productData.dailyCapacity || 5000,
          currentAvailable: responseData?.currentAvailable || productData.currentAvailable || 0,
          unitType: responseData?.unitType || productData.unitType || 'units',
          pricePerUnit: responseData?.pricePerUnit || productData.pricePerUnit,
          leadTime: responseData?.leadTime || productData.leadTime || '1-2',
          leadTimeUnit: responseData?.leadTimeUnit || productData.leadTimeUnit || 'weeks',
          sustainable: responseData?.sustainable || productData.sustainable || false,
          sku: responseData?.sku || `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
          reorderPoint: Math.floor((responseData?.minOrderQuantity || productData.minOrderQuantity || 1000) * 0.5),
          lastProduced: new Date().toISOString(),
          createdAt: responseData?.createdAt || new Date().toISOString(),
          updatedAt: responseData?.updatedAt || new Date().toISOString(),
          // Add other fields as needed
          manufacturer: responseData?.manufacturer || productData.manufacturerName,
          originCountry: responseData?.originCountry || productData.originCountry,
          // Food-specific fields
          foodType: responseData?.foodType || productData.foodType,
          flavorType: responseData?.flavorType || productData.flavorType,
          ingredients: responseData?.ingredients || productData.ingredients,
          allergens: responseData?.allergens || productData.allergens,
          usage: responseData?.usage || productData.usage,
          packagingSize: responseData?.packagingSize || productData.packagingSize,
          shelfLife: responseData?.shelfLife || productData.shelfLife,
        };
        
        setProducts([...products, transformedProduct]);
        setNewlyCreatedProductId(responseData._id);
        console.log('Product created successfully via API');
      } else {
        throw new Error(response.error || 'Failed to create product');
      }
      
    toast({
      title: t('production-product-created', "Product created"),
        description: t('production-product-added', "{{name}} has been added to your product list.", { name: formData.name }),
    });
      
    setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: t('production-error', "Error"),
        description: t('production-create-error', "Failed to create product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing product
  const handleUpdateProduct = async (updatedProduct: Product) => {
    setIsLoading(true);

    try {
      if (!updatedProduct._id) {
        toast({
          title: t('production-error', "Error"),
          description: "Product ID is required for update",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate("/auth?type=signin");
        setIsLoading(false);
        return;
      }

      console.log('Attempting to update product:', { id: updatedProduct._id, name: updatedProduct.name });

      // === FRONTEND VALIDATION: Kiểm tra dữ liệu bắt buộc ===
      const productName = updatedProduct.name?.trim();
      const manufacturerName = updatedProduct.manufacturerName?.trim() || user?.companyName?.trim();
      
      console.log('=== UPDATE FRONTEND VALIDATION ===');
      console.log('Trimmed Product Name:', `"${productName}"`);
      console.log('Trimmed Manufacturer Name:', `"${manufacturerName}"`);
      
      // Kiểm tra các field bắt buộc
      if (!productName || !manufacturerName) {
        console.error('=== UPDATE VALIDATION FAILED ===');
        console.error('Product Name empty:', !productName);
        console.error('Manufacturer Name empty:', !manufacturerName);
        
        toast({
          title: t('production-error', "Error"),
          description: "Please enter full product name and manufacturer.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Kiểm tra các field quan trọng khác
      if (!updatedProduct.category?.trim()) {
        toast({
          title: t('production-error', "Error"),
          description: "Please select a product category.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!updatedProduct.description?.trim()) {
        toast({
          title: t('production-error', "Error"),
          description: "Please provide a product description.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!updatedProduct.pricePerUnit || updatedProduct.pricePerUnit <= 0) {
        toast({
          title: t('production-error', "Error"),
          description: "Please enter a valid price per unit.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('=== UPDATE FRONTEND VALIDATION PASSED ===');

      // Prepare data for API
      const productData = {
        name: updatedProduct.name,
        brand: updatedProduct.brand,
        category: updatedProduct.category,
        description: updatedProduct.description,
        price: Number(updatedProduct.pricePerUnit),
        image: updatedProduct.image,
        productType: updatedProduct.productType,
        minOrderQuantity: updatedProduct.minOrderQuantity,
        dailyCapacity: updatedProduct.dailyCapacity,
        currentAvailable: updatedProduct.currentAvailable,
        unitType: updatedProduct.unitType,
        pricePerUnit: Number(updatedProduct.pricePerUnit),
        leadTime: updatedProduct.leadTime,
        leadTimeUnit: updatedProduct.leadTimeUnit,
        sustainable: updatedProduct.sustainable,
        // Food-specific fields
        ...(updatedProduct.productType === 'food' && {
          foodType: updatedProduct.foodType,
          flavorType: updatedProduct.flavorType || [],
          ingredients: updatedProduct.ingredients || [],
          allergens: updatedProduct.allergens || [],
          usage: updatedProduct.usage || [],
          packagingSize: updatedProduct.packagingSize,
          shelfLife: updatedProduct.shelfLife,
        }),
      };
      
      // Use the product service to update product
      const response = await productService.updateProduct(updatedProduct._id, productData);
      
      console.log('Update response:', response);
      
      if (response.success) {
        // Update local state
        setProducts(products.map((p) => 
          p._id === updatedProduct._id ? updatedProduct : p
        ));
        console.log('Product updated successfully via API');
        
        toast({
          title: t('production-product-updated', "Product updated"),
          description: t('production-product-updated-successfully', "{{name}} has been updated successfully.", { name: updatedProduct.name }),
          variant: "default",
        });
        
        setIsAddDialogOpen(false);
        setSelectedProduct(null);
      } else {
        // Handle specific error cases
        const errorMessage = response.error || 'Failed to update product';
        
        if (errorMessage.includes('authentication') || errorMessage.includes('login') || errorMessage.includes('token')) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          navigate("/auth?type=signin");
          return;
        }
        
        // Show specific error message
        toast({
          title: t('production-error', "Error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Handle authentication errors
      if (error instanceof Error && (
        error.message.includes('authentication') || 
        error.message.includes('login') ||
        error.message.includes('token')
      )) {
        toast({
          title: "Authentication Required",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate("/auth?type=signin");
        return;
      }
      
      toast({
        title: t('production-error', "Error"),
        description: error instanceof Error ? error.message : t('production-update-error', "Failed to update product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (productId: string | number) => {
    setIsLoading(true);

    try {
      console.log('=== FRONTEND DELETE PRODUCT DEBUG ===');
      console.log('Input productId:', productId, 'Type:', typeof productId);
      
      const product = products.find((p) => p._id === String(productId) || p.id === productId);
      if (!product) {
        console.log('Product not found in local state');
        toast({
          title: t('production-error', "Error"),
          description: "Product not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('Product found in local state:', {
        _id: product._id,
        id: product.id,
        name: product.name,
        productType: product.productType
      });

      // Use MongoDB _id for API call (primary identifier)
      const deleteId = product._id || String(productId);
      console.log('Using deleteId for API:', deleteId);
      
      // Check if user is authenticated (JWT token OR session-based)
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      let hasValidAuth = false;
      
      // Check JWT token validity
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          if (payload.exp && payload.exp > currentTime) {
            console.log('Using valid JWT token authentication');
            hasValidAuth = true;
          } else {
            console.log('JWT token expired, removing from localStorage');
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.log('Invalid JWT token, removing from localStorage');
          localStorage.removeItem('auth_token');
        }
      }
      
      // Check session-based auth
      if (!hasValidAuth && user) {
        try {
          JSON.parse(user); // Validate user data
          console.log('Using session-based authentication (cookies)');
          hasValidAuth = true;
        } catch (error) {
          console.log('Invalid user data, removing from localStorage');
          localStorage.removeItem('user');
        }
      }
      
      // If no valid authentication found, redirect to login
      if (!hasValidAuth) {
        console.log('No valid authentication found');
        toast({
          title: "Authentication Required",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate("/auth?type=signin");
        setIsLoading(false);
        return;
      }
      
      console.log('Auth token exists, making API call...');
      
      // Use the product service to delete product
      const response = await productService.deleteProduct(deleteId);
      
      console.log('API response:', response);
      
      if (response.success) {
        // Remove product from local state using both possible IDs
        setProducts(prevProducts => 
          prevProducts.filter((p) => 
            p._id !== deleteId && 
            p._id !== String(productId) && 
            p.id !== productId
          )
        );
        console.log('Product removed from local state successfully');
        
        toast({
          title: t('production-product-deleted', "Product deleted"),
          description: t('production-product-removed', "{{name}} has been removed.", { name: product.name }),
          variant: "default",
        });
        
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
      } else {
        // Handle specific error cases
        const errorMessage = response.error || 'Failed to delete product';
        console.log('API error:', errorMessage);
        
        if (errorMessage.includes('authentication') || errorMessage.includes('login') || errorMessage.includes('token')) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          navigate("/auth?type=signin");
          return;
        }
        
        // Show specific error message
        toast({
          title: t('production-error', "Error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('=== FRONTEND DELETE ERROR ===');
      console.error('Error details:', error);
      
      // Handle authentication errors
      if (error instanceof Error && (
        error.message.includes('authentication') || 
        error.message.includes('login') ||
        error.message.includes('token')
      )) {
        toast({
          title: "Authentication Required",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate("/auth?type=signin");
        return;
      }
      
      // Handle network errors
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        toast({
          title: "Network Error",
          description: "Cannot connect to server. Please check if backend is running on port 3000.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: t('production-error', "Error"),
        description: error instanceof Error ? error.message : t('production-delete-error', "Failed to delete product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog for creating or updating a product
  const openEditDialog = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsAddDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Status badge generator with improved styling for light/dark modes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Development":
        return <StatusBadge status="Development" />;
      case "In Production":
        return <StatusBadge status="In Production" />;
      case "Completed":
        return <StatusBadge status="Completed" />;
      case "Scheduled":
        return <StatusBadge status="Scheduled" />;
      default:
        return <StatusBadge status={status as "Active" | "Inactive" | "pending"} />;
    }
  };

  // Function to generate badge based on product type
  const getProductTypeBadge = (productType: string) => {
    switch (productType) {
      case "Finished Good":
        return <StatusBadge status="Active" />;
      case "Raw Material":
        return <StatusBadge status="Development" />;
      case "Component":
        return <StatusBadge status="pending" />;
      default:
        return <StatusBadge status="inactive" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  // Function to open product details dialog
  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };



  return (
    <ManufacturerLayout>
      <MotionConfig reducedMotion="user">
        <motion.div
          className="max-w-none px-4 sm:px-6 lg:px-8 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="space-y-6">
            {/* Header with title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  {t('production-title', 'Product Management')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t('production-subtitle', 'Manage your products and manufacturing operations')}
                </p>
              </motion.div>
            </div>

            {/* Products Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductsTab
                products={filteredAndSortedProducts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categories={categories}
                availableStatuses={availableStatuses}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isReverseSorted={isReverseSorted}
                setIsReverseSorted={setIsReverseSorted}
                openEditDialog={openEditDialog}
                openDeleteDialog={openDeleteDialog}
                viewProductDetails={viewProductDetails}
                getProductTypeBadge={getProductTypeBadge}
                getProductStatus={getProductStatus}
                newlyCreatedProductId={newlyCreatedProductId}
              />
            </motion.div>
          </div>
        </motion.div>
      </MotionConfig>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px] p-0 max-h-[95vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DialogHeader className="px-6 pt-6 pb-2 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <PlusCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedProduct ? t('production-edit-product', "Edit Product") : t('production-add-product', "Add New Product")}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {selectedProduct 
                        ? t('production-edit-product-description', "Update your product details and specifications.") 
                        : t('production-add-product-description', "Create a new product for your manufacturing catalog.")}
                    </DialogDescription>
                  </div>
                </motion.div>
              </DialogHeader>

              <div className="px-6 py-6 overflow-y-auto max-h-[calc(95vh-130px)]">
                {/* Conditionally render appropriate form component based on product type */}
                {selectedProduct?.productType === "Food Product" ? (
                                      <ProductFormFoodBeverage
                      product={toFormData(selectedProduct)}
                      onSubmit={(productData: ProductFormData) => {
                        const convertedData = toBaseProduct(productData);
                        if (selectedProduct) {
                          handleUpdateProduct(convertedData);
                        } else {
                          // Truyền cả convertedData và productData gốc từ form
                          handleCreateProduct(convertedData as CreateProductData, productData);
                        }
                      }}
                      isLoading={isLoading}
                      parentCategory="Food & Beverage"
                    />
                ) : (
                  <ProductForm
                    product={selectedProduct}
                    onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg border-destructive/20">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 h-5 w-5 text-destructive" />
                  {t('production-delete-product', "Delete Product")}
                </DialogTitle>
                <DialogDescription className="text-foreground/80">
                  {t('production-delete-product-confirmation', "Are you sure you want to delete '{{product}}'? This action cannot be undone.", 
                    { product: selectedProduct?.name })}
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 mt-2 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Warning: This action is irreversible</p>
                    <p className="text-sm text-foreground/80">All product data will be permanently deleted</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  {t('production-cancel', "Cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedProduct && handleDeleteProduct(selectedProduct._id || selectedProduct.id)}
                  disabled={isLoading}
                  className="flex items-center bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t('production-delete', "Delete")}
                </Button>
              </DialogFooter>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
        <DialogContent className="sm:max-w-[1200px] p-0 scrollable-dialog-content">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col h-full"
            >
              <DialogHeader className="px-6 pt-6 pb-2 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {t('production-product-details', "Product Details")}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {selectedProduct?.name}
                    </DialogDescription>
                  </div>
                </motion.div>
              </DialogHeader>

              <div className="dialog-body">
                {selectedProduct && (
                  <ProductDetailsContent
                    product={selectedProduct}
                    getProductTypeBadge={getProductTypeBadge}
                    onEdit={() => {
                      setIsProductDetailsOpen(false);
                      openEditDialog(selectedProduct);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </ManufacturerLayout>
  );
};

// Add default export
export default Production;

// ProductsTab Component
interface ProductsTabProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categories: string[];
  availableStatuses: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  isReverseSorted: boolean;
  setIsReverseSorted: (reverse: boolean) => void;
  openEditDialog: (product?: Product) => void;
  openDeleteDialog: (product: Product) => void;
  viewProductDetails: (product: Product) => void;
  getProductTypeBadge: (productType: string) => JSX.Element;
  getProductStatus: (product: Product) => string;
  newlyCreatedProductId?: string | null;
}

// Helper function để kiểm tra category an toàn
const safeIncludes = (str: string | undefined | null, searchString: string): boolean => {
  return typeof str === 'string' && str.includes(searchString);
};

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
  availableStatuses,
  sortBy,
  setSortBy,
  isReverseSorted,
  setIsReverseSorted,
  openEditDialog,
  openDeleteDialog,
  viewProductDetails,
  getProductTypeBadge,
  getProductStatus,
  newlyCreatedProductId,
}) => {
  const { t } = useTranslation();
  const [animateCards, setAnimateCards] = useState(false);

  // Trigger animation when component mounts or products change
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, [products.length]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('name-asc');
    setIsReverseSorted(false);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'name-asc' || isReverseSorted;

  return (
    <div className="space-y-6">
      {/* Enhanced Filters and Search */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left group: search & filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, ingredients, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full form-field-animation hover:border-muted-foreground/50"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] form-field-animation hover:border-muted-foreground/50">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent side="bottom" className="max-h-[300px]">
              <SelectItem value="all" className="font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('production-all-categories', 'All Categories')}
                </div>
              </SelectItem>
              <SelectSeparator />
              {categories.slice(1).filter(category => category && typeof category === 'string').map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    {safeIncludes(category, 'Food') && <Wheat className="h-4 w-4 text-green-600" />}
                    {safeIncludes(category, 'Natural') && <Leaf className="h-4 w-4 text-green-600" />}
                    {safeIncludes(category, 'Health') && <Activity className="h-4 w-4 text-blue-600" />}
                    {safeIncludes(category, 'Packaging') && <Package2 className="h-4 w-4 text-purple-600" />}
                    {safeIncludes(category, 'Beverage') && <Package className="h-4 w-4 text-cyan-600" />}
                    {safeIncludes(category, 'Industrial') && <Factory className="h-4 w-4 text-gray-600" />}
                    {safeIncludes(category, 'Chemical') && <Beaker className="h-4 w-4 text-orange-600" />}
                    {safeIncludes(category, 'Medical') && <Award className="h-4 w-4 text-red-600" />}
                    {safeIncludes(category, 'Electronic') && <Zap className="h-4 w-4 text-yellow-600" />}
                    {safeIncludes(category, 'Sustainable') && <Leaf className="h-4 w-4 text-green-600" />}
                    {!safeIncludes(category, 'Food') && !safeIncludes(category, 'Natural') && !safeIncludes(category, 'Health') && 
                     !safeIncludes(category, 'Packaging') && !safeIncludes(category, 'Beverage') && !safeIncludes(category, 'Industrial') && 
                     !safeIncludes(category, 'Chemical') && !safeIncludes(category, 'Medical') && !safeIncludes(category, 'Electronic') && 
                     !safeIncludes(category, 'Sustainable') && <Tag className="h-4 w-4 text-muted-foreground" />}
                    <span>{category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[260px] form-field-animation hover:border-muted-foreground/50 overflow-hidden whitespace-nowrap">
              <SelectValue placeholder="Select Status" className="truncate" />
            </SelectTrigger>
            <SelectContent side="bottom" className="max-h-[300px] min-w-full">
              {DETAILED_PRODUCT_STATUSES.filter(status => 
                status.value === 'all' || availableStatuses.includes(status.value)
              ).map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {status.value === 'all' && <Package className="h-4 w-4" />}
                      {status.value.includes('Active') && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {status.value.includes('Stock') && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {status.value === 'Out of Stock' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      {status.value === 'Discontinued' && <X className="h-4 w-4 text-gray-600" />}
                      {status.value === 'In Development' && <Settings className="h-4 w-4 text-blue-600" />}
                      {status.value === 'Seasonal' && <Calendar className="h-4 w-4 text-purple-600" />}
                      {status.value === 'Limited Edition' && <Star className="h-4 w-4 text-yellow-600" />}
                      {status.value === 'Prototype' && <Beaker className="h-4 w-4 text-orange-600" />}
                      {status.value === 'Testing' && <Activity className="h-4 w-4 text-blue-600" />}
                      {status.value === 'Quality Hold' && <Pause className="h-4 w-4 text-red-600" />}
                      {status.value === 'Maintenance' && <Wrench className="h-4 w-4 text-gray-600" />}
                      {!status.value.includes('Active') && !status.value.includes('Stock') && 
                       status.value !== 'Out of Stock' && status.value !== 'Discontinued' && 
                       status.value !== 'In Development' && status.value !== 'Seasonal' && 
                       status.value !== 'Limited Edition' && status.value !== 'Prototype' && 
                       status.value !== 'Testing' && status.value !== 'Quality Hold' && 
                       status.value !== 'Maintenance' && status.value !== 'all' && 
                       <InfoIcon className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{status.label}</span>
                    </div>
                    {status.value !== 'all' && (
                      <span className="text-xs text-muted-foreground ml-6">
                        {status.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] form-field-animation hover:border-muted-foreground/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Reverse Sort Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReverseSorted(!isReverseSorted)}
              className={cn(
                "p-2 transition-colors",
                isReverseSorted && "bg-primary text-primary-foreground"
              )}
              title={isReverseSorted ? "Normal order" : "Reverse order"}
            >
              {isReverseSorted ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs flex items-center gap-1 hover-scale-subtle"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Right group: create button & results count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {hasActiveFilters && ` (filtered)`}
          </div>
          
          <Button
            onClick={() => openEditDialog()}
            className="w-full sm:w-auto submit-button-hover hover-scale-medium group"
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="mr-2"
            >
              <PlusCircle className="h-4 w-4" />
            </motion.div>
            <span>{t('production-create-new-product', 'Create New Product')}</span>
          </Button>
        </div>
      </motion.div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-lg text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Package className="h-16 w-16 text-muted-foreground/60 mx-auto" />
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-xl font-medium mb-2">{t('production-no-products-found', "No products found")}</h3>
              <p className="text-muted-foreground max-w-md">
                {hasActiveFilters
                  ? t('production-adjust-search', "Try adjusting your search criteria or filters to find what you're looking for.")
                  : t('production-start-create', "Start by creating your first product using the button above.")}
              </p>
            </motion.div>

            {hasActiveFilters && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-2 hover-scale-subtle"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  animateCards
                    ? {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }
                    : {}
                }
                className="group"
              >
                <Card className={cn(
                  "overflow-hidden card-hover-effect border border-muted-foreground/20 bg-background/60 backdrop-blur-sm",
                  newlyCreatedProductId === product._id && "ring-2 ring-primary ring-opacity-50 shadow-lg border-primary/50 bg-primary/5"
                )}>
                  <CardHeader className="p-0">
                    <div
                      className="aspect-video w-full bg-muted relative group cursor-pointer overflow-hidden"
                      onClick={() => viewProductDetails(product)}
                    >
                      {newlyCreatedProductId === product._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-2 right-2 z-10"
                        >
                          <Badge className="bg-primary text-primary-foreground shadow-md">
                            <Star className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        </motion.div>
                      )}
                      {product.image ? (
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5 }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted/90 to-muted/60">
                          <motion.div
                            initial={{ opacity: 0.8, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              repeat: Infinity,
                              repeatType: "mirror",
                              duration: 2,
                            }}
                          >
                            <Package className="h-12 w-12 text-muted-foreground/40" />
                          </motion.div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-white font-medium truncate">
                            {product.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          SKU: {product.sku}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Category: {product.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-lg font-semibold">
                          ${product.pricePerUnit?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per {product.unitType}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          {
                            'border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800': getProductStatus(product) === 'Active' || getProductStatus(product) === 'Active - Sustainable',
                            'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800': getProductStatus(product) === 'Low Stock' || getProductStatus(product) === 'Below MOQ',
                            'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800': getProductStatus(product) === 'Out of Stock',
                            'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800': getProductStatus(product) === 'In Development',
                            'border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700': getProductStatus(product) === 'Discontinued',
                          }
                        )}
                      >
                        {getProductStatus(product)}
                      </Badge>
                      {product.sustainable && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Leaf className="h-3 w-3" />
                          <span className="text-xs">Eco</span>
                        </div>
                      )}
                    </div>

                    {/* Stock and Capacity Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Stock:</span> {product.currentAvailable || 0}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {product.dailyCapacity || 0}/day
                      </div>
                    </div>

                    {/* Lead Time */}
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Lead Time:</span> {product.leadTime} {product.leadTimeUnit}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewProductDetails(product)}
                      className="flex items-center gap-1 hover-scale-subtle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(product)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(product)}
                          className="flex items-center gap-2 text-destructive dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Types for production management are now imported from @/types/product

interface ProductionTabProps {
  productionLines: ProductionLine[];
  products: Product[];
  lineStatusFilter: string;
  setLineStatusFilter: (status: string) => void;
  lineTypeFilter: string;
  setLineTypeFilter: (type: string) => void;
  isRefreshingLines: boolean;
  refreshProductionLines: () => void;
  handleViewLineDetails: (line: ProductionLine) => void;
  handleAddProductionLine: () => void;
  handleScheduleMaintenance: (line: ProductionLine) => void;
  handleAssignProduct: (line: ProductionLine) => void;
  handleToggleLineStatus: (line: ProductionLine) => void;
  activeBatches: Record<number, BatchInfo>;
  efficiencyHistory: Record<number, { timestamp: string; value: number }[]>;
  lineUtilization: Record<number, number>;
  isRealTimeMonitoring: boolean;
  handleCompleteBatch: (lineId: number) => void;
  handleStartNewBatch: (
    line: ProductionLine,
    productId: number,
    targetQuantity: number
  ) => void;
}

const ProductionTab: React.FC<ProductionTabProps> = ({
  productionLines,
  products,
  lineStatusFilter,
  setLineStatusFilter,
  lineTypeFilter,
  setLineTypeFilter,
  isRefreshingLines,
  refreshProductionLines,
  handleViewLineDetails,
  handleAddProductionLine,
  handleScheduleMaintenance,
  handleAssignProduct,
  handleToggleLineStatus,
  activeBatches,
  efficiencyHistory,
  lineUtilization,
  isRealTimeMonitoring,
  handleCompleteBatch,
  handleStartNewBatch,
}) => {
  const { t } = useTranslation();
  
  // Filter production lines based on filters
  const filteredLines = productionLines.filter((line) => {
    const matchesStatus =
      lineStatusFilter === "all" || line.status === lineStatusFilter;
    const matchesType =
      lineTypeFilter === "all" || line.line_type.includes(lineTypeFilter);
    return matchesStatus && matchesType;
  });

  // Get unique line types for filter dropdown
  const lineTypes = [
    "all",
    ...Array.from(new Set(productionLines.map((l) => l.line_type))),
  ];

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <motion.div
        className="flex flex-col lg:flex-row justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={lineStatusFilter} onValueChange={setLineStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-field-animation">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('production-all-statuses', "All Statuses")}</SelectItem>
              <SelectItem value="Active">{t('production-active', 'Active')}</SelectItem>
              <SelectItem value="Maintenance">{t('production-maintenance', 'Maintenance')}</SelectItem>
              <SelectItem value="Idle">{t('production-idle', 'Idle')}</SelectItem>
              <SelectItem value="Setup">{t('production-setup', 'Setup')}</SelectItem>
              <SelectItem value="Offline">{t('production-offline', 'Offline')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={lineTypeFilter} onValueChange={setLineTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-field-animation">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {lineTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? t('production-all-types', "All Types") : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="default"
            onClick={refreshProductionLines}
            disabled={isRefreshingLines}
            className="flex items-center hover-scale-subtle"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefreshingLines ? "animate-spin" : ""
              }`}
            />
            {t('production-refresh', 'Refresh')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAddProductionLine}
            className="flex items-center hover-scale-medium submit-button-hover"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('production-add-line', 'Add Production Line')}
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="card-hover-effect border-primary/10 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Factory className="h-4 w-4 mr-2 text-primary/70" />
              {t('production-active-lines', 'Active Lines')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stat-number">
              {productionLines.filter((l) => l.status === "Active").length}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {productionLines.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (productionLines.filter((l) => l.status === "Active").length /
                  productionLines.length) *
                  100
              )}
              % {t('production-lines-operational', 'lines operational')}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2 text-amber-500/70" />
              {t('production-maintenance', 'Maintenance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stat-number">
              {productionLines.filter((l) => l.status === "Maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {productionLines.filter((l) => l.status === "Maintenance")
                .length > 0
                ? t('production-lines-in-maintenance', 'Lines currently under maintenance')
                : t('production-no-maintenance', 'No lines in maintenance')}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500/70" />
              {t('production-avg-efficiency', 'Avg. Efficiency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stat-number">
              {productionLines.filter((l) => l.status === "Active").length > 0
                ? Math.round(
                    productionLines
                      .filter((l) => l.status === "Active")
                      .reduce((sum, line) => sum + line.efficiency, 0) /
                      productionLines.filter((l) => l.status === "Active")
                        .length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('production-average-across-lines', 'Average efficiency across active lines')}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect border-green-500/10 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-green-500/70" />
              {t('production-active-batches', 'Active Batches')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stat-number">
              {
                Object.values(activeBatches).filter(
                  (b) => b.status === "in_progress"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('production-batches-in-production', 'Batches currently in production')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Production Lines */}
      <AnimatePresence mode="wait">
        {filteredLines.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-lg text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Factory className="h-16 w-16 text-muted-foreground/60 mx-auto" />
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-xl font-medium mb-2">
                {t('production-no-lines-found', 'No production lines found')}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {lineStatusFilter !== "all" || lineTypeFilter !== "all"
                  ? t('production-try-adjusting-filters', 'Try adjusting your filters to see more production lines.')
                  : t('production-start-adding', 'Start by adding your first production line.')}
              </p>
            </motion.div>

            {(lineStatusFilter !== "all" || lineTypeFilter !== "all") && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLineStatusFilter("all");
                    setLineTypeFilter("all");
                  }}
                  className="mt-2 hover-scale-subtle"
                >
                  {t('production-clear-filters', 'Clear Filters')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t('production-line-name', 'Line Name')}</TableHead>
                    <TableHead>{t('production-status', 'Status')}</TableHead>
                    <TableHead>{t('production-current-product', 'Product')}</TableHead>
                    <TableHead className="text-right">{t('production-efficiency', 'Efficiency')}</TableHead>
                    <TableHead className="text-right">{t('production-daily-capacity', 'Daily Capacity')}</TableHead>
                    <TableHead className="text-right">{t('production-next-maintenance', 'Next Maintenance')}</TableHead>
                    <TableHead className="text-right">{t('production-actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredLines.map((line, index) => (
                      <motion.tr
                        key={line.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.3,
                            delay: index * 0.03,
                          },
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewLineDetails(line)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                line.status === "Active"
                                  ? "bg-green-500"
                                  : line.status === "Maintenance"
                                  ? "bg-amber-500"
                                  : line.status === "Idle"
                                  ? "bg-blue-500"
                                  : line.status === "Setup"
                                  ? "bg-purple-500"
                                  : "bg-gray-500"
                              }`}
                            />
                            {line.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              line.status === "Active"
                                ? "bg-green-500/10 text-green-600"
                                : line.status === "Maintenance"
                                ? "bg-amber-500/10 text-amber-600"
                                : line.status === "Idle"
                                ? "bg-blue-500/10 text-blue-600"
                                : line.status === "Setup"
                                ? "bg-purple-500/10 text-purple-600"
                                : "bg-gray-500/10 text-gray-600"
                            }
                          >
                            {line.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {line.product === "N/A"
                            ? "Not assigned"
                            : line.product}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span
                              className={`mr-2 ${
                                line.efficiency > 90
                                  ? "text-green-600"
                                  : line.efficiency > 75
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {line.efficiency}%
                            </span>
                            {isRealTimeMonitoring &&
                              line.status === "Active" && (
                                <motion.div
                                  animate={{
                                    opacity: [0.4, 1, 0.4],
                                    scale: [0.8, 1, 0.8],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                  }}
                                  className="w-2 h-2 rounded-full bg-green-500 ml-1"
                                />
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {line.daily_capacity}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.next_maintenance}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover-scale-subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLineDetails(line);
                              }}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover-scale-subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLineStatus(line);
                              }}
                            >
                              {line.status === "Active" ? (
                                <PauseCircle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Play className="h-4 w-4 text-green-600" />
                              )}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover-scale-subtle"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('production-actions', 'Actions')}</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScheduleMaintenance(line);
                                  }}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Wrench className="h-4 w-4 mr-2" />
                                  {t('production-schedule-maintenance', 'Schedule Maintenance')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignProduct(line);
                                  }}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  {t('production-assign-product', 'Assign Product')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// LineDetailsContent Component
interface LineDetailsContentProps {
  line: ProductionLine;
  products: Product[];
  handleToggleLineStatus: (line: ProductionLine) => void;
  handleScheduleMaintenance: () => void;
  handleAssignProduct: () => void;
  activeBatches: Record<number, BatchInfo>;
  efficiencyHistory: Record<number, { timestamp: string; value: number }[]>;
  lineUtilization: Record<number, number>;
  isRealTimeMonitoring: boolean;
  handleStartNewBatch: (
    line: ProductionLine,
    productId: number,
    targetQuantity: number
  ) => void;
  handleCompleteBatch: (lineId: number) => void;
}

const LineDetailsContent: React.FC<LineDetailsContentProps> = ({
  line,
  products,
  handleToggleLineStatus,
  handleScheduleMaintenance,
  handleAssignProduct,
  activeBatches,
  efficiencyHistory,
  lineUtilization,
  isRealTimeMonitoring,
  handleStartNewBatch,
  handleCompleteBatch,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              line.status === "Active"
                ? "bg-green-500"
                : line.status === "Maintenance"
                ? "bg-amber-500"
                : line.status === "Idle"
                ? "bg-blue-500"
                : line.status === "Setup"
                ? "bg-purple-500"
                : "bg-gray-500"
            }`}
          />
          <h2 className="text-2xl font-bold">{line.name}</h2>
          <Badge
            variant="outline"
            className={`ml-3 ${
              line.status === "Active"
                ? "bg-green-500/10 text-green-600"
                : line.status === "Maintenance"
                ? "bg-amber-500/10 text-amber-600"
                : line.status === "Idle"
                ? "bg-blue-500/10 text-blue-600"
                : line.status === "Setup"
                ? "bg-purple-500/10 text-purple-600"
                : "bg-gray-500/10 text-gray-600"
            }`}
          >
            {line.status}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant={line.status === "Active" ? "destructive" : "default"}
            size="sm"
            onClick={() => handleToggleLineStatus(line)}
            className="hover-scale-subtle"
          >
            {line.status === "Active" ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Stop Line
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Line
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleScheduleMaintenance}
            className="hover-scale-subtle"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignProduct}
            className="hover-scale-subtle"
          >
            <Package className="h-4 w-4 mr-2" />
            Assign Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2 text-primary/70" />
              {t('production-current-product', 'Current Product')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {line.product === "N/A" ? (
                <span className="text-muted-foreground">{t('production-no-product-assigned', 'None assigned')}</span>
              ) : (
                line.product
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-primary/70" />
              {t('production-efficiency', 'Efficiency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{line.efficiency}%</div>
              {isRealTimeMonitoring && line.status === "Active" && (
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="w-2 h-2 rounded-full bg-green-500 ml-3"
                />
              )}
            </div>
            <Progress
              value={line.efficiency}
              className={`h-1.5 mt-2 rounded-full ${
                line.efficiency > 90
                  ? "bg-green-500"
                  : line.efficiency > 75
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarCheck className="h-4 w-4 mr-2 text-primary/70" />
              {t('production-next-maintenance', 'Next Maintenance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold">{line.next_maintenance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('production-last-maintenance', 'Last')}: {line.last_maintenance}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Factory className="h-4 w-4 mr-2 text-primary/70" />
              {t('production-daily-capacity', 'Daily Capacity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold">{line.daily_capacity}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {line.line_type}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground">
        This line has been operational since {line.operational_since}
      </div>

      {/* Create a placeholder for the line's current batch details, maintenance history, etc. */}
      <div>
        {line.current_batch && (
          <Card className="card-hover-effect border-primary/10 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-primary/70" />
                {t('production-current-batch', 'Current Batch')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('production-batch-id', 'Batch ID')}:</span>
                  <span className="font-medium">{line.current_batch.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('production-batch-status', 'Status')}:</span>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600"
                  >
                    {line.current_batch.status === "in_progress"
                      ? t('production-status-in-progress', "In Progress")
                      : line.current_batch.status === "completed"
                      ? t('production-status-completed', "Completed")
                      : line.current_batch.status === "paused"
                      ? t('production-status-paused', "Paused")
                      : t('production-status-cancelled', "Cancelled")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('production-target-quantity', 'Target')}:</span>
                  <span className="font-medium">
                    {line.current_batch.target_quantity} {t('production-units', 'units')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('production-produced-quantity', 'Produced')}:</span>
                  <span className="font-medium">
                    {line.current_batch.produced_quantity} {t('production-units', 'units')}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('production-progress', 'Progress')}:</span>
                    <span className="font-medium">{Math.round((line.current_batch.produced_quantity / line.current_batch.target_quantity) * 100)}%</span>
                  </div>
                  <Progress
                    value={
                      (line.current_batch.produced_quantity /
                        line.current_batch.target_quantity) *
                      100
                    }
                    className="h-2 rounded-full"
                  />
                </div>

                {line.current_batch.status === "in_progress" && (
                  <Button
                    onClick={() => handleCompleteBatch(line.id)}
                    variant="default"
                    className="mt-2"
                  >
                    {t('production-complete-batch', 'Complete Batch')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Product Form Component
interface ProductFormProps {
  product: Product | null;
  onSubmit: (
    product:
      | Product
      | Omit<
          Product,
          | "_id"
          | "id"
          | "createdAt"
          | "updatedAt"
          | "lastProduced"
          | "reorderPoint"
          | "sku"
        >
  ) => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<'typeSelection' | 'details'>(product ? 'details' : 'typeSelection');
  const [selectedProductType, setSelectedProductType] = useState<string>(product?.productType || "");
  
  const [formData, setFormData] = useState<Partial<Product>>(
    product
      ? { ...product }
      : {
          name: "",
          category: "",
          minOrderQuantity: 1000,
          dailyCapacity: 5000,
          unitType: "units",
          currentAvailable: 0,
          pricePerUnit: 0,
          productType: "",
          image: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastProduced: new Date().toISOString(),
          reorderPoint: Math.floor(1000 * 0.5), // Default to 50% of MOQ
          leadTime: "1-2",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );
  
  // Food product specific fields
  const [foodProductData, setFoodProductData] = useState({
    flavorType: [] as string[],
    ingredients: [] as string[],
    usage: [] as string[],
    packagingSize: "",
    shelfLife: "",
    manufacturerRegion: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          image: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }

    // Handle numeric inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
      return;
    }

    // Handle text and other inputs
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFoodProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFoodProductData({
      ...foodProductData,
      [name]: value,
    });
  };

  const handleFlavorTypeChange = (flavor: string) => {
    setFoodProductData(prev => {
      if (prev.flavorType.includes(flavor)) {
        return {
          ...prev,
          flavorType: prev.flavorType.filter(f => f !== flavor)
        };
      } else {
        return {
          ...prev,
          flavorType: [...prev.flavorType, flavor]
        };
      }
    });
  };

  const handleArrayInputChange = (field: 'ingredients' | 'usage', value: string) => {
    if (value.trim()) {
      const values = value.split(',').map(item => item.trim());
      setFoodProductData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity =
        "Minimum order quantity must be greater than zero";
    }

    if (!formData.dailyCapacity || formData.dailyCapacity <= 0) {
      newErrors.dailyCapacity = "Daily capacity must be greater than zero";
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = "Price per unit must be greater than zero";
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
    }

    if (!formData.unitType) {
      newErrors.unitType = "Unit type is required";
    }

    // Validate food product fields if product type is Food
    if (selectedProductType === 'Food Product') {
      if (foodProductData.flavorType.length === 0) {
        newErrors.flavorType = "At least one flavor type is required";
      }
      
      if (!foodProductData.ingredients || foodProductData.ingredients.length === 0) {
        newErrors.ingredients = "Ingredients are required";
      }
      
      if (!foodProductData.packagingSize) {
        newErrors.packagingSize = "Packaging size is required";
      }
      
      if (!foodProductData.shelfLife) {
        newErrors.shelfLife = "Shelf life is required";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleProductTypeSelect = (type: string) => {
    setSelectedProductType(type);
    setFormData({
      ...formData,
      productType: type,
    });
    setCurrentStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitLoading(true);
      
      try {
        // Debug: Check if authentication token exists
        const token = localStorage.getItem('auth_token');
        console.log('Auth token exists:', !!token);
        
        // Prepare data based on product type
        let productData: ProductData = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          pricePerUnit: Number(formData.pricePerUnit),
          brand: user?.companyName || 'Unknown',
          minimumOrderQuantity: formData.minOrderQuantity,
          dailyCapacity: formData.dailyCapacity,
          unitType: formData.unitType,
          currentAvailableStock: formData.currentAvailable,
          leadTime: formData.leadTime,
          leadTimeUnit: formData.leadTimeUnit,
          sustainable: formData.sustainable,
          productType: selectedProductType,
          image: formData.image || '/4301793_article_good_manufacture_merchandise_production_icon.svg',
        };
        
        // Save to Food Product database if applicable
        if (selectedProductType === 'Food Product') {
          // Add specific fields for product data
          productData = {
            ...productData,
            flavorType: foodProductData.flavorType,
            ingredients: foodProductData.ingredients,
            usage: foodProductData.usage,
            packagingSize: foodProductData.packagingSize,
            shelfLife: foodProductData.shelfLife,
            manufacturerName: user?.companyName || 'Unknown',
            manufacturerRegion: foodProductData.manufacturerRegion,
          };
          
          // Prepare food product specific data for the database
          const foodProductDataForApi = {
            productName: formData.name,
            category: formData.category,
            flavorType: foodProductData.flavorType,
            ingredients: foodProductData.ingredients,
            usage: foodProductData.usage,
            packagingSize: foodProductData.packagingSize,
            shelfLife: foodProductData.shelfLife,
            manufacturerName: user?.companyName || 'Unknown', 
            manufacturerRegion: foodProductData.manufacturerRegion,
          };
          
          // TODO: Save food product to database when API is ready
          try {
            // const foodProductResponse = await foodProductApi.createFoodProduct(foodProductDataForApi);
            // console.log('Food product saved to database:', foodProductResponse.data);
            console.log('Food product data prepared for API:', foodProductDataForApi);
          } catch (foodError) {
            console.error('Error saving food product:', foodError);
          }
        }

        const finalProductData = {
          ...formData,
          // Add food product specific data if type is Food
          ...(selectedProductType === 'Food Product' && {
            foodProductData
          })
        };

      if (product) {
          // Update existing product using onSubmit for UI update
        onSubmit({
          ...product,
            ...finalProductData,
        } as Product);
          
          // TODO: When backend API is ready, call update API
          // if (product.id) {
          //   await productApi.updateProduct(product.id.toString(), productData);
          // }
          
          // Update food product if applicable
          if (product.productType === 'Food Product' && product.id) {
            try {
              const foodProductUpdateData = {
                productName: formData.name,
                category: formData.category,
                flavorType: foodProductData.flavorType,
                ingredients: foodProductData.ingredients,
                usage: foodProductData.usage,
                packagingSize: foodProductData.packagingSize,
                shelfLife: foodProductData.shelfLife,
                manufacturerName: user?.companyName || 'Unknown',
                manufacturerRegion: foodProductData.manufacturerRegion,
              };
              
              // TODO: Update food product via API when backend is ready
              // const foodProductResponse = await foodProductApi.updateFoodProduct(String(product.id), foodProductUpdateData);
              // console.log('Food product updated:', foodProductResponse.data);
              console.log('Food product update data prepared:', foodProductUpdateData);
            } catch (foodError) {
              console.error('Error updating food product:', foodError);
            }
          }
          
          toast({
            title: "Product Updated",
            description: "Your product has been updated successfully.",
          });
      } else {
        // Create new product
        onSubmit(
            finalProductData as Omit<
            Product,
            | "_id"
            | "id"
            | "createdAt"
            | "updatedAt"
            | "lastProduced"
            | "reorderPoint"
            | "sku"
          >
        );
          
          // TODO: When backend API is ready, call create API
          // const response = await productApi.createProduct(productData);
          // console.log('Product created:', response.data);
          
          toast({
            title: "Product Created",
            description: "Your product has been prepared for database save.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error saving product:', error);
        toast({
          title: "Error",
          description: "There was an error saving your product. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  // Product type selection screen
  if (currentStep === 'typeSelection') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">{t('production-select-product-type', 'Select Product Type')}</h2>
          <p className="text-muted-foreground">{t('production-select-type-description', 'Choose a product type to customize input fields')}</p>
        </div>
        
        <div className="mx-auto max-w-xl mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Your product type determines what specific information we'll collect.</p>
              <p className="text-muted-foreground">Each product type has customized fields relevant to that category.</p>
            </div>
          </div>
        </div>
        
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Food Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                   <Package className="h-8 w-8 text-primary" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Food Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   Food items, ingredients, and fermented products
                 </p>
               </CardContent>
             </Card>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Natural Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                   <Zap className="h-8 w-8 text-green-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Natural Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   Organic, natural, or sustainably sourced products
                 </p>
               </CardContent>
             </Card>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Healthy Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                   <Activity className="h-8 w-8 text-blue-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Healthy Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   Health supplements, nutritional products
                 </p>
               </CardContent>
             </Card>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Beverage Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                   <DollarSign className="h-8 w-8 text-cyan-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Beverage Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   Drinks, liquids, and brewing ingredients
                 </p>
               </CardContent>
             </Card>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Packaging Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                   <PackageCheck className="h-8 w-8 text-purple-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Packaging Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   Containers, wrappers, and packaging solutions
                 </p>
               </CardContent>
             </Card>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
           >
             <Card 
               className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
               onClick={() => handleProductTypeSelect('Other Product')}
             >
               <CardContent className="flex flex-col items-center justify-center p-6">
                 <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                   <Box className="h-8 w-8 text-amber-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Other Product</h3>
                 <p className="text-muted-foreground text-center text-sm">
                   General merchandise and other product types
                 </p>
               </CardContent>
             </Card>
           </motion.div>
         </div>
      </motion.div>
    );
  }

  // Transform product for form compatibility
  const transformProductForForm = (prod: Product | null) => {
    if (!prod) return null;
    return {
      ...prod,
      manufacturerName: prod.manufacturerName || prod.brand || prod.manufacturer || 'Unknown',
      pricePerUnit: prod.pricePerUnit || 0,
      originCountry: prod.originCountry || 'Unknown'
    } as ProductFormData; // Ép kiểu rõ ràng thành ProductFormData
  };

  // Handle form submission with proper type conversion
  const handleFormSubmit = (productData: ProductFormData) => {
    // Chuyển đổi từ ProductFormData sang BaseProduct sử dụng adapter
    const convertedData = toBaseProduct(productData);
    
    if (product) {
      onSubmit(convertedData as Product);
    } else {
      // Loại bỏ các trường không cần thiết cho CreateProductData
      const { _id, id, createdAt, updatedAt, lastProduced, reorderPoint, sku, ...createData } = convertedData;
      onSubmit(createData as CreateProductData);
    }
  };

  // Navigate to ProductFormFoodBeverage for Food Products
  if (currentStep === 'details' && selectedProductType === 'Food Product') {
    return (
      <ProductFormFoodBeverage
        product={transformProductForForm(product)}
        parentCategory="Food & Beverage"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // Navigate to ProductFormNaturalProduct for Natural Products
  if (currentStep === 'details' && selectedProductType === 'Natural Product') {
    return (
      <ProductFormNaturalProduct
        product={transformProductForForm(product)}
        parentCategory="Natural & Organic"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // Navigate to ProductFormHealthyProduct for Healthy Products
  if (currentStep === 'details' && selectedProductType === 'Healthy Product') {
    return (
      <ProductFormHealthyProduct
        product={transformProductForForm(product)}
        parentCategory="Health & Wellness"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // Navigate to ProductFormBeverage for Beverage Products
  if (currentStep === 'details' && selectedProductType === 'Beverage Product') {
    return (
      <ProductFormBeverage
        product={transformProductForForm(product)}
        parentCategory="Beverages"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // Navigate to ProductFormPackaging for Packaging Products
  if (currentStep === 'details' && selectedProductType === 'Packaging Product') {
    return (
      <ProductFormPackaging
        product={transformProductForForm(product)}
        parentCategory="Packaging"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // Navigate to ProductFormOther for Other Products
  if (currentStep === 'details' && selectedProductType === 'Other Product') {
    return (
      <ProductFormOther
        product={transformProductForForm(product)}
        parentCategory="Other Products"
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onBack={() => setCurrentStep('typeSelection')}
      />
    );
  }

  // For other product types, redirect to separate form
  if (currentStep === 'details') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('production-create-product-form', 'Create Product Form')}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {t('production-form-redirect-description', 'You will be redirected to a specialized form for creating your product.')}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-primary/10 rounded-full text-primary font-medium">
              {selectedProductType}
            </span>
            <span>product form</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('typeSelection')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('production-back-to-selection', 'Back to Selection')}
          </Button>
          <Button 
            onClick={() => {
              // Here you would navigate to the separate form
              // For now, we'll show a coming soon message
              toast({
                title: "Coming Soon",
                description: `Specialized form for ${selectedProductType} is under development.`,
              });
            }}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            {t('production-open-form', 'Open Form')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
};

// AddProductionLineForm Component
interface AddProductionLineFormProps {
  onSubmit: (newLine: Omit<ProductionLine, "id">) => void;
  isLoading: boolean;
}

const AddProductionLineForm: React.FC<AddProductionLineFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<
    Omit<
      ProductionLine,
      | "id"
      | "maintenance_history"
      | "downtime_incidents"
      | "quality_metrics"
      | "alerts"
    >
  >({
    name: "",
    status: "Idle",
    product: "N/A",
    efficiency: 85,
    daily_capacity: "0 units/day",
    next_maintenance: "",
    operational_since: new Date().toISOString().split("T")[0],
    operator_assigned: "",
    last_maintenance: "",
    line_type: "Assembly",
    total_runtime_hours: 0,
    energy_consumption: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Production line name is required";
    }

    if (!formData.operator_assigned.trim()) {
      newErrors.operator_assigned = "Operator assignment is required";
    }

    if (!formData.next_maintenance) {
      newErrors.next_maintenance = "Next maintenance date is required";
    }

    if (!formData.line_type.trim()) {
      newErrors.line_type = "Line type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Handle numeric values
    if (
      name === "efficiency" ||
      name === "total_runtime_hours" ||
      name === "energy_consumption"
    ) {
      setFormData({
        ...formData,
        [name]: Number(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium flex items-center"
          >
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-line-name', 'Production Line Name*')}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('production-line-name-example', "e.g., Assembly Line 1")}
            className={`w-full ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="line_type"
            className="text-sm font-medium flex items-center"
          >
            <Factory className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-line-type', 'Line Type')}*
          </Label>
          <Select
            name="line_type"
            value={formData.line_type}
            onValueChange={(value) => {
              if (errors.line_type) {
                setErrors({
                  ...errors,
                  line_type: "",
                });
              }
              setFormData({
                ...formData,
                line_type: value,
              });
            }}
          >
            <SelectTrigger className={errors.line_type ? "border-red-500" : ""}>
              <SelectValue placeholder={t('production-select-line-type', 'Select line type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assembly">{t('production-line-type-assembly', 'Assembly')}</SelectItem>
              <SelectItem value="Packaging">{t('production-line-type-packaging', 'Packaging')}</SelectItem>
              <SelectItem value="Filling">{t('production-line-type-filling', 'Filling')}</SelectItem>
              <SelectItem value="Processing">{t('production-line-type-processing', 'Processing')}</SelectItem>
              <SelectItem value="Assembly & Packaging">
                {t('production-line-type-assembly-packaging', 'Assembly & Packaging')}
              </SelectItem>
              <SelectItem value="Processing & Filling">
                {t('production-line-type-processing-filling', 'Processing & Filling')}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.line_type && (
            <p className="text-xs text-red-500">{errors.line_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="status"
            className="text-sm font-medium flex items-center"
          >
            <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-initial-status', 'Initial Status')}
          </Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                status: value as
                  | "Active"
                  | "Maintenance"
                  | "Idle"
                  | "Setup"
                  | "Offline",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('production-select-status', 'Select status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">{t('production-status-active', 'Active')}</SelectItem>
              <SelectItem value="Idle">{t('production-status-idle', 'Idle')}</SelectItem>
              <SelectItem value="Setup">{t('production-status-setup', 'Setup')}</SelectItem>
              <SelectItem value="Maintenance">{t('production-status-maintenance', 'Maintenance')}</SelectItem>
              <SelectItem value="Offline">{t('production-status-offline', 'Offline')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="operator_assigned"
            className="text-sm font-medium flex items-center"
          >
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-operator-assigned', 'Operator Assigned')}*
          </Label>
          <Input
            id="operator_assigned"
            name="operator_assigned"
            value={formData.operator_assigned}
            onChange={handleChange}
            placeholder={t('production-operator-assigned-example', "e.g., John Smith")}
            className={`w-full ${
              errors.operator_assigned ? "border-red-500" : ""
            }`}
          />
          {errors.operator_assigned && (
            <p className="text-xs text-red-500">{errors.operator_assigned}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="efficiency"
            className="text-sm font-medium flex items-center"
          >
            <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-target-efficiency', 'Target Efficiency (%)')}
          </Label>
          <Input
            id="efficiency"
            name="efficiency"
            type="number"
            min="0"
            max="100"
            value={formData.efficiency}
            onChange={handleChange}
            placeholder="85"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="next_maintenance"
            className="text-sm font-medium flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-next-maintenance-date', 'Next Maintenance Date')}*
          </Label>
          <Input
            id="next_maintenance"
            name="next_maintenance"
            type="date"
            value={formData.next_maintenance}
            onChange={handleChange}
            className={`w-full ${
              errors.next_maintenance ? "border-red-500" : ""
            }`}
          />
          {errors.next_maintenance && (
            <p className="text-xs text-red-500">{errors.next_maintenance}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="operational_since"
            className="text-sm font-medium flex items-center"
          >
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-operational-since', 'Operational Since')}
          </Label>
          <Input
            id="operational_since"
            name="operational_since"
            type="date"
            value={formData.operational_since}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="energy_consumption"
            className="text-sm font-medium flex items-center"
          >
            <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
            {t('production-energy-consumption', 'Energy Consumption (kWh)')}
          </Label>
          <Input
            id="energy_consumption"
            name="energy_consumption"
            type="number"
            min="0"
            value={formData.energy_consumption}
            onChange={handleChange}
            placeholder="0"
            className="w-full"
          />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto hover-scale-subtle"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('production-adding-line', 'Adding Line...')}
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('production-add-production-line', 'Add Production Line')}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// ScheduleMaintenanceForm Component
interface ScheduleMaintenanceFormProps {
  line: ProductionLine;
  onSubmit: (maintenanceData: {
    date: string;
    type: "Routine" | "Emergency" | "Upgrade";
    technician: string;
    duration: string;
    notes: string;
    startNow: boolean;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ScheduleMaintenanceForm: React.FC<ScheduleMaintenanceFormProps> = ({
  line,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    date: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split("T")[0],
    type: "Routine" as "Routine" | "Emergency" | "Upgrade",
    technician: "",
    duration: "2 hours",
    notes: "",
    startNow: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Maintenance date is required";
    }

    if (!formData.technician.trim()) {
      newErrors.technician = "Technician name is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Expected duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('production-maintenance-date', 'Maintenance Date*')}
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full ${errors.date ? "border-red-500" : ""}`}
        />
        {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium flex items-center">
          <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('production-maintenance-type', 'Maintenance Type')}
        </Label>
        <Select
          name="type"
          value={formData.type}
          onValueChange={(value) => {
            setFormData({
              ...formData,
              type: value as "Routine" | "Emergency" | "Upgrade",
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('production-select-maintenance-type', 'Select type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Routine">{t('production-maintenance-routine', 'Routine')}</SelectItem>
            <SelectItem value="Emergency">{t('production-maintenance-emergency', 'Emergency')}</SelectItem>
            <SelectItem value="Upgrade">{t('production-maintenance-upgrade', 'Upgrade')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="technician"
          className="text-sm font-medium flex items-center"
        >
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('production-assigned-technician', 'Assigned Technician')}*
        </Label>
        <Input
          id="technician"
          name="technician"
          value={formData.technician}
          onChange={handleChange}
          placeholder={t('production-enter-technician', 'Enter technician name')}
          className={`w-full ${errors.technician ? "border-red-500" : ""}`}
        />
        {errors.technician && (
          <p className="text-xs text-red-500">{errors.technician}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="duration"
          className="text-sm font-medium flex items-center"
        >
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('production-expected-duration', 'Expected Duration')}*
        </Label>
        <Input
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder={t('production-duration-example', 'e.g., 2 hours')}
          className={`w-full ${errors.duration ? "border-red-500" : ""}`}
        />
        {errors.duration && (
          <p className="text-xs text-red-500">{errors.duration}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="notes"
          className="text-sm font-medium flex items-center"
        >
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          className="w-full min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="startNow"
          name="startNow"
          checked={formData.startNow}
          onCheckedChange={(checked) => {
            setFormData({
              ...formData,
              startNow: checked === true,
            });
          }}
        />
        <Label htmlFor="startNow" className="text-sm cursor-pointer">
          {t('production-start-maintenance-now', 'Put line in maintenance mode immediately')}
        </Label>
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto hover-scale-subtle"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <CalendarCheck className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// AssignProductForm Component
interface AssignProductFormProps {
  productionLine: ProductionLine;
  products: Product[];
  onSubmit: (productId: number) => void;
  isLoading: boolean;
}

const AssignProductForm: React.FC<AssignProductFormProps> = ({
  productionLine,
  products,
  onSubmit,
  isLoading,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Filter products with current available inventory
  const availableProducts = products.filter((p) => p.currentAvailable > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      setError("Please select a product to assign");
      return;
    }

    onSubmit(selectedProductId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="product"
          className="text-sm font-medium flex items-center"
        >
          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
          Select Product*
        </Label>

        {availableProducts.length === 0 ? (
          <div className="p-4 border rounded-md bg-muted/50 text-center">
            <span className="text-sm text-muted-foreground">
              No products available in stock
            </span>
          </div>
        ) : (
          <div className="grid gap-3 pt-2">
            <RadioGroup
              value={selectedProductId?.toString() || ""}
              onValueChange={(value) => {
                setSelectedProductId(Number(value));
                setError(null);
              }}
            >
              {availableProducts.map((product) => (
                <div key={product._id || product.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={product._id?.toString() || product.id.toString()}
                    id={`product-${product._id || product.id}`}
                  />
                  <Label
                    htmlFor={`product-${product._id || product.id}`}
                    className="flex flex-1 items-center p-2 cursor-pointer hover:bg-muted/50 rounded-md"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-muted flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <BarChart className="h-3 w-3 mr-1" />
                        {product.dailyCapacity} {product.unitType}/day
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {error && (
              <p className="text-xs text-red-500 mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="submit"
          disabled={isLoading || availableProducts.length === 0}
          className="w-full sm:w-auto hover-scale-subtle"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Assign Product
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// ProductDetailsContent Component
interface ProductDetailsContentProps {
  product: Product;
  getProductTypeBadge: (productType: string) => JSX.Element;
  onEdit: () => void;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  getProductTypeBadge,
  onEdit,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4 items-start"
        >
          <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {product.name}
              {product.sustainable && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-500/10 text-green-600 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Sustainable
                </Badge>
              )}
            </h2>
            <p className="text-muted-foreground">
              {getProductTypeBadge(product.productType)}
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-hover-effect">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <InfoIcon className="h-5 w-5 mr-2 text-primary" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  SKU
                </h4>
                <p className="font-medium">{product.sku}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Category
                </h4>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Minimum Order Quantity
                </h4>
                <p className="font-medium">
                  {product.minOrderQuantity} {product.unitType}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Daily Capacity
                </h4>
                <p className="font-medium">
                  {product.dailyCapacity} {product.unitType}/day
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Price Per Unit
                </h4>
                <p className="font-medium">
                  ${product.pricePerUnit.toFixed(2)} per {product.unitType}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Lead Time
                </h4>
                <p className="font-medium">
                  {product.leadTime} {product.leadTimeUnit}
                </p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Description
                </h4>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Current Available</h4>
                  <span
                    className={
                      product.currentAvailable < product.minOrderQuantity * 0.5
                        ? "text-red-500 font-medium"
                        : product.currentAvailable < product.minOrderQuantity
                        ? "text-amber-500 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {product.currentAvailable} {product.unitType}
                  </span>
                </div>
                <Progress
                  value={
                    (product.currentAvailable /
                      (product.minOrderQuantity * 3)) *
                    100
                  }
                  className={`h-2 rounded-full ${
                    product.currentAvailable < product.minOrderQuantity * 0.5
                      ? "bg-red-500"
                      : product.currentAvailable < product.minOrderQuantity
                      ? "bg-amber-500"
                      : "bg-green-600"
                  }`}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Reorder Point</h4>
                <p className="font-medium">
                  {product.reorderPoint} {product.unitType}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Last Produced</h4>
                <p className="font-medium">
                  {new Date(product.lastProduced).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
              Production History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                <p className="font-medium">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Production Status</h4>
                <Badge
                  variant="outline"
                  className={
                    product.currentAvailable === 0
                      ? "bg-red-500/10 text-red-600"
                      : product.currentAvailable < product.minOrderQuantity
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-green-500/10 text-green-600"
                  }
                >
                  {product.currentAvailable === 0
                    ? "Out of Stock"
                    : product.currentAvailable < product.minOrderQuantity
                    ? "Low Stock"
                    : "In Stock"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Type Specific Data */}
      {product.foodProductData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Wheat className="h-5 w-5 mr-2 text-primary" />
                Food Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {product.foodProductData.flavorType && product.foodProductData.flavorType.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Flavor Types</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.foodProductData.flavorType.map((flavor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {flavor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.foodProductData.ingredients && product.foodProductData.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Ingredients</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.foodProductData.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.foodProductData.allergens && product.foodProductData.allergens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Allergens</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.foodProductData.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.foodProductData.usage && product.foodProductData.usage.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Usage</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.foodProductData.usage.map((use, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.foodProductData.packagingSize && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Packaging Size</h4>
                    <p className="font-medium">{product.foodProductData.packagingSize}</p>
                  </div>
                )}
                
                {product.foodProductData.shelfLife && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Shelf Life</h4>
                    <p className="font-medium">{product.foodProductData.shelfLife}</p>
                  </div>
                )}
                
                {product.foodProductData.manufacturerRegion && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Manufacturer Region</h4>
                    <p className="font-medium">{product.foodProductData.manufacturerRegion}</p>
                  </div>
                )}
                
                {product.foodProductData.foodType && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Food Type</h4>
                    <p className="font-medium">{product.foodProductData.foodType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-end gap-3"
      >
        <Button
          variant="outline"
          onClick={onEdit}
          className="hover-scale-subtle"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Product
        </Button>
      </motion.div>
    </div>
  );
};
