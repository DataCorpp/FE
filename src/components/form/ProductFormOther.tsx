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
  Package2,
  Settings,
  Tag,
  Shield,
  Truck,
  Award,
  Leaf,
  AlertCircle,
  Factory,
  Zap,
  Target,
  CheckCircle,
  Layers,
  Wrench,
  Star,
} from 'lucide-react';

interface OtherProductData {
  productCategory: string[];
  specifications: {
    model: string;
    version: string;
    serialNumber: string;
    partNumber: string;
  };
  technicalSpecs: {
    dimensions: string;
    weight: string;
    material: string;
    color: string;
  };
  features: string[];
  applications: string[];
  compatibility: string[];
  certifications: string[];
  qualityStandards: string[];
  targetMarkets: string[];
  usageInstructions: string;
  maintenanceRequirements: string;
  warrantyInfo: {
    duration: string;
    coverage: string;
    terms: string;
  };
  safetyInformation: string[];
  storageConditions: string;
  shelfLife: string;
  customization: {
    availableOptions: string[];
    customColors: string[];
    customSizes: string[];
    brandingOptions: string[];
  };
  compliance: string[];
  environmentalImpact: string;
  sustainability: string[];
  packaging: {
    type: string;
    material: string;
    recyclable: boolean;
  };
  accessories: string[];
  relatedProducts: string[];
  priceFactors: string[];
  distributionChannels: string[];
  marketingFeatures: string[];
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
  otherProductData?: OtherProductData;
}

interface ProductFormOtherProps {
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

export const ProductFormOther: React.FC<ProductFormOtherProps> = ({
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
          minOrderQuantity: 100,
          dailyCapacity: 1000,
          unitType: "pieces",
          currentAvailable: 0,
          pricePerUnit: 0,
          productType: "Other Product",
          image: "",
          description: "",
          leadTime: "1-2",
          leadTimeUnit: "weeks",
          sustainable: false,
        }
  );

  const [otherData, setOtherData] = useState<OtherProductData>(
    product?.otherProductData || {
      productCategory: [],
      specifications: {
        model: "",
        version: "",
        serialNumber: "",
        partNumber: "",
      },
      technicalSpecs: {
        dimensions: "",
        weight: "",
        material: "",
        color: "",
      },
      features: [],
      applications: [],
      compatibility: [],
      certifications: [],
      qualityStandards: [],
      targetMarkets: [],
      usageInstructions: "",
      maintenanceRequirements: "",
      warrantyInfo: {
        duration: "",
        coverage: "",
        terms: "",
      },
      safetyInformation: [],
      storageConditions: "",
      shelfLife: "",
      customization: {
        availableOptions: [],
        customColors: [],
        customSizes: [],
        brandingOptions: [],
      },
      compliance: [],
      environmentalImpact: "",
      sustainability: [],
      packaging: {
        type: "",
        material: "",
        recyclable: false,
      },
      accessories: [],
      relatedProducts: [],
      priceFactors: [],
      distributionChannels: [],
      marketingFeatures: [],
    }
  );

  const [images, setImages] = useState<string[]>(
    product?.image ? [product.image] : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Product Categories
  const productCategories = [
    'Electronics', 'Tools & Equipment', 'Industrial Supplies', 'Office Supplies',
    'Automotive Parts', 'Hardware', 'Textiles', 'Crafts & Hobbies',
    'Sports Equipment', 'Home & Garden', 'Pet Supplies', 'Medical Equipment'
  ];

  // Features
  const commonFeatures = [
    'Durable', 'Lightweight', 'Portable', 'Energy Efficient', 'User Friendly',
    'Multi-functional', 'Weather Resistant', 'Ergonomic', 'High Performance',
    'Cost Effective', 'Easy Installation', 'Low Maintenance'
  ];

  // Applications
  const commonApplications = [
    'Industrial Use', 'Commercial Use', 'Residential Use', 'Educational',
    'Medical', 'Automotive', 'Construction', 'Agriculture', 'Marine',
    'Aerospace', 'Entertainment', 'Research'
  ];

  // Certifications
  const certifications = [
    'ISO 9001', 'ISO 14001', 'CE Marking', 'FCC', 'UL Listed', 'RoHS',
    'FDA Approved', 'Energy Star', 'OSHA Compliant', 'IP Rating',
    'EMC Compliance', 'Safety Standards'
  ];

  // Target Markets
  const targetMarkets = [
    'B2B', 'B2C', 'Government', 'Educational Institutions', 'Healthcare',
    'Manufacturing', 'Retail', 'Wholesale', 'Export', 'Domestic',
    'Small Business', 'Enterprise'
  ];

  // Sustainability Features
  const sustainabilityFeatures = [
    'Recyclable Materials', 'Energy Efficient', 'Low Carbon Footprint',
    'Biodegradable Components', 'Renewable Materials', 'Eco-friendly Packaging',
    'Reduced Waste', 'Long Lasting', 'Repairable', 'Refurbished Options'
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

  const handleOtherDataChange = (field: keyof OtherProductData, value: any) => {
    setOtherData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecificationChange = (field: string, value: string) => {
    setOtherData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const handleTechnicalSpecChange = (field: string, value: string) => {
    setOtherData(prev => ({
      ...prev,
      technicalSpecs: {
        ...prev.technicalSpecs,
        [field]: value,
      },
    }));
  };

  const handleWarrantyChange = (field: string, value: string) => {
    setOtherData(prev => ({
      ...prev,
      warrantyInfo: {
        ...prev.warrantyInfo,
        [field]: value,
      },
    }));
  };

  const handleCustomizationChange = (field: string, value: string[]) => {
    setOtherData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value,
      },
    }));
  };

  const handlePackagingChange = (field: string, value: any) => {
    setOtherData(prev => ({
      ...prev,
      packaging: {
        ...prev.packaging,
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (field: keyof OtherProductData, item: string) => {
    setOtherData(prev => {
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
    setOtherData(prev => {
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

    if (otherData.productCategory.length === 0) {
      newErrors.productCategory = "At least one product category is required";
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
        otherProductData: otherData,
      } as Product;

      onSubmit(productData);

      toast({
        title: "Success!",
        description: `Other product ${product ? 'updated' : 'created'} successfully.`,
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {product ? 'Edit' : 'Create'} Other Product
              </h1>
              <p className="text-sm text-muted-foreground">
                Specialized form for miscellaneous products
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
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
                    placeholder="e.g., Multi-Purpose Tool Kit"
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
                  placeholder="Describe your product..."
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
                    placeholder="100"
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
                    placeholder="1000"
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
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="kits">Kits</SelectItem>
                      <SelectItem value="packs">Packs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories & Features */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Categories & Features
              </CardTitle>
              <CardDescription>
                Product classification and key features
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Product Categories */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Product Categories *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {productCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={otherData.productCategory.includes(category)}
                        onCheckedChange={() => toggleArrayItem('productCategory', category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.productCategory && (
                  <p className="text-sm text-red-500">{errors.productCategory}</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Key Features
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={otherData.features.includes(feature)}
                        onCheckedChange={() => toggleArrayItem('features', feature)}
                      />
                      <Label
                        htmlFor={`feature-${feature}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Applications
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonApplications.map((application) => (
                    <div key={application} className="flex items-center space-x-2">
                      <Checkbox
                        id={`application-${application}`}
                        checked={otherData.applications.includes(application)}
                        onCheckedChange={() => toggleArrayItem('applications', application)}
                      />
                      <Label
                        htmlFor={`application-${application}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {application}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Technical Specifications
              </CardTitle>
              <CardDescription>
                Detailed technical and physical specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Product Specifications */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Product Specifications</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={otherData.specifications.model}
                      onChange={(e) => handleSpecificationChange('model', e.target.value)}
                      placeholder="e.g., XYZ-2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={otherData.specifications.version}
                      onChange={(e) => handleSpecificationChange('version', e.target.value)}
                      placeholder="e.g., v2.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={otherData.specifications.serialNumber}
                      onChange={(e) => handleSpecificationChange('serialNumber', e.target.value)}
                      placeholder="e.g., SN123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partNumber">Part Number</Label>
                    <Input
                      id="partNumber"
                      value={otherData.specifications.partNumber}
                      onChange={(e) => handleSpecificationChange('partNumber', e.target.value)}
                      placeholder="e.g., PN789012"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Technical Specifications</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={otherData.technicalSpecs.dimensions}
                      onChange={(e) => handleTechnicalSpecChange('dimensions', e.target.value)}
                      placeholder="e.g., 10x5x3 cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={otherData.technicalSpecs.weight}
                      onChange={(e) => handleTechnicalSpecChange('weight', e.target.value)}
                      placeholder="e.g., 500g"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={otherData.technicalSpecs.material}
                      onChange={(e) => handleTechnicalSpecChange('material', e.target.value)}
                      placeholder="e.g., Stainless Steel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={otherData.technicalSpecs.color}
                      onChange={(e) => handleTechnicalSpecChange('color', e.target.value)}
                      placeholder="e.g., Black"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications & Quality */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Quality
              </CardTitle>
              <CardDescription>
                Quality standards and certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Certifications */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Certifications
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={otherData.certifications.includes(cert)}
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

              {/* Target Markets */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Target Markets
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {targetMarkets.map((market) => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={`market-${market}`}
                        checked={otherData.targetMarkets.includes(market)}
                        onCheckedChange={() => toggleArrayItem('targetMarkets', market)}
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

              {/* Sustainability */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Sustainability Features
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sustainabilityFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sustainability-${feature}`}
                        checked={otherData.sustainability.includes(feature)}
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
                Upload high-quality images of your product
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