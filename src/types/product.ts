// Shared Product Type Definitions
// This file contains all product-related type definitions used across the application

// Food product specific data interface
export interface FoodProductData {
  flavorType: string[];
  ingredients: string[];
  usage: string[];
  packagingSize: string;
  shelfLife: string;
  manufacturerRegion: string;
  foodType: string;
  allergens?: string[];
}

// Natural product specific data interface
export interface NaturalProductData {
  naturalType: string[];
  certifications: string[];
  sustainabilityFeatures: string[];
  origin: string;
  extractionMethod: string;
  purityLevel: string;
  organicCertified: boolean;
  environmentalImpact: string;
}

// Healthy product specific data interface
export interface HealthyProductData {
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

// Beverage product specific data interface
export interface BeverageProductData {
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

// Packaging product specific data interface
export interface PackagingProductData {
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

// Other product specific data interface
export interface OtherProductData {
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

// Base Product interface - used across all components
export interface BaseProduct {
  _id?: string; // MongoDB ObjectId
  id?: number; // For backwards compatibility with existing UI code
  user?: string; // User ObjectId
  
  // Basic Product fields (matches backend FoodProduct model)
  name: string;
  brand?: string; // From manufacturer name
  manufacturerName?: string; // Deprecated, use manufacturer instead
  category: string;
  description: string;
  countInStock?: number; // From currentAvailable
  image: string;
  rating?: number;
  numReviews?: number;
  
  // Product type identification
  productType: string;
  
  // Extended fields for production (from FoodProduct.ts)
  manufacturer?: string; // Primary field for manufacturer name
  originCountry?: string; // Made optional
  manufacturerRegion?: string;
  
  minOrderQuantity: number;
  dailyCapacity: number;
  currentAvailable: number;
  unitType: string;
  
  // Price fields - pricePerUnit is the source of truth
  pricePerUnit: number;
  price?: number; // Deprecated, use pricePerUnit instead
  priceCurrency?: string;
  
  leadTime: string;
  leadTimeUnit: string;
  
  sustainable: boolean;
  sku?: string;
  
  // Food-specific fields (flattened from foodProductData)
  foodType?: string;
  flavorType?: string[];
  ingredients?: string[];
  allergens?: string[];
  usage?: string[];
  packagingType?: string;
  packagingSize?: string;
  shelfLife?: string;
  shelfLifeStartDate?: Date;
  shelfLifeEndDate?: Date;
  storageInstruction?: string;
  
  // Production specific fields
  reorderPoint?: number;
  lastProduced?: string;
  
  // Timestamps
  createdAt?: string; // Made optional
  updatedAt?: string;
  
  // Nested product type specific data for backwards compatibility
  foodProductData?: FoodProductData;
  naturalProductData?: NaturalProductData;
  healthyProductData?: HealthyProductData;
  beverageProductData?: BeverageProductData;
  packagingProductData?: PackagingProductData;
  otherProductData?: OtherProductData;
}

// Production-specific Product interface
export interface ProductionProduct extends BaseProduct {
  // Add at least one production-specific property
  productionStatus?: 'active' | 'inactive' | 'pending' | 'discontinued';
}

// Type for creating new products (excludes auto-generated fields)
export type CreateProductData = Omit<
  BaseProduct,
  "_id" | "id" | "createdAt" | "updatedAt" | "lastProduced" | "reorderPoint" | "sku"
>;

// Type for updating products
export type UpdateProductData = BaseProduct;

// Type for product form submission (includes all possible fields)
export interface ProductFormData extends BaseProduct {
  // Form-specific fields
  imageFile?: File;
  
  // Override some BaseProduct fields to make required in form
  manufacturer: string;
  pricePerUnit: number;
  originCountry: string;
}

// API Product data structure
export interface ProductApiData {
  name: string;
  description: string;
  category: string;
  pricePerUnit: number;
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
  manufacturer: string; // Primary field for manufacturer name
  manufacturerName?: string; // Deprecated, kept for backward compatibility
  manufacturerRegion?: string;
  foodType?: string;
  allergens?: string[];
}

// Production line interfaces
export interface ProductionLine {
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

export interface BatchInfo {
  id: number;
  status: string;
  target_quantity: number;
  produced_quantity: number;
}

// Utility types for component props
export type ProductFormSubmitHandler = (
  product: BaseProduct | CreateProductData
) => void;

export type ProductUpdateHandler = (product: BaseProduct) => Promise<void>;
export type ProductCreateHandler = (product: CreateProductData) => Promise<void>;
export type ProductDeleteHandler = (productId: string | number) => Promise<void>; 