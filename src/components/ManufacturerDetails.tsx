import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Heart, 
  GitCompare,
  MapPin, 
  Calendar, 
  Building, 
  Award, 
  Mail, 
  Phone, 
  Globe,
  ExternalLink,
  Building2,
  Users,
  Zap,
  Shield,
  CheckCircle,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useManufacturerFavorites } from "@/contexts/ManufacturerFavoriteContext";
import { useManufacturerCompare } from "@/contexts/ManufacturerCompareContext";
import { cn } from "@/lib/utils";

// Updated interface to match actual database fields only
interface Manufacturer {
  id: number;
  name: string;
  location: string;
  logo: string;
  industry: string;
  certification: string;
  establishedYear: number;
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  description?: string;
}

// Product category interface
interface ProductCategory {
  category: string;
  count: number;
  products: string[];
}

interface ManufacturerDetailsProps {
  manufacturer: Manufacturer;
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.95
  }
};

const ManufacturerDetails: React.FC<ManufacturerDetailsProps> = ({
  manufacturer,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [imageError, setImageError] = useState(false);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useManufacturerFavorites();
  const { compareItems, toggleCompare } = useManufacturerCompare();

  const isFavorite = favorites.some(fav => fav.id === manufacturer.id);
  const isInCompare = compareItems.some(item => item.id === manufacturer.id);
  const canAddToCompare = compareItems.length < 3;

  // Load product categories for this manufacturer
  useEffect(() => {
    const loadProductCategories = async () => {
      if (!isOpen) return;
      
      setLoadingProducts(true);
      setProductsError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/foodproducts?manufacturer=${encodeURIComponent(manufacturer.name)}&limit=100`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.foodProducts) {
            // Group products by category
            const categoryMap = new Map<string, { count: number; products: string[] }>();
            
            data.foodProducts.forEach((product: any) => {
              const category = product.category || 'Uncategorized';
              if (!categoryMap.has(category)) {
                categoryMap.set(category, { count: 0, products: [] });
              }
              const categoryData = categoryMap.get(category)!;
              categoryData.count++;
              categoryData.products.push(product.name);
            });
            
            // Convert to array and sort by count
            const categories: ProductCategory[] = Array.from(categoryMap.entries())
              .map(([category, data]) => ({
                category,
                count: data.count,
                products: data.products.slice(0, 5) // Limit to first 5 products for display
              }))
              .sort((a, b) => b.count - a.count);
            
            setProductCategories(categories);
          } else {
            setProductCategories([]);
          }
        } else {
          throw new Error('Failed to load products');
        }
      } catch (error) {
        console.error('Error loading product categories:', error);
        setProductsError('Failed to load product information');
        setProductCategories([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProductCategories();
  }, [isOpen, manufacturer.name]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = () => {
    toggleFavorite(manufacturer);
  };

  const handleCompareClick = () => {
    if (canAddToCompare || isInCompare) {
      toggleCompare(manufacturer);
    }
  };

  const handleContactClick = (type: 'email' | 'phone' | 'website') => {
    switch (type) {
      case 'email':
        window.open(`mailto:${manufacturer.contact.email}`);
        break;
      case 'phone':
        if (manufacturer.contact.phone) {
          window.open(`tel:${manufacturer.contact.phone}`);
        }
        break;
      case 'website':
        if (manufacturer.contact.website) {
          window.open(manufacturer.contact.website, '_blank');
        }
        break;
    }
  };

  // Parse certifications from string to array
  const certifications = manufacturer.certification 
    ? manufacturer.certification.split(';').map(cert => cert.trim()).filter(cert => cert.length > 0)
    : [];

  // Parse industries from string to array if contains multiple values
  const industries = manufacturer.industry 
    ? manufacturer.industry.split(';').map(ind => ind.trim()).filter(ind => ind.length > 0)
    : [];

  // Calculate years in business
  const yearsInBusiness = new Date().getFullYear() - manufacturer.establishedYear;

  // Calculate total products
  const totalProducts = productCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-background via-background/98 to-muted/5">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col h-full"
            >
              {/* Header */}
              <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Logo */}
                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50">
                      {!imageError && manufacturer.logo ? (
                        <img
                          src={manufacturer.logo}
                          alt={`${manufacturer.name} logo`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <Building className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                    </div>

                    {/* Title and Location */}
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="text-3xl font-bold text-foreground mb-2 line-clamp-2">
                        {manufacturer.name}
                      </DialogTitle>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{manufacturer.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">Est. {manufacturer.establishedYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleFavoriteClick}
                        className={cn(
                          "rounded-full transition-all duration-300 h-10 w-10",
                          isFavorite && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                      </Button>
                    </motion.div>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCompareClick}
                        disabled={!canAddToCompare && !isInCompare}
                        className={cn(
                          "rounded-full transition-all duration-300 h-10 w-10",
                          isInCompare && "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                        )}
                      >
                        <GitCompare className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </DialogHeader>

              {/* Content */}
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-auto"
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 bg-muted/50">
                    <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg">Products</TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-lg">Contact</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab - Comprehensive company information */}
                  <TabsContent value="overview" className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Key Stats */}
                      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-4 text-center">
                          <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold text-primary">{yearsInBusiness}</div>
                          <div className="text-sm text-muted-foreground">Years in Business</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                          <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-green-700">Certified</div>
                          <div className="text-sm text-green-600">{certifications.length} Certifications</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-blue-700">Industries</div>
                          <div className="text-sm text-blue-600">{industries.length} Sectors</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-purple-700">Products</div>
                          <div className="text-sm text-purple-600">{totalProducts} Items</div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Company Overview */}
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Company Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Company Description */}
                          {manufacturer.description && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                About Company
                              </h4>
                              <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 border-l-4 border-primary/30">
                                <p className="leading-relaxed">{manufacturer.description}</p>
                              </div>
                            </div>
                          )}

                          {/* Basic Company Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="bg-muted/30 rounded-lg p-4 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Establishment</span>
                                </div>
                                <div className="text-lg font-semibold">{manufacturer.establishedYear}</div>
                                <div className="text-sm text-muted-foreground">
                                  {yearsInBusiness} years in business
                                </div>
                              </div>

                              <div className="bg-muted/30 rounded-lg p-4 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Location</span>
                                </div>
                                <div className="text-lg font-semibold">{manufacturer.location}</div>
                                <div className="text-sm text-muted-foreground">Headquarters</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-muted/30 rounded-lg p-4 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Industries</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {industries.map((industry, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="bg-primary/10 text-primary"
                                    >
                                      {industry}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-muted/30 rounded-lg p-4 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Product Portfolio</span>
                                </div>
                                <div className="text-lg font-semibold">{totalProducts}</div>
                                <div className="text-sm text-muted-foreground">
                                  Across {productCategories.length} categories
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Certifications */}
                          <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              Certifications & Standards
                            </h4>
                            {certifications.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {certifications.map((cert, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                                  >
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-green-800">{cert}</div>
                                      <div className="text-xs text-green-600">Certified</div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No certifications listed</p>
                              </div>
                            )}
                          </div>

                          {/* Contact Summary */}

                          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-primary" />
                              Quick Actions
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                onClick={() => handleContactClick('email')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                              >
                                <Mail className="h-4 w-4" />
                                Send Email
                              </Button>
                              
                              {manufacturer.contact.phone && (
                                <Button
                                  onClick={() => handleContactClick('phone')}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                >
                                  <Phone className="h-4 w-4" />
                                  Call Now
                                </Button>
                              )}
                              
                              {manufacturer.contact.website && (
                                <Button
                                  onClick={() => handleContactClick('website')}
                                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                                >
                                  <Globe className="h-4 w-4" />
                                  Visit Website
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {/* <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              Contact Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Mail className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-800">Email</span>
                                </div>
                                <div className="text-sm text-blue-600 break-all">
                                  {manufacturer.contact.email}
                                </div>
                              </div>

                              {manufacturer.contact.phone && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Phone className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-800">Phone</span>
                                  </div>
                                  <div className="text-sm text-green-600">
                                    {manufacturer.contact.phone}
                                  </div>
                                </div>
                              )}

                              {manufacturer.contact.website && (
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Globe className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-purple-800">Website</span>
                                  </div>
                                  <div className="text-sm text-purple-600 break-all">
                                    {manufacturer.contact.website}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div> */}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products" className="p-6 space-y-6">
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Product Portfolio
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loadingProducts ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                              <span className="text-lg text-muted-foreground">Loading product information...</span>
                            </div>
                          ) : productsError ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                              <p className="text-lg mb-2">Unable to load products</p>
                              <p className="text-sm">{productsError}</p>
                            </div>
                          ) : productCategories.length > 0 ? (
                            <>
                              {/* Product Summary Stats */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                  <CardContent className="p-4 text-center">
                                    <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-blue-700">{totalProducts}</div>
                                    <div className="text-sm text-blue-600">Total Products</div>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                  <CardContent className="p-4 text-center">
                                    <Building className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-green-700">{productCategories.length}</div>
                                    <div className="text-sm text-green-600">Categories</div>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                  <CardContent className="p-4 text-center">
                                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-purple-700">{industries.length}</div>
                                    <div className="text-sm text-purple-600">Industries</div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Product Categories */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <ShoppingCart className="h-5 w-5 text-primary" />
                                  Product Categories
                                </h3>
                                {productCategories.map((category, index) => (
                                  <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-muted/30 rounded-lg p-6 border hover:shadow-md transition-all duration-300"
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-lg font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        {category.category}
                                      </h4>
                                      <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                                        {category.count} products
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {category.products.map((product, idx) => (
                                        <div
                                          key={idx}
                                          className="text-sm text-muted-foreground bg-background/50 rounded-md p-3 border hover:bg-background/80 transition-colors"
                                        >
                                          {product}
                                        </div>
                                      ))}
                                      {category.count > category.products.length && (
                                        <div className="text-sm text-primary bg-primary/5 rounded-md p-3 border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors">
                                          +{category.count - category.products.length} more products
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-12">
                              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                              <p className="text-lg text-muted-foreground mb-2">No Products Available</p>
                              <p className="text-sm text-muted-foreground">
                                This manufacturer hasn't listed any products yet.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Contact Tab */}
                  <TabsContent value="contact" className="p-6 space-y-6">
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Contact Methods */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 cursor-pointer"
                              onClick={() => handleContactClick('email')}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-blue-800">Email</div>
                                  <div className="text-blue-600 text-sm break-all">
                                    {manufacturer.contact.email}
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-blue-600" />
                              </div>
                            </motion.div>

                            {/* Phone */}
                            {manufacturer.contact.phone && (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 cursor-pointer"
                                onClick={() => handleContactClick('phone')}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                    <Phone className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-green-800">Phone</div>
                                    <div className="text-green-600 text-sm">
                                      {manufacturer.contact.phone}
                                    </div>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-green-600" />
                                </div>
                              </motion.div>
                            )}

                            {/* Website */}
                            {manufacturer.contact.website && (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 cursor-pointer"
                                onClick={() => handleContactClick('website')}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                    <Globe className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-purple-800">Website</div>
                                    <div className="text-purple-600 text-sm break-all">
                                      {manufacturer.contact.website}
                                    </div>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-purple-600" />
                                </div>
                              </motion.div>
                            )}

                            {/* Location */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                  <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-orange-800">Location</div>
                                  <div className="text-orange-600 text-sm">
                                    {manufacturer.location}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Quick Contact Actions */}
                          {/* <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-primary" />
                              Quick Actions
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                onClick={() => handleContactClick('email')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                              >
                                <Mail className="h-4 w-4" />
                                Send Email
                              </Button>
                              
                              {manufacturer.contact.phone && (
                                <Button
                                  onClick={() => handleContactClick('phone')}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                >
                                  <Phone className="h-4 w-4" />
                                  Call Now
                                </Button>
                              )}
                              
                              {manufacturer.contact.website && (
                                <Button
                                  onClick={() => handleContactClick('website')}
                                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                                >
                                  <Globe className="h-4 w-4" />
                                  Visit Website
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div> */}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ManufacturerDetails; 