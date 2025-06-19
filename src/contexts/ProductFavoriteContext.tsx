import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

// Product interface supporting both API and UI formats
interface Product {
  _id?: string; // From API
  id?: number | string; // From UI components
  name: string;
  manufacturer: string;
  image: string;
  price: string;
  category: string;
  [key: string]: any; // Allow additional properties
}

interface ProductFavoriteContextProps {
  favorites: Product[];
  isFavorite: (id: string | number | undefined) => boolean;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
}

const ProductFavoriteContext = createContext<ProductFavoriteContextProps>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  clearFavorites: () => {},
});

export const useProductFavorites = () => useContext(ProductFavoriteContext);

export const ProductFavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load favorites from localStorage
  const [favorites, setFavorites] = useState<Product[]>(() => {
    const savedFavorites = localStorage.getItem('productFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Update localStorage when favorites change
  useEffect(() => {
    localStorage.setItem('productFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Check if a product is in favorites
  const isFavorite = (id: string | number | undefined): boolean => {
    if (!id) return false;
    return favorites.some(fav => {
      const favId = fav._id || fav.id;
      return favId === id || favId?.toString() === id?.toString();
    });
  };

  // Toggle a product in favorites
  const toggleFavorite = (product: Product) => {
    const productId = product._id || product.id;
    
    if (isFavorite(productId)) {
      setFavorites(favorites.filter(item => {
        const itemId = item._id || item.id;
        return itemId?.toString() !== productId?.toString();
      }));
      toast.success(`${product.name} removed from favorites`);
    } else {
      setFavorites([...favorites, product]);
      toast.success(`${product.name} added to favorites`);
    }
  };

  // Clear all favorite products
  const clearFavorites = () => {
    setFavorites([]);
    toast.success("All product favorites cleared");
  };

  return (
    <ProductFavoriteContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>
      {children}
    </ProductFavoriteContext.Provider>
  );
};

export default ProductFavoriteProvider; 