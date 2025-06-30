import axios from 'axios';
import { BACKEND_URL, CONTEXT_PATH } from '@/constants/app.environment';

// Construct API URL from available constants
const API_URL = `${BACKEND_URL}${CONTEXT_PATH}`;

// Image upload functionality has been removed
// This file is kept as a placeholder to prevent import errors
// If you need to re-enable image upload features, please check the git history

// Empty implementations to avoid breaking existing code
export const uploadProductImage = async (file: File): Promise<string> => {
  console.warn('Image upload functionality has been removed');
  return '';
};

export const uploadMultipleProductImages = async (files: File[]): Promise<string[]> => {
  console.warn('Image upload functionality has been removed');
  return [];
};

export const updateProductImages = async (
  productId: string, 
  images: string[],
  mainImage?: string
): Promise<{ images: string[], mainImage: string }> => {
  console.warn('Image update functionality has been removed');
  return {
    images: [],
    mainImage: mainImage || ''
  };
}; 