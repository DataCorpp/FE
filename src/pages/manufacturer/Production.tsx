import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productApi, foodProductApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Factory,
  Settings,
  ArrowLeft,
  Calendar,
  BarChart,
  Clock,
  AlertCircle,
  Package,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Save,
  RefreshCw,
  X,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  TrendingUp,
  Play,
  PauseCircle,
  LayoutGrid,
  CalendarDays,
  PowerOff,
  ShieldAlert,
  Bell,
  BellRing,
  Wrench,
  Activity,
  LineChart,
  Layers,
  Zap,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  Image,
  ImageIcon,
  MoreVertical,
  Plus,
  CircleDashed,
  Edit,
  Eye,
  Copy,
  Ban,
  InfoIcon,
  PackageCheck,
  Tag,
  User,
  FileText,
  CalendarCheck,
  LineChartIcon,
  DollarSign,
  Box,
  Info,
  Star,
  Leaf,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import ManufacturerLayout from "@/components/layouts/ManufacturerLayout";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslation } from "react-i18next";

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
`;

// Food product specific data interface
interface FoodProductData {
  flavorType: string[];
  ingredients: string[];
  usage: string[];
  packagingSize: string;
  shelfLife: string;
  manufacturerRegion: string;
}

// ProductData interface for API
interface ProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  brand?: string;
  minimumOrderQuantity: number;
  dailyCapacity: number;
  unitType: string;
  currentAvailableStock: number;
  leadTime: string;
  leadTimeUnit: string;
  sustainable: boolean;
  productType: string;
  image: string;
  flavorType?: string[];
  ingredients?: string[];
  usage?: string[];
  packagingSize?: string;
  shelfLife?: string;
  manufacturerName?: string;
  manufacturerRegion?: string;
}

// Product interface
interface Product {
  id: number;
  name: string;
  category: string;
  sku: string; // Generated automatically, not required for input
  minOrderQuantity: number; // Changed from moq to match Products.tsx
  dailyCapacity: number;
  unitType: string;
  currentAvailable: number;
  pricePerUnit: number;
  productType: string;
  image: string;
  createdAt: string;
  description: string;
  updatedAt: string;
  lastProduced: string;
  leadTime: string;
  leadTimeUnit: string;
  reorderPoint: number;
  rating?: number; // Optional field, filled by matching users, not by manufacturers
  sustainable: boolean; // This is a product characteristic determined by the manufacturer
  foodProductData?: FoodProductData; // Optional field for food product specific data
}

// Empty products array to be filled from the database
const initialProducts: Product[] = [];

export const Production = () => {
  const { isAuthenticated, user, role } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Try to get products from local storage first (for development)
        const localProducts = localStorage.getItem('products');
        const localFoodProducts = localStorage.getItem('foodProducts');
        let mappedProducts = [];

        if (localProducts) {
          const parsedProducts = JSON.parse(localProducts);
          // Map the data to match our Product interface
          mappedProducts = parsedProducts.map((product: ProductData, index: number) => ({
            id: index + 1,
            name: product.name,
            category: product.category,
            sku: `SKU-${Math.floor(Math.random() * 90000) + 10000}`,
            minOrderQuantity: product.minimumOrderQuantity,
            dailyCapacity: product.dailyCapacity,
            unitType: product.unitType,
            currentAvailable: product.currentAvailableStock,
            pricePerUnit: product.price,
            productType: product.productType,
            image: product.image,
            createdAt: new Date().toISOString(),
            description: product.description,
            updatedAt: new Date().toISOString(),
            lastProduced: new Date().toISOString(),
            leadTime: product.leadTime,
            leadTimeUnit: product.leadTimeUnit,
            reorderPoint: Math.floor(product.minimumOrderQuantity * 0.5),
            sustainable: product.sustainable,
            // If it's a food product, include the food product data
            ...(product.flavorType && {
              foodProductData: {
                flavorType: product.flavorType,
                ingredients: product.ingredients,
                usage: product.usage,
                packagingSize: product.packagingSize,
                shelfLife: product.shelfLife,
                manufacturerRegion: product.manufacturerRegion,
              }
            })
          }));
        }
        
        // Load food products from separate localStorage if they exist
        if (localFoodProducts) {
          try {
            const parsedFoodProducts = JSON.parse(localFoodProducts);
            
            // Check if any food products already exist in the main product list
            const foodProductNames = new Set(mappedProducts
              .filter(p => p.productType === 'Food Product')
              .map(p => p.name));
            
            // Map food products to Product interface
            const foodProducts = parsedFoodProducts
              .filter((fp: any) => !foodProductNames.has(fp.productName)) // Skip duplicates
              .map((foodProduct: any, index: number) => ({
                id: mappedProducts.length + index + 1,
                name: foodProduct.productName,
                category: foodProduct.category,
                sku: `SKU-FOOD-${Math.floor(Math.random() * 90000) + 10000}`,
                minOrderQuantity: 1000,
                dailyCapacity: 5000,
                unitType: 'units',
                currentAvailable: 1000,
                pricePerUnit: 0,
                productType: 'Food Product',
                image: '/placeholder.svg',
                createdAt: foodProduct.createdAt || new Date().toISOString(),
                description: `${foodProduct.productName} - Food product`,
                updatedAt: new Date().toISOString(),
                lastProduced: new Date().toISOString(),
                leadTime: '1-2',
                leadTimeUnit: 'weeks',
                reorderPoint: 500,
                sustainable: true,
                foodProductData: {
                  flavorType: foodProduct.flavorType || [],
                  ingredients: foodProduct.ingredients || [],
                  usage: foodProduct.usage || [],
                  packagingSize: foodProduct.packagingSize || '',
                  shelfLife: foodProduct.shelfLife || '',
                  manufacturerRegion: foodProduct.manufacturerRegion || '',
                }
              }));
              
            // Combine regular products with food products
            mappedProducts = [...mappedProducts, ...foodProducts];
            console.log('Loaded food products:', foodProducts.length);
          } catch (error) {
            console.error('Error processing food products from localStorage:', error);
          }
        }
        
        setProducts(mappedProducts);

        // In a real app, you would fetch from API here
        // Try to fetch from API - uncomment when backend is ready
        // const response = await productApi.getProducts();
        // if (response.data && response.data.data) {
        //   setProducts(response.data.data);
        // }
        
        // Fetch food products from API - uncomment when backend is ready
        /* 
        try {
          const foodProductsResponse = await foodProductApi.getFoodProducts();
          if (foodProductsResponse.data) {
            // Process and add food products to the list
            // ...
          }
        } catch (foodError) {
          console.error('Error fetching food products:', foodError);
        }
        */
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && role === "manufacturer") {
      fetchProducts();
    }
  }, [isAuthenticated, role, toast]);

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

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Create a new product
  const handleCreateProduct = async (
    newProduct: Omit<
      Product,
      "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku"
    >
  ) => {
    setIsLoading(true);
    
    try {
      // Generate SKU
    const randomSKU = `SKU-${Math.floor(Math.random() * 90000) + 10000}`;

    const productToAdd = {
      ...newProduct,
      id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      sku: randomSKU,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastProduced: new Date().toISOString(),
        reorderPoint: Math.floor(newProduct.minOrderQuantity * 0.5), // Default to 50% of MOQ
      };
  
      // Prepare data for API (when backend is ready)
      const apiData: ProductData = {
        name: productToAdd.name,
        description: productToAdd.description,
        category: productToAdd.category,
        price: Number(productToAdd.pricePerUnit),
        brand: user?.companyName || 'Unknown',
        minimumOrderQuantity: productToAdd.minOrderQuantity,
        dailyCapacity: productToAdd.dailyCapacity,
        unitType: productToAdd.unitType,
        currentAvailableStock: productToAdd.currentAvailable,
        leadTime: productToAdd.leadTime,
        leadTimeUnit: productToAdd.leadTimeUnit,
        sustainable: productToAdd.sustainable,
        productType: productToAdd.productType,
        image: productToAdd.image || '/placeholder.svg',
      };
      
      // Add food product specific data if it exists
      if (productToAdd.productType === 'Food Product' && productToAdd.foodProductData) {
        Object.assign(apiData, {
          flavorType: productToAdd.foodProductData.flavorType,
          ingredients: productToAdd.foodProductData.ingredients,
          usage: productToAdd.foodProductData.usage,
          packagingSize: productToAdd.foodProductData.packagingSize,
          shelfLife: productToAdd.foodProductData.shelfLife,
          manufacturerName: user?.companyName || 'Unknown',
          manufacturerRegion: productToAdd.foodProductData.manufacturerRegion,
        });
      }
      
      // Save to API (uncomment when backend is ready)
      // const response = await productApi.createProduct(apiData);
      // console.log('Product created:', response.data);
      
      // Save to localStorage for demonstration
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      localStorage.setItem('products', JSON.stringify([...existingProducts, apiData]));
      
      // Update UI
    setProducts([...products, productToAdd]);
      
    toast({
      title: t('production-product-created', "Product created"),
      description: t('production-product-added', "{{name}} has been added to your product list.", { name: productToAdd.name }),
    });
      
    setIsEditDialogOpen(false);
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
      // Prepare data for API
      const apiData: ProductData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        price: Number(updatedProduct.pricePerUnit),
        brand: user?.companyName || 'Unknown',
        minimumOrderQuantity: updatedProduct.minOrderQuantity,
        dailyCapacity: updatedProduct.dailyCapacity,
        unitType: updatedProduct.unitType,
        currentAvailableStock: updatedProduct.currentAvailable,
        leadTime: updatedProduct.leadTime,
        leadTimeUnit: updatedProduct.leadTimeUnit,
        sustainable: updatedProduct.sustainable,
        productType: updatedProduct.productType,
        image: updatedProduct.image || '/placeholder.svg',
      };
      
      // Add food product specific data if it exists
      if (updatedProduct.productType === 'Food Product' && updatedProduct.foodProductData) {
        Object.assign(apiData, {
          flavorType: updatedProduct.foodProductData.flavorType,
          ingredients: updatedProduct.foodProductData.ingredients,
          usage: updatedProduct.foodProductData.usage,
          packagingSize: updatedProduct.foodProductData.packagingSize,
          shelfLife: updatedProduct.foodProductData.shelfLife,
          manufacturerName: user?.companyName || 'Unknown',
          manufacturerRegion: updatedProduct.foodProductData.manufacturerRegion,
        });
      }
      
      // Call API (uncomment when backend is ready)
      // const response = await productApi.updateProduct(String(updatedProduct.id), apiData);
      // console.log('Product updated:', response.data);
      
      // Update localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = existingProducts.map((p: ProductData) => 
        p.name === updatedProduct.name ? apiData : p
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Update UI
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );

      toast({
        title: t('production-product-updated', "Product updated"),
        description: t('production-product-updated-successfully', "{{name}} has been updated successfully.", { name: updatedProduct.name }),
        variant: "default",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: t('production-error', "Error"),
        description: t('production-update-error', "Failed to update product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a product
    const handleDeleteProduct = async (id: number) => {
    setIsLoading(true);

    try {
      const productToDelete = products.find((p) => p.id === id);
      if (!productToDelete) {
        throw new Error("Product not found");
      }
      
      // Call API (uncomment when backend is ready)
      // await productApi.deleteProduct(String(id));
      
      // Update localStorage for regular products
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = existingProducts.filter((p: { name: string }) => 
        p.name !== productToDelete.name
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
             // If it's a food product, remove from both localStorage and MongoDB
      if (productToDelete.productType === 'Food Product') {
        try {
          // Xóa khỏi localStorage
          const existingFoodProducts = JSON.parse(localStorage.getItem('foodProducts') || '[]');
          const updatedFoodProducts = existingFoodProducts.filter((p: { productName: string }) => 
            p.productName !== productToDelete.name
          );
          localStorage.setItem('foodProducts', JSON.stringify(updatedFoodProducts));
          
          // Xóa khỏi MongoDB
          try {
                         await foodProductApi.deleteFoodProduct(String(id));
             console.log('Food product has been deleted from MongoDB');
             toast({
               title: "Success",
               description: "Food product has been deleted from MongoDB",
               variant: "default",
             });
           } catch (foodError) {
             console.error('Error deleting food product from MongoDB:', foodError);
             toast({
               title: "MongoDB Error",
               description: "Unable to delete from MongoDB. Deleted from localStorage instead.",
               variant: "destructive",
             });
          }
        } catch (localStorageError) {
          console.error('Error removing food product from localStorage:', localStorageError);
        }
      }
      
      // Update UI
      setProducts(products.filter((p) => p.id !== id));

      toast({
        title: t('production-product-deleted', "Product deleted"),
        description: t('production-product-removed', "{{name}} has been removed.", { name: productToDelete.name }),
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: t('production-error', "Error"),
        description: t('production-delete-error', "Failed to delete product. Please try again."),
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
        return <StatusBadge status={status as any} />;
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
                products={filteredProducts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categories={categories}
                openEditDialog={openEditDialog}
                openDeleteDialog={openDeleteDialog}
                viewProductDetails={viewProductDetails}
                getProductTypeBadge={getProductTypeBadge}
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
                <ProductForm
                  product={selectedProduct}
                  onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 h-5 w-5" />
                  {t('production-delete-product', "Delete Product")}
                </DialogTitle>
                <DialogDescription>
                  {t('production-delete-product-confirmation', "Are you sure you want to delete '{{product}}'? This action cannot be undone.", 
                    { product: selectedProduct?.name })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  {t('production-cancel', "Cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedProduct && handleDeleteProduct(selectedProduct.id)}
                  disabled={isLoading}
                  className="flex items-center"
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
        <DialogContent className="sm:max-w-[1200px] p-0 max-h-[95vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full flex flex-col"
            >
              <DialogHeader className="px-6 pt-6 pb-2 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
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
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsProductDetailsOpen(false);
                      if (selectedProduct) {
                        openEditDialog(selectedProduct);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('production-edit', "Edit")}
                  </Button>
                </motion.div>
              </DialogHeader>

              <div className="px-6 py-6 overflow-y-auto flex-1">
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
  openEditDialog: (product?: Product) => void;
  openDeleteDialog: (product: Product) => void;
  viewProductDetails: (product: Product) => void;
  getProductTypeBadge: (productType: string) => JSX.Element;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
  openEditDialog,
  openDeleteDialog,
  viewProductDetails,
  getProductTypeBadge,
}) => {
  const { t } = useTranslation();
  const [animateCards, setAnimateCards] = useState(false);

  // Trigger animation when component mounts or products change
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, [products.length]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full form-field-animation hover:border-muted-foreground/50"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-field-animation hover:border-muted-foreground/50">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? t('production-all-categories', "All Categories") : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-field-animation hover:border-muted-foreground/50">
              <SelectValue placeholder="Select status" />
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

          {(searchQuery ||
            categoryFilter !== "all" ||
            statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs flex items-center gap-1 hover-scale-subtle"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Create New Product Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
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
          <span>{t('production-create-new-product', "Create New Product")}</span>
        </Button>
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
                {searchQuery ||
                categoryFilter !== "all" ||
                statusFilter !== "all"
                  ? t('production-adjust-search', "Try adjusting your search criteria or filters to find what you're looking for.")
                  : t('production-start-create', "Start by creating your first product using the button above.")}
              </p>
            </motion.div>

            {(searchQuery ||
              categoryFilter !== "all" ||
              statusFilter !== "all") && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-2 hover-scale-subtle"
                >
                  Clear Filters
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
                key={product.id}
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
                <Card className="overflow-hidden card-hover-effect border border-muted-foreground/20 bg-background/60 backdrop-blur-sm">
                  <CardHeader className="p-0">
                    <div
                      className="aspect-video w-full bg-muted relative group cursor-pointer overflow-hidden"
                      onClick={() => viewProductDetails(product)}
                    >
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
                          {getProductTypeBadge(product.productType)}
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
                        <div className="text-sm font-medium">MOQ</div>
                        <div className="text-xl font-semibold">
                          {product.minOrderQuantity}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Inventory</span>
                        <span
                          className={
                            product.currentAvailable <
                            product.minOrderQuantity * 0.5
                              ? "text-red-500 font-medium"
                              : product.currentAvailable <
                                product.minOrderQuantity
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
                        className={`h-1.5 rounded-full ${
                          product.currentAvailable <
                          product.minOrderQuantity * 0.5
                            ? "bg-red-500"
                            : product.currentAvailable <
                              product.minOrderQuantity
                            ? "bg-amber-500"
                            : "bg-green-600"
                        }`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="text-muted-foreground">
                        Daily Capacity
                      </div>
                      <div className="font-medium">
                        {product.dailyCapacity} {product.unitType}/day
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex justify-between border-t border-muted/40 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-foreground hover:bg-primary hover-scale-subtle transition-all duration-300"
                      onClick={() => viewProductDetails(product)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover-scale-subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(product);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover-scale-subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(product);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

// Define types for production lines and batches and props for ProductionTab
interface ProductionLine {
  id: number;
  name: string;
  status: string;
  line_type: string;
  product: string;
  efficiency: number;
  daily_capacity: number | string;
  next_maintenance: string;
  last_maintenance?: string;
  operational_since?: string;
  operator_assigned: string;
  total_runtime_hours: number;
  energy_consumption: number;
  current_batch?: {
    id: number;
    status: string;
    target_quantity: number;
    produced_quantity: number;
  };
}

interface BatchInfo {
  id: number;
  status: string;
  target_quantity: number;
  produced_quantity: number;
}

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
                                line.status === "Active"
                                  ? handleToggleLineStatus(line)
                                  : handleToggleLineStatus(line);
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
              <Calendar className="h-4 w-4 mr-2 text-primary/70" />
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
          price: Number(formData.pricePerUnit),
          brand: user?.companyName || 'Unknown',
          minimumOrderQuantity: formData.minOrderQuantity,
          dailyCapacity: formData.dailyCapacity,
          unitType: formData.unitType,
          currentAvailableStock: formData.currentAvailable,
          leadTime: formData.leadTime,
          leadTimeUnit: formData.leadTimeUnit,
          sustainable: formData.sustainable,
          productType: selectedProductType,
          image: formData.image || '/placeholder.svg',
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
          
          // Lưu food product vào MongoDB thông qua API
          try {
            // Cập nhật lưu trữ localStorage (để duy trì tương thích)
            const existingFoodProducts = JSON.parse(localStorage.getItem('foodProducts') || '[]');
            const newFoodProduct = {
              ...foodProductDataForApi,
              id: existingFoodProducts.length + 1,
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem('foodProducts', JSON.stringify([...existingFoodProducts, newFoodProduct]));
            
            // Gửi dữ liệu đến MongoDB thông qua API 
            try {
              console.log('Sending food product to API:', foodProductDataForApi);
              const foodProductResponse = await foodProductApi.createFoodProduct(foodProductDataForApi);
              console.log('Food product has been saved to MongoDB:', foodProductResponse.data);
              
              toast({
                title: "Success",
                description: "Food product has been saved to MongoDB database",
                variant: "default",
              });
            } catch (foodError) {
              console.error('Error saving food product to MongoDB:', foodError);
              toast({
                title: "MongoDB Error",
                description: "Unable to save to MongoDB. Saved to localStorage instead.",
                variant: "destructive",
              });
            }
          } catch (localStorageError) {
            console.error('Error saving to localStorage:', localStorageError);
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
          
          // When backend API is ready:
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
              
              // Cập nhật trong cả localStorage và MongoDB
              try {
                // Cập nhật localStorage
                const existingFoodProducts = JSON.parse(localStorage.getItem('foodProducts') || '[]');
                const updatedProducts = existingFoodProducts.map((fp: any) => 
                  fp.productName === formData.name ? {...fp, ...foodProductUpdateData} : fp
                );
                localStorage.setItem('foodProducts', JSON.stringify(updatedProducts));
                
                // Cập nhật MongoDB qua API
                try {
                  const foodProductResponse = await foodProductApi.updateFoodProduct(String(product.id), foodProductUpdateData);
                  console.log('Food product has been updated in MongoDB:', foodProductResponse.data);
                  toast({
                    title: "Success",
                    description: "Food product has been updated in MongoDB",
                    variant: "default",
                  });
                } catch (foodError) {
                  console.error('Error updating food product in MongoDB:', foodError);
                  toast({
                    title: "MongoDB Error",
                    description: "Unable to update MongoDB. Updated in localStorage instead.",
                    variant: "destructive",
                  });
                }
              } catch (localStorageError) {
                console.error('Error updating localStorage:', localStorageError);
              }
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
            | "id"
            | "createdAt"
            | "updatedAt"
            | "lastProduced"
            | "reorderPoint"
            | "sku"
          >
        );
          
          // When backend API is ready:
          // const response = await productApi.createProduct(productData);
          // console.log('Product created:', response.data);
          
          // Save product data to localStorage for demonstration
          const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
          localStorage.setItem('products', JSON.stringify([...existingProducts, productData]));
          
          toast({
            title: "Product Created",
            description: "Your product has been saved to the database.",
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('production-create-product-details', 'Product Details')}</h2>
        <Button 
          variant="outline" 
          type="button" 
          size="sm"
          onClick={() => setCurrentStep('typeSelection')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('production-change-type', 'Change Type')}
        </Button>
      </div>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">
            {t('production-product-name', 'Product Name')}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('production-enter-product-name', "Enter product name")}
            className={cn(
              "enhanced-input form-field-animation",
              errors.name && "error"
            )}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-base">
            {t('production-category', 'Category')}
          </Label>
          <Select
            name="category"
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger
              className={cn(
                "enhanced-input form-field-animation",
                errors.category && "error"
              )}
            >
              <SelectValue placeholder={t('production-select-category', "Select a category")} />
            </SelectTrigger>
            <SelectContent>
              {selectedProductType === 'Food Product' ? (
                <>
                  <SelectItem value="Soy Sauce">Soy Sauce</SelectItem>
                  <SelectItem value="Miso">Miso</SelectItem>
                  <SelectItem value="Tofu">Tofu</SelectItem>
                  <SelectItem value="Fermented">Fermented Products</SelectItem>
                  <SelectItem value="Dried Foods">Dried Foods</SelectItem>
                  <SelectItem value="Condiments">Condiments</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                </>
              ) : (
                <>
              <SelectItem value="Food">{t('production-food', "Food")}</SelectItem>
              <SelectItem value="Beverage">{t('production-beverage', "Beverage")}</SelectItem>
              <SelectItem value="Health">{t('production-health', "Health")}</SelectItem>
              <SelectItem value="Packaging">{t('production-packaging', "Packaging")}</SelectItem>
              <SelectItem value="Ingredients">{t('production-ingredients', "Ingredients")}</SelectItem>
              <SelectItem value="Other">{t('production-other', "Other")}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="space-y-2">
          <Label htmlFor="minOrderQuantity" className="text-base">
            {t('production-minimum-order', 'Minimum Order Quantity')}
          </Label>
          <Input
            id="minOrderQuantity"
            name="minOrderQuantity"
            type="number"
            value={formData.minOrderQuantity}
            onChange={handleChange}
            className={cn(
              "enhanced-input form-field-animation",
              errors.minOrderQuantity && "error"
            )}
          />
          {errors.minOrderQuantity && (
            <p className="text-sm text-destructive">
              {errors.minOrderQuantity}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyCapacity" className="text-base">
            {t('production-daily-capacity', 'Daily Capacity')}
          </Label>
          <Input
            id="dailyCapacity"
            name="dailyCapacity"
            type="number"
            value={formData.dailyCapacity}
            onChange={handleChange}
            className={cn(
              "enhanced-input form-field-animation",
              errors.dailyCapacity && "error"
            )}
          />
          {errors.dailyCapacity && (
            <p className="text-sm text-destructive">{errors.dailyCapacity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitType" className="text-base">
            {t('production-unit-type', 'Unit Type')}
          </Label>
          <Select
            name="unitType"
            value={formData.unitType}
            onValueChange={(value) =>
              setFormData({ ...formData, unitType: value })
            }
          >
            <SelectTrigger
              className={cn(
                "enhanced-input form-field-animation",
                errors.unitType && "error"
              )}
            >
              <SelectValue placeholder={t('production-select-unit-type', 'Select unit type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="units">{t('production-units', 'units')}</SelectItem>
              <SelectItem value="boxes">{t('production-boxes', 'Boxes')}</SelectItem>
              <SelectItem value="bottles">{t('production-bottles', 'Bottles')}</SelectItem>
              <SelectItem value="kg">{t('production-kilograms', 'Kilograms')}</SelectItem>
              <SelectItem value="liters">{t('production-liters', 'Liters')}</SelectItem>
              <SelectItem value="sachets">{t('production-sachets', 'Sachets')}</SelectItem>
              <SelectItem value="pairs">{t('production-pairs', 'Pairs')}</SelectItem>
              <SelectItem value="cases">{t('production-cases', 'Cases')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.unitType && (
            <p className="text-sm text-destructive">{errors.unitType}</p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="space-y-2">
          <Label htmlFor="currentAvailable" className="text-base">
            {t('production-current-available', 'Current Available')}
          </Label>
          <Input
            id="currentAvailable"
            name="currentAvailable"
            type="number"
            value={formData.currentAvailable}
            onChange={handleChange}
            className="enhanced-input form-field-animation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerUnit" className="text-base">
            {t('production-price-per-unit', 'Price Per Unit ($)')}
          </Label>
          <Input
            id="pricePerUnit"
            name="pricePerUnit"
            type="number"
            step="0.01"
            value={formData.pricePerUnit}
            onChange={handleChange}
            className={cn(
              "enhanced-input form-field-animation",
              errors.pricePerUnit && "error"
            )}
          />
          {errors.pricePerUnit && (
            <p className="text-sm text-destructive">{errors.pricePerUnit}</p>
          )}
        </div>

        <div className="space-y-2 flex items-center">
          <div className="flex-1 pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sustainable"
                name="sustainable"
                checked={formData.sustainable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sustainable: checked as boolean })
                }
              />
              <label
                htmlFor="sustainable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <Zap className="h-4 w-4 mr-2 text-green-600" />
                Sustainable Product
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="space-y-2">
          <Label htmlFor="leadTime" className="text-base">
            Lead Time
          </Label>
          <Input
            id="leadTime"
            name="leadTime"
            value={formData.leadTime}
            onChange={handleChange}
            className="enhanced-input form-field-animation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leadTimeUnit" className="text-base">
            Lead Time Unit
          </Label>
          <Select
            name="leadTimeUnit"
            value={formData.leadTimeUnit}
            onValueChange={(value) =>
              setFormData({ ...formData, leadTimeUnit: value })
            }
          >
            <SelectTrigger className="enhanced-input form-field-animation">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Food Product specific fields */}
      {selectedProductType === 'Food Product' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-6 border-t pt-6 mt-6 bg-primary/5 p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold flex items-center text-primary">
            <Package className="h-5 w-5 mr-2" />
            Food Product Details
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base flex items-center">
                <span className="bg-primary/10 p-1 rounded-md mr-2">
                  <Star className="h-4 w-4 text-primary" />
                </span>
                Flavor Profile
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['salty', 'sweet', 'spicy', 'umami', 'sour'].map(flavor => (
                  <div key={flavor} className="flex items-center space-x-2">
              <Checkbox
                      id={`flavor-${flavor}`}
                      checked={foodProductData.flavorType.includes(flavor)}
                      onCheckedChange={() => handleFlavorTypeChange(flavor)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label 
                      htmlFor={`flavor-${flavor}`}
                      className="capitalize cursor-pointer hover:text-primary transition-colors"
                    >
                      {flavor}
                    </Label>
            </div>
                ))}
              </div>
              {errors.flavorType && (
                <p className="text-sm text-destructive">{errors.flavorType}</p>
              )}
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="ingredients" className="text-base flex items-center">
                   <span className="bg-primary/10 p-1 rounded-md mr-2">
                     <Layers className="h-4 w-4 text-primary" />
                   </span>
                   Ingredients
                 </Label>
                 <div className="relative">
                   <Textarea
                     id="ingredients"
                     placeholder="Enter ingredients separated by commas"
                     className="enhanced-input form-field-animation min-h-[120px] pr-8"
                     value={foodProductData.ingredients.join(', ')}
                     onChange={(e) => handleArrayInputChange('ingredients', e.target.value)}
                   />
                   <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                     Comma separated
                   </div>
                 </div>
                 {errors.ingredients && (
                   <p className="text-sm text-destructive">{errors.ingredients}</p>
                 )}
                 {foodProductData.ingredients.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {foodProductData.ingredients.map((ingredient, index) => (
                       <Badge key={index} variant="outline" className="bg-primary/10 hover:bg-primary/20">
                         {ingredient.trim()}
                       </Badge>
                     ))}
                   </div>
                 )}
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="usage" className="text-base flex items-center">
                   <span className="bg-primary/10 p-1 rounded-md mr-2">
                     <FileText className="h-4 w-4 text-primary" />
                   </span>
                   Usage Examples
                 </Label>
                 <div className="relative">
                   <Textarea
                     id="usage"
                     placeholder="Enter usage examples separated by commas"
                     className="enhanced-input form-field-animation min-h-[120px] pr-8"
                     value={foodProductData.usage.join(', ')}
                     onChange={(e) => handleArrayInputChange('usage', e.target.value)}
                   />
                   <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                     Comma separated
                   </div>
                 </div>
                 {foodProductData.usage.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {foodProductData.usage.map((usage, index) => (
                       <Badge key={index} variant="outline" className="bg-primary/10 hover:bg-primary/20">
                         {usage.trim()}
                       </Badge>
                     ))}
                   </div>
                 )}
               </div>
             </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div className="space-y-2">
                 <Label htmlFor="packagingSize" className="text-base flex items-center">
                   <span className="bg-primary/10 p-1 rounded-md mr-2">
                     <Package className="h-4 w-4 text-primary" />
                   </span>
                   Packaging Size
                 </Label>
                 <div className="relative">
                   <Input
                     id="packagingSize"
                     name="packagingSize"
                     value={foodProductData.packagingSize}
                     onChange={handleFoodProductChange}
                     placeholder="e.g. 250g, 1L, 500mL"
                     className={cn(
                       "enhanced-input form-field-animation pl-10",
                       errors.packagingSize && "error"
                     )}
                   />
                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60">
                     <Tag className="h-4 w-4" />
                   </div>
                 </div>
                 {errors.packagingSize && (
                   <p className="text-sm text-destructive">{errors.packagingSize}</p>
                 )}
                 
                 <div className="flex flex-wrap gap-2 mt-3">
                   {['100g', '250g', '500g', '1kg', '5L'].map((size) => (
                     <Button
                       key={size}
                       type="button"
                       variant="outline"
                       size="sm"
                       className={cn(
                         "bg-muted/50 hover:bg-primary/10 hover:text-primary",
                         foodProductData.packagingSize === size && "bg-primary/10 text-primary border-primary/30"
                       )}
                       onClick={() => setFoodProductData({...foodProductData, packagingSize: size})}
                     >
                       {size}
                     </Button>
                   ))}
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="shelfLife" className="text-base flex items-center">
                   <span className="bg-primary/10 p-1 rounded-md mr-2">
                     <Calendar className="h-4 w-4 text-primary" />
                   </span>
                   Shelf Life
                 </Label>
                 <div className="relative">
                   <Input
                     id="shelfLife"
                     name="shelfLife"
                     value={foodProductData.shelfLife}
                     onChange={handleFoodProductChange}
                     placeholder="e.g. 12 months, 2 years"
                     className={cn(
                       "enhanced-input form-field-animation pl-10",
                       errors.shelfLife && "error"
                     )}
                   />
                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60">
                     <Clock className="h-4 w-4" />
                   </div>
                 </div>
                 {errors.shelfLife && (
                   <p className="text-sm text-destructive">{errors.shelfLife}</p>
                 )}
                 
                 <div className="flex flex-wrap gap-2 mt-3">
                   {['6 months', '1 year', '18 months', '2 years', '3 years'].map((duration) => (
                     <Button
                       key={duration}
                       type="button"
                       variant="outline"
                       size="sm"
                       className={cn(
                         "bg-muted/50 hover:bg-primary/10 hover:text-primary",
                         foodProductData.shelfLife === duration && "bg-primary/10 text-primary border-primary/30"
                       )}
                       onClick={() => setFoodProductData({...foodProductData, shelfLife: duration})}
                     >
                       {duration}
                     </Button>
                   ))}
                 </div>
               </div>
             </div>
            
                         <div className="space-y-2">
               <Label htmlFor="manufacturerRegion" className="text-base">
                 Manufacturing Region
               </Label>
               <Select
                 name="manufacturerRegion"
                 value={foodProductData.manufacturerRegion}
                 onValueChange={(value) =>
                   setFoodProductData({ ...foodProductData, manufacturerRegion: value })
                 }
               >
                 <SelectTrigger className="enhanced-input form-field-animation">
                   <SelectValue placeholder="Select manufacturing region" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Asia">Asia</SelectItem>
                   <SelectItem value="North America">North America</SelectItem>
                   <SelectItem value="Europe">Europe</SelectItem>
                   <SelectItem value="South America">South America</SelectItem>
                   <SelectItem value="Africa">Africa</SelectItem>
                   <SelectItem value="Australia">Australia</SelectItem>
                 </SelectContent>
               </Select>
          </div>
        </div>
      </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className={cn(
              "h-[120px] enhanced-input form-field-animation",
              errors.description && "error"
            )}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base">Product Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <motion.div
            className={cn(
              "image-upload-area w-full h-[120px] border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : formData.image
                ? "border-primary/30 bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/30 hover:bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {formData.image ? (
              <div className="relative w-full h-full">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/60 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <p className="text-white text-sm font-medium">
                    Click or drop to change
                  </p>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  className="upload-icon-animation text-primary/60"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <UploadCloud className="h-8 w-8 mb-2" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Click or drag & drop an image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG or GIF up to 5MB
                </p>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="flex justify-end mt-6 space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <Button
          type="submit"
          disabled={isLoading || submitLoading}
          className="submit-button-hover hover-scale-subtle"
        >
          {isLoading || submitLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {product ? "Update Product" : "Create Product"}
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
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
                <div key={product.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={product.id.toString()}
                    id={`product-${product.id}`}
                  />
                  <Label
                    htmlFor={`product-${product.id}`}
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="hover-scale-subtle"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
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
    </div>
  );
};
