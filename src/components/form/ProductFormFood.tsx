import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
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

// Interfaces
interface FoodProductData {
  flavorType: string[];
  ingredients: string[];
  usage: string[];
  allergens: string[];
  packagingSize: string;
  shelfLife: string;
  manufacturerRegion: string;
  foodType: string;
}

interface Product {
  id?: number;
  name: string;
  category: string;
  sku?: string;
  minOrderQuantity: number;
  dailyCapacity: number;
  unitType: string;
  currentAvailable: number;
  pricePerUnit: number;
  productType: string;
  image: string;
  createdAt?: string;
  description: string;
  updatedAt?: string;
  lastProduced?: string;
  leadTime: string;
  leadTimeUnit: string;
  reorderPoint?: number;
  rating?: number;
  sustainable: boolean;
  foodProductData?: FoodProductData;
}

interface ProductFormFoodBeverageProps {
  product: Product | null;
  parentCategory: string; // "Food & Beverage"
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
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
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
          productType: "Food Product",
          image: "",
          description: "",
          leadTime: "1-2",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );

  // Food-specific state
  const [foodProductData, setFoodProductData] = useState<FoodProductData>({
    flavorType: product?.foodProductData?.flavorType || [],
    ingredients: product?.foodProductData?.ingredients || [],
    usage: product?.foodProductData?.usage || [],
    allergens: product?.foodProductData?.allergens || [],
    packagingSize: product?.foodProductData?.packagingSize || "",
    shelfLife: product?.foodProductData?.shelfLife || "",
    manufacturerRegion: product?.foodProductData?.manufacturerRegion || "",
    foodType: product?.foodProductData?.foodType || "",
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.image ? [product.image] : []);
  const [customIngredient, setCustomIngredient] = useState("");
  const [customUsage, setCustomUsage] = useState("");
  const [selectedAllergen, setSelectedAllergen] = useState("");

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
    
    // Limit to 5 images maximum
    const maxImages = 5;
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
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Sub-category is required";
    }

    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = "Minimum order quantity must be greater than zero";
    }

    if (!formData.dailyCapacity || formData.dailyCapacity <= 0) {
      newErrors.dailyCapacity = "Daily capacity must be greater than zero";
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = "Price per unit must be greater than zero";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.unitType?.trim()) {
      newErrors.unitType = "Unit type is required";
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
      newErrors.allergens = "At least one allergen is required";
    }

    if (!foodProductData.packagingSize?.trim()) {
      newErrors.packagingSize = "Packaging size is required";
    }

    if (!foodProductData.shelfLife?.trim()) {
      newErrors.shelfLife = "Shelf life is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitLoading(true);
      
      try {
        const finalProductData = {
          ...formData,
          foodProductData,
          productType: "Food Product"
        };

        if (product) {
          onSubmit({ ...product, ...finalProductData } as Product);
        } else {
          onSubmit(finalProductData as Omit<Product, "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku">);
        }

        // Don't navigate here - let the parent component handle it
        // The parent (Production.tsx) will close the dialog and show the updated list
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
        {/* Basic Information */}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">
                    Sub-Category *
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
                      <SelectValue placeholder="Select a sub-category" />
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Food-Specific Properties */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                </div>
                Product Characteristics
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

        {/* Packaging & Storage */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                Packaging & Storage
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Packaging Size - Enhanced Dropdown */}
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

                {/* Shelf Life - Enhanced Dropdown */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Shelf Life *
                  </Label>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Production Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
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
                  <Label htmlFor="pricePerUnit" className="text-base font-medium">
                    Price per Unit *
                  </Label>
                  <Input
                    id="pricePerUnit"
                    name="pricePerUnit"
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit || ""}
                    onChange={handleChange}
                    className={cn(
                      "transition-all duration-300",
                      errors.pricePerUnit && "border-red-500"
                    )}
                  />
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
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="packs">Packs</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
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

        {/* Description & Media - Updated for multiple images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
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
                    Product Images ({images.length}/5)
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
                      images.length >= 5 && "opacity-50 cursor-not-allowed"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => images.length < 5 && fileInputRef.current?.click()}
                    whileHover={images.length < 5 ? { scale: 1.02 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {images.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <UploadCloud className="h-6 w-6 text-primary/60 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground text-center">
                          {images.length >= 5 ? "Maximum 5 images reached" : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    ) : (
                      <>
                        <img src={images[0]} alt="Main preview" className="h-full w-full object-cover" />
                        {images.length < 5 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <UploadCloud className="h-6 w-6 text-white mb-1" />
                            <span className="text-xs text-white">Click or drag to add more</span>
                          </div>
                        )}
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
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                Main
                              </div>
                            )}
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