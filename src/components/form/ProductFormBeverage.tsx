import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Coffee,
  Droplets,
  Thermometer,
  Clock,
  Award,
  Leaf,
  AlertCircle,
  Package,
  Zap,
  Heart,
  Shield,
  Sparkles,
  Wine,
  ChefHat,
  CheckCircle,
  Beaker,
} from 'lucide-react';

interface BeverageProductData {
  beverageType: string[];
  flavorProfile: string[];
  ingredients: string[];
  alcoholContent?: string;
  carbonationLevel: string;
  servingTemperature: string;
  shelfLife: string;
  packagingType: string[];
  volumeOptions: string[];
  nutritionalInfo: {
    calories: string;
    sugar: string;
    caffeine?: string;
    sodium: string;
    carbs: string;
    protein: string;
  };
  certifications: string[];
  targetMarket: string[];
  seasonality: string;
  mixingInstructions?: string;
  storageConditions: string;
  allergenInfo: string[];
  preservatives: string[];
  coloringAgents: string[];
  healthBenefits: string[];
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
  beverageProductData?: BeverageProductData;
}

interface ProductFormBeverageProps {
  product: Product | null;
  parentCategory: string;
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
  onBack: () => void;
}

export const ProductFormBeverage: React.FC<ProductFormBeverageProps> = ({
  product,
  parentCategory,
  onSubmit,
  isLoading,
  onBack,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>(
    product
      ? { ...product }
      : {
          name: "",
          category: parentCategory,
          minOrderQuantity: 1000,
          dailyCapacity: 5000,
          unitType: "bottles",
          currentAvailable: 0,
          pricePerUnit: 0,
          productType: "Beverage Product",
          image: "",
          description: "",
          leadTime: "1-2",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );

  const [beverageData, setBeverageData] = useState<BeverageProductData>(
    product?.beverageProductData || {
      beverageType: [],
      flavorProfile: [],
      ingredients: [],
      alcoholContent: "",
      carbonationLevel: "Still",
      servingTemperature: "Chilled",
      shelfLife: "",
      packagingType: [],
      volumeOptions: [],
      nutritionalInfo: {
        calories: "",
        sugar: "",
        caffeine: "",
        sodium: "",
        carbs: "",
        protein: "",
      },
      certifications: [],
      targetMarket: [],
      seasonality: "Year-round",
      mixingInstructions: "",
      storageConditions: "",
      allergenInfo: [],
      preservatives: [],
      coloringAgents: [],
      healthBenefits: [],
    }
  );

  const [images, setImages] = useState<string[]>(
    product?.image ? [product.image] : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Beverage Types
  const beverageTypes = [
    'Soft Drink', 'Energy Drink', 'Sports Drink', 'Juice', 'Tea', 'Coffee',
    'Water', 'Alcoholic', 'Functional Drink', 'Smoothie', 'Kombucha', 'Soda'
  ];

  // Flavor Profiles
  const flavorProfiles = [
    'Sweet', 'Sour', 'Bitter', 'Citrus', 'Tropical', 'Berry', 'Mint',
    'Vanilla', 'Chocolate', 'Caramel', 'Spicy', 'Herbal', 'Floral', 'Nutty'
  ];

  // Packaging Types
  const packagingTypes = [
    'Glass Bottle', 'Plastic Bottle', 'Can', 'Tetra Pack', 'Pouch',
    'Glass Jar', 'Bag-in-Box', 'Keg', 'Bottle with Cork', 'Eco-Friendly Pack'
  ];

  // Volume Options
  const volumeOptions = [
    '250ml', '330ml', '500ml', '750ml', '1L', '1.5L', '2L', '12oz', '16oz', '20oz'
  ];

  // Certifications
  const certifications = [
    'Organic', 'Non-GMO', 'Fair Trade', 'Kosher', 'Halal', 'Vegan',
    'Sugar-Free', 'Natural', 'USDA Organic', 'EU Organic', 'Rainforest Alliance'
  ];

  // Target Markets
  const targetMarkets = [
    'Athletes', 'Health Conscious', 'Kids', 'Adults', 'Seniors',
    'Fitness Enthusiasts', 'Diabetics', 'Weight Watchers', 'Gamers', 'Students'
  ];

  // Allergens
  const allergens = [
    'Gluten', 'Dairy', 'Nuts', 'Soy', 'Eggs', 'Sulfites', 'Artificial Colors',
    'Artificial Flavors', 'Preservatives', 'Caffeine'
  ];

  // Health Benefits
  const healthBenefits = [
    'Hydration', 'Energy Boost', 'Antioxidants', 'Vitamins', 'Minerals',
    'Electrolytes', 'Probiotics', 'Low Calorie', 'Natural Ingredients', 'Detox'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBeverageDataChange = (field: keyof BeverageProductData, value: any) => {
    setBeverageData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNutritionalChange = (field: string, value: string) => {
    setBeverageData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (field: keyof BeverageProductData, item: string) => {
    setBeverageData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0";
    }

    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = "Minimum order quantity must be greater than 0";
    }

    if (beverageData.beverageType.length === 0) {
      newErrors.beverageType = "At least one beverage type is required";
    }

    if (beverageData.flavorProfile.length === 0) {
      newErrors.flavorProfile = "At least one flavor profile is required";
    }

    if (!beverageData.shelfLife?.trim()) {
      newErrors.shelfLife = "Shelf life is required";
    }

    if (beverageData.packagingType.length === 0) {
      newErrors.packagingType = "At least one packaging type is required";
    }

    if (beverageData.volumeOptions.length === 0) {
      newErrors.volumeOptions = "At least one volume option is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData: Product = {
        ...formData,
        image: images[0] || "",
        beverageProductData: beverageData,
      } as Product;

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = product
        ? existingProducts.map((p: Product) => p.id === product.id ? productData : p)
        : [...existingProducts, { ...productData, id: Date.now() }];
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      onSubmit(productData);

      toast({
        title: "Success!",
        description: `Beverage product ${product ? 'updated' : 'created'} successfully.`,
      });

    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {product ? 'Edit' : 'Create'} Beverage Product
              </h1>
              <p className="text-sm text-muted-foreground">
                Specialized form for beverage products
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential product details and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Orange Juice"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price per Unit *</Label>
                  <Input
                    id="pricePerUnit"
                    name="pricePerUnit"
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={errors.pricePerUnit ? "border-red-500" : ""}
                  />
                  {errors.pricePerUnit && (
                    <p className="text-sm text-red-500">{errors.pricePerUnit}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  placeholder="Describe your beverage product..."
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">Min Order Quantity *</Label>
                  <Input
                    id="minOrderQuantity"
                    name="minOrderQuantity"
                    type="number"
                    value={formData.minOrderQuantity || ""}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className={errors.minOrderQuantity ? "border-red-500" : ""}
                  />
                  {errors.minOrderQuantity && (
                    <p className="text-sm text-red-500">{errors.minOrderQuantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyCapacity">Daily Capacity</Label>
                  <Input
                    id="dailyCapacity"
                    name="dailyCapacity"
                    type="number"
                    value={formData.dailyCapacity || ""}
                    onChange={handleInputChange}
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select
                    value={formData.unitType || "bottles"}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unitType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="cans">Cans</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="gallons">Gallons</SelectItem>
                      <SelectItem value="cases">Cases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beverage Specifications */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Beverage Specifications
              </CardTitle>
              <CardDescription>
                Detailed beverage characteristics and properties
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Beverage Types */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  Beverage Types *
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {beverageTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`beverage-type-${type}`}
                        checked={beverageData.beverageType.includes(type)}
                        onCheckedChange={() => toggleArrayItem('beverageType', type)}
                      />
                      <Label
                        htmlFor={`beverage-type-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.beverageType && (
                  <p className="text-sm text-red-500">{errors.beverageType}</p>
                )}
              </div>

              {/* Flavor Profiles */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Flavor Profiles *
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {flavorProfiles.map((flavor) => (
                    <div key={flavor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`flavor-${flavor}`}
                        checked={beverageData.flavorProfile.includes(flavor)}
                        onCheckedChange={() => toggleArrayItem('flavorProfile', flavor)}
                      />
                      <Label
                        htmlFor={`flavor-${flavor}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {flavor}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.flavorProfile && (
                  <p className="text-sm text-red-500">{errors.flavorProfile}</p>
                )}
              </div>

              {/* Carbonation & Temperature */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carbonationLevel">Carbonation Level</Label>
                  <Select
                    value={beverageData.carbonationLevel}
                    onValueChange={(value) => handleBeverageDataChange('carbonationLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Still">Still</SelectItem>
                      <SelectItem value="Lightly Carbonated">Lightly Carbonated</SelectItem>
                      <SelectItem value="Moderately Carbonated">Moderately Carbonated</SelectItem>
                      <SelectItem value="Highly Carbonated">Highly Carbonated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servingTemperature">Serving Temperature</Label>
                  <Select
                    value={beverageData.servingTemperature}
                    onValueChange={(value) => handleBeverageDataChange('servingTemperature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Room Temperature">Room Temperature</SelectItem>
                      <SelectItem value="Chilled">Chilled</SelectItem>
                      <SelectItem value="Ice Cold">Ice Cold</SelectItem>
                      <SelectItem value="Hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seasonality">Seasonality</Label>
                  <Select
                    value={beverageData.seasonality}
                    onValueChange={(value) => handleBeverageDataChange('seasonality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Year-round">Year-round</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Holiday Special">Holiday Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alcohol Content & Shelf Life */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alcoholContent">Alcohol Content (if applicable)</Label>
                  <Input
                    id="alcoholContent"
                    value={beverageData.alcoholContent || ""}
                    onChange={(e) => handleBeverageDataChange('alcoholContent', e.target.value)}
                    placeholder="e.g., 5% ABV"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shelfLife">Shelf Life *</Label>
                  <Input
                    id="shelfLife"
                    value={beverageData.shelfLife}
                    onChange={(e) => handleBeverageDataChange('shelfLife', e.target.value)}
                    placeholder="e.g., 12 months"
                    className={errors.shelfLife ? "border-red-500" : ""}
                  />
                  {errors.shelfLife && (
                    <p className="text-sm text-red-500">{errors.shelfLife}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packaging & Volume */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Packaging & Volume Options
              </CardTitle>
              <CardDescription>
                Packaging types and available volume sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Packaging Types */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Packaging Types *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {packagingTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`packaging-${type}`}
                        checked={beverageData.packagingType.includes(type)}
                        onCheckedChange={() => toggleArrayItem('packagingType', type)}
                      />
                      <Label
                        htmlFor={`packaging-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.packagingType && (
                  <p className="text-sm text-red-500">{errors.packagingType}</p>
                )}
              </div>

              {/* Volume Options */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Volume Options *</Label>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                  {volumeOptions.map((volume) => (
                    <div key={volume} className="flex items-center space-x-2">
                      <Checkbox
                        id={`volume-${volume}`}
                        checked={beverageData.volumeOptions.includes(volume)}
                        onCheckedChange={() => toggleArrayItem('volumeOptions', volume)}
                      />
                      <Label
                        htmlFor={`volume-${volume}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {volume}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.volumeOptions && (
                  <p className="text-sm text-red-500">{errors.volumeOptions}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Nutritional Information
              </CardTitle>
              <CardDescription>
                Nutritional facts and health-related information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories (per serving)</Label>
                  <Input
                    id="calories"
                    value={beverageData.nutritionalInfo.calories}
                    onChange={(e) => handleNutritionalChange('calories', e.target.value)}
                    placeholder="e.g., 150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    value={beverageData.nutritionalInfo.sugar}
                    onChange={(e) => handleNutritionalChange('sugar', e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caffeine">Caffeine (mg)</Label>
                  <Input
                    id="caffeine"
                    value={beverageData.nutritionalInfo.caffeine || ""}
                    onChange={(e) => handleNutritionalChange('caffeine', e.target.value)}
                    placeholder="e.g., 80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    value={beverageData.nutritionalInfo.sodium}
                    onChange={(e) => handleNutritionalChange('sodium', e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohydrates (g)</Label>
                  <Input
                    id="carbs"
                    value={beverageData.nutritionalInfo.carbs}
                    onChange={(e) => handleNutritionalChange('carbs', e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    value={beverageData.nutritionalInfo.protein}
                    onChange={(e) => handleNutritionalChange('protein', e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications & Target Market */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Target Market
              </CardTitle>
              <CardDescription>
                Quality certifications and target consumer segments
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Certifications */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Certifications
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={beverageData.certifications.includes(cert)}
                        onCheckedChange={() => toggleArrayItem('certifications', cert)}
                      />
                      <Label
                        htmlFor={`cert-${cert}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Market */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Target Market</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {targetMarkets.map((market) => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={`market-${market}`}
                        checked={beverageData.targetMarket.includes(market)}
                        onCheckedChange={() => toggleArrayItem('targetMarket', market)}
                      />
                      <Label
                        htmlFor={`market-${market}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {market}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Benefits */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Health Benefits
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {healthBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`benefit-${benefit}`}
                        checked={beverageData.healthBenefits.includes(benefit)}
                        onCheckedChange={() => toggleArrayItem('healthBenefits', benefit)}
                      />
                      <Label
                        htmlFor={`benefit-${benefit}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {benefit}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergens & Additional Info */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Allergens & Additional Information
              </CardTitle>
              <CardDescription>
                Allergen information and additional product details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Allergen Information */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Allergen Information
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allergens.map((allergen) => (
                    <div key={allergen} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergen-${allergen}`}
                        checked={beverageData.allergenInfo.includes(allergen)}
                        onCheckedChange={() => toggleArrayItem('allergenInfo', allergen)}
                      />
                      <Label
                        htmlFor={`allergen-${allergen}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {allergen}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage Conditions */}
              <div className="space-y-2">
                <Label htmlFor="storageConditions">Storage Conditions</Label>
                <Textarea
                  id="storageConditions"
                  value={beverageData.storageConditions}
                  onChange={(e) => handleBeverageDataChange('storageConditions', e.target.value)}
                  placeholder="e.g., Store in cool, dry place. Refrigerate after opening."
                  rows={2}
                />
              </div>

              {/* Mixing Instructions */}
              <div className="space-y-2">
                <Label htmlFor="mixingInstructions">Mixing Instructions (if applicable)</Label>
                <Textarea
                  id="mixingInstructions"
                  value={beverageData.mixingInstructions || ""}
                  onChange={(e) => handleBeverageDataChange('mixingInstructions', e.target.value)}
                  placeholder="e.g., Mix 1 part concentrate with 3 parts water"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product Images
              </CardTitle>
              <CardDescription>
                Upload high-quality images of your beverage product
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop images here, or click to select
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </div>
              ) : (
                `${product ? 'Update' : 'Create'} Product`
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}; 