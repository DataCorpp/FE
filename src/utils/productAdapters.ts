/**
 * Product Data Adapters
 * 
 * This file contains utility functions to convert between different product data types:
 * - ProductFormData: Used by forms for input
 * - Product (BaseProduct): Main product type used across the application
 * - CreateProductData: Used when creating new products (omits auto-generated fields)
 */

import { 
  BaseProduct, 
  ProductFormData, 
  CreateProductData,
  FoodProductData,
  BeverageProductData,
  HealthyProductData,
  NaturalProductData,
  PackagingProductData,
  OtherProductData
} from '@/types/product';

/**
 * Converts ProductFormData to Product (BaseProduct)
 * Used when submitting form data to update an existing product
 */
export function formDataToProduct(formData: ProductFormData): BaseProduct {
  // Copy basic fields
  const product: BaseProduct = {
    ...formData,
    
    // Ensure proper mapping of required fields
    name: formData.name,
    brand: formData.manufacturerName || formData.brand,
    manufacturerName: formData.manufacturerName,
    category: formData.category,
    description: formData.description,
    image: formData.image,
    productType: formData.productType,
    
    // Map price fields
    pricePerUnit: formData.pricePerUnit,
    price: formData.pricePerUnit, // Keep both for backward compatibility
    
    // Map other required fields
    minOrderQuantity: formData.minOrderQuantity,
    dailyCapacity: formData.dailyCapacity,
    currentAvailable: formData.currentAvailable,
    unitType: formData.unitType,
    leadTime: formData.leadTime,
    leadTimeUnit: formData.leadTimeUnit,
    sustainable: formData.sustainable,
    
    // Optional fields
    originCountry: formData.originCountry,
    manufacturerRegion: formData.manufacturerRegion,
  };

  // Remove form-specific fields that should not be in Product
  const { imageFile, ...productWithoutFormFields } = product as any;

  return productWithoutFormFields;
}

/**
 * Converts ProductFormData to CreateProductData
 * Used when submitting form data to create a new product
 */
export function formDataToCreateProductData(formData: ProductFormData): CreateProductData {
  // First convert to Product
  const product = formDataToProduct(formData);
  
  // Then remove fields that should not be in CreateProductData
  const { 
    _id, id, createdAt, updatedAt, lastProduced, reorderPoint, sku, 
    ...createProductData 
  } = product as any;

  return createProductData as CreateProductData;
}

/**
 * Converts Product to ProductFormData
 * Used when loading existing product data into a form
 */
export function productToFormData(product: BaseProduct): ProductFormData {
  return {
    ...product,
    
    // Ensure required form fields are present
    manufacturerName: product.manufacturerName || product.brand || product.manufacturer || '',
    pricePerUnit: product.pricePerUnit || product.price || 0,
    originCountry: product.originCountry || '',
    
    // Default values for other required fields
    name: product.name,
    category: product.category,
    description: product.description,
    productType: product.productType,
    minOrderQuantity: product.minOrderQuantity,
    dailyCapacity: product.dailyCapacity,
    currentAvailable: product.currentAvailable,
    unitType: product.unitType,
    leadTime: product.leadTime,
    leadTimeUnit: product.leadTimeUnit,
    sustainable: product.sustainable,
    image: product.image,
  };
}

/**
 * Maps nested product type specific data from one product to another
 * Preserves nested data objects during conversion
 */
export function mapProductTypeSpecificData(
  source: BaseProduct | ProductFormData,
  target: BaseProduct | ProductFormData
): BaseProduct | ProductFormData {
  const result = { ...target };
  
  // Map each product type specific data if present
  if (source.foodProductData) {
    result.foodProductData = { ...source.foodProductData };
  }
  
  if (source.beverageProductData) {
    result.beverageProductData = { ...source.beverageProductData };
  }
  
  if (source.healthyProductData) {
    result.healthyProductData = { ...source.healthyProductData };
  }
  
  if (source.naturalProductData) {
    result.naturalProductData = { ...source.naturalProductData };
  }
  
  if (source.packagingProductData) {
    result.packagingProductData = { ...source.packagingProductData };
  }
  
  if (source.otherProductData) {
    result.otherProductData = { ...source.otherProductData };
  }
  
  return result;
}

/**
 * Sync product data from API response to product object
 * Used when receiving API response data and need to update local product object
 */
export function syncProductFromApiResponse(
  apiResponse: any, 
  existingProduct?: BaseProduct
): BaseProduct {
  const product: BaseProduct = existingProduct ? { ...existingProduct } : {} as BaseProduct;
  
  // Map API fields to product fields
  if (apiResponse) {
    // Basic fields
    if (apiResponse._id) product._id = apiResponse._id;
    if (apiResponse.name) product.name = apiResponse.name;
    if (apiResponse.brand) product.brand = apiResponse.brand;
    if (apiResponse.manufacturerName) product.manufacturerName = apiResponse.manufacturerName;
    if (apiResponse.category) product.category = apiResponse.category;
    if (apiResponse.description) product.description = apiResponse.description;
    if (apiResponse.image) product.image = apiResponse.image;
    if (apiResponse.productType) product.productType = apiResponse.productType;
    
    // Price fields - ensure both price and pricePerUnit are set
    if (apiResponse.pricePerUnit) {
      product.pricePerUnit = apiResponse.pricePerUnit;
      product.price = apiResponse.pricePerUnit;
    } else if (apiResponse.price) {
      product.price = apiResponse.price;
      product.pricePerUnit = apiResponse.price;
    }
    
    // Other fields
    if (apiResponse.minOrderQuantity) product.minOrderQuantity = apiResponse.minOrderQuantity;
    if (apiResponse.dailyCapacity) product.dailyCapacity = apiResponse.dailyCapacity;
    if (apiResponse.currentAvailable) product.currentAvailable = apiResponse.currentAvailable;
    if (apiResponse.unitType) product.unitType = apiResponse.unitType;
    if (apiResponse.leadTime) product.leadTime = apiResponse.leadTime;
    if (apiResponse.leadTimeUnit) product.leadTimeUnit = apiResponse.leadTimeUnit;
    if (apiResponse.sustainable !== undefined) product.sustainable = apiResponse.sustainable;
    if (apiResponse.originCountry) product.originCountry = apiResponse.originCountry;
    if (apiResponse.manufacturerRegion) product.manufacturerRegion = apiResponse.manufacturerRegion;
    
    // Timestamps
    if (apiResponse.createdAt) product.createdAt = apiResponse.createdAt;
    if (apiResponse.updatedAt) product.updatedAt = apiResponse.updatedAt;
  }
  
  return product;
} 

/**
 * Converts BaseProduct to ProductFormData (Alias for productToFormData)
 * Standardized name for conversion from model to form
 */
export function toFormData(product: BaseProduct): ProductFormData {
  return productToFormData(product);
}

/**
 * Converts ProductFormData to BaseProduct (Alias for formDataToProduct)
 * Standardized name for conversion from form to model
 */
export function toBaseProduct(formData: ProductFormData): BaseProduct {
  return formDataToProduct(formData);
} 