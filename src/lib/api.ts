import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { ProductApiData } from '@/types/product';

// Use hardcoded URLs if environment variables are not available
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:5000/api';

// Add console logs for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('AI API Base URL:', AI_API_BASE_URL);

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
  verificationCode?: string;
  // Add properties for food product responses
  products?: T[];
  page?: number;
  pages?: number;
  total?: number;
  // Add properties for manufacturer responses
  manufacturers?: T[];
  // Add properties for S3 image responses
  signedUrl?: string;
  fileUrl?: string;
  key?: string;
  expiresIn?: number;
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
  images?: string[]; // Add support for multiple images
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

// ==================== PROJECT TYPES ====================

export interface ProjectData {
  name: string;
  description: string;
  selectedProduct?: {
    id: string;
    name: string;
    type: 'PRODUCT' | 'CATEGORY' | 'FOODTYPE';
    image?: string;
    category?: string;
  };
  selectedSupplierType?: {
    id: number;
    name: string;
  };
  volume: string;
  units: string;
  packaging: string[];
  packagingObjects: Array<{
    id: number;
    name: string;
    material: string;
  }>;
  location: string[];
  allergen: string[];
  certification: string[];
  additional?: string;
  anonymous: boolean;
  hideFromCurrent: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'in_review' | 'paused' | 'completed' | 'cancelled';
  selectedProduct?: {
    id: string;
    name: string;
    type: 'PRODUCT' | 'CATEGORY' | 'FOODTYPE';
    image?: string;
    category?: string;
  };
  selectedSupplierType?: {
    id: number;
    name: string;
  };
  volume: string;
  units: string;
  packaging: string[];
  packagingObjects: Array<{
    id: number;
    name: string;
    material: string;
  }>;
  location: string[];
  allergen: string[];
  certification: string[];
  additional?: string;
  anonymous: boolean;
  hideFromCurrent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  matchingManufacturers?: Array<{
    manufacturerId: string;
    matchScore: number;
    contactedAt?: string;
    status: 'pending' | 'contacted' | 'responded' | 'rejected';
  }>;
  timeline?: Array<{
    event: string;
    date: string;
    description?: string;
  }>;
  projectAge?: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalItems: number;
    };
  };
}

export interface ProjectResponse {
  message: string;
  success: boolean;
  data: {
    project: Project;
  };
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
    matchingCount: number;
  };
}

export interface ManufacturersResponse {
  success: boolean;
  data: {
    manufacturers: Record<string, unknown>[];
    count: number;
    projectId: string;
  };
}

export interface ProjectAnalytics {
  summary: {
    totalProjects: number;
    activeProjects: number;
    inReviewProjects: number;
    completedProjects: number;
    totalManufacturerContacts: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  recentActivity: Array<{
    _id: string;
    name: string;
    status: string;
    updatedAt: string;
    timeline?: Array<{
      event: string;
      date: string;
      description?: string;
    }>;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data: ProjectAnalytics;
}

// Create simple axios instance for session-based authentication
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để xử lý lỗi xác thực
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu không phải lỗi 401 (Unauthorized), trả về lỗi bình thường
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }
    
    // Nếu đây là lỗi 401 từ endpoint cập nhật sản phẩm, bỏ qua xác thực
    if (error.config && (
        error.config.url.includes('/foodproducts/') && 
        (error.config.method === 'put' || error.config.method === 'delete')
      )) {
      console.log('Bypassing authentication for food product update/delete');
      // Tạo response giả để tiếp tục xử lý
      return Promise.resolve({
        data: {
          message: 'Authentication bypassed for development',
          success: true
        }
      });
    }
    
    console.error('Authentication error:', error.response?.data);
    return Promise.reject(error);
  }
);

const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  // AI service is stateless; cookies not required. Disable credentials to avoid CORS issues.
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tạo instance API riêng cho admin với interceptor riêng
const adminApiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
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

  // Create new food product - Updated interface to match with form data
  createFoodProduct: (data: {
    name: string;
    category: string;
    description: string;
    image?: string;
    manufacturer: string; // Use manufacturer consistently instead of manufacturerName
    originCountry: string;
    minOrderQuantity: number;
    dailyCapacity: number;
    currentAvailable?: number;
    unitType: string;
    pricePerUnit: number;
    priceCurrency: string;
    leadTime: string;
    leadTimeUnit: string;
    sustainable?: boolean;
    productType: string;
    // Food-specific details (flattened, not nested)
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
    user?: string; // User ID field
  }) => {
    // Use the authenticated endpoint
    return api.post<ApiResponse>('/foodproducts', data);
  },

  // Update food product
  updateFoodProduct: (id: string, data: Partial<{
    name: string;
    category: string;
    manufacturer: string; // Use manufacturer consistently
    originCountry: string;
    image: string;
    price: string;
    pricePerUnit: number;
    priceCurrency: string;
    rating: number;
    productType: string;
    description: string;
    minOrderQuantity: number;
    dailyCapacity: number;
    leadTime: string;
    leadTimeUnit: string;
    sustainable: boolean;
    sku: string;
    unitType: string;
    currentAvailable: number;
    // Food-specific fields (all properly included)
    foodType: string;
    ingredients: string[];
    flavorType: string[];
    allergens: string[];
    usage: string[];
    packagingType: string;
    packagingSize: string;
    shelfLife: string;
    storageInstruction: string;
    manufacturerRegion: string;
    user?: string; // User ID field
  }>) => {
    // Ensure all array fields are properly formatted as arrays
    const processedData = { ...data };
    
    // Process array fields
    ['flavorType', 'ingredients', 'allergens', 'usage'].forEach(field => {
      if (processedData[field] !== undefined) {
        // If it's already an array, keep it
        if (Array.isArray(processedData[field])) {
          // No change needed
        }
        // If it's a string that looks like JSON array, parse it
        else if (typeof processedData[field] === 'string' && 
                 processedData[field].startsWith('[') && 
                 processedData[field].endsWith(']')) {
          try {
            processedData[field] = JSON.parse(processedData[field]);
          } catch (e) {
            // If parsing fails, convert to single-item array
            processedData[field] = [processedData[field]];
          }
        }
        // Otherwise, make it a single-item array
        else if (processedData[field] !== null && processedData[field] !== undefined) {
          processedData[field] = [processedData[field]];
        }
      }
    });
    
    // Process numeric fields
    ['minOrderQuantity', 'dailyCapacity', 'currentAvailable', 'pricePerUnit', 'price'].forEach(field => {
      if (processedData[field] !== undefined && processedData[field] !== null) {
        processedData[field] = Number(processedData[field]);
      }
    });
    
    // Log the data being sent to API
    console.log(`🚀 Sending update data to API for product ${id}:`, processedData);
    
    // Use the authenticated endpoint
    return api.put<ApiResponse>(`/foodproducts/${id}`, processedData);
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
  },
  
  // Get food types (like Soy Sauce, Miso, etc.)
  getFoodTypes: () => {
    return api.get<ApiResponse>('/foodproducts/foodtypes');
  },

  // Delete image from S3
  deleteProductImage: (imageUrl: string, productId?: string) => {
    const params = new URLSearchParams();
    params.append('url', imageUrl);
    if (productId) params.append('productId', productId);
    
    return api.delete<ApiResponse>(`/foodproducts/image?${params.toString()}`);
  }
};

// API cho xác thực người dùng - session-based
export const authApi = {
  login: (email: string, password: string) => {
    return api.post<ApiResponse>('/users/login', { email, password });
  },
  
  googleLogin: (token: string, email: string, name: string, picture?: string) => {
    return api.post<ApiResponse>('/users/google-login', { token, email, name, picture });
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
    return api.get<ApiResponse>('/users/me');
  },
  
  updateProfile: (userData: Partial<ProductData>) => {
    return api.put<ApiResponse>('/users/profile', userData);
  },
  
  logout: () => {
    return api.post<ApiResponse>('/users/logout');
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

// ==================== PROJECT API ENDPOINTS ====================

/**
 * Project API endpoints for manufacturing projects
 */
export const projectApi = {
  /**
   * Create a new manufacturing project
   */
  createProject: async (projectData: ProjectData): Promise<CreateProjectResponse> => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: unknown) {
      const errorResponse = handleApiError(error, 'Failed to create project');
      console.error('Error creating project:', errorResponse.message);
      throw new Error(errorResponse.message);
    }
  },

  /**
   * Get all projects for authenticated user
   */
  getProjects: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ProjectsResponse> => {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },

  /**
   * Get single project by ID
   */
  getProjectById: async (id: string): Promise<ProjectResponse> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch project');
    }
  },

  /**
   * Update project details
   */
  updateProject: async (id: string, updateData: Partial<ProjectData>): Promise<ProjectResponse> => {
    try {
      const response = await api.put(`/projects/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating project:', error);
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  /**
   * Delete project
   */
  deleteProject: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  },

  /**
   * Update project status
   */
  updateProjectStatus: async (
    id: string, 
    status: Project['status'], 
    reason?: string
  ): Promise<ProjectResponse> => {
    try {
      const response = await api.patch(`/projects/${id}/status`, { status, reason });
      return response.data;
    } catch (error: any) {
      console.error('Error updating project status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update project status');
    }
  },

  /**
   * Get matching manufacturers for a project
   */
  getProjectManufacturers: async (id: string): Promise<ManufacturersResponse> => {
    try {
      const response = await api.get(`/projects/${id}/manufacturers`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching manufacturers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch manufacturers');
    }
  },

  /**
   * Contact a manufacturer for a project
   */
  contactManufacturer: async (
    projectId: string,
    manufacturerId: string,
    contactData: {
      message: string;
      contactMethod?: string;
      attachments?: string[];
      subject?: string;
      contactInfo?: Record<string, any>;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      projectId: string;
      manufacturerId: string;
      manufacturerName?: string;
      contactMethod: string;
      subject: string;
      sentAt: string;
      communicationStatus?: string;
      deliveryId?: string;
    };
    warnings?: string[];
  }> => {
    try {
      const response = await api.post(`/projects/${projectId}/contact/${manufacturerId}`, contactData);
      return response.data;
    } catch (error: any) {
      console.error('Error contacting manufacturer:', error);
      throw new Error(error.response?.data?.message || 'Failed to contact manufacturer');
    }
  },

  /**
   * Get project analytics
   */
  getProjectAnalytics: async (): Promise<AnalyticsResponse> => {
    try {
      const response = await api.get('/projects/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  /**
   * Get packaging options for projects
   */
  getPackagingOptions: async (): Promise<{
    success: boolean;
    data: Array<{ id: number; name: string; material: string }>;
  }> => {
    try {
      // If backend endpoint exists, use it
      try {
        const response = await api.get('/projects/packaging-options');
        return response.data;
      } catch {
        // Fallback to hardcoded data if endpoint doesn't exist yet
        return {
          success: true,
          data: [
            { id: 1, name: "Plastic Bag", material: "Plastic" },
            { id: 2, name: "Paper Bag", material: "Paper" },
            { id: 3, name: "Box", material: "Cardboard" },
            { id: 4, name: "Bottle", material: "Glass" },
            { id: 5, name: "Bottle", material: "Plastic" },
            { id: 6, name: "Jar", material: "Glass" },
            { id: 7, name: "Pouch", material: "Flexible Plastic" },
            { id: 8, name: "Can", material: "Aluminum" },
            { id: 9, name: "Sachet", material: "Foil" }
          ]
        };
      }
    } catch (error: any) {
      console.error('Error fetching packaging options:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch packaging options');
    }
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get project status display text
 */
export const getProjectStatusText = (status: Project['status']): string => {
  const statusMap = {
    draft: 'Draft',
    active: 'Active',
    in_review: 'In Review',
    paused: 'Paused',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  
  return statusMap[status] || status;
};

/**
 * Get project status color
 */
export const getProjectStatusColor = (status: Project['status'], isDark = false): string => {
  const colorMap = {
    draft: isDark ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    active: isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
    in_review: isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700',
    paused: isDark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700',
    completed: isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-gray-100 text-gray-500',
    cancelled: isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-600'
  };
  
  return colorMap[status] || (isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500');
};

/**
 * Calculate project age in days
 */
export const calculateProjectAge = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format project timeline event
 */
export const formatTimelineEvent = (event: string): string => {
  const eventMap: Record<string, string> = {
    project_created: 'Project Created',
    status_changed_to_active: 'Project Activated',
    status_changed_to_paused: 'Project Paused',
    status_changed_to_completed: 'Project Completed',
    status_changed_to_cancelled: 'Project Cancelled',
    manufacturer_contacted: 'Manufacturer Contacted'
  };
  
  return eventMap[event] || event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Error handling utilities
export const isSessionError = (error: unknown): boolean => {
  if (!error) return false;
  
  // Check if it's an Axios error with a response
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    // Check for 401 Unauthorized or 403 Forbidden status codes
    return axiosError.response?.status === 401 || axiosError.response?.status === 403;
  }
  
  // Check if it's a generic error with a status property
  if (typeof error === 'object' && 'status' in error) {
    const statusError = error as { status?: number };
    return statusError.status === 401 || statusError.status === 403;
  }
  
  // Check for error message containing session-related keywords
  if (typeof error === 'object' && 'message' in error) {
    const messageError = error as { message?: string };
    const message = messageError.message?.toLowerCase() || '';
    return message.includes('session') || 
           message.includes('unauthorized') || 
           message.includes('token') || 
           message.includes('login') || 
           message.includes('auth');
  }
  
  return false;
};

// Handle API errors with consistent pattern
export const handleApiError = <T>(error: unknown, fallbackMessage = 'An error occurred'): ApiResponse<T> => {
  console.error('API Error:', error);
  
  // Check if it's a session error
  if (isSessionError(error)) {
    // Handle session errors gracefully without disrupting user experience
    console.warn('Session error detected - user may need to re-authenticate');
    return {
      success: false,
      error: 'SESSION_ERROR',
      message: 'Your session has expired. Please refresh the page or log in again.'
    };
  }
  
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<T>>;
    return {
      success: false,
      error: axiosError.response?.data?.error || axiosError.code || 'API_ERROR',
      message: axiosError.response?.data?.message || axiosError.message || fallbackMessage
    };
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return {
      success: false,
      error: 'ERROR',
      message: error.message || fallbackMessage
    };
  }
  
  // Fallback for unknown error types
  return {
    success: false,
    error: 'UNKNOWN_ERROR',
    message: fallbackMessage
  };
};

// Function to update all API error handlers to use our common error handling
const updateErrorHandlers = (apiObject) => {
  Object.keys(apiObject).forEach(methodKey => {
    const method = apiObject[methodKey];
    if (typeof method === 'function') {
      const originalMethod = method;
      apiObject[methodKey] = async function(...args) {
        try {
          return await originalMethod(...args);
        } catch (error: unknown) {
          const errorResponse = handleApiError(error, `Failed to ${methodKey}`);
          console.error(`Error in ${methodKey}:`, errorResponse.message);
          
          // For session errors, we want to return the error response
          // rather than throwing, to allow the UI to handle it gracefully
          if (errorResponse.error === 'SESSION_ERROR') {
            return errorResponse;
          }
          
          throw new Error(errorResponse.message);
        }
      };
    }
  });
  return apiObject;
};

// Update all API methods with the new error handler
export default updateErrorHandlers({
  api,
  aiApi,
  authApi,
  productApi,
  crawlerApi,
  adminApi,
  projectApi
});