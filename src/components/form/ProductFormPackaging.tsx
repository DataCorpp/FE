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
  Package,
  Box,
  Shield,
  Recycle,
  Truck,
  Award,
  Leaf,
  AlertCircle,
  Factory,
  Zap,
  Target,
  CheckCircle,
  Layers,
  Ruler,
} from 'lucide-react';

interface PackagingProductData {
  packagingType: string[];
  material: string[];
  dimensions: {
    length: string;
    width: string;
    height: string;
    weight: string;
  };
  capacity: {
    volume: string;
    maxWeight: string;
  };
  durability: string;
  sustainability: string[];
  barrierProperties: string[];
  printingOptions: string[];
  closureType: string[];
  certifications: string[];
  targetIndustries: string[];
  storageConditions: string;
  shelfLife: string;
  customization: {
    colorOptions: string[];
    logoPlacement: string[];
    finishOptions: string[];
  };
  compliance: string[];
  recyclability: string;
  biodegradability: string;
  temperatureResistance: {
    minTemp: string;
    maxTemp: string;
  };
  moistureResistance: string;
  lightProtection: string;
  gasBarrier: string;
  costFactors: string[];
  minimumOrderQuantity: string;
  leadTimeProduction: string;
  qualityStandards: string[];
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
  packagingProductData?: PackagingProductData;
}

interface ProductFormPackagingProps {
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

export const ProductFormPackaging: React.FC<ProductFormPackagingProps> = ({
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
          dailyCapacity: 10000,
          unitType: "pieces",
          currentAvailable: 0,
          pricePerUnit: 0,
          productType: "Packaging Product",
          image: "",
          description: "",
          leadTime: "2-3",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );

  const [packagingData, setPackagingData] = useState<PackagingProductData>(
    product?.packagingProductData || {
      packagingType: [],
      material: [],
      dimensions: {
        length: "",
        width: "",
        height: "",
        weight: "",
      },
      capacity: {
        volume: "",
        maxWeight: "",
      },
      durability: "",
      sustainability: [],
      barrierProperties: [],
      printingOptions: [],
      closureType: [],
      certifications: [],
      targetIndustries: [],
      storageConditions: "",
      shelfLife: "",
      customization: {
        colorOptions: [],
        logoPlacement: [],
        finishOptions: [],
      },
      compliance: [],
      recyclability: "",
      biodegradability: "",
      temperatureResistance: {
        minTemp: "",
        maxTemp: "",
      },
      moistureResistance: "",
      lightProtection: "",
      gasBarrier: "",
      costFactors: [],
      minimumOrderQuantity: "",
      leadTimeProduction: "",
      qualityStandards: [],
    }
  );

  const [images, setImages] = useState<string[]>(
    product?.image ? [product.image] : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Packaging Types
  const packagingTypes = [
    'Bottles', 'Cans', 'Boxes', 'Pouches', 'Bags', 'Containers',
    'Tubes', 'Jars', 'Wraps', 'Trays', 'Blister Packs', 'Sachets'
  ];

  // Materials
  const materials = [
    'Plastic', 'Glass', 'Metal', 'Paper', 'Cardboard', 'Aluminum',
    'Biodegradable Plastic', 'Composite', 'Foam', 'Textile', 'Wood', 'Bamboo'
  ];

  // Sustainability Features
  const sustainabilityFeatures = [
    'Recyclable', 'Biodegradable', 'Compostable', 'Reusable', 'Renewable Materials',
    'Reduced Plastic', 'Carbon Neutral', 'FSC Certified', 'Ocean Plastic', 'Bio-based'
  ];

  // Barrier Properties
  const barrierProperties = [
    'Oxygen Barrier', 'Moisture Barrier', 'Light Barrier', 'Aroma Barrier',
    'Grease Barrier', 'Chemical Barrier', 'UV Protection', 'Gas Barrier'
  ];

  // Printing Options
  const printingOptions = [
    'Digital Printing', 'Flexographic', 'Offset Printing', 'Screen Printing',
    'Gravure', 'Thermal Transfer', 'Laser Printing', 'Embossing', 'Debossing'
  ];

  // Closure Types
  const closureTypes = [
    'Screw Cap', 'Snap Lid', 'Press Fit', 'Zipper', 'Peel & Seal',
    'Twist Tie', 'Heat Seal', 'Adhesive', 'Cork', 'Crown Cap'
  ];

  // Target Industries
  const targetIndustries = [
    'Food & Beverage', 'Pharmaceuticals', 'Cosmetics', 'Electronics',
    'Automotive', 'Textiles', 'Chemicals', 'Agriculture', 'Retail', 'E-commerce'
  ];

  // Certifications
  const certifications = [
    'FDA Approved', 'EU Food Contact', 'ISO 9001', 'BRC', 'SQF',
    'Kosher', 'Halal', 'Organic', 'Fair Trade', 'Cradle to Cradle'
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

  const handlePackagingDataChange = (field: keyof PackagingProductData, value: any) => {
    setPackagingData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (field: string, value: string) => {
    setPackagingData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  const handleCapacityChange = (field: string, value: string) => {
    setPackagingData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [field]: value,
      },
    }));
  };

  const handleCustomizationChange = (field: string, value: string[]) => {
    setPackagingData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value,
      },
    }));
  };

  const handleTemperatureChange = (field: string, value: string) => {
    setPackagingData(prev => ({
      ...prev,
      temperatureResistance: {
        ...prev.temperatureResistance,
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (field: keyof PackagingProductData, item: string) => {
    setPackagingData(prev => {
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

  const toggleCustomizationItem = (field: string, item: string) => {
    setPackagingData(prev => {
      const currentArray = prev.customization[field as keyof typeof prev.customization] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        customization: {
          ...prev.customization,
          [field]: newArray,
        },
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

    if (packagingData.packagingType.length === 0) {
      newErrors.packagingType = "At least one packaging type is required";
    }

    if (packagingData.material.length === 0) {
      newErrors.material = "At least one material is required";
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
        packagingProductData: packagingData,
      } as Product;

      onSubmit(productData);

      toast({
        title: "Success!",
        description: `Packaging product ${product ? 'updated' : 'created'} successfully.`,
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {product ? 'Edit' : 'Create'} Packaging Product
              </h1>
              <p className="text-sm text-muted-foreground">
                Specialized form for packaging products
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
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
                    placeholder="e.g., Premium Food Container"
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
                  placeholder="Describe your packaging product..."
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">Min Order Quantity</Label>
                  <Input
                    id="minOrderQuantity"
                    name="minOrderQuantity"
                    type="number"
                    value={formData.minOrderQuantity || ""}
                    onChange={handleInputChange}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyCapacity">Daily Capacity</Label>
                  <Input
                    id="dailyCapacity"
                    name="dailyCapacity"
                    type="number"
                    value={formData.dailyCapacity || ""}
                    onChange={handleInputChange}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select
                    value={formData.unitType || "pieces"}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unitType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                      <SelectItem value="rolls">Rolls</SelectItem>
                      <SelectItem value="sheets">Sheets</SelectItem>
                      <SelectItem value="packs">Packs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packaging Specifications */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Packaging Specifications
              </CardTitle>
              <CardDescription>
                Detailed packaging characteristics and properties
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Packaging Types */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Packaging Types *
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {packagingTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`packaging-type-${type}`}
                        checked={packagingData.packagingType.includes(type)}
                        onCheckedChange={() => toggleArrayItem('packagingType', type)}
                      />
                      <Label
                        htmlFor={`packaging-type-${type}`}
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

              {/* Materials */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Factory className="h-4 w-4" />
                  Materials *
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {materials.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material}`}
                        checked={packagingData.material.includes(material)}
                        onCheckedChange={() => toggleArrayItem('material', material)}
                      />
                      <Label
                        htmlFor={`material-${material}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {material}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.material && (
                  <p className="text-sm text-red-500">{errors.material}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Capacity */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Dimensions & Capacity
              </CardTitle>
              <CardDescription>
                Physical specifications and capacity details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Dimensions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Dimensions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      value={packagingData.dimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      value={packagingData.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      value={packagingData.dimensions.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (g)</Label>
                    <Input
                      id="weight"
                      value={packagingData.dimensions.weight}
                      onChange={(e) => handleDimensionChange('weight', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Capacity</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (ml/L)</Label>
                    <Input
                      id="volume"
                      value={packagingData.capacity.volume}
                      onChange={(e) => handleCapacityChange('volume', e.target.value)}
                      placeholder="e.g., 500ml"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                    <Input
                      id="maxWeight"
                      value={packagingData.capacity.maxWeight}
                      onChange={(e) => handleCapacityChange('maxWeight', e.target.value)}
                      placeholder="e.g., 2kg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sustainability & Certifications */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Sustainability & Certifications
              </CardTitle>
              <CardDescription>
                Environmental features and quality certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Sustainability Features */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Recycle className="h-4 w-4" />
                  Sustainability Features
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sustainabilityFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sustainability-${feature}`}
                        checked={packagingData.sustainability.includes(feature)}
                        onCheckedChange={() => toggleArrayItem('sustainability', feature)}
                      />
                      <Label
                        htmlFor={`sustainability-${feature}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={packagingData.certifications.includes(cert)}
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
                Upload high-quality images of your packaging product
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