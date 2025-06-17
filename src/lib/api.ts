import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Use hardcoded URLs if environment variables are not available
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:5000/api';

// Add console logs to help debug API connection issues
// console.log('API Base URL:', API_BASE_URL);
// console.log('AI API Base URL:', AI_API_BASE_URL);

// Type definitions
export interface ApiResponse<T = Record<string, unknown>> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  token?: string;
  verificationCode?: string;
  // Add properties for food product responses
  products?: T[];
  page?: number;
  pages?: number;
  total?: number;
  // Add properties for manufacturer responses
  manufacturers?: T[];
}

export interface ProductData {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  brand?: string;
  category?: string;
  ingredients?: string[];
  nutritionFacts?: Record<string, unknown>;
  image?: string;
  [key: string]: unknown; // For additional fields
}

export interface ManufacturerData {
  id?: string;
  name: string;
  location: string;
  establish?: number;
  industry?: string;
  certification?: string;
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  image?: string;
  [key: string]: unknown; // For additional fields
}

export interface CrawlerTaskConfig {
  depth: number;
  maxPages: number;
  selectors?: {
    productContainer?: string;
    name?: string;
    price?: string;
    description?: string;
    image?: string;
    ingredients?: string;
    nutritionFacts?: string;
    brand?: string;
  };
}

export interface CrawlerTaskData {
  url: string;
  config: CrawlerTaskConfig;
  userId: string;
  autoSave?: boolean;
  aiProvider?: 'default' | 'openai' | 'gemini' | 'claude';
}

// Tạo một instance axios với cấu hình chung
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Thêm interceptor để xử lý token
  instance.interceptors.request.use(
    (config) => {
      // Lấy token từ localStorage nếu có
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

// Khởi tạo các instance API
const api = createApiInstance(API_BASE_URL);
const aiApi = createApiInstance(AI_API_BASE_URL);

// Tạo instance API riêng cho admin với interceptor riêng
const adminApiInstance = createApiInstance(API_BASE_URL);
adminApiInstance.interceptors.request.use(
  (config) => {
    // Lấy thông tin admin từ localStorage
    const adminUserData = localStorage.getItem('adminUser');
    const adminAuth = localStorage.getItem('adminAuth');
    
    if (adminUserData && adminAuth === 'true') {
      try {
        const adminUser = JSON.parse(adminUserData);
        
        // Sử dụng token admin được lưu trong adminUser nếu có
        const token = adminUser.token || 'admin-token';
        
        // Thêm các headers xác thực admin cần thiết
        config.headers.AdminAuthorization = `Bearer ${token}`;
        config.headers['X-Admin-Role'] = adminUser.role;
        config.headers['X-Admin-Email'] = adminUser.email;
        
        // console.log('Sending admin API request with headers:', {
        //   AdminAuthorization: `Bearer ${token.substring(0, 10)}...`, // Chỉ hiển thị một phần token để bảo mật
        //   'X-Admin-Role': config.headers['X-Admin-Role'],
        //   'X-Admin-Email': config.headers['X-Admin-Email']
        // });
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    } else {
      console.warn('Admin API request without admin authentication!');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API cho tính năng Web Crawler
export const crawlerApi = {
  // Tạo nhiệm vụ crawl mới
  createTask: (data: CrawlerTaskData) => {
    return aiApi.post<ApiResponse>('/crawler/tasks', data);
  },

  // Lấy danh sách nhiệm vụ crawl
  getTasks: (page = 1, limit = 10, status?: string) => {
    return aiApi.get<ApiResponse>('/crawler/tasks', {
      params: { page, limit, status },
    });
  },

  // Lấy chi tiết nhiệm vụ crawl
  getTask: (taskId: string) => {
    return aiApi.get<ApiResponse>(`/crawler/tasks/${taskId}`);
  },

  // Lấy kết quả crawl
  getResults: (taskId: string) => {
    return aiApi.get<ApiResponse>(`/crawler/results/${taskId}`);
  },

  // Xử lý kết quả crawl với AI
  processResult: (resultId: string) => {
    return aiApi.post<ApiResponse>(`/crawler/process/${resultId}`);
  },

  // Thêm sản phẩm từ kết quả crawl vào catalog
  integrateProduct: (resultId: string, userId: string = 'admin', additionalParams: Record<string, unknown> = {}) => {
    const params = {
      userId,
      minimumOrderQuantity: 10,
      dailyCapacity: 100,
      unitType: 'units',
      currentAvailableStock: 50,
      leadTime: '3',
      leadTimeUnit: 'days',
      ...additionalParams
    };
    
    // Ensure numeric fields are properly formatted
    if (params.minimumOrderQuantity) {
      params.minimumOrderQuantity = Number(params.minimumOrderQuantity);
    }
    if (params.dailyCapacity) {
      params.dailyCapacity = Number(params.dailyCapacity);
    }
    if (params.currentAvailableStock) {
      params.currentAvailableStock = Number(params.currentAvailableStock);
    }
    
    return aiApi.post<ApiResponse>(`/crawler/integrate/${resultId}`, params);
  },

  // Xóa nhiệm vụ crawl
  deleteTask: (taskId: string) => {
    return aiApi.delete<ApiResponse>(`/crawler/tasks/${taskId}`);
  },

  // Get queue status
  getQueueStatus: () => {
    return aiApi.get<ApiResponse>(`/crawler/queue`);
  },

  // Clear queue
  clearQueue: () => {
    return aiApi.delete<ApiResponse>(`/crawler/queue`);
  },

  batchDeleteByStatus: (status: string) => {
    return aiApi.delete<ApiResponse>(`/crawler/tasks/status/${status}`);
  },
};

// API cho quản lý sản phẩm
export const productApi = {
  // Lấy danh sách sản phẩm
  getProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<ApiResponse>('/products', { params });
  },

  // Lấy chi tiết sản phẩm
  getProduct: (productId: string) => {
    return api.get<ApiResponse>(`/products/${productId}`);
  },

  // Tạo sản phẩm mới
  createProduct: (data: ProductData) => {
    return api.post<ApiResponse>('/products', data);
  },

  // Cập nhật sản phẩm
  updateProduct: (productId: string, data: ProductData) => {
    return api.put<ApiResponse>(`/products/${productId}`, data);
  },

  // Xóa sản phẩm
  deleteProduct: (productId: string) => {
    return api.delete<ApiResponse>(`/products/${productId}`);
  },

  // Lấy dữ liệu bộ lọc (thương hiệu, danh mục, phạm vi giá)
  getFilters: () => {
    return api.get<ApiResponse>('/products/filters');
  },

  // New methods for catalog products
  getCatalogProducts: (params: Record<string, unknown>) => {
    return aiApi.get<ApiResponse>('/catalog', { params });
  },
  
  getCatalogProductById: (id: string) => {
    return aiApi.get<ApiResponse>(`/catalog/${id}`);
  },
  
  updateCatalogProduct: (id: string, data: Record<string, unknown>) => {
    // Ensure all numeric fields are properly formatted
    const cleanData = { ...data };
    
    // Numeric fields
    const numericFields = [
      'price', 'pricePerUnit', 'currentAvailableStock', 
      'minimumOrderQuantity', 'dailyCapacity', 'weight'
    ];
    
    // Convert numeric fields to numbers
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        cleanData[field] = Number(cleanData[field]);
      }
    });
    
    // Remove empty values and null values
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });
    
    return aiApi.put<ApiResponse>(`/catalog/${id}`, cleanData);
  },
  
  deleteCatalogProduct: (id: string) => {
    return aiApi.delete<ApiResponse>(`/catalog/${id}`);
  },
  
  getCatalogFilters: () => {
    return aiApi.get<ApiResponse>('/catalog/filters');
  },
};

// API for Manufacturer management
export const manufacturerApi = {
  // Get all manufacturers with filters
  getManufacturers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    location?: string;
    establish_gte?: number;
    establish_lte?: number;
  }) => {
    return api.get<ApiResponse>('/manufacturers', { params });
  },

  // Get manufacturer by ID
  getManufacturerById: (id: string) => {
    return api.get<ApiResponse>(`/manufacturers/${id}`);
  },

  // Create new manufacturer
  createManufacturer: (data: ManufacturerData) => {
    return api.post<ApiResponse>('/manufacturers', data);
  },

  // Update manufacturer
  updateManufacturer: (id: string, data: Partial<ManufacturerData>) => {
    return api.put<ApiResponse>(`/manufacturers/${id}`, data);
  },

  // Delete manufacturer
  deleteManufacturer: (id: string) => {
    return api.delete<ApiResponse>(`/manufacturers/${id}`);
  },

  // Get distinct industries
  getIndustries: () => {
    return api.get<ApiResponse>('/manufacturers/industries');
  },
  
  // Get distinct locations
  getLocations: () => {
    return api.get<ApiResponse>('/manufacturers/locations');
  }
};

// API for FoodProduct management
export const foodProductApi = {
  // Get all food products with filters and search
  getFoodProducts: (params?: {
    page?: number;
    limit?: number; 
    search?: string;
    category?: string;
    productType?: string[];
    sustainable?: boolean;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    leadTime?: string[];
    inStockOnly?: boolean;
    newArrivalsOnly?: boolean;
    manufacturer?: string[];
  }) => {
    return api.get<ApiResponse>('/foodproducts', { params });
  },

  // Get food product by ID
  getFoodProductById: (id: string) => {
    return api.get<ApiResponse>(`/foodproducts/${id}`);
  },

  // Create new food product
  createFoodProduct: (data: Partial<{
    name: string;
    category: string;
    manufacturer: string;
    image: string;
    price: string;
    pricePerUnit: number;
    rating: number;
    productType: string;
    description: string;
    minOrderQuantity: number;
    leadTime: string;
    leadTimeUnit: string;
    sustainable: boolean;
    sku: string;
    unitType: string;
    currentAvailable: number;
    ingredients: string[];
    flavorType: string[];
    usage: string[];
    packagingSize: string;
    shelfLife: string;
    manufacturerRegion: string;
  }>) => {
    return api.post<ApiResponse>('/foodproducts', data);
  },

  // Update food product
  updateFoodProduct: (id: string, data: Partial<{
    name: string;
    category: string;
    manufacturer: string;
    image: string;
    price: string;
    pricePerUnit: number;
    rating: number;
    productType: string;
    description: string;
    minOrderQuantity: number;
    leadTime: string;
    leadTimeUnit: string;
    sustainable: boolean;
    sku: string;
    unitType: string;
    currentAvailable: number;
    ingredients: string[];
    flavorType: string[];
    usage: string[];
    packagingSize: string;
    shelfLife: string;
    manufacturerRegion: string;
  }>) => {
    return api.put<ApiResponse>(`/foodproducts/${id}`, data);
  },

  // Delete food product
  deleteFoodProduct: (id: string) => {
    return api.delete<ApiResponse>(`/foodproducts/${id}`);
  },
  
  // Get product categories
  getCategories: () => {
    return api.get<ApiResponse>('/foodproducts/categories');
  },
  
  // Get product types
  getProductTypes: () => {
    return api.get<ApiResponse>('/foodproducts/types');
  },
  
  // Get manufacturers
  getManufacturers: () => {
    return api.get<ApiResponse>('/foodproducts/manufacturers');
  }
};

// API cho xác thực người dùng
export const authApi = {
  login: (email: string, password: string, useSession: boolean = false) => {
    const config = useSession ? { withCredentials: true } : {};
    return api.post<ApiResponse>('/users/login', { email, password }, config);
  },
  
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'manufacturer' | 'brand' | 'retailer';
    phone?: string;
    company?: string;
  }) => {
    return api.post<ApiResponse>('/users', userData);
  },
  
  verifyEmail: (email: string, verificationCode: string) => {
    return api.post<ApiResponse>('/users/verify-email', { email, verificationCode });
  },
  
  resendVerificationEmail: (email: string) => {
    return api.post<ApiResponse>('/users/resend-verification', { email });
  },
  
  requestPasswordReset: (email: string) => {
    return api.post<ApiResponse>('/users/forgot-password', { email });
  },
  
  resetPassword: (token: string, password: string) => {
    return api.post<ApiResponse>('/users/reset-password', { token, password });
  },
  
  getCurrentUser: () => {
    return api.get<ApiResponse>('/users/me', { withCredentials: true });
  },
  
  updateProfile: (userData: Partial<ProductData>) => {
    return api.put<ApiResponse>('/users/profile', userData, { withCredentials: true });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    // Also logout from session if used
    api.post('/users/logout', {}, { withCredentials: true })
      .catch(err => console.error("Session logout error:", err));
    return Promise.resolve();
  }
};

// API cho Admin
export const adminApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    return adminApiInstance.get<ApiResponse>('/admin/users', { params });
  },
  
  getUserById: (userId: string) => {
    return adminApiInstance.get<ApiResponse>(`/admin/users/${userId}`);
  },
  
  updateUser: (userId: string, userData: Record<string, unknown>) => {
    return adminApiInstance.put<ApiResponse>(`/admin/users/${userId}`, userData);
  },
  
  deleteUser: (userId: string) => {
    return adminApiInstance.delete<ApiResponse>(`/admin/users/${userId}`);
  },
  
  getActivity: (params?: { page?: number; limit?: number }) => {
    return adminApiInstance.get<ApiResponse>('/admin/activity', { params });
  },
  
  getAnalytics: () => {
    return adminApiInstance.get<ApiResponse>('/admin/analytics');
  }
};

export default {
  api,
  aiApi,
  authApi,
  productApi,
  crawlerApi,
  adminApi,
  manufacturerApi
};