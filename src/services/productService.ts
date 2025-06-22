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
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api') + '/products';

  // Helper function to get headers for session-based authentication
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Helper method to handle API errors, especially 401 authentication failures
  private handleApiError(error: { status?: number; response?: { status?: number; data?: { message?: string } } }, operation: string): never {
    console.error(`${operation} error:`, error);
    
    if (error.response?.status === 401 || error.status === 401) {
      console.error('Authentication failed - redirecting to login');
      // Redirect to login page for any authentication failure
      window.location.href = '/auth';
      throw new Error('Your session has expired. Please login again.');
    }
    
    if (error.response?.status === 403 || error.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status >= 500 || error.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || `${operation} failed`);
  }

  // Get all products for the authenticated manufacturer
  async getProducts(productType?: string): Promise<ApiResponse<Product[]>> {
    try {
      const queryParam = productType ? `?productType=${productType}` : '';
      const response = await fetch(`${this.baseUrl}${queryParam}`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for session-based auth
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Get products');
        }
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
      const response = await fetch(`${this.baseUrl}/type/${productType}`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for session-based auth
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Get products by type');
        }
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
      // === DEBUG: Kiểm tra dữ liệu đầu vào ===
      console.log('=== PRODUCT SERVICE CREATE DEBUG ===');
      console.log('Raw productData received:', productData);
      console.log('Product Name (raw):', `"${productData.name}"`);
      console.log('Manufacturer Name (raw):', `"${productData.manufacturerName}"`);
      console.log('Category:', `"${productData.category}"`);
      console.log('Description length:', productData.description?.length || 0);

      // === DATA SANITIZATION: Trim và validate dữ liệu ===
      const sanitizedData: ProductFormData = {
        ...productData,
        // Trim string fields to remove whitespace
        name: productData.name?.toString().trim() || '',
        manufacturerName: productData.manufacturerName?.toString().trim() || '',
        category: productData.category?.toString().trim() || '',
        description: productData.description?.toString().trim() || '',
        originCountry: productData.originCountry?.toString().trim() || '',
        priceCurrency: productData.priceCurrency?.toString().trim() || '',
        unitType: productData.unitType?.toString().trim() || '',
        leadTime: productData.leadTime?.toString().trim() || '',
        leadTimeUnit: productData.leadTimeUnit?.toString().trim() || '',
        productType: productData.productType?.toString().trim() || '',
        image: productData.image?.toString().trim() || '',
        sku: productData.sku?.toString().trim() || undefined,
      };

      // === VALIDATION: Kiểm tra các field bắt buộc ===
      const validationErrors: string[] = [];
      
      if (!sanitizedData.name) {
        validationErrors.push('Product name is required and cannot be empty');
      }
      
      if (!sanitizedData.manufacturerName) {
        validationErrors.push('Manufacturer name is required and cannot be empty');
      }
      
      if (!sanitizedData.category) {
        validationErrors.push('Category is required and cannot be empty');
      }
      
      if (!sanitizedData.description) {
        validationErrors.push('Description is required and cannot be empty');
      }
      
      if (sanitizedData.pricePerUnit <= 0) {
        validationErrors.push('Price per unit must be greater than 0');
      }

      if (validationErrors.length > 0) {
        console.error('=== VALIDATION ERRORS ===');
        validationErrors.forEach(error => console.error(`- ${error}`));
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // === DEBUG: Kiểm tra dữ liệu sau khi sanitize ===
      console.log('=== AFTER SANITIZATION ===');
      console.log('Product Name (sanitized):', `"${sanitizedData.name}"`);
      console.log('Manufacturer Name (sanitized):', `"${sanitizedData.manufacturerName}"`);
      console.log('Category (sanitized):', `"${sanitizedData.category}"`);
      console.log('Price per unit:', sanitizedData.pricePerUnit);
      console.log('Current available:', sanitizedData.currentAvailable);
      
      // === API CALL ===
      console.log('Sending payload to API...');
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sanitizedData),
        credentials: 'include', // Include cookies for session-based auth
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Create product');
        }
        const errorData = await response.json();
        console.error('API Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Product created successfully:', data);
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
      // === DEBUG: Kiểm tra dữ liệu đầu vào ===
      console.log('=== PRODUCT SERVICE UPDATE DEBUG ===');
      console.log(`Updating product ${id}:`, productData);
      console.log('Product Name (raw):', `"${productData.name || 'not provided'}"`);
      console.log('Manufacturer Name (raw):', `"${productData.manufacturerName || 'not provided'}"`);

      // === DATA SANITIZATION: Trim string fields ===
      const sanitizedData: Partial<ProductFormData> = { ...productData };
      
      // Only sanitize fields that are provided
      if (productData.name !== undefined) {
        sanitizedData.name = productData.name?.toString().trim() || '';
      }
      if (productData.manufacturerName !== undefined) {
        sanitizedData.manufacturerName = productData.manufacturerName?.toString().trim() || '';
      }
      if (productData.category !== undefined) {
        sanitizedData.category = productData.category?.toString().trim() || '';
      }
      if (productData.description !== undefined) {
        sanitizedData.description = productData.description?.toString().trim() || '';
      }
      if (productData.originCountry !== undefined) {
        sanitizedData.originCountry = productData.originCountry?.toString().trim() || '';
      }
      if (productData.priceCurrency !== undefined) {
        sanitizedData.priceCurrency = productData.priceCurrency?.toString().trim() || '';
      }
      if (productData.unitType !== undefined) {
        sanitizedData.unitType = productData.unitType?.toString().trim() || '';
      }
      if (productData.leadTime !== undefined) {
        sanitizedData.leadTime = productData.leadTime?.toString().trim() || '';
      }
      if (productData.leadTimeUnit !== undefined) {
        sanitizedData.leadTimeUnit = productData.leadTimeUnit?.toString().trim() || '';
      }
      if (productData.productType !== undefined) {
        sanitizedData.productType = productData.productType?.toString().trim() || '';
      }
      if (productData.image !== undefined) {
        sanitizedData.image = productData.image?.toString().trim() || '';
      }
      if (productData.sku !== undefined) {
        sanitizedData.sku = productData.sku?.toString().trim() || undefined;
      }

      // === VALIDATION: Kiểm tra các field nếu được cung cấp ===
      const validationErrors: string[] = [];
      
      if (sanitizedData.name !== undefined && !sanitizedData.name) {
        validationErrors.push('Product name cannot be empty if provided');
      }
      
      if (sanitizedData.manufacturerName !== undefined && !sanitizedData.manufacturerName) {
        validationErrors.push('Manufacturer name cannot be empty if provided');
      }
      
      if (sanitizedData.pricePerUnit !== undefined && sanitizedData.pricePerUnit <= 0) {
        validationErrors.push('Price per unit must be greater than 0 if provided');
      }

      if (validationErrors.length > 0) {
        console.error('=== UPDATE VALIDATION ERRORS ===');
        validationErrors.forEach(error => console.error(`- ${error}`));
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // === DEBUG: Kiểm tra dữ liệu sau khi sanitize ===
      console.log('=== AFTER SANITIZATION ===');
      console.log('Product Name (sanitized):', `"${sanitizedData.name || 'not provided'}"`);
      console.log('Manufacturer Name (sanitized):', `"${sanitizedData.manufacturerName || 'not provided'}"`);

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sanitizedData),
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Update product');
        }
        
        let errorMessage;
        let errorData;
        
        try {
          errorData = await response.json();
          console.error('Update API Error response:', errorData);
          errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
        }
        
        return {
          success: false,
          data: {} as Product,
          error: errorMessage
        };
      }

      const result = await response.json();
      console.log('Product updated successfully:', result);
      return { 
        success: true, 
        data: result.data || result,
        message: result.message || 'Product updated successfully'
      };
    } catch (error) {
      console.error('Update product error:', error);
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
      console.log('=== DELETE PRODUCT ===');
      console.log('Product ID:', id);
      console.log('Full URL:', `${this.baseUrl}/${id}`);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for session-based auth
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Delete product');
        }
        
        let errorMessage;
        let errorData;
        
        try {
          errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
        }
        
        return {
          success: false,
          data: undefined,
          error: errorMessage
        };
      }
      
      console.log('Delete successful!');
      return { 
        success: true, 
        data: undefined,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.log('=== DELETE ERROR ===');
      console.error('Delete error details:', error);
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
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for session-based auth
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleApiError({ status: response.status }, 'Get product');
        }
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