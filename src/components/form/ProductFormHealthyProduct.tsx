import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import {
  X,
  UploadCloud,
  Clock,
  Package,
  FileText,
  Sparkles,
  ArrowLeft,
  Heart,
  Shield,
  Activity,
  Zap,
  Leaf
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Interfaces
interface HealthyProductData {
  healthBenefits: string[];
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
  };
  dietaryRestrictions: string[];
  healthCertifications: string[];
  targetHealthGoals: string[];
  allergenInfo: string[];
  supplementFacts?: string;
  clinicalStudies?: string;
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
  healthyProductData?: HealthyProductData;
}

interface ProductFormHealthyProductProps {
  product: Product | null;
  parentCategory: string;
  onSubmit: (product: Product | Omit<Product, "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku">) => void;
  isLoading: boolean;
  onBack?: () => void;
}

// Constants
const HEALTHY_SUBCATEGORIES = [
  { value: "Protein Supplements", label: "Protein Supplements", icon: "💪" },
  { value: "Vitamins & Minerals", label: "Vitamins & Minerals", icon: "💊" },
  { value: "Functional Foods", label: "Functional Foods", icon: "🥗" },
  { value: "Sports Nutrition", label: "Sports Nutrition", icon: "🏃" },
  { value: "Weight Management", label: "Weight Management", icon: "⚖️" },
  { value: "Immune Support", label: "Immune Support", icon: "🛡️" },
  { value: "Heart Health", label: "Heart Health", icon: "❤️" },
  { value: "Brain Health", label: "Brain Health", icon: "🧠" },
  { value: "Digestive Health", label: "Digestive Health", icon: "🌱" },
  { value: "Energy & Vitality", label: "Energy & Vitality", icon: "⚡" }
];

const HEALTH_BENEFITS = [
  { value: "Boosts Immunity", label: "Boosts Immunity", description: "Strengthens immune system" },
  { value: "Improves Energy", label: "Improves Energy", description: "Increases energy levels" },
  { value: "Supports Heart Health", label: "Supports Heart Health", description: "Promotes cardiovascular health" },
  { value: "Enhances Brain Function", label: "Enhances Brain Function", description: "Improves cognitive performance" },
  { value: "Aids Digestion", label: "Aids Digestion", description: "Supports digestive health" },
  { value: "Builds Muscle", label: "Builds Muscle", description: "Promotes muscle growth" },
  { value: "Burns Fat", label: "Burns Fat", description: "Supports fat metabolism" },
  { value: "Reduces Inflammation", label: "Reduces Inflammation", description: "Anti-inflammatory properties" },
  { value: "Improves Sleep", label: "Improves Sleep", description: "Promotes better sleep quality" },
  { value: "Antioxidant Rich", label: "Antioxidant Rich", description: "High in antioxidants" }
];

const DIETARY_RESTRICTIONS = [
  { value: "Vegan", label: "Vegan", description: "Plant-based only" },
  { value: "Vegetarian", label: "Vegetarian", description: "No meat products" },
  { value: "Gluten-Free", label: "Gluten-Free", description: "No gluten ingredients" },
  { value: "Dairy-Free", label: "Dairy-Free", description: "No dairy products" },
  { value: "Sugar-Free", label: "Sugar-Free", description: "No added sugars" },
  { value: "Keto-Friendly", label: "Keto-Friendly", description: "Low carb, high fat" },
  { value: "Paleo", label: "Paleo", description: "Paleo diet compatible" },
  { value: "Low-Sodium", label: "Low-Sodium", description: "Reduced sodium content" },
  { value: "Organic", label: "Organic", description: "Certified organic" },
  { value: "Non-GMO", label: "Non-GMO", description: "No GMO ingredients" }
];

const HEALTH_CERTIFICATIONS = [
  { value: "FDA Approved", label: "FDA Approved", category: "Regulatory" },
  { value: "NSF Certified", label: "NSF Certified", category: "Quality" },
  { value: "USP Verified", label: "USP Verified", category: "Quality" },
  { value: "Third-Party Tested", label: "Third-Party Tested", category: "Quality" },
  { value: "GMP Certified", label: "GMP Certified", category: "Manufacturing" },
  { value: "Informed Sport", label: "Informed Sport", category: "Sports" },
  { value: "BSCG Certified", label: "BSCG Certified", category: "Sports" },
  { value: "Halal Certified", label: "Halal Certified", category: "Religious" },
  { value: "Kosher Certified", label: "Kosher Certified", category: "Religious" },
  { value: "Clinical Studies", label: "Clinical Studies", category: "Research" }
];

const TARGET_HEALTH_GOALS = [
  { value: "Weight Loss", label: "Weight Loss", description: "Supports weight management" },
  { value: "Muscle Gain", label: "Muscle Gain", description: "Promotes muscle building" },
  { value: "Athletic Performance", label: "Athletic Performance", description: "Enhances sports performance" },
  { value: "General Wellness", label: "General Wellness", description: "Overall health support" },
  { value: "Recovery", label: "Recovery", description: "Post-workout recovery" },
  { value: "Endurance", label: "Endurance", description: "Improves stamina" },
  { value: "Mental Focus", label: "Mental Focus", description: "Cognitive enhancement" },
  { value: "Stress Management", label: "Stress Management", description: "Reduces stress" },
  { value: "Longevity", label: "Longevity", description: "Anti-aging benefits" },
  { value: "Disease Prevention", label: "Disease Prevention", description: "Preventive health" }
];

const ALLERGENS = [
  { value: "Milk", label: "Milk", category: "Dairy" },
  { value: "Eggs", label: "Eggs", category: "Animal" },
  { value: "Peanuts", label: "Peanuts", category: "Nuts" },
  { value: "Tree Nuts", label: "Tree Nuts", category: "Nuts" },
  { value: "Soy", label: "Soy", category: "Legume" },
  { value: "Wheat", label: "Wheat", category: "Grain" },
  { value: "Fish", label: "Fish", category: "Seafood" },
  { value: "Shellfish", label: "Shellfish", category: "Seafood" },
  { value: "Sesame", label: "Sesame", category: "Seed" },
  { value: "Sulfites", label: "Sulfites", category: "Preservative" }
];

const ProductFormHealthyProduct: React.FC<ProductFormHealthyProductProps> = ({
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

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>(
    product ? { ...product } : {
      name: "",
      category: "",
      minOrderQuantity: 500,
      dailyCapacity: 2000,
      unitType: "units",
      currentAvailable: 0,
      pricePerUnit: 0,
      productType: "Healthy Product",
      image: "",
      description: "",
      leadTime: "5",
      leadTimeUnit: "days",
      sustainable: true,
    }
  );

  const [healthyProductData, setHealthyProductData] = useState<HealthyProductData>(
    product?.healthyProductData || {
      healthBenefits: [],
      nutritionalInfo: {
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sugar: "",
      },
      dietaryRestrictions: [],
      healthCertifications: [],
      targetHealthGoals: [],
      allergenInfo: [],
      supplementFacts: "",
      clinicalStudies: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>(product?.image ? [product.image] : []);
  const [isDragging, setIsDragging] = useState(false);

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setHealthyProductData(product.healthyProductData || {
        healthBenefits: [],
        nutritionalInfo: {
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          sugar: "",
        },
        dietaryRestrictions: [],
        healthCertifications: [],
        targetHealthGoals: [],
        allergenInfo: [],
        supplementFacts: "",
        clinicalStudies: "",
      });
      setImages(product.image ? [product.image] : []);
    }
  }, [product]);

  // Handlers
  const handleHealthBenefitChange = (value: string) => {
    const updated = healthyProductData.healthBenefits.includes(value)
      ? healthyProductData.healthBenefits.filter(benefit => benefit !== value)
      : [...healthyProductData.healthBenefits, value];
    setHealthyProductData({ ...healthyProductData, healthBenefits: updated });
  };

  const handleDietaryRestrictionChange = (value: string) => {
    const updated = healthyProductData.dietaryRestrictions.includes(value)
      ? healthyProductData.dietaryRestrictions.filter(restriction => restriction !== value)
      : [...healthyProductData.dietaryRestrictions, value];
    setHealthyProductData({ ...healthyProductData, dietaryRestrictions: updated });
  };

  const handleCertificationChange = (value: string) => {
    const updated = healthyProductData.healthCertifications.includes(value)
      ? healthyProductData.healthCertifications.filter(cert => cert !== value)
      : [...healthyProductData.healthCertifications, value];
    setHealthyProductData({ ...healthyProductData, healthCertifications: updated });
  };

  const handleHealthGoalChange = (value: string) => {
    const updated = healthyProductData.targetHealthGoals.includes(value)
      ? healthyProductData.targetHealthGoals.filter(goal => goal !== value)
      : [...healthyProductData.targetHealthGoals, value];
    setHealthyProductData({ ...healthyProductData, targetHealthGoals: updated });
  };

  const handleAllergenChange = (value: string) => {
    const updated = healthyProductData.allergenInfo.includes(value)
      ? healthyProductData.allergenInfo.filter(allergen => allergen !== value)
      : [...healthyProductData.allergenInfo, value];
    setHealthyProductData({ ...healthyProductData, allergenInfo: updated });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []));
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
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
          if (images.length === 0) {
            setFormData(prev => ({ ...prev, image: result }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (index === 0 && newImages.length > 0) {
        setFormData(prev => ({ ...prev, image: newImages[0] }));
      } else if (newImages.length === 0) {
        setFormData(prev => ({ ...prev, image: "" }));
      }
      return newImages;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHealthyProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHealthyProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleNutritionalInfoChange = (field: keyof HealthyProductData['nutritionalInfo'], value: string) => {
    setHealthyProductData(prev => ({
      ...prev,
      nutritionalInfo: { ...prev.nutritionalInfo, [field]: value }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    if (!formData.category?.trim()) newErrors.category = "Category is required";
    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) newErrors.pricePerUnit = "Price must be greater than 0";
    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) newErrors.minOrderQuantity = "Minimum order quantity must be greater than 0";
    if (!formData.dailyCapacity || formData.dailyCapacity <= 0) newErrors.dailyCapacity = "Daily capacity must be greater than 0";
    if (!formData.description?.trim()) newErrors.description = "Description is required";

    if (healthyProductData.healthBenefits.length === 0) newErrors.healthBenefits = "Please select at least one health benefit";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData: any = {
        ...formData,
        image: images[0] || "",
        healthyProductData,
        sustainable: true,
      };

      await onSubmit(productData);
      
      toast({
        title: "Success!",
        description: `Healthy product ${product ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error("Error submitting healthy product:", error);
      toast({
        title: "Error",
        description: "There was an error saving your healthy product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {product ? 'Edit Healthy Product' : 'Create Healthy Product'}
            </h1>
            <p className="text-muted-foreground">
              Create products focused on health, wellness, and nutrition
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Heart className="h-3 w-3 mr-1" />
            Health & Wellness
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter healthy product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Sub-Category *</Label>
                <Select
                  name="category"
                  value={formData.category || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTHY_SUBCATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price Per Unit ($) *</Label>
                <Input
                  id="pricePerUnit"
                  name="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.pricePerUnit ? "border-red-500" : ""}
                />
                {errors.pricePerUnit && <p className="text-sm text-red-500">{errors.pricePerUnit}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitType">Unit Type</Label>
                <Select
                  name="unitType"
                  value={formData.unitType || "units"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unitType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="capsules">Capsules</SelectItem>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="servings">Servings</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Minimum Order Quantity *</Label>
                <Input
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  type="number"
                  value={formData.minOrderQuantity || ""}
                  onChange={handleChange}
                  placeholder="500"
                  className={errors.minOrderQuantity ? "border-red-500" : ""}
                />
                {errors.minOrderQuantity && <p className="text-sm text-red-500">{errors.minOrderQuantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyCapacity">Daily Capacity *</Label>
                <Input
                  id="dailyCapacity"
                  name="dailyCapacity"
                  type="number"
                  value={formData.dailyCapacity || ""}
                  onChange={handleChange}
                  placeholder="2000"
                  className={errors.dailyCapacity ? "border-red-500" : ""}
                />
                {errors.dailyCapacity && <p className="text-sm text-red-500">{errors.dailyCapacity}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Benefits */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Health Benefits</h2>
            </div>

            <div className="space-y-3">
              <Label>Health Benefits * (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HEALTH_BENEFITS.map((benefit) => (
                  <motion.div
                    key={benefit.value}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      healthyProductData.healthBenefits.includes(benefit.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    )}
                    onClick={() => handleHealthBenefitChange(benefit.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={healthyProductData.healthBenefits.includes(benefit.value)}
                        onChange={() => handleHealthBenefitChange(benefit.value)}
                      />
                      <div>
                        <p className="font-medium text-sm">{benefit.label}</p>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {errors.healthBenefits && <p className="text-sm text-red-500">{errors.healthBenefits}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Nutritional Information</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories (per serving)</Label>
                <Input
                  id="calories"
                  value={healthyProductData.nutritionalInfo.calories}
                  onChange={(e) => handleNutritionalInfoChange('calories', e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  value={healthyProductData.nutritionalInfo.protein}
                  onChange={(e) => handleNutritionalInfoChange('protein', e.target.value)}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbohydrates (g)</Label>
                <Input
                  id="carbs"
                  value={healthyProductData.nutritionalInfo.carbs}
                  onChange={(e) => handleNutritionalInfoChange('carbs', e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  value={healthyProductData.nutritionalInfo.fat}
                  onChange={(e) => handleNutritionalInfoChange('fat', e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  value={healthyProductData.nutritionalInfo.fiber}
                  onChange={(e) => handleNutritionalInfoChange('fiber', e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">Sugar (g)</Label>
                <Input
                  id="sugar"
                  value={healthyProductData.nutritionalInfo.sugar}
                  onChange={(e) => handleNutritionalInfoChange('sugar', e.target.value)}
                  placeholder="e.g., 1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Restrictions & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Dietary Restrictions</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <motion.div
                      key={restriction.value}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        healthyProductData.dietaryRestrictions.includes(restriction.value)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                      onClick={() => handleDietaryRestrictionChange(restriction.value)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={healthyProductData.dietaryRestrictions.includes(restriction.value)}
                          onChange={() => handleDietaryRestrictionChange(restriction.value)}
                        />
                        <div>
                          <p className="font-medium text-sm">{restriction.label}</p>
                          <p className="text-xs text-muted-foreground">{restriction.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Health Certifications</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {HEALTH_CERTIFICATIONS.map((cert) => (
                    <motion.div
                      key={cert.value}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        healthyProductData.healthCertifications.includes(cert.value)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                      onClick={() => handleCertificationChange(cert.value)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={healthyProductData.healthCertifications.includes(cert.value)}
                          onChange={() => handleCertificationChange(cert.value)}
                        />
                        <div>
                          <p className="font-medium text-sm">{cert.label}</p>
                          <Badge variant="outline" className="text-xs">{cert.category}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Health Goals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Target Health Goals</h2>
            </div>

            <div className="space-y-3">
              <Label>Target Health Goals (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TARGET_HEALTH_GOALS.map((goal) => (
                  <motion.div
                    key={goal.value}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      healthyProductData.targetHealthGoals.includes(goal.value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    )}
                    onClick={() => handleHealthGoalChange(goal.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={healthyProductData.targetHealthGoals.includes(goal.value)}
                        onChange={() => handleHealthGoalChange(goal.value)}
                      />
                      <div>
                        <p className="font-medium text-sm">{goal.label}</p>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergen Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Allergen Information</h2>
            </div>

            <div className="space-y-3">
              <Label>Contains Allergens (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALLERGENS.map((allergen) => (
                  <motion.div
                    key={allergen.value}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      healthyProductData.allergenInfo.includes(allergen.value)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    )}
                    onClick={() => handleAllergenChange(allergen.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={healthyProductData.allergenInfo.includes(allergen.value)}
                        onChange={() => handleAllergenChange(allergen.value)}
                      />
                      <div>
                        <p className="font-medium text-sm">{allergen.label}</p>
                        <Badge variant="outline" className="text-xs">{allergen.category}</Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Additional Information</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="supplementFacts">Supplement Facts</Label>
                <Textarea
                  id="supplementFacts"
                  name="supplementFacts"
                  value={healthyProductData.supplementFacts || ""}
                  onChange={handleHealthyProductChange}
                  placeholder="Detailed supplement facts and dosage information..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalStudies">Clinical Studies & Research</Label>
                <Textarea
                  id="clinicalStudies"
                  name="clinicalStudies"
                  value={healthyProductData.clinicalStudies || ""}
                  onChange={handleHealthyProductChange}
                  placeholder="References to clinical studies or research supporting health claims..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Details */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Production Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentAvailable">Current Available Stock</Label>
                <Input
                  id="currentAvailable"
                  name="currentAvailable"
                  type="number"
                  value={formData.currentAvailable || ""}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time</Label>
                <Input
                  id="leadTime"
                  name="leadTime"
                  value={formData.leadTime || ""}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTimeUnit">Lead Time Unit</Label>
                <Select
                  name="leadTimeUnit"
                  value={formData.leadTimeUnit || "days"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leadTimeUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Media */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Description & Media</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Product Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Describe your healthy product, its benefits, usage instructions, and target audience..."
                  className={cn("min-h-[120px]", errors.description ? "border-red-500" : "")}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Images</Label>
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
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                >
                  <UploadCloud className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">Upload Product Images</p>
                  <p className="text-muted-foreground">
                    Drag & drop images or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG or GIF up to 5MB each
                  </p>
                </motion.div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">
                            Main
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                {product ? 'Update Healthy Product' : 'Create Healthy Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductFormHealthyProduct; 