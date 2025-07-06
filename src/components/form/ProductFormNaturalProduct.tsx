import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
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
  Info,
  Leaf,
  Shield,
  Award,
  Globe,
  Recycle
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Interfaces
interface NaturalProductData {
  naturalType: string[];
  certifications: string[];
  sustainabilityFeatures: string[];
  origin: string;
  extractionMethod: string;
  purityLevel: string;
  organicCertified: boolean;
  environmentalImpact: string;
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
  naturalProductData?: NaturalProductData;
}

interface ProductFormNaturalProductProps {
  product: Product | null;
  parentCategory: string; // "Natural & Organic"
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
const NATURAL_SUBCATEGORIES = [
  { value: "Organic Foods", label: "Organic Foods", icon: "🥬" },
  { value: "Natural Supplements", label: "Natural Supplements", icon: "💊" },
  { value: "Herbal Products", label: "Herbal Products", icon: "🌿" },
  { value: "Essential Oils", label: "Essential Oils", icon: "🌸" },
  { value: "Natural Cosmetics", label: "Natural Cosmetics", icon: "🧴" },
  { value: "Eco-Friendly Items", label: "Eco-Friendly Items", icon: "♻️" },
  { value: "Raw Materials", label: "Raw Materials", icon: "🌾" },
  { value: "Plant-Based", label: "Plant-Based Products", icon: "🌱" },
  { value: "Sustainable Goods", label: "Sustainable Goods", icon: "🌍" },
  { value: "Natural Fibers", label: "Natural Fibers", icon: "🧵" }
];

const NATURAL_TYPES = [
  { value: "Organic", label: "Organic", description: "Certified organic ingredients" },
  { value: "Wild-Harvested", label: "Wild-Harvested", description: "Sustainably wild-sourced" },
  { value: "Non-GMO", label: "Non-GMO", description: "Non-genetically modified" },
  { value: "Raw", label: "Raw", description: "Unprocessed, natural state" },
  { value: "Cold-Pressed", label: "Cold-Pressed", description: "Extracted without heat" },
  { value: "Steam-Distilled", label: "Steam-Distilled", description: "Pure steam extraction" },
  { value: "Fair-Trade", label: "Fair-Trade", description: "Ethically sourced" },
  { value: "Biodynamic", label: "Biodynamic", description: "Holistic farming approach" },
  { value: "Vegan", label: "Vegan", description: "Plant-based, no animal products" },
  { value: "Cruelty-Free", label: "Cruelty-Free", description: "Not tested on animals" },
  { value: "Sustainable", label: "Sustainable", description: "Environmentally responsible" },
  { value: "Renewable", label: "Renewable", description: "From renewable sources" }
];

const CERTIFICATIONS = [
  { value: "USDA Organic", label: "USDA Organic", category: "Organic" },
  { value: "EU Organic", label: "EU Organic", category: "Organic" },
  { value: "JAS Organic", label: "JAS Organic (Japan)", category: "Organic" },
  { value: "Fair Trade", label: "Fair Trade Certified", category: "Ethical" },
  { value: "Rainforest Alliance", label: "Rainforest Alliance", category: "Environmental" },
  { value: "Non-GMO Project", label: "Non-GMO Project Verified", category: "Quality" },
  { value: "Cruelty-Free", label: "Cruelty-Free Certified", category: "Ethical" },
  { value: "Vegan Society", label: "Vegan Society", category: "Ethical" },
  { value: "FSC", label: "Forest Stewardship Council", category: "Environmental" },
  { value: "Carbon Neutral", label: "Carbon Neutral", category: "Environmental" },
  { value: "ISO 14001", label: "ISO 14001 Environmental", category: "Environmental" },
  { value: "B-Corp", label: "B-Corporation", category: "Social" }
];

const SUSTAINABILITY_FEATURES = [
  { value: "Biodegradable", label: "Biodegradable", description: "Naturally breaks down" },
  { value: "Recyclable", label: "Recyclable Packaging", description: "Can be recycled" },
  { value: "Minimal Packaging", label: "Minimal Packaging", description: "Reduced waste" },
  { value: "Carbon Neutral", label: "Carbon Neutral", description: "Net-zero emissions" },
  { value: "Water Conservation", label: "Water Conservation", description: "Water-efficient production" },
  { value: "Renewable Energy", label: "Renewable Energy", description: "Clean energy used" },
  { value: "Local Sourcing", label: "Local Sourcing", description: "Locally sourced materials" },
  { value: "Zero Waste", label: "Zero Waste", description: "No waste to landfill" },
  { value: "Compostable", label: "Compostable", description: "Can be composted" },
  { value: "Refillable", label: "Refillable", description: "Reusable container" }
];

const EXTRACTION_METHODS = [
  { value: "Cold-Pressed", label: "Cold-Pressed", category: "Mechanical" },
  { value: "Steam-Distilled", label: "Steam-Distilled", category: "Distillation" },
  { value: "CO2 Extraction", label: "CO2 Extraction", category: "Chemical" },
  { value: "Solvent-Free", label: "Solvent-Free", category: "Natural" },
  { value: "Water-Based", label: "Water-Based", category: "Natural" },
  { value: "Traditional", label: "Traditional Methods", category: "Heritage" },
  { value: "Enzymatic", label: "Enzymatic", category: "Biological" },
  { value: "Fermentation", label: "Fermentation", category: "Biological" }
];

const PURITY_LEVELS = [
  { value: "99%+", label: "99%+ Pure", category: "Ultra Pure" },
  { value: "95-99%", label: "95-99% Pure", category: "High Purity" },
  { value: "90-95%", label: "90-95% Pure", category: "Standard" },
  { value: "85-90%", label: "85-90% Pure", category: "Commercial" },
  { value: "Natural Blend", label: "Natural Blend", category: "Blend" }
];

const ProductFormNaturalProduct: React.FC<ProductFormNaturalProductProps> = ({
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
    product
      ? { ...product }
      : {
          name: "",
          category: "",
          minOrderQuantity: 500,
          dailyCapacity: 2000,
          unitType: "units",
          currentAvailable: 0,
          pricePerUnit: 0,
          productType: "Natural Product",
          image: "",
          description: "",
          leadTime: "5",
          leadTimeUnit: "days",
          sustainable: true,
        }
  );

  const [naturalProductData, setNaturalProductData] = useState<NaturalProductData>(
    product?.naturalProductData || {
      naturalType: [],
      certifications: [],
      sustainabilityFeatures: [],
      origin: "",
      extractionMethod: "",
      purityLevel: "",
      organicCertified: false,
      environmentalImpact: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>(product?.image ? [product.image] : []);
  const [isDragging, setIsDragging] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [newUsage, setNewUsage] = useState("");

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setNaturalProductData(product.naturalProductData || {
        naturalType: [],
        certifications: [],
        sustainabilityFeatures: [],
        origin: "",
        extractionMethod: "",
        purityLevel: "",
        organicCertified: false,
        environmentalImpact: "",
      });
      setImages(product.image ? [product.image] : []);
    }
  }, [product]);

  // Handlers
  const handleNaturalTypeChange = (value: string) => {
    const updatedTypes = naturalProductData.naturalType.includes(value)
      ? naturalProductData.naturalType.filter(type => type !== value)
      : [...naturalProductData.naturalType, value];
    setNaturalProductData({ ...naturalProductData, naturalType: updatedTypes });
  };

  const handleCertificationChange = (value: string) => {
    const updatedCerts = naturalProductData.certifications.includes(value)
      ? naturalProductData.certifications.filter(cert => cert !== value)
      : [...naturalProductData.certifications, value];
    setNaturalProductData({ ...naturalProductData, certifications: updatedCerts });
  };

  const handleSustainabilityChange = (value: string) => {
    const updatedFeatures = naturalProductData.sustainabilityFeatures.includes(value)
      ? naturalProductData.sustainabilityFeatures.filter(feature => feature !== value)
      : [...naturalProductData.sustainabilityFeatures, value];
    setNaturalProductData({ ...naturalProductData, sustainabilityFeatures: updatedFeatures });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (type === "number") {
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

  const handleNaturalProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNaturalProductData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0";
    }

    if (!formData.minOrderQuantity || formData.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = "Minimum order quantity must be greater than 0";
    }

    if (!formData.dailyCapacity || formData.dailyCapacity <= 0) {
      newErrors.dailyCapacity = "Daily capacity must be greater than 0";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    // Natural product specific validation
    if (naturalProductData.naturalType.length === 0) {
      newErrors.naturalType = "Please select at least one natural type";
    }

    if (!naturalProductData.origin?.trim()) {
      newErrors.origin = "Origin is required";
    }

    if (!naturalProductData.extractionMethod?.trim()) {
      newErrors.extractionMethod = "Extraction method is required";
    }

    if (!naturalProductData.purityLevel?.trim()) {
      newErrors.purityLevel = "Purity level is required";
    }

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
        naturalProductData,
        sustainable: true, // Natural products are inherently sustainable
      };

      await onSubmit(productData);
      
      toast({
        title: "Success!",
        description: `Natural product ${product ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error("Error submitting natural product:", error);
      toast({
        title: "Error",
        description: "There was an error saving your natural product. Please try again.",
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
              {product ? 'Edit Natural Product' : 'Create Natural Product'}
            </h1>
            <p className="text-muted-foreground">
              Create sustainable, organic, and eco-friendly products
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Leaf className="h-3 w-3 mr-1" />
            Natural & Organic
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-green-600" />
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
                  placeholder="Enter natural product name"
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
                    {NATURAL_SUBCATEGORIES.map((cat) => (
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
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="packages">Packages</SelectItem>
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

        {/* Natural Product Properties */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Natural Product Properties</h2>
            </div>

            <div className="space-y-6">
              {/* Natural Types */}
              <div className="space-y-3">
                <Label>Natural Types * (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {NATURAL_TYPES.map((type) => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        naturalProductData.naturalType.includes(type.value)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      )}
                      onClick={() => handleNaturalTypeChange(type.value)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={naturalProductData.naturalType.includes(type.value)}
                          onChange={() => handleNaturalTypeChange(type.value)}
                        />
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {errors.naturalType && <p className="text-sm text-red-500">{errors.naturalType}</p>}
              </div>

              {/* Origin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin/Source *</Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={naturalProductData.origin}
                    onChange={handleNaturalProductChange}
                    placeholder="e.g., Organic farms in California"
                    className={errors.origin ? "border-red-500" : ""}
                  />
                  {errors.origin && <p className="text-sm text-red-500">{errors.origin}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extractionMethod">Extraction Method *</Label>
                  <Select
                    name="extractionMethod"
                    value={naturalProductData.extractionMethod}
                    onValueChange={(value) => setNaturalProductData(prev => ({ ...prev, extractionMethod: value }))}
                  >
                    <SelectTrigger className={errors.extractionMethod ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select extraction method" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXTRACTION_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label} - {method.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.extractionMethod && <p className="text-sm text-red-500">{errors.extractionMethod}</p>}
                </div>
              </div>

              {/* Purity Level */}
              <div className="space-y-2">
                <Label htmlFor="purityLevel">Purity Level *</Label>
                <Select
                  name="purityLevel"
                  value={naturalProductData.purityLevel}
                  onValueChange={(value) => setNaturalProductData(prev => ({ ...prev, purityLevel: value }))}
                >
                  <SelectTrigger className={errors.purityLevel ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select purity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label} - {level.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purityLevel && <p className="text-sm text-red-500">{errors.purityLevel}</p>}
              </div>

              {/* Organic Certified */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organicCertified"
                  checked={naturalProductData.organicCertified}
                  onCheckedChange={(checked) => 
                    setNaturalProductData(prev => ({ ...prev, organicCertified: checked as boolean }))
                  }
                />
                <Label htmlFor="organicCertified" className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>Certified Organic</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Certifications & Standards</h2>
            </div>

            <div className="space-y-3">
              <Label>Certifications (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CERTIFICATIONS.map((cert) => (
                  <motion.div
                    key={cert.value}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      naturalProductData.certifications.includes(cert.value)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    )}
                    onClick={() => handleCertificationChange(cert.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={naturalProductData.certifications.includes(cert.value)}
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

        {/* Sustainability Features */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Sustainability Features</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Sustainability Features (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SUSTAINABILITY_FEATURES.map((feature) => (
                    <motion.div
                      key={feature.value}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        naturalProductData.sustainabilityFeatures.includes(feature.value)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      )}
                      onClick={() => handleSustainabilityChange(feature.value)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={naturalProductData.sustainabilityFeatures.includes(feature.value)}
                          onChange={() => handleSustainabilityChange(feature.value)}
                        />
                        <div>
                          <p className="font-medium text-sm">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="space-y-2">
                <Label htmlFor="environmentalImpact">Environmental Impact Statement</Label>
                <Textarea
                  id="environmentalImpact"
                  name="environmentalImpact"
                  value={naturalProductData.environmentalImpact}
                  onChange={handleNaturalProductChange}
                  placeholder="Describe the environmental benefits and impact of this product..."
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
              <Clock className="h-5 w-5 text-green-600" />
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
              <FileText className="h-5 w-5 text-green-600" />
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
                  placeholder="Describe your natural product, its benefits, and uses..."
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
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                >
                  <UploadCloud className="h-12 w-12 text-green-500 mx-auto mb-4" />
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
            className="bg-green-600 hover:bg-green-700 text-white px-8"
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
                <Leaf className="mr-2 h-4 w-4" />
                {product ? 'Update Natural Product' : 'Create Natural Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductFormNaturalProduct; 