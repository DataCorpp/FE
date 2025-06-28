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
import { validateUserId } from './validationUtils';

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
    manufacturer: formData.manufacturer, // Map manufacturerName to manufacturer for backend
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
    
    // For Food Products, ensure these fields are mapped exactly as provided without defaults
    ...(formData.productType === 'Food Product' && {
      // Pass through all food-specific fields exactly as provided without any transformation
      foodType: formData.foodType,
      flavorType: formData.flavorType,
      ingredients: formData.ingredients,
      allergens: formData.allergens,
      usage: formData.usage,
      packagingType: formData.packagingType,
      packagingSize: formData.packagingSize,
      shelfLife: formData.shelfLife,
      shelfLifeStartDate: formData.shelfLifeStartDate,
      shelfLifeEndDate: formData.shelfLifeEndDate,
      storageInstruction: formData.storageInstruction,
    }),
  };

  // Remove form-specific fields that should not be in Product
  const { imageFile, ...productWithoutFormFields } = product as Partial<ProductFormData> & BaseProduct;

  return productWithoutFormFields;
}

/**
 * Specialized adapter for Food Products
 * Ensures all food-specific fields are correctly mapped and validated
 */
export function toFoodProduct(formData: ProductFormData): BaseProduct {
  // First convert using the generic adapter
  const baseProduct = formDataToProduct(formData);
  
  // Validate and enhance food-specific fields
  if (formData.productType !== 'Food Product') {
    console.warn('toFoodProduct called with non-food product type:', formData.productType);
  }
  
  // Check if this is an update to an existing product
  const isUpdate = Boolean(formData._id);
  
  if (isUpdate) {
    console.log(`Updating existing food product: ${formData._id}`);
  }
  
  // Ensure food-specific fields are correctly formatted
  const foodProduct: BaseProduct = {
    ...baseProduct,
    productType: 'Food Product', // Force correct product type
    
    // IMPORTANT: Keep user input exactly as provided without defaults
    // Do not modify these values at all - pass through exactly as provided
    foodType: formData.foodType,
    packagingType: formData.packagingType,
    packagingSize: formData.packagingSize,
    shelfLife: formData.shelfLife,
    storageInstruction: formData.storageInstruction,
    
    // CRITICAL FIX: Ensure arrays are properly formatted to avoid string conversion issues
    // ALWAYS use explicit array instances even if empty
    flavorType: Array.isArray(formData.flavorType) ? [...formData.flavorType] : 
               (formData.flavorType ? [formData.flavorType].flat() : []),
               
    ingredients: Array.isArray(formData.ingredients) ? [...formData.ingredients] : 
                (formData.ingredients ? [formData.ingredients].flat() : []),
                
    allergens: Array.isArray(formData.allergens) ? [...formData.allergens] : 
              (formData.allergens ? [formData.allergens].flat() : []),
              
    usage: Array.isArray(formData.usage) ? [...formData.usage] : 
          (formData.usage ? [formData.usage].flat() : []),
    
    // Ensure dates are properly formatted
    shelfLifeStartDate: formData.shelfLifeStartDate instanceof Date ? 
      formData.shelfLifeStartDate : 
      (formData.shelfLifeStartDate ? new Date(formData.shelfLifeStartDate as unknown as string) : undefined),
    shelfLifeEndDate: formData.shelfLifeEndDate instanceof Date ? 
      formData.shelfLifeEndDate : 
      (formData.shelfLifeEndDate ? new Date(formData.shelfLifeEndDate as unknown as string) : undefined),
    
    // Add nested foodProductData for backward compatibility
    foodProductData: {
      foodType: formData.foodType,
      flavorType: Array.isArray(formData.flavorType) ? [...formData.flavorType] : 
                 (formData.flavorType ? [formData.flavorType].flat() : []),
      ingredients: Array.isArray(formData.ingredients) ? [...formData.ingredients] : 
                  (formData.ingredients ? [formData.ingredients].flat() : []),
      allergens: Array.isArray(formData.allergens) ? [...formData.allergens] : 
                (formData.allergens ? [formData.allergens].flat() : []),
      usage: Array.isArray(formData.usage) ? [...formData.usage] : 
            (formData.usage ? [formData.usage].flat() : []),
      packagingSize: formData.packagingSize,
      shelfLife: formData.shelfLife,
      manufacturerRegion: formData.manufacturerRegion,
    }
  };
  
  // Preserve critical fields for updates
  if (isUpdate) {
    // Ensure ID fields are properly preserved
    foodProduct._id = formData._id;
    foodProduct.id = formData.id;
    
    // Preserve timestamps
    if (formData.createdAt) {
      foodProduct.createdAt = formData.createdAt;
    }
    foodProduct.updatedAt = new Date().toISOString();
    
    // Preserve metadata fields
    if (formData.user) {
      foodProduct.user = formData.user;
    }
    
    if (formData.sku) {
      foodProduct.sku = formData.sku;
    }
    
    // Preserve calculated/system fields
    if (formData.reorderPoint !== undefined) {
      foodProduct.reorderPoint = formData.reorderPoint;
    }
    
    if (formData.lastProduced) {
      foodProduct.lastProduced = formData.lastProduced;
    }
    
    // Preserve ratings and reviews
    if (formData.rating !== undefined) {
      foodProduct.rating = formData.rating;
    }
    
    if (formData.numReviews !== undefined) {
      foodProduct.numReviews = formData.numReviews;
    }
  }
  
  // Log the final data being sent to backend
  console.log(`${isUpdate ? 'Updated' : 'New'} food product data ready for backend:`, {
    _id: foodProduct._id,
    foodType: foodProduct.foodType,
    packagingType: foodProduct.packagingType,
    packagingSize: foodProduct.packagingSize,
    shelfLife: foodProduct.shelfLife,
    storageInstruction: foodProduct.storageInstruction,
    flavorType: foodProduct.flavorType,
    ingredients: foodProduct.ingredients,
    allergens: foodProduct.allergens,
    usage: foodProduct.usage
  });
  
  return foodProduct;
}

/**
 * Attach user ID to a product before submission
 * This can be used before calling the API to ensure the user field is set
 */
export function attachUserToProduct(product: BaseProduct, userId: string): BaseProduct {
  if (!userId) {
    console.warn('No user ID provided when attaching to product');
    return product;
  }
  
  // Validate MongoDB ObjectId format using our validation utility
  validateUserId(userId);
  
  return {
    ...product,
    user: userId
  };
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
  } = product as Partial<BaseProduct> & CreateProductData;

  return createProductData;
}

/**
 * Converts Product to ProductFormData
 * Used when loading existing product data into a form
 */
export function productToFormData(product: BaseProduct): ProductFormData {
  return {
    ...product,
    
    // Ensure required form fields are present
    manufacturer: product.manufacturer || product.manufacturerName || product.brand || '',
    manufacturerName: product.manufacturer || product.manufacturerName || product.brand || '',
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
  apiResponse: Record<string, unknown>, 
  existingProduct?: BaseProduct
): BaseProduct {
  const product: BaseProduct = existingProduct ? { ...existingProduct } : {} as BaseProduct;
  
  // Map API fields to product fields
  if (apiResponse) {
    // Basic fields
    if (apiResponse._id) product._id = apiResponse._id as string;
    if (apiResponse.name) product.name = apiResponse.name as string;
    if (apiResponse.brand) product.brand = apiResponse.brand as string;
    if (apiResponse.manufacturer) product.manufacturer = apiResponse.manufacturer as string;
    if (apiResponse.manufacturerName) product.manufacturer = apiResponse.manufacturerName as string; // Map to manufacturer
    if (apiResponse.category) product.category = apiResponse.category as string;
    if (apiResponse.description) product.description = apiResponse.description as string;
    if (apiResponse.image) product.image = apiResponse.image as string;
    if (apiResponse.productType) product.productType = apiResponse.productType as string;
    
    // Price fields - ensure both price and pricePerUnit are set
    if (apiResponse.pricePerUnit) {
      product.pricePerUnit = Number(apiResponse.pricePerUnit);
      product.price = Number(apiResponse.pricePerUnit);
    } else if (apiResponse.price) {
      product.price = Number(apiResponse.price);
      product.pricePerUnit = Number(apiResponse.price);
    }
    
    // Other fields
    if (apiResponse.minOrderQuantity) product.minOrderQuantity = Number(apiResponse.minOrderQuantity);
    if (apiResponse.dailyCapacity) product.dailyCapacity = Number(apiResponse.dailyCapacity);
    if (apiResponse.currentAvailable) product.currentAvailable = Number(apiResponse.currentAvailable);
    if (apiResponse.unitType) product.unitType = apiResponse.unitType as string;
    if (apiResponse.leadTime) product.leadTime = apiResponse.leadTime as string;
    if (apiResponse.leadTimeUnit) product.leadTimeUnit = apiResponse.leadTimeUnit as string;
    if (apiResponse.sustainable !== undefined) product.sustainable = Boolean(apiResponse.sustainable);
    if (apiResponse.originCountry) product.originCountry = apiResponse.originCountry as string;
    if (apiResponse.manufacturerRegion) product.manufacturerRegion = apiResponse.manufacturerRegion as string;
    
    // Timestamps
    if (apiResponse.createdAt) product.createdAt = apiResponse.createdAt as string;
    if (apiResponse.updatedAt) product.updatedAt = apiResponse.updatedAt as string;
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
  if (formData.productType === 'Food Product') {
    return toFoodProduct(formData);
  }
  return formDataToProduct(formData);
} 