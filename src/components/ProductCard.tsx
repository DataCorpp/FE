import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, Variants } from "framer-motion";
import { 
  CheckCircle2, 
  Eye, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  Leaf,
  Heart,
  Loader,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useTheme } from "@/contexts/ThemeContext";
import { useProductFavorites } from "@/contexts/ProductFavoriteContext";

// Define the Product interface with all required fields
interface Product {
  _id: string;
  name: string;
  productName?: string;
  category: string;
  manufacturer: string;
  manufacturerName?: string;
  manufacturerRegion?: string;
  image: string;
  images?: string[];
  price: string;
  pricePerUnit?: number;
  rating: number;
  productType: string;
  description: string;
  minOrderQuantity: number;
  leadTime: string;
  leadTimeUnit?: string;
  sustainable: boolean;
  sku?: string;
  unitType?: string;
  currentAvailable?: number;
  packagingSize?: string;
  shelfLife?: string;
  flavorType?: string[];
  ingredients?: string[];
  usage?: string[];
}

// Props interface for the ProductCard component
interface ProductCardProps {
  product: Product;
  onFindMatching: (productId: string) => Promise<void>;
}

// Enhanced card animations
const tiltCardVariants: Variants = {
  initial: { 
    scale: 1, 
    y: 0, 
    rotateY: 0, 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" 
  },
  hover: { 
    scale: 1.03, 
    y: -5, 
    boxShadow: "0 25px 30px -12px rgba(0, 0, 0, 0.15), 0 15px 15px -10px rgba(0, 0, 0, 0.08)",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  }
};

// Enhanced button animations
const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      type: "spring",
      stiffness: 500,
      damping: 10
    }
  },
  tap: { scale: 0.97 }
};

// Badge animations
const badgeVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
      delay: 0.1
    }
  }
};

// Image hover animation
const imageVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.08,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const ProductCard = ({ product, onFindMatching }: ProductCardProps) => {
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useProductFavorites();
  
  // Mouse position values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for tilt
  const rotateY = useTransform(x, [-100, 100], [-3, 3]);
  const rotateX = useTransform(y, [-100, 100], [3, -3]);
  
  // Handle mouse move for tilt effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate the mouse position relative to the card center
    const newX = event.clientX - rect.left - rect.width / 2;
    const newY = event.clientY - rect.top - rect.height / 2;
    
    x.set(newX);
    y.set(newY);
  };
  
  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  // Handle see details click
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/products/${product._id}`);
  };
  
  // Handle find matching click with loading state
  const handleFindMatchingClick = async () => {
    setIsFindingMatch(true);
    try {
      await onFindMatching(product._id);
    } finally {
      setIsFindingMatch(false);
    }
  };
  
  // Convert rating to array of stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={`star-${i}`} 
            className={cn(
              "h-3.5 w-3.5", 
              i < Math.floor(rating) 
                ? "text-yellow-400 fill-yellow-400" 
                : i < Math.ceil(rating) && i > Math.floor(rating) - 1 
                  ? "text-yellow-400 fill-yellow-400/50" 
                  : "text-gray-300"
            )} 
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Images array for carousel (use product.images if available, otherwise use single image)
  const images = product.images?.length ? product.images : [product.image];

  // Card fields
  const displayName = product.productName || product.name;

  const { theme } = useTheme();

  return (
    <motion.div
      className="relative overflow-visible"
      initial="initial"
      whileHover="hover"
      variants={tiltCardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, perspective: 1000 }}
      layoutId={`product-card-${product._id}`}
    >
      {/* Modern card, bỏ blur và tăng độ rõ ràng */}
      <div className={cn(
        "rounded-2xl overflow-hidden border shadow-lg h-full flex flex-col transition-colors duration-300",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        {/* Image Carousel */}
        <div className="relative p-3 pt-4">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={isHovered ? { delay: 2000, disableOnInteraction: false } : undefined}
            className="product-card-swiper rounded-xl overflow-hidden"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <div className="aspect-square rounded-xl flex items-center justify-center p-0 overflow-hidden w-full h-full">
                  <motion.img
                    src={img}
                    alt={`${displayName} - image ${index + 1}`}
                    className="w-full h-full object-cover bg-white dark:bg-zinc-900"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    loading="lazy"
                    whileHover={{ scale: 1.04 }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Sustainable badge with enhanced animation */}
          <AnimatePresence>
            {product.sustainable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="absolute top-5 left-5 bg-green-100 text-green-800 rounded-full p-1.5 z-10 shadow-sm"
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sustainable Product</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </AnimatePresence>
          
          {/* Favorite Button */}
          <motion.div
            className={cn(
              "absolute top-5 z-10 shadow-sm",
              product.sustainable ? "left-16" : "left-5"
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full p-1.5 h-auto w-auto backdrop-blur-sm transition-all duration-300",
                      isFavorite(product._id)
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-600"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product);
                    }}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isFavorite(product._id) ? "fill-current" : ""
                      )} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isFavorite(product._id) ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          
          {/* Animated Category Badge */}
          <motion.div
            className="absolute top-5 right-5 z-10"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <Badge className="shadow-sm font-medium">{product.category}</Badge>
          </motion.div>
        </div>
        
        {/* Content with improved text handling */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product name with improved truncation */}
          <div className="h-14 mb-1"> {/* Fixed height for consistency */}
            <h3 className="text-xl font-semibold line-clamp-2 tracking-tight leading-tight">
              {displayName}
            </h3>
          </div>
          
          {/* Price info with enhanced visual hierarchy */}
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {product.price}
                <span className="text-xs text-foreground/70 ml-1">
                  {product.unitType && `/${product.unitType}`}
                </span>
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {renderRating(product.rating)}
            </motion.div>
          </div>
          
          {/* Key info with icons in a more organized layout */}
          <div className="space-y-2 mb-4">
            {/* Manufacturer info with better visibility */}
            <div className="text-sm font-medium text-foreground/80 mb-1 line-clamp-1">
              {product.manufacturerName || product.manufacturer}
              {product.manufacturerRegion && (
                <span className="before:content-[','] before:mr-1 text-foreground/60">{product.manufacturerRegion}</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.packagingSize && (
                <motion.div 
                  className="flex items-center gap-1 text-sm text-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Package className="h-3 w-3 text-primary/80" />
                  <span>{product.packagingSize}</span>
                </motion.div>
              )}
              
              {product.shelfLife && (
                <motion.div 
                  className="flex items-center gap-1 text-sm text-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Calendar className="h-3 w-3 text-primary/80" />
                  <span>{product.shelfLife}</span>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Min Order & Type with improved visual design */}
          <div className="flex flex-wrap gap-2 mb-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Badge variant="secondary" className="text-xs font-medium">
                {product.productType}
              </Badge>
            </motion.div>
            
            {product.minOrderQuantity && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className="text-xs">
                  Min: {product.minOrderQuantity} {product.unitType || "units"}
                </Badge>
              </motion.div>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-4 text-sm text-foreground/80 line-clamp-2 min-h-[2.5em]">{product.description}</div>
          
          {/* Action buttons with enhanced animations */}
          <div className="flex gap-2 mt-auto">
            <motion.div variants={buttonVariants} className="flex-1">
              <Button 
                className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                See Details
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full rounded-full border-primary/30 hover:bg-primary/10 transition-all duration-300"
                onClick={handleFindMatchingClick}
                disabled={isFindingMatch}
              >
                {isFindingMatch ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                )}
                Find Matching
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Product Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              className={cn(
                "rounded-2xl shadow-2xl max-w-lg w-full p-8 relative overflow-y-auto max-h-[90vh] border transition-colors duration-300",
                theme === 'dark'
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-white border-zinc-200 text-zinc-900"
              )}
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowDetails(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              {/* Product image */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={product.image}
                  alt={displayName}
                  className="w-32 h-32 object-contain rounded-xl shadow mb-2 bg-white dark:bg-zinc-900"
                  style={{ background: theme === 'dark' ? '#18181b' : '#fff' }}
                />
                <h2 className="text-2xl font-bold text-center mb-1" style={{ color: theme === 'dark' ? '#fff' : '#18181b' }}>{displayName}</h2>
                <div className={cn("text-lg font-semibold mb-2", theme === 'dark' ? "text-primary" : "text-primary")}>{product.price} {product.unitType && <span className="text-xs text-foreground/70">/{product.unitType}</span>}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{product.category}</Badge>
                  {product.flavorType && product.flavorType.length > 0 && (
                    <Badge variant="outline">{product.flavorType.join(', ')}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderRating(product.rating)}
                </div>
              </div>
              {/* Details grid */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                {product.description && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm font-medium text-foreground/90">{product.description}</div>
                  </div>
                )}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ingredients</div>
                    <div className="flex flex-wrap gap-1">
                      {product.ingredients.map((ing, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.usage && product.usage.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Usage</div>
                    <div className="flex flex-wrap gap-1">
                      {product.usage.map((u, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{u}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.packagingSize && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Packaging Size</div>
                    <div className="text-sm font-medium text-foreground/90">{product.packagingSize}</div>
                  </div>
                )}
                {product.shelfLife && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Shelf Life</div>
                    <div className="text-sm font-medium text-foreground/90">{product.shelfLife}</div>
                  </div>
                )}
                {product.manufacturerName || product.manufacturer ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Manufacturer</div>
                    <div className="text-sm font-medium text-foreground/90">
                      {product.manufacturerName || product.manufacturer}
                      {product.manufacturerRegion && (
                        <span className="ml-1 text-muted-foreground">({product.manufacturerRegion})</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS for Swiper and button ripple effect */}
      <style>
        {`
          .product-card-swiper .swiper-pagination-bullet {
            background-color: var(--primary);
            opacity: 0.5;
            width: 6px;
            height: 6px;
            transition: all 0.3s ease;
          }
          
          .product-card-swiper .swiper-pagination-bullet-active {
            opacity: 1;
            background-color: var(--primary);
            width: 20px;
            border-radius: 4px;
          }
          
          /* Improved ripple effect for buttons */
          button {
            position: relative;
            overflow: hidden;
          }
          
          button:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.4);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%, -50%);
            transform-origin: 50% 50%;
          }
          
          button:focus:not(:active)::after {
            animation: ripple 0.6s ease-out;
          }
          
          @keyframes ripple {
            0% {
              transform: scale(0, 0);
              opacity: 0.5;
            }
            20% {
              transform: scale(25, 25);
              opacity: 0.3;
            }
            100% {
              opacity: 0;
              transform: scale(40, 40);
            }
          }

          /* Shimmer effect for price gradient */
          @keyframes shimmer {
            0% {
              background-position: -100% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
    </motion.div>
  );
};

export default ProductCard;
