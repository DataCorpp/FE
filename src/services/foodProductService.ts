import { api } from '../lib/api';

/**
 * Food Product Service
 * Dedicated service for handling food product operations
 */
export interface FoodProductFormData {
  name: string;
  category: string;
  manufacturer: string;
  brand?: string;
  originCountry: string;
  
  packagingType: string;
  packagingSize: string;
  shelfLife: string;
  storageInstruction: string;
  
  minOrderQuantity: number;
  dailyCapacity: number;
  currentAvailable: number;
  unitType: string;
  pricePerUnit: number;
  priceCurrency: string;
  
  description: string;
  image: string;
  images?: string[];
  
  foodType: string;
  flavorType?: string[];
  ingredients?: string[];
  allergens?: string[];
  usage?: string[];
  
  user?: string;
  rating?: number;
  numReviews?: number;
  sku?: string;
}

export interface FoodProductFilterOptions {
  search?: string;
  category?: string;
  productType?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  manufacturer?: string | string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const createFoodProduct = async (foodProductData: FoodProductFormData) => {
  return api.post('/foodproducts', foodProductData);
};

const foodProductService = {
  createFoodProduct,
  // Get all food products with optional filtering
  async getFoodProducts(filters: FoodProductFilterOptions = {}) {
    const {
      search,
      category,
      productType,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      manufacturer,
      sortBy = 'createdAt-desc',
      page = 1,
      limit = 10
    } = filters;

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (productType) {
      if (Array.isArray(productType)) {
        productType.forEach(type => queryParams.append('productType', type));
      } else {
        queryParams.append('productType', productType);
      }
    }
    if (minPrice) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice) queryParams.append('maxPrice', maxPrice.toString());
    if (minRating) queryParams.append('minRating', minRating.toString());
    if (inStockOnly) queryParams.append('inStockOnly', 'true');
    if (manufacturer) {
      if (Array.isArray(manufacturer)) {
        manufacturer.forEach(m => queryParams.append('manufacturer', m));
      } else {
        queryParams.append('manufacturer', manufacturer);
      }
    }
    if (sortBy) queryParams.append('sortBy', sortBy);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    
    return api.get(`/foodproducts${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get a specific food product by ID
  async getFoodProductById(id: string) {
    return api.get(`/foodproducts/${id}`);
  },
  
  // Update an existing food product
  async updateFoodProduct(id: string, foodProductData: Partial<FoodProductFormData>) {
    return api.put(`/foodproducts/${id}`, foodProductData);
  },
  
  // Delete a food product
  async deleteFoodProduct(id: string) {
    return api.delete(`/foodproducts/${id}`);
  },
  
  // Upload food product images
  async uploadImages(formData: FormData) {
    return api.post('/foodproducts/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update main product image
  async updateMainImage(productId: string, imageUrl: string) {
    return api.put('/foodproducts/image', {
      productId,
      image: imageUrl
    });
  },
  
  // Update product images (add/remove/reorder)
  async updateImages(productId: string, images: string[]) {
    return api.put('/foodproducts/images', {
      productId,
      images
    });
  },
  
  // Get metadata for dropdown menus and filters
  async getCategories() {
    return api.get('/foodproducts/categories');
  },
  
  async getProductTypes() {
    return api.get('/foodproducts/types');
  },
  
  async getManufacturers() {
    return api.get('/foodproducts/manufacturers');
  },
  
  async getFoodTypes() {
    return api.get('/foodproducts/foodtypes');
  }
};

export default foodProductService; 