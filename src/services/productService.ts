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

  // Utility method to check authentication state consistency
  private checkAuthState(): { isValid: boolean; reason?: string } {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (!token && !user) {
      return { isValid: false, reason: 'no_auth_data' };
    }
    
    if (user && !token) {
      return { isValid: false, reason: 'missing_token' };
    }
    
    if (token && !user) {
      return { isValid: false, reason: 'missing_user' };
    }
    
    try {
      JSON.parse(user!);
      return { isValid: true };
    } catch {
      return { isValid: false, reason: 'corrupted_user_data' };
    }
  }

  // Helper method to clean inconsistent auth state
  private cleanAuthState(reason: string): void {
    console.warn(`🧹 Cleaning authentication state. Reason: ${reason}`);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Helper function to get auth header
  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    console.log('=== GETTING AUTH HEADERS ===');

    // Try JWT token first (from localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('JWT token found in localStorage');
      try {
        // Basic JWT token validation (check if it's not expired)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp > currentTime) {
          headers.Authorization = `Bearer ${token}`;
          console.log('Valid JWT token added to headers');
          return headers;
        } else {
          console.log('JWT token expired, removing from localStorage');
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.log('Invalid JWT token format, removing from localStorage');
        localStorage.removeItem('auth_token');
      }
    }

    // Check if we have user info in localStorage (indicates session-based login)
    const user = localStorage.getItem('user');
    if (user) {
      console.log('User found in localStorage (session-based auth)');
      try {
        JSON.parse(user); // Validate user data format
        console.log('Session-based authentication will be used (cookies)');
        // For session-based auth, we don't need Authorization header
        // Cookies will be sent automatically with credentials: 'include'
        return headers;
      } catch (error) {
        console.log('Invalid user data format, cleaning up');
        localStorage.removeItem('user');
      }
    }

    console.log('No authentication method available - will attempt request with session cookies');
    // Don't force logout here - let the backend decide if the session is valid
    return headers;
  }

  // Helper method to check if user has any form of authentication
  private hasAnyAuthentication(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    // Check for valid JWT token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp > currentTime) {
          return true;
        }
      } catch (error) {
        // Invalid JWT token
        localStorage.removeItem('auth_token');
      }
    }
    
    // Check for session-based auth
    if (user) {
      try {
        JSON.parse(user); // Validate user data
        return true;
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleApiError(error: any, operation: string): never {
    console.error(`${operation} error:`, error);
    
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      const authType = error.response?.data?.authType;
      
      console.error('Authentication error details:', {
        message: errorMessage,
        authType: authType,
        operation: operation
      });
      
      // Check if this is a dual authentication failure (both JWT and session failed)
      if (authType === 'both_failed' || errorMessage.includes('session expired')) {
        // Clear both localStorage and redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/auth';
        
        throw new Error('Your session has expired. Please login again.');
      }
      
      // For regular auth failures, provide helpful guidance without immediately logging out
      throw new Error(`Authentication failed: ${errorMessage}. Please try refreshing the page or login again if the issue persists.`);
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || error.message || `${operation} failed`);
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
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData),
        credentials: 'include', // Include cookies for session-based auth
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
      console.log(`Updating product ${id}:`, productData);
      
      const headers = this.getAuthHeaders();
      
      // Check if we have any form of authentication
      if (!this.hasAnyAuthentication()) {
        console.log('No authentication available for update request');
        return {
          success: false,
          data: {} as Product,
          error: 'Authentication required. Please login again.'
        };
      }

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        let errorMessage;
        let errorData;
        
        try {
          errorData = await response.json();
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
      console.log('=== DELETE PRODUCT DEBUG ===');
      console.log('Product ID:', id);
      console.log('Base URL:', this.baseUrl);
      console.log('Full URL:', `${this.baseUrl}/${id}`);
      
      const headers = this.getAuthHeaders();
      console.log('Request headers:', headers);
      
      // Check if we have any form of authentication
      const hasAuth = this.hasAnyAuthentication();
      const hasJwtToken = !!headers.Authorization;
      
      console.log('Authentication status:', {
        hasAuth,
        hasJwtToken,
        authMethod: hasJwtToken ? 'JWT Token' : 'Session-based (cookies)'
      });
      
      // If no authentication at all, return error
      if (!hasAuth) {
        console.log('No authentication available for delete request');
        return {
          success: false,
          data: undefined,
          error: 'Authentication required. Please login again.'
        };
      }
      
      console.log('Making DELETE request with authentication...');
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include', // Include cookies for session-based auth
      });
      
      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
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