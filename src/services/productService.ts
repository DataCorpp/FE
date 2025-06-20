// Product Service - API calls for product management
// This file contains all product-related API calls and interfaces that match backend models

// Define specific product data interfaces for different product types
export interface FoodProductData {
  foodType: string;
  flavorType: string[];
  ingredients: string[];
  allergens: string[];
  usage: string[];
  packagingType: string;
  packagingSize: string;
  shelfLife: string;
  shelfLifeStartDate?: string;
  shelfLifeEndDate?: string;
  storageInstruction: string;
  manufacturerRegion?: string;
}

export interface NaturalProductData {
  organicCertification?: boolean;
  certificationBody?: string;
  activeIngredients?: string[];
  extractionMethod?: string;
  purity?: number;
}

export interface HealthyProductData {
  nutritionalInfo?: Record<string, string | number>;
  healthBenefits?: string[];
  targetAudience?: string[];
  dietaryRestrictions?: string[];
}

export interface BeverageProductData {
  alcoholContent?: number;
  carbonation?: boolean;
  servingTemperature?: string;
  flavorProfile?: string[];
}

export interface PackagingProductData {
  material?: string;
  recyclable?: boolean;
  dimensions?: string;
  weight?: number;
}

export interface OtherProductData {
  customFields?: Record<string, string | number | boolean>;
  specifications?: string[];
  applications?: string[];
}

// Interface for creating/updating products (matches form structure)
export interface ProductFormData {
  // Base Product fields
  name: string;
  description: string;
  category: string;
  manufacturerName: string; // Will be mapped to 'manufacturer' and 'brand' in backend
  originCountry: string;
  pricePerUnit: number; // Will be mapped to 'price' and 'pricePerUnit' in backend
  priceCurrency: string;
  minOrderQuantity: number;
  dailyCapacity: number;
  unitType: string;
  currentAvailable: number; // Will be mapped to 'countInStock' and 'currentAvailable' in backend
  leadTime: string;
  leadTimeUnit: string;
  sustainable: boolean;
  productType: string;
  image: string;
  sku?: string;
  
  // Food-specific data (will be flattened in backend)
  foodProductData?: FoodProductData;
  naturalProductData?: NaturalProductData;
  healthyProductData?: HealthyProductData;
  beverageProductData?: BeverageProductData;
  packagingProductData?: PackagingProductData;
  otherProductData?: OtherProductData;
}

// Interface for API responses (matches backend model structure)
export interface Product {
  _id: string; // MongoDB ObjectId
  user: string; // User ObjectId
  
  // Base Product fields (from Product.ts)
  name: string;
  brand: string; // From manufacturerName
  category: string;
  description: string;
  price: number; // From pricePerUnit
  countInStock: number; // From currentAvailable
  image: string;
  rating: number;
  numReviews: number;
  productType: 'food' | 'beverage' | 'health' | 'other';
  
  // Extended fields for Food Products (from FoodProduct.ts)
  manufacturer?: string; // Same as manufacturerName
  originCountry?: string;
  manufacturerRegion?: string;
  
  minOrderQuantity?: number;
  dailyCapacity?: number;
  currentAvailable?: number;
  unitType?: string;
  
  pricePerUnit?: number;
  priceCurrency?: string;
  
  leadTime?: string;
  leadTimeUnit?: string;
  
  sustainable?: boolean;
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
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ProductService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth header
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all products for the authenticated manufacturer
  async getProducts(productType?: string): Promise<ApiResponse<Product[]>> {
    try {
      const queryParam = productType ? `?productType=${productType}` : '';
      const response = await fetch(`${this.baseUrl}/products${queryParam}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data: Array.isArray(data) ? data : [],
        message: 'Products fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { 
        success: false, 
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
    }
  }

  // Get products by type
  async getProductsByType(productType: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/products/type/${productType}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data: Array.isArray(data) ? data : [],
        message: 'Products fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching products by type:', error);
      return { 
        success: false, 
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
    }
  }

  // Create a new product
  async createProduct(productData: ProductFormData): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data,
        message: 'Product created successfully'
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return { 
        success: false, 
        data: {} as Product,
        error: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }

  // Update an existing product
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data,
        message: 'Product updated successfully'
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return { 
        success: false, 
        data: {} as Product,
        error: error instanceof Error ? error.message : 'Failed to update product'
      };
    }
  }

  // Delete a product
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return { 
        success: true, 
        data: undefined,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { 
        success: false, 
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data,
        message: 'Product fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { 
        success: false, 
        data: {} as Product,
        error: error instanceof Error ? error.message : 'Failed to fetch product'
      };
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService; 