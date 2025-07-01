import axios from 'axios';
import { BACKEND_URL, CONTEXT_PATH } from '@/constants/app.environment';

// Construct API URL from available constants
const apiUrl = (path: string): string => {
  return `${BACKEND_URL}${CONTEXT_PATH}${path}`;
};

// Image upload functionality has been removed
// This file is kept as a placeholder to prevent import errors
// If you need to re-enable image upload features, please check the git history

// Empty implementations to avoid breaking existing code
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const response = await uploadImage(file);
    return response.fileUrl;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

interface FileUploadResponse {
  fileUrl: string;
  signedUrl: string;
  key: string;
  expiresIn: number;
  mimetype?: string;
  size?: number;
  originalName?: string;
}

interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  message?: string;
  uploaded?: boolean;
  savedToDb?: boolean;
}

export const uploadMultipleProductImages = async (files: File[]): Promise<string[]> => {
  try {
    const response = await uploadMultipleImages(files) as MultipleFileUploadResponse;
    if (response && response.files) {
      return response.files.map((file: FileUploadResponse) => file.fileUrl);
    }
    throw new Error("Failed to upload images. Please try again.");
  } catch (error) {
    console.error("Error uploading product images:", error);
    throw error;
  }
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

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Validates an image file before upload
 * @param file - The file object to validate
 * @returns An object indicating if the file is valid and a message if not
 */
export const validateImageFile = (file: File): { valid: boolean; message: string } => {
  // Check if file exists
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed'
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    };
  }

  return { valid: true, message: 'File is valid' };
};

/**
 * Compresses an image file client-side
 * @param file - The original image file
 * @param maxWidth - Maximum width for the compressed image (default: 1200px)
 * @param quality - JPEG quality from 0-1 (default: 0.8)
 * @returns A Promise resolving to a compressed File object
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      // Create file reader to read image data
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        // Create an image object to get dimensions
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            // Maintain aspect ratio
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get output format from original file
          let outputType = file.type;
          if (outputType === 'image/jpeg' || outputType === 'image/jpg') {
            outputType = 'image/jpeg';
          }
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create compressed image blob'));
                return;
              }
              
              // Create a new file with same name but compressed data
              const compressedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now()
              });
              
              console.log(`Compressed ${file.name} from ${Math.round(file.size / 1024)}KB to ${Math.round(compressedFile.size / 1024)}KB`);
              resolve(compressedFile);
            },
            outputType,
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for compression'));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Uploads a single image to the server
 * @param file - The file to upload
 * @param foodProductId - Optional ID of associated food product
 * @param isMainImage - Whether this image should be the main product image
 * @param compress - Whether to compress the image before uploading (default: true)
 * @returns Promise resolving to the upload response
 */
export const uploadImage = async (
  file: File,
  foodProductId?: string,
  isMainImage: boolean = false,
  compress: boolean = true
) => {
  try {
    // Compress the image if requested
    const fileToUpload = compress ? await compressImage(file) : file;
    
    const formData = new FormData();
    formData.append('image', fileToUpload);
    
    if (foodProductId) {
      formData.append('foodProductId', foodProductId);
    }
    
    if (isMainImage) {
      formData.append('isMainImage', 'true');
    }
    
    const response = await axios.post(`${apiUrl('/upload')}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to the server
 * @param files - Array of files to upload
 * @param foodProductId - Optional ID of associated food product
 * @param compress - Whether to compress images before uploading (default: true)
 * @returns Promise resolving to the upload response
 */
export const uploadMultipleImages = async (
  files: File[],
  foodProductId?: string,
  compress: boolean = true
) => {
  try {
    // Compress all images if requested
    const filesToUpload = compress 
      ? await Promise.all(files.map(file => compressImage(file)))
      : files;
    
    const formData = new FormData();
    
    // Append all files to formData
    filesToUpload.forEach((file) => {
      formData.append('images', file);
    });
    
    if (foodProductId) {
      formData.append('foodProductId', foodProductId);
    }
    
    const response = await axios.post(`${apiUrl('/upload/multiple')}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Gets a fresh signed URL for an image
 * @param key - The S3 object key
 * @param expiresIn - Number of seconds until expiration (default: 3600)
 * @param fileUrl - Optional full S3 URL (used if key is not provided)
 * @returns Promise resolving to a signed URL string
 */
export const refreshSignedUrl = async (
  key: string,
  expiresIn: number = 3600,
  fileUrl?: string
): Promise<string> => {
  try {
    // Build request parameters
    const params: Record<string, string | number> = {};
    
    if (key) {
      params.key = key;
    } else if (fileUrl) {
      params.url = fileUrl;
    } else {
      throw new Error('Either key or fileUrl must be provided');
    }
    
    params.expires = expiresIn;
    
    // Make API request to get signed URL
    const response = await axios.get(`${apiUrl('/upload/signed-url')}`, {
      params
    });
    
    if (response.data && response.data.signedUrl) {
      return response.data.signedUrl;
    } else {
      throw new Error('Invalid response format - signedUrl not found');
    }
  } catch (error) {
    console.error('Error refreshing signed URL:', error);
    throw error;
  }
};

/**
 * Creates an image URL object from an upload response
 * @param uploadResponse - The response from the upload API
 * @returns An image object with URL, signed URL, key, and expiration time
 */
export const createImageUrlObject = (uploadResponse: {
  fileUrl: string;
  signedUrl: string;
  key: string;
  expiresIn?: number;
}) => {
  return {
    url: uploadResponse.fileUrl,         // Original S3 URL for database
    signedUrl: uploadResponse.signedUrl, // Signed URL for display
    key: uploadResponse.key,             // S3 object key for refreshing
    expiresAt: Date.now() + (uploadResponse.expiresIn || 3600) * 1000 // Expiration timestamp
  };
}; 