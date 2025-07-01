import { useState, useCallback, useEffect } from 'react';
import foodProductService, { FoodProductFormData, FoodProductFilterOptions } from '../services/foodProductService';
import { useToast } from '@/components/ui/use-toast';

export function useFoodProductService() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [foodProducts, setFoodProducts] = useState<any[]>([]);
  const [foodProduct, setFoodProduct] = useState<any | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Get all food products with filtering
  const getFoodProducts = useCallback(async (filters: FoodProductFilterOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.getFoodProducts(filters);
      setFoodProducts(response.data.products || []);
      setPagination({
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        total: response.data.total || 0
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch food products');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch food products'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get a single food product by ID
  const getFoodProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.getFoodProductById(id);
      setFoodProduct(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch food product');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch food product'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new food product
  const createFoodProduct = useCallback(async (data: FoodProductFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.createFoodProduct(data);
      toast({
        title: 'Success',
        description: 'Food product created successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create food product');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create food product'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update an existing food product
  const updateFoodProduct = useCallback(async (id: string, data: Partial<FoodProductFormData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.updateFoodProduct(id, data);
      toast({
        title: 'Success',
        description: 'Food product updated successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update food product');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update food product'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a food product
  const deleteFoodProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.deleteFoodProduct(id);
      toast({
        title: 'Success',
        description: 'Food product deleted successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete food product');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete food product'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Upload food product images
  const uploadImages = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.uploadImages(formData);
      toast({
        title: 'Success',
        description: 'Images uploaded successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to upload images'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update main image
  const updateMainImage = useCallback(async (productId: string, imageUrl: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.updateMainImage(productId, imageUrl);
      toast({
        title: 'Success',
        description: 'Main image updated successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update main image');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update main image'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update product images
  const updateImages = useCallback(async (productId: string, images: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodProductService.updateImages(productId, images);
      toast({
        title: 'Success',
        description: 'Images updated successfully'
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update images');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update images'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load categories for dropdown menus
  const loadCategories = useCallback(async () => {
    try {
      const response = await foodProductService.getCategories();
      setCategories(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      return [];
    }
  }, []);

  // Load food types for dropdown menus
  const loadFoodTypes = useCallback(async () => {
    try {
      const response = await foodProductService.getFoodTypes();
      setFoodTypes(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to load food types:', err);
      return [];
    }
  }, []);

  // Load manufacturers for dropdown menus
  const loadManufacturers = useCallback(async () => {
    try {
      const response = await foodProductService.getManufacturers();
      setManufacturers(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to load manufacturers:', err);
      return [];
    }
  }, []);

  // Load all metadata options at once
  const loadAllMetadata = useCallback(async () => {
    await Promise.all([
      loadCategories(),
      loadFoodTypes(),
      loadManufacturers()
    ]);
  }, [loadCategories, loadFoodTypes, loadManufacturers]);

  // Auto-load metadata when component mounts
  useEffect(() => {
    loadAllMetadata();
  }, [loadAllMetadata]);

  return {
    // State
    loading,
    error,
    foodProducts,
    foodProduct,
    pagination,
    categories,
    foodTypes,
    manufacturers,
    
    // CRUD operations
    getFoodProducts,
    getFoodProductById,
    createFoodProduct,
    updateFoodProduct,
    deleteFoodProduct,
    
    // Image operations
    uploadImages,
    updateMainImage,
    updateImages,
    
    // Metadata operations
    loadCategories,
    loadFoodTypes,
    loadManufacturers,
    loadAllMetadata
  };
} 