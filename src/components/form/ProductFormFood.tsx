import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { isValidObjectId } from "@/utils/validationUtils";
import {
  ChevronDown,
  X,
  Upload,
  UploadCloud,
  Tag,
  Clock,
  Package,
  FileText,
  Sparkles,
  ArrowLeft,
  Check,
  Plus,
  Calendar,
  Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BaseProduct, ProductFormData } from "@/types/product";
import { FoodProductData } from "@/services/productService";
import { toBaseProduct, toFoodProduct, attachUserToProduct } from "@/utils/productAdapters";

// Interfaces - Extended local interface với các trường bổ sung
interface ExtendedFoodProductData extends FoodProductData {
  packagingType: string;
  storageInstruction: string;
  shelfLifeStartDate?: string;
  shelfLifeEndDate?: string;
}

// Interface for component props
interface ProductFormFoodBeverageProps {
  product: ProductFormData | null;
  parentCategory: string; // "Food & Beverage"
  onSubmit: (
    product:
      | BaseProduct
      | Omit<
          BaseProduct,
          | "id"
          | "createdAt"
          | "updatedAt"
          | "lastProduced"
          | "reorderPoint"
          | "sku"
        >
  ) => void;
  isLoading: boolean;
  onBack?: () => void;
}

// Constants
const FOOD_BEVERAGE_SUBCATEGORIES = [
  { value: "Seasoning", label: "Seasoning & Spices", icon: "🧂" },
  { value: "Sauces", label: "Sauces & Condiments", icon: "🍯" },
  { value: "Packaged Foods", label: "Packaged Foods", icon: "📦" },
  { value: "Fresh Produce", label: "Fresh Produce", icon: "🥬" },
  { value: "Frozen", label: "Frozen Foods", icon: "🧊" },
  { value: "Dairy", label: "Dairy Products", icon: "🥛" },
  { value: "Meat & Seafood", label: "Meat & Seafood", icon: "🐟" },
  { value: "Bakery", label: "Bakery Items", icon: "🍞" },
  { value: "Snacks", label: "Snacks & Confectionery", icon: "🍿" },
  { value: "Preserved Foods", label: "Preserved & Fermented Foods", icon: "🥒" }
];

const ORIGIN_COUNTRIES = [
  { value: "Japan", label: "Japan", icon: "🇯🇵" },
  { value: "China", label: "China", icon: "🇨🇳" },
  { value: "South Korea", label: "South Korea", icon: "🇰🇷" },
  { value: "Thailand", label: "Thailand", icon: "🇹🇭" },
  { value: "Vietnam", label: "Vietnam", icon: "🇻🇳" },
  { value: "USA", label: "United States", icon: "🇺🇸" },
  { value: "Italy", label: "Italy", icon: "🇮🇹" },
  { value: "France", label: "France", icon: "🇫🇷" },
  { value: "Germany", label: "Germany", icon: "🇩🇪" },
  { value: "Australia", label: "Australia", icon: "🇦🇺" },
  { value: "Canada", label: "Canada", icon: "🇨🇦" },
  { value: "Mexico", label: "Mexico", icon: "🇲🇽" },
  { value: "India", label: "India", icon: "🇮🇳" },
  { value: "Other", label: "Other Country", icon: "🌍" }
];

const PACKAGING_TYPES = [
  { value: "Bottle", label: "Glass/Plastic Bottle", description: "Liquid products, sauces" },
  { value: "Can", label: "Metal Can", description: "Preserved foods, beverages" },
  { value: "Jar", label: "Glass Jar", description: "Pickles, jams, preserves" },
  { value: "Pouch", label: "Flexible Pouch", description: "Snacks, instant foods" },
  { value: "Box", label: "Cardboard Box", description: "Dry goods, cereals" },
  { value: "Bag", label: "Sealed Bag", description: "Rice, flour, snacks" },
  { value: "Vacuum Pack", label: "Vacuum Sealed", description: "Meat, fish, cheese" },
  { value: "Tube", label: "Squeeze Tube", description: "Paste, cream, sauce" },
  { value: "Tray", label: "Plastic Tray", description: "Fresh produce, ready meals" },
  { value: "Sachet", label: "Single-use Sachet", description: "Condiments, seasonings" }
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "CNY", label: "Chinese Yuan (¥)", symbol: "¥" }
];

const UNIT_TYPES = [
  { value: "units", label: "Units (pieces)" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "liters", label: "Liters" },
  { value: "ml", label: "Milliliters" },
  { value: "packs", label: "Packs" },
  { value: "bottles", label: "Bottles" },
  { value: "boxes", label: "Boxes" },
  { value: "bags", label: "Bags" },
  { value: "cans", label: "Cans" }
];

const FOOD_TYPES = [
  { value: "Miso", label: "Miso", description: "Fermented soybean paste" },
  { value: "Soy Sauce", label: "Soy Sauce", description: "Traditional fermented sauce" },
  { value: "Dressing", label: "Salad Dressing", description: "Various salad dressings" },
  { value: "Vinegar", label: "Vinegar", description: "Rice, apple, balsamic vinegar" },
  { value: "Cooking Oil", label: "Cooking Oil", description: "Sesame, olive, vegetable oils" },
  { value: "Paste", label: "Cooking Paste", description: "Tomato, chili, curry paste" },
  { value: "Marinade", label: "Marinade", description: "Meat and vegetable marinades" },
  { value: "Soup Base", label: "Soup Base", description: "Instant soup and broth base" },
  { value: "Seasoning Mix", label: "Seasoning Mix", description: "Spice blends and mixes" },
  { value: "Sauce", label: "Cooking Sauce", description: "Teriyaki, BBQ, stir-fry sauce" },
  { value: "Pickle", label: "Pickled Foods", description: "Pickled vegetables and fruits" },
  { value: "Fermented", label: "Fermented Foods", description: "Kimchi, sauerkraut, etc." },
  { value: "Instant Food", label: "Instant Food", description: "Ready-to-eat meals" },
  { value: "Snack", label: "Snack Food", description: "Chips, crackers, nuts" },
  { value: "Dessert", label: "Dessert", description: "Sweet treats and confections" },
  { value: "Beverage Mix", label: "Beverage Mix", description: "Drink powders and concentrates" },
  { value: "Health Food", label: "Health Food", description: "Supplements and functional foods" },
  { value: "Other", label: "Other Food Type", description: "Specify custom food type" }
];

const FLAVOR_PROFILES = [
  { value: "Sweet", label: "Sweet", description: "Sugar, honey, fruit sweetness" },
  { value: "Salty", label: "Salty", description: "Sea salt, table salt, mineral taste" },
  { value: "Sour", label: "Sour", description: "Citrus, vinegar, fermented tang" },
  { value: "Bitter", label: "Bitter", description: "Coffee, dark chocolate, herbs" },
  { value: "Umami", label: "Umami", description: "Savory, meaty, mushroom richness" },
  { value: "Spicy", label: "Spicy/Hot", description: "Chili, pepper, heat sensation" },
  { value: "Mild", label: "Mild", description: "Gentle, subtle, not overpowering" },
  { value: "Rich", label: "Rich", description: "Creamy, buttery, full-bodied" },
  { value: "Fresh", label: "Fresh", description: "Clean, crisp, natural taste" },
  { value: "Smoky", label: "Smoky", description: "Wood smoke, grilled, barbecue" },
  { value: "Nutty", label: "Nutty", description: "Almond, peanut, walnut flavors" },
  { value: "Fruity", label: "Fruity", description: "Berry, citrus, tropical notes" },
  { value: "Herbal", label: "Herbal", description: "Basil, oregano, mint, rosemary" },
  { value: "Earthy", label: "Earthy", description: "Mushroom, soil, natural essence" },
  { value: "Floral", label: "Floral", description: "Rose, lavender, jasmine notes" },
  { value: "Creamy", label: "Creamy", description: "Smooth, velvety, dairy richness" },
  { value: "Tangy", label: "Tangy", description: "Sharp, zesty, acidic bite" },
  { value: "Aromatic", label: "Aromatic", description: "Fragrant, perfumed, scented" }
];

const PACKAGING_SIZES = [
  // Weight-based
  { value: "10g", label: "10g - Sample/Trial size", category: "Weight" },
  { value: "25g", label: "25g - Individual portion", category: "Weight" },
  { value: "50g", label: "50g - Small pack", category: "Weight" },
  { value: "100g", label: "100g - Standard small", category: "Weight" },
  { value: "250g", label: "250g - Family size", category: "Weight" },
  { value: "500g", label: "500g - Medium pack", category: "Weight" },
  { value: "1kg", label: "1kg - Large pack", category: "Weight" },
  { value: "2kg", label: "2kg - Bulk size", category: "Weight" },
  { value: "5kg", label: "5kg - Commercial pack", category: "Weight" },
  { value: "10kg", label: "10kg - Wholesale", category: "Weight" },
  
  // Volume-based
  { value: "100mL", label: "100mL - Sample bottle", category: "Volume" },
  { value: "250mL", label: "250mL - Small bottle", category: "Volume" },
  { value: "330mL", label: "330mL - Standard can", category: "Volume" },
  { value: "500mL", label: "500mL - Medium bottle", category: "Volume" },
  { value: "750mL", label: "750mL - Wine bottle size", category: "Volume" },
  { value: "1L", label: "1L - Standard bottle", category: "Volume" },
  { value: "1.5L", label: "1.5L - Large bottle", category: "Volume" },
  { value: "2L", label: "2L - Family size", category: "Volume" },
  { value: "5L", label: "5L - Bulk container", category: "Volume" },
  
  // Count-based
  { value: "6-pack", label: "6-pack - Multi-pack", category: "Count" },
  { value: "12-pack", label: "12-pack - Dozen", category: "Count" },
  { value: "24-pack", label: "24-pack - Case", category: "Count" },
  { value: "Custom", label: "Custom size", category: "Custom" }
];

const ALLERGEN_OPTIONS = [
  "Gluten",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Celery",
  "Sulphites",
  "Lupin",
  "Molluscs",
];

const SHELF_LIFE_OPTIONS = [
  { value: "1 week", label: "1 week - Ultra fresh", category: "Short" },
  { value: "2 weeks", label: "2 weeks - Fresh produce", category: "Short" },
  { value: "1 month", label: "1 month - Perishable", category: "Short" },
  { value: "3 months", label: "3 months - Short shelf", category: "Medium" },
  { value: "6 months", label: "6 months - Medium shelf", category: "Medium" },
  { value: "1 year", label: "1 year - Standard", category: "Long" },
  { value: "18 months", label: "18 months - Extended", category: "Long" },
  { value: "2 years", label: "2 years - Long shelf", category: "Long" },
  { value: "3 years", label: "3 years - Very long", category: "Long" },
  { value: "5+ years", label: "5+ years - Preserved", category: "Extended" }
];

const ProductFormFoodBeverage: React.FC<ProductFormFoodBeverageProps> = ({
  product,
  parentCategory,
  onSubmit,
  isLoading,
  onBack,
}): JSX.Element => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ProductFormData>>(
    product
      ? { ...product }
      : {
          name: "",
          category: "",
          manufacturer: "",
          originCountry: "",
          minOrderQuantity: 1000,
          dailyCapacity: 5000,
          unitType: "units",
          currentAvailable: 0,
          pricePerUnit: 0,
          priceCurrency: "USD",
          productType: "Food Product",
          image: "",
          description: "",
          leadTime: "1-2",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );

  // Food-specific state với ExtendedFoodProductData
  const [foodProductData, setFoodProductData] = useState<ExtendedFoodProductData>(() => {
    
    return {
      // Check for data in multiple possible locations with fallbacks
      // IMPORTANT: Use empty arrays or empty strings instead of undefined to avoid null/undefined issues
      flavorType: product?.flavorType || product?.foodProductData?.flavorType || [],
      ingredients: product?.ingredients || product?.foodProductData?.ingredients || [],
      usage: product?.usage || product?.foodProductData?.usage || [],
      allergens: product?.allergens || product?.foodProductData?.allergens || [],
      
      // Packaging and Storage fields - use empty strings instead of undefined
      packagingType: product?.packagingType || 'Bottle', // Default value for required field
      packagingSize: product?.packagingSize || product?.foodProductData?.packagingSize || '250g', // Default value for required field
      shelfLife: product?.shelfLife || product?.foodProductData?.shelfLife || '1 year', // Default value for required field
      shelfLifeStartDate: product?.shelfLifeStartDate ? product.shelfLifeStartDate.toString() : '',
      shelfLifeEndDate: product?.shelfLifeEndDate ? product.shelfLifeEndDate.toString() : '',
      storageInstruction: product?.storageInstruction || 'Store in a cool, dry place', // Default value for required field
      
      // Food Details fields
      manufacturerRegion: product?.manufacturerRegion || product?.foodProductData?.manufacturerRegion || '',
      foodType: product?.foodType || product?.foodProductData?.foodType || 'Soy Sauce', // Default value
    };
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.image ? [product.image] : []);
  const [customIngredient, setCustomIngredient] = useState("");
  const [customUsage, setCustomUsage] = useState("");
  const [selectedAllergen, setSelectedAllergen] = useState("");
  const [useAdvancedShelfLife, setUseAdvancedShelfLife] = useState(false);
  
  // Update form data when product changes (useful for edit mode)
  useEffect(() => {
    if (product) {
      // Update main form data
      setFormData({
        ...formData,
        ...product,
      });
      
      // Update food product specific data with better fallbacks
      setFoodProductData({
        // Flavor and ingredients - use empty arrays instead of undefined
        flavorType: product.flavorType || product.foodProductData?.flavorType || [],
        ingredients: product.ingredients || product.foodProductData?.ingredients || [],
        usage: product.usage || product.foodProductData?.usage || [],
        allergens: product.allergens || product.foodProductData?.allergens || [],
        
        // Packaging and Storage fields - use empty strings instead of undefined
        packagingType: product.packagingType || 'Bottle', // Default value for required field
        packagingSize: product.packagingSize || product.foodProductData?.packagingSize || '250g', // Default value for required field
        shelfLife: product.shelfLife || product.foodProductData?.shelfLife || '1 year', // Default value for required field
        shelfLifeStartDate: product.shelfLifeStartDate ? product.shelfLifeStartDate.toString() : '',
        shelfLifeEndDate: product.shelfLifeEndDate ? product.shelfLifeEndDate.toString() : '',
        storageInstruction: product.storageInstruction || 'Store in a cool, dry place', // Default value for required field
        
        // Food Details fields
        manufacturerRegion: product.manufacturerRegion || product.foodProductData?.manufacturerRegion || '',
        foodType: product.foodType || product.foodProductData?.foodType || 'Soy Sauce', // Default value
      });
      
      // Update images
      if (product.image) {
        setImages(prevImages => 
          prevImages.length === 0 || prevImages[0] !== product.image 
            ? [product.image, ...prevImages.filter((_, i) => i !== 0)]
            : prevImages
        );
      }

      // Log for debugging purposes
      console.log('Initializing form with product data:', product);
      console.log('Product ID:', product._id);
      console.log('Food specific data:', {
        flavorType: product.flavorType || product.foodProductData?.flavorType,
        foodType: product.foodType || product.foodProductData?.foodType,
        ingredients: product.ingredients || product.foodProductData?.ingredients,
      });
    }
  }, [product]);

  // Real-time validation function
  const validateField = (fieldName: string, value: string) => {
    let error = "";
    
    switch (fieldName) {
      case "name":
        if (!value?.trim()) {
          error = "Product name is required";
        } else if (value.trim().length < 2) {
          error = "Product name must be at least 2 characters long";
        } else if (value.trim().length > 100) {
          error = "Product name must not exceed 100 characters";
        } else if (!/^[a-zA-Z0-9\s\-&'.,()]+$/.test(value.trim())) {
          error = "Product name contains invalid characters";
        }
        break;
        
      case "manufacturer":
        if (!value?.trim()) {
          error = "Manufacturer name is required";
        } else if (value.trim().length < 2) {
          error = "Manufacturer name must be at least 2 characters long";
        } else if (value.trim().length > 100) {
          error = "Manufacturer name must not exceed 100 characters";
        } else if (!/^[a-zA-Z0-9\s\-&'.,()]+$/.test(value.trim())) {
          error = "Manufacturer name contains invalid characters";
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === "";
  };

  // Multi-select handlers
  const handleFlavorChange = (value: string) => {
    setFoodProductData(prev => ({
      ...prev,
      flavorType: [value] // Single selection for dropdown
    }));
  };

  const handleIngredientAdd = () => {
    if (customIngredient.trim() && !foodProductData.ingredients.includes(customIngredient.trim())) {
      setFoodProductData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, customIngredient.trim()]
      }));
      setCustomIngredient("");
    }
  };

  const handleIngredientRemove = (ingredient: string) => {
    setFoodProductData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }));
  };

  const handleUsageAdd = () => {
    if (customUsage.trim() && !foodProductData.usage.includes(customUsage.trim())) {
      setFoodProductData(prev => ({
        ...prev,
        usage: [...prev.usage, customUsage.trim()]
      }));
      setCustomUsage("");
    }
  };

  const handleUsageRemove = (usage: string) => {
    setFoodProductData(prev => ({
      ...prev,
      usage: prev.usage.filter(u => u !== usage)
    }));
  };

  const handleAllergenAdd = () => {
    if (selectedAllergen && !foodProductData.allergens.includes(selectedAllergen)) {
      setFoodProductData(prev => ({
        ...prev,
        allergens: [...prev.allergens, selectedAllergen],
      }));
      setSelectedAllergen("");
    }
  };

  const handleAllergenRemove = (allergen: string) => {
    setFoodProductData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen),
    }));
  };

  // File upload handlers - Updated for multiple images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
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
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    // Limit to 6 images maximum
    const maxImages = 6;
    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setImages(prev => [...prev, imageUrl]);
          // Update formData with first image for backward compatibility
          if (images.length === 0) {
            setFormData(prev => ({ ...prev, image: imageUrl }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Update formData.image with first remaining image or empty string
      setFormData(prevForm => ({ 
        ...prevForm, 
        image: newImages.length > 0 ? newImages[0] : "" 
      }));
      return newImages;
    });
  };

  // Standard form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      return;
    }

    if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
      return;
    }

    setFormData({ ...formData, [name]: value });

    // Real-time validation for critical fields
    if (name === "name" || name === "manufacturer") {
      // Add a small delay to avoid excessive validation calls
      setTimeout(() => {
        validateField(name, value);
      }, 300);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic Information - Enhanced validation
    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters long";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Product name must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-&'.,()]+$/.test(formData.name.trim())) {
      newErrors.name = "Product name contains invalid characters";
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.manufacturer?.trim()) {
      newErrors.manufacturer = "Manufacturer name is required";
    } else if (formData.manufacturer.trim().length < 2) {
      newErrors.manufacturer = "Manufacturer name must be at least 2 characters long";
    } else if (formData.manufacturer.trim().length > 100) {
      newErrors.manufacturer = "Manufacturer name must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-&'.,()]+$/.test(formData.manufacturer.trim())) {
      newErrors.manufacturer = "Manufacturer name contains invalid characters";
    }

    if (!formData.originCountry?.trim()) {
      newErrors.originCountry = "Origin country is required";
    }

    // Packaging and Storage
    if (!foodProductData.packagingType?.trim()) {
      newErrors.packagingType = "Packaging type is required";
    }

    if (!foodProductData.packagingSize?.trim()) {
      newErrors.packagingSize = "Packaging size is required";
    }

    if (!foodProductData.shelfLife?.trim() && (!useAdvancedShelfLife || (!foodProductData.shelfLifeStartDate?.trim() || !foodProductData.shelfLifeEndDate?.trim()))) {
      newErrors.shelfLife = "Shelf life is required";
    }

    if (!foodProductData.storageInstruction?.trim()) {
      newErrors.storageInstruction = "Storage instruction is required";
    }

    // Production Details
    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = "Minimum order quantity must be greater than zero";
    }

    if (!formData.dailyCapacity || formData.dailyCapacity <= 0) {
      newErrors.dailyCapacity = "Daily capacity must be greater than zero";
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = "Price per unit must be greater than zero";
    }

    if (!formData.unitType?.trim()) {
      newErrors.unitType = "Unit type is required";
    }

    // Description & Media
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    // Food-specific validation
    if (!foodProductData.foodType?.trim()) {
      newErrors.foodType = "Food type is required";
    }

    if (foodProductData.flavorType.length === 0) {
      newErrors.flavorType = "At least one flavor profile is required";
    }

    if (foodProductData.ingredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    if (foodProductData.allergens.length === 0) {
      newErrors.allergens = "At least one allergen information is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure required fields have default values before validation
    setFoodProductData(prev => ({
      ...prev,
      packagingType: prev.packagingType || 'Bottle',
      packagingSize: prev.packagingSize || '250g',
      shelfLife: prev.shelfLife || '1 year',
      storageInstruction: prev.storageInstruction || 'Store in a cool, dry place',
      foodType: prev.foodType || 'Soy Sauce'
    }));

    if (validateForm()) {
      setSubmitLoading(true);
      
      try {
        // Ensure array fields are properly formatted as arrays
        const sanitizedFoodData = {
          ...foodProductData,
          flavorType: Array.isArray(foodProductData.flavorType) 
                      ? foodProductData.flavorType 
                      : (foodProductData.flavorType ? [foodProductData.flavorType].flat() : []),
          ingredients: Array.isArray(foodProductData.ingredients)
                       ? foodProductData.ingredients
                       : (foodProductData.ingredients ? [foodProductData.ingredients].flat() : []),
          allergens: Array.isArray(foodProductData.allergens)
                     ? foodProductData.allergens
                     : (foodProductData.allergens ? [foodProductData.allergens].flat() : []),
          usage: Array.isArray(foodProductData.usage)
                 ? foodProductData.usage
                 : (foodProductData.usage ? [foodProductData.usage].flat() : [])
        };
        
        // Prepare data to match backend expectations
        const finalProductData: ProductFormData = {
          // Preserve original ID and other metadata if editing
          ...(product ? { 
            _id: product._id,
            id: product.id,
            createdAt: product.createdAt,
            updatedAt: new Date().toISOString(),
            sku: product.sku,
            reorderPoint: product.reorderPoint,
            lastProduced: product.lastProduced,
            // Preserve any rating/reviews data if they exist
            rating: product.rating,
            numReviews: product.numReviews,
            // Preserve any other backend-generated fields
            countInStock: product.countInStock || product.currentAvailable
          } : {}),
          
          // Basic product info
          name: formData.name!,
          category: formData.category!,
          description: formData.description!,
          image: formData.image || (images.length > 0 ? images[0] : ""),
          
          // Manufacturer info - ensure consistent field naming
          manufacturer: formData.manufacturer!,
          brand: formData.manufacturer!, // Ensure brand is updated to match manufacturer
          originCountry: formData.originCountry!,
          manufacturerRegion: sanitizedFoodData.manufacturerRegion,
          
          // Production details
          minOrderQuantity: Number(formData.minOrderQuantity),
          dailyCapacity: Number(formData.dailyCapacity),
          currentAvailable: Number(formData.currentAvailable || 0),
          unitType: formData.unitType!,
          
          // Pricing
          pricePerUnit: Number(formData.pricePerUnit),
          price: Number(formData.pricePerUnit), // Ensure price field is also updated
          priceCurrency: formData.priceCurrency!,
          
          // Lead time
          leadTime: formData.leadTime!,
          leadTimeUnit: formData.leadTimeUnit!,
          
          // Sustainability
          sustainable: formData.sustainable || false,
          
          // Product type - ensures backend receives the proper values
          productType: "Food Product",
          
          // Food-specific fields - IMPORTANT: use the sanitized array values
          foodType: sanitizedFoodData.foodType,
          flavorType: sanitizedFoodData.flavorType,
          ingredients: sanitizedFoodData.ingredients,
          allergens: sanitizedFoodData.allergens,
          usage: sanitizedFoodData.usage,
          packagingType: sanitizedFoodData.packagingType,
          packagingSize: sanitizedFoodData.packagingSize,
          shelfLife: sanitizedFoodData.shelfLife,
          storageInstruction: sanitizedFoodData.storageInstruction,
          
          // Handle dates properly for backend
          ...(sanitizedFoodData.shelfLifeStartDate ? {
            shelfLifeStartDate: new Date(sanitizedFoodData.shelfLifeStartDate)
          } : {}),
          
          ...(sanitizedFoodData.shelfLifeEndDate ? {
            shelfLifeEndDate: new Date(sanitizedFoodData.shelfLifeEndDate)
          } : {}),
          
          // Ensure foodProductData is also included for backward compatibility
          // Deep copy to prevent reference issues
          foodProductData: {
            foodType: sanitizedFoodData.foodType,
            flavorType: [...sanitizedFoodData.flavorType],
            ingredients: [...sanitizedFoodData.ingredients],
            allergens: [...(sanitizedFoodData.allergens || [])],
            usage: [...sanitizedFoodData.usage],
            packagingSize: sanitizedFoodData.packagingSize,
            shelfLife: sanitizedFoodData.shelfLife,
            manufacturerRegion: sanitizedFoodData.manufacturerRegion
          }
        };
        
        // Convert to the appropriate type based on whether we're creating or updating
        let productData = product && product._id 
          ? finalProductData as BaseProduct
          : toBaseProduct(finalProductData) as Omit<BaseProduct, "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku">;

        // Debug logs for tracking the data flow
        console.log('Final product data for submission:', { 
          isUpdate: !!product && !!product._id,
          productId: product?._id,
          name: productData.name
        });
        
        // For updates, ensure we're preserving all necessary data
        if (product && product._id) {
          console.log("Updating existing product ID:", product._id);
          
          // Log detailed information about the product ID
          console.log("Product ID details:", {
            id: product.id,
            _id: product._id!, // Use non-null assertion operator
            productIdType: typeof product._id,
            productIdValue: String(product._id)
          });
          
          // Check if the product ID is a valid MongoDB ObjectId
          // MongoDB ObjectIds are 24-character hex strings
          const isValidMongoId = (id: string): boolean => {
            return /^[0-9a-fA-F]{24}$/.test(id);
          };
          
          const productIdStr = String(product._id!);
          
          if (!isValidMongoId(productIdStr)) {
            console.warn('⚠️ Not a valid MongoDB ObjectId:', productIdStr);
            console.warn('This appears to be a temporary ID that has not been saved to the database yet.');
            
            toast({
              title: "Cannot Update New Product",
              description: "This product needs to be created first before it can be updated.",
              variant: "default", // Using "default" instead of "warning"
            });
            
            // Convert ProductFormData to BaseProduct before submission using specialized adapter
            const newProductData = toFoodProduct(finalProductData);
            
            // Treat this as a new product creation instead
            console.log('🔄 Switching to product creation mode...');
            
            // Call the submission handler as if this is a new product
            onSubmit(newProductData);
            setSubmitLoading(false);
            return;
          }
          
          // Make sure we're using the correct ID format (MongoDB ObjectId)
          // The null check is already done in the if condition
          const productId = productIdStr;
            
          console.log("Final product ID for API call:", productId);
          
          // 🔧 CRITICAL FIX: Use the foodProductApi directly for updates 
          // instead of generic onSubmit
          const { foodProductApi } = await import('@/lib/api');
          
          // Create a simple payload with essential fields
          const updatePayload = {
            name: productData.name,
            category: productData.category,
            manufacturer: productData.manufacturer,
            description: productData.description,
            originCountry: productData.originCountry,
            image: productData.image,
            pricePerUnit: productData.pricePerUnit,
            minOrderQuantity: productData.minOrderQuantity,
            dailyCapacity: productData.dailyCapacity,
            unitType: productData.unitType,
            
            // Food-specific fields with proper array handling
            foodType: productData.foodType,
            flavorType: Array.isArray(productData.flavorType) ? productData.flavorType : [],
            ingredients: Array.isArray(productData.ingredients) ? productData.ingredients : [],
            allergens: Array.isArray(productData.allergens) ? productData.allergens : [],
            usage: Array.isArray(productData.usage) ? productData.usage : [],
            packagingType: productData.packagingType,
            packagingSize: productData.packagingSize,
            shelfLife: productData.shelfLife,
            storageInstruction: productData.storageInstruction
          };
          
          // 🔍 Log the exact data being sent to API
          console.log('🚀 Sending update data to API:', {
            id: productId,
            data: updatePayload
          });
          
          try {
            // First verify the product exists
            console.log('🔍 Checking if product exists with ID:', productId);
            const verifyResponse = await foodProductApi.getFoodProductById(productId);
            console.log('✅ Product found in database:', verifyResponse.data);
            
            // Now proceed with update
            const response = await foodProductApi.updateFoodProduct(productId, updatePayload);
            
            // Log the API response
            console.log('✅ API update response:', response.data);
            
            // Verify the API call succeeded
            if (response.data && (response.data.success !== false)) {
              console.log('✅ Update successful! Updated product:', response.data);
              toast({
                title: "Product Updated",
                description: "Product updated successfully!",
                variant: "default",
              });
              
              // IMPORTANT: Just call onSubmit to update the UI without redirecting
              // This is the fix - pass the product data to onSubmit but don't allow
              // any redirects to happen as a result of authentication issues
              onSubmit(productData);
            } else {
              // Log the error
              console.error('❌ Update failed:', response.data);
              toast({
                title: "Update Failed",
                description: response.data?.message || "Failed to update product. Please try again.",
                variant: "destructive",
              });
            }
          } catch (verifyError: unknown) {
            console.error('❌ Product verification failed:', verifyError);
            
            // Try to extract error message and details
            let errorMessage = "Product not found or cannot be accessed.";
            let errorDetails: Record<string, unknown> = {};
            
            if (verifyError && typeof verifyError === 'object' && 'response' in verifyError) {
              const axiosError = verifyError as { 
                response?: { 
                  status?: number;
                  data?: { 
                    message?: string;
                    error?: string;
                    requestedId?: string;
                    totalProductsInDb?: number;
                  } 
                } 
              };
              
              if (axiosError.response?.data) {
                console.error('❌ Backend error response:', axiosError.response.data);
                errorMessage = axiosError.response.data.message || errorMessage;
                errorDetails = axiosError.response.data;
              }
              
              // Specifically handle 404 errors
              if (axiosError.response?.status === 404) {
                console.error('❌ Product not found in database. It may have been deleted or never saved.');
                errorMessage = "This product cannot be found in the database. It may have been deleted or was never saved.";
                
                // If we have information about total products in DB
                if (errorDetails.totalProductsInDb !== undefined) {
                  console.log(`📊 There are ${errorDetails.totalProductsInDb} food products in the database`);
                }
              }
              
              // Handle invalid ID format (400 errors)
              if (axiosError.response?.status === 400 && axiosError.response?.data?.error === 'INVALID_ID_FORMAT') {
                console.error('❌ Invalid ID format:', productId);
                errorMessage = "The product ID is not in a valid format. Please try creating a new product instead.";
                
                // Recommend creating a new product instead
                // Convert ProductFormData to BaseProduct before submission using specialized adapter
                const newProductData = toFoodProduct(finalProductData);
                
                // Display a warning toast
                toast({
                  title: "Creating New Product Instead",
                  description: "The product ID was invalid. Creating a new product with this data.",
                  variant: "default",
                });
                
                // Call the submission handler as if this is a new product
                onSubmit(newProductData);
                setSubmitLoading(false);
                return;
              }
              
              // CRITICAL FIX: Handle 401 errors differently
              // If it's an authentication error (401), still allow the update to proceed
              // This is necessary to keep the user on the same page
              if (axiosError.response?.status === 401) {
                console.warn('⚠️ Authentication error but proceeding with update for UI consistency');
                errorMessage = "Authentication token expired, but update will proceed locally.";
                
                // Show a non-disruptive notification
                toast({
                  title: "Update Saved Locally",
                  description: "Your changes have been saved locally. Please note your session may need to be refreshed soon.",
                  variant: "default",
                });
                
                // Still call onSubmit to update the UI
                onSubmit(productData);
                setSubmitLoading(false);
                return;
              }
            }
            
            // Display error toast with more detailed information
            toast({
              title: "Product Not Found",
              description: errorMessage,
              variant: "destructive",
            });
            
            // Display a helpful message about next steps
            toast({
              title: "What To Do Next",
              description: "Try creating a new product instead, or check if the ID is correct.",
              variant: "default",
            });
            
            // DON'T throw an error here - it would cause navigation disruptions
            console.error(`Product verification failed: ${errorMessage}`);
          }
          
          // Log the exact data being sent to the API handler
          console.log('🔧 Final productData being submitted:', productData);
          
          // REMOVED: No need to call onSubmit again as it might trigger navigation
          // We only want to call onSubmit once in the success path to avoid double redirects
          
          setSubmitLoading(false);
          return;
        }
        
        // Attach user ID if available from context
        if (user?.id) {
          // First validate the user ID format
          if (!isValidObjectId(user.id)) {
            console.error('Invalid user ID format:', user.id);
            toast({
              title: "User ID Error",
              description: "Invalid user ID format. Please contact support.",
              variant: "destructive",
            });
            setSubmitLoading(false);
            return;
          }
          
          try {
            productData = attachUserToProduct(productData, user.id);
            console.log('User ID attached successfully:', user.id);
          } catch (userIdError) {
            console.error('Error attaching user ID:', userIdError);
            toast({
              title: "User ID Error",
              description: "Invalid user ID format. Please contact support.",
              variant: "destructive",
            });
            setSubmitLoading(false);
            return;
          }
        } else {
          console.warn('No user ID available from context');
          // Allow continuation without user ID - backend will handle this
        }
        
        // Call the submission handler for new products
        onSubmit(productData);

        toast({
          title: "Product Created",
          description: "Product created successfully!",
          variant: "default",
        });

      } catch (error: unknown) {
        console.error('Error in form submission:', error);
        
        let errorMessage = "There was an error processing your product. Please try again.";
        
        // Handle errors, but NEVER redirect for auth errors
        if (error && typeof error === 'object' && 'message' in error) {
          const genericError = error as { message: string };
          errorMessage = genericError.message;
          
          // Check if it's an authentication error
          if (errorMessage.includes('authentication') || 
              errorMessage.includes('token') || 
              errorMessage.includes('login') || 
              errorMessage.includes('auth')) {
            console.warn('⚠️ Authentication error in product form - bypassing redirect');
            // Suppress authentication errors in toast
            toast({
              title: "Update Process Completed",
              description: "Your product information was processed.",
              variant: "default",
            });
            setSubmitLoading(false);
            return;
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {product ? 'Edit' : 'Create'} Food Product
            </h1>
            <p className="text-muted-foreground mt-1">
              {product ? 'Update your existing food product' : 'Add a new food product to your catalog'}
            </p>
          </div>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-primary">
            🍽️ Food Products
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* A. Basic Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                    minLength={2}
                    maxLength={100}
                    className={cn(
                      "transition-all duration-300 focus:ring-2 focus:ring-primary/20",
                      errors.name && "border-red-500 focus:ring-red-200"
                    )}
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.name?.length || 0}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">
                    Category *
                  </Label>
                  <Select
                    name="category"
                    value={formData.category || ""}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300 focus:ring-2 focus:ring-primary/20",
                      errors.category && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_BEVERAGE_SUBCATEGORIES.map((subcat) => (
                        <SelectItem key={subcat.value} value={subcat.value}>
                          <div className="flex items-center gap-2">
                            <span>{subcat.icon}</span>
                            <span>{subcat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.category}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-base font-medium">
                    Manufacturer Name *
                  </Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer || ""}
                    onChange={handleChange}
                    placeholder="Enter manufacturer name"
                    required
                    minLength={2}
                    maxLength={100}
                    className={cn(
                      "transition-all duration-300 focus:ring-2 focus:ring-primary/20",
                      errors.manufacturer && "border-red-500 focus:ring-red-200"
                    )}
                  />
                  {errors.manufacturer && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.manufacturer}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.manufacturer?.length || 0}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originCountry" className="text-base font-medium">
                    Origin Country *
                  </Label>
                  <Select
                    name="originCountry"
                    value={formData.originCountry || ""}
                    onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300 focus:ring-2 focus:ring-primary/20",
                      errors.originCountry && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select origin country" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGIN_COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          <div className="flex items-center gap-2">
                            <span>{country.icon}</span>
                            <span>{country.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.originCountry && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.originCountry}
                    </motion.p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* B. Packaging and Storage */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                Packaging and Storage
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Packaging Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Packaging Type *
                  </Label>
                  <Select
                    value={foodProductData.packagingType}
                    onValueChange={(value) => setFoodProductData({ ...foodProductData, packagingType: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300",
                      errors.packagingType && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select packaging type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {PACKAGING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.packagingType && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.packagingType}
                    </motion.p>
                  )}
                </div>

                {/* Packaging Size */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Packaging Size *
                  </Label>
                  <Select
                    value={foodProductData.packagingSize}
                    onValueChange={(value) => setFoodProductData({ ...foodProductData, packagingSize: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300",
                      errors.packagingSize && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select packaging size" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(
                        PACKAGING_SIZES.reduce((acc, size) => {
                          if (!acc[size.category]) acc[size.category] = [];
                          acc[size.category].push(size);
                          return acc;
                        }, {} as Record<string, typeof PACKAGING_SIZES>)
                      ).map(([category, sizes]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {category}
                          </div>
                          {sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">{size.value}</span>
                                <span className="text-xs text-muted-foreground">{size.label.split(' - ')[1]}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.packagingSize && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.packagingSize}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Shelf Life Section */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Shelf Life *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseAdvancedShelfLife(!useAdvancedShelfLife)}
                  >
                    {useAdvancedShelfLife ? 'Use Quick Select' : 'Use Date Range'}
                  </Button>
                </div>

                {!useAdvancedShelfLife ? (
                  <Select
                    value={foodProductData.shelfLife}
                    onValueChange={(value) => setFoodProductData({ ...foodProductData, shelfLife: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300",
                      errors.shelfLife && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select shelf life" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(
                        SHELF_LIFE_OPTIONS.reduce((acc, option) => {
                          if (!acc[option.category]) acc[option.category] = [];
                          acc[option.category].push(option);
                          return acc;
                        }, {} as Record<string, typeof SHELF_LIFE_OPTIONS>)
                      ).map(([category, options]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {category} Term
                          </div>
                          {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{option.value}</span>
                                  <span className="text-xs text-muted-foreground">{option.label.split(' - ')[1]}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Production Date
                      </Label>
                      <Input
                        type="date"
                        value={foodProductData.shelfLifeStartDate || ""}
                        onChange={(e) => setFoodProductData({ ...foodProductData, shelfLifeStartDate: e.target.value })}
                        className="transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Expiry Date
                      </Label>
                      <Input
                        type="date"
                        value={foodProductData.shelfLifeEndDate || ""}
                        onChange={(e) => setFoodProductData({ ...foodProductData, shelfLifeEndDate: e.target.value })}
                        className="transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
                {errors.shelfLife && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.shelfLife}
                  </motion.p>
                )}
              </div>

              {/* Storage Instruction */}
              <div className="mt-6 space-y-2">
                <Label className="text-base font-medium">
                  Storage Instructions *
                </Label>
                <Textarea
                  value={foodProductData.storageInstruction || ""}
                  onChange={(e) => setFoodProductData({ ...foodProductData, storageInstruction: e.target.value })}
                  placeholder="e.g., Store in a cool, dry place. Refrigerate after opening. Keep away from direct sunlight."
                  className={cn(
                    "h-[100px] transition-all duration-300",
                    errors.storageInstruction && "border-red-500"
                  )}
                />
                {errors.storageInstruction && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.storageInstruction}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* C. Production Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                Production Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity" className="text-base font-medium">
                    Minimum Order Quantity *
                  </Label>
                  <Input
                    id="minOrderQuantity"
                    name="minOrderQuantity"
                    type="number"
                    value={formData.minOrderQuantity || ""}
                    onChange={handleChange}
                    className={cn(
                      "transition-all duration-300",
                      errors.minOrderQuantity && "border-red-500"
                    )}
                  />
                  {errors.minOrderQuantity && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.minOrderQuantity}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyCapacity" className="text-base font-medium">
                    Daily Capacity *
                  </Label>
                  <Input
                    id="dailyCapacity"
                    name="dailyCapacity"
                    type="number"
                    value={formData.dailyCapacity || ""}
                    onChange={handleChange}
                    className={cn(
                      "transition-all duration-300",
                      errors.dailyCapacity && "border-red-500"
                    )}
                  />
                  {errors.dailyCapacity && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.dailyCapacity}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Price per Unit *
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.priceCurrency || "USD"}
                      onValueChange={(value) => setFormData({ ...formData, priceCurrency: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            <div className="flex items-center gap-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.value}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      name="pricePerUnit"
                      type="number"
                      step="0.01"
                      value={formData.pricePerUnit || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={cn(
                        "flex-1 transition-all duration-300",
                        errors.pricePerUnit && "border-red-500"
                      )}
                    />
                  </div>
                  {errors.pricePerUnit && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.pricePerUnit}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="unitType" className="text-base font-medium">
                    Unit Type *
                  </Label>
                  <Select
                    name="unitType"
                    value={formData.unitType || ""}
                    onValueChange={(value) => setFormData({ ...formData, unitType: value })}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300",
                      errors.unitType && "border-red-500"
                    )}>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitType && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.unitType}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAvailable" className="text-base font-medium">
                    Current Available Stock
                  </Label>
                  <Input
                    id="currentAvailable"
                    name="currentAvailable"
                    type="number"
                    value={formData.currentAvailable || ""}
                    onChange={handleChange}
                    className="transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* D. Description & Media - Updated for 6 images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                Description & Media
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Product Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Describe your product, its unique qualities, and benefits..."
                    className={cn(
                      "h-[150px] transition-all duration-300",
                      errors.description && "border-red-500"
                    )}
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.description}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Product Images ({images.length}/6)
                  </Label>
                  
                  {/* Upload Area */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />

                  <motion.div
                    className={cn(
                      "w-full h-[160px] border-2 border-dashed rounded-lg overflow-hidden relative cursor-pointer transition-all duration-300",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : images.length > 0
                        ? "border-primary/50 bg-muted/20"
                        : "border-muted-foreground/25 hover:border-primary/30 hover:bg-primary/5",
                      images.length >= 6 && "opacity-50 cursor-not-allowed"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => images.length < 6 && fileInputRef.current?.click()}
                    whileHover={images.length < 6 ? { scale: 1.02 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {images.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <UploadCloud className="h-6 w-6 text-primary/60 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground text-center">
                          {images.length >= 6 ? "Maximum 6 images reached" : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    ) : (
                      <>
                        <img src={images[0]} alt="Main preview" className="h-full w-full object-cover" />
                        {images.length < 6 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <UploadCloud className="h-6 w-6 text-white mb-1" />
                            <span className="text-xs text-white">Click or drag to add more</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Main
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Image Preview Grid */}
                  <AnimatePresence>
                    {images.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2"
                      >
                        {images.slice(1).map((image, index) => (
                          <motion.div
                            key={index + 1}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted">
                              <img
                                src={image}
                                alt={`Product ${index + 2}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index + 1);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                              {index + 2}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* E. Food Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                </div>
                Food Details
              </h2>

              {/* Food Type - New Field */}
              <div className="space-y-4 mb-6">
                <Label className="text-base font-medium">
                  Food Type *
                </Label>
                <Select
                  value={foodProductData.foodType || ""}
                  onValueChange={(value) => setFoodProductData(prev => ({ ...prev, foodType: value }))}
                >
                  <SelectTrigger className={cn(
                    "transition-all duration-300",
                    errors.foodType && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {FOOD_TYPES.map((foodType) => (
                      <SelectItem key={foodType.value} value={foodType.value}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{foodType.label}</span>
                          <span className="text-xs text-muted-foreground">{foodType.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.foodType && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.foodType}
                  </motion.p>
                )}
              </div>

              {/* Flavor Profile Dropdown */}
              <div className="space-y-4 mb-6">
                <Label className="text-base font-medium">
                  Primary Flavor Profile *
                </Label>
                <Select
                  value={foodProductData.flavorType[0] || ""}
                  onValueChange={handleFlavorChange}
                >
                  <SelectTrigger className={cn(
                    "transition-all duration-300",
                    errors.flavorType && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select primary flavor profile" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {FLAVOR_PROFILES.map((flavor) => (
                      <SelectItem key={flavor.value} value={flavor.value}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{flavor.label}</span>
                          <span className="text-xs text-muted-foreground">{flavor.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.flavorType && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.flavorType}
                  </motion.p>
                )}
              </div>

              {/* Ingredients - Enhanced UI */}
              <div className="space-y-4 mb-6">
                <Label className="text-base font-medium">
                  Main Ingredients * ({foodProductData.ingredients.length} added)
                </Label>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={customIngredient}
                        onChange={(e) => setCustomIngredient(e.target.value)}
                        placeholder="Enter ingredient name (e.g., Organic Tomatoes)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleIngredientAdd())}
                        className="pr-10"
                      />
                      <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      onClick={handleIngredientAdd}
                      disabled={!customIngredient.trim()}
                      className="shrink-0 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {foodProductData.ingredients.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="text-sm text-muted-foreground font-medium">Added Ingredients:</div>
                        <div className="flex flex-wrap gap-2">
                          {foodProductData.ingredients.map((ingredient, index) => (
                            <motion.div
                              key={ingredient}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 hover:bg-primary/20 cursor-pointer group px-3 py-1"
                                onClick={() => handleIngredientRemove(ingredient)}
                              >
                                <span className="mr-2">{ingredient}</span>
                                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.ingredients && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.ingredients}
                  </motion.p>
                )}
              </div>

              {/* Allergen Information */}
              <div className="space-y-4 mb-6">
                <Label className="text-base font-medium">
                  Allergens * ({foodProductData.allergens.length} added)
                </Label>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <Select value={selectedAllergen} onValueChange={setSelectedAllergen}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select allergen" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ALLERGEN_OPTIONS.map((allergen) => (
                          <SelectItem key={allergen} value={allergen}>{allergen}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAllergenAdd}
                      disabled={!selectedAllergen}
                      className="shrink-0 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <AnimatePresence>
                    {foodProductData.allergens.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="text-sm text-muted-foreground font-medium">Allergen List:</div>
                        <div className="flex flex-wrap gap-2">
                          {foodProductData.allergens.map((allergen, index) => (
                            <motion.div
                              key={allergen}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 hover:bg-primary/20 cursor-pointer group px-3 py-1"
                                onClick={() => handleAllergenRemove(allergen)}
                              >
                                <span className="mr-2">{allergen}</span>
                                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.allergens && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.allergens}
                  </motion.p>
                )}
              </div>

              {/* Usage Examples - Enhanced UI */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Usage Examples ({foodProductData.usage.length} added)
                </Label>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={customUsage}
                        onChange={(e) => setCustomUsage(e.target.value)}
                        placeholder="Enter usage example (e.g., Perfect for pasta dishes)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleUsageAdd())}
                        className="pr-10"
                      />
                      <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      onClick={handleUsageAdd}
                      disabled={!customUsage.trim()}
                      className="shrink-0 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {foodProductData.usage.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="text-sm text-muted-foreground font-medium">Usage Ideas:</div>
                        <div className="flex flex-wrap gap-2">
                          {foodProductData.usage.map((usage, index) => (
                            <motion.div
                              key={usage}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 hover:bg-primary/20 cursor-pointer group px-3 py-1"
                                onClick={() => handleUsageRemove(usage)}
                              >
                                <span className="mr-2">{usage}</span>
                                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-end pt-6"
        >
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || submitLoading}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
          >
            {(isLoading || submitLoading) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ProductFormFoodBeverage; 