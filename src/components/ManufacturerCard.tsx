import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye, MapPin, Calendar, Building, Award, GitCompare } from "lucide-react";
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

interface ManufacturerCardProps {
  manufacturer: Manufacturer;
  onViewDetails: (id: number) => void;
  viewMode?: 'grid' | 'list';
}

// Enhanced animation variants with improved physics and smooth transitions
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 24, 
    scale: 0.94,
    filter: "blur(2px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 22,
      mass: 0.9,
      duration: 0.6
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 20,
      mass: 0.7
    }
  }
};

const imageVariants = {
  hidden: { 
    scale: 1.08, 
    opacity: 0,
    filter: "blur(4px)"
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 25,
      duration: 0.8,
      delay: 0.1
    }
  },
  hover: {
    scale: 1.06,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.4
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.7,
    y: 4
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: 0.2
    }
  },
  hover: {
    scale: 1.08,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 20,
      duration: 0.2
    }
  },
  tap: {
    scale: 0.92,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 25,
      duration: 0.1
    }
  }
};

const badgeVariants = {
  hidden: { 
    opacity: 0, 
    x: -8,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
      delay: 0.15
    }
  }
};

const overlayVariants = {
  hidden: { 
    opacity: 0,
    backdropFilter: "blur(0px)"
  },
  visible: { 
    opacity: 1,
    backdropFilter: "blur(2px)",
    transition: {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const ManufacturerCard: React.FC<ManufacturerCardProps> = ({ 
  manufacturer, 
  onViewDetails,
  viewMode = 'grid'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { favorites, toggleFavorite } = useManufacturerFavorites();
  const { compareItems, toggleCompare } = useManufacturerCompare();

  const isFavorite = favorites.some(fav => fav.id === manufacturer.id);
  const isInCompare = compareItems.some(item => item.id === manufacturer.id);
  const canAddToCompare = compareItems.length < 3;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(manufacturer);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAddToCompare || isInCompare) {
      toggleCompare(manufacturer);
    }
  };

  const handleViewDetails = () => {
    onViewDetails(manufacturer.id);
  };

  // Parse certifications from string to array
  const certifications = manufacturer.certification 
    ? manufacturer.certification.split(';').map(cert => cert.trim()).filter(cert => cert.length > 0)
    : [];

  // Parse industries from string to array if contains multiple values
  const industries = manufacturer.industry 
    ? manufacturer.industry.split(';').map(ind => ind.trim()).filter(ind => ind.length > 0)
    : [];

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group cursor-pointer h-full"
      >
        <Card className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl backdrop-blur-sm">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Image Section - Fixed Height */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 flex-shrink-0">
              <motion.div
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="w-full h-full"
              >
                {!imageError && manufacturer.logo ? (
                  <img
                    src={manufacturer.logo}
                    alt={`${manufacturer.name} logo`}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <Building className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </motion.div>

              {/* Overlay Actions */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center gap-3"
                  >
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        onClick={handleFavoriteClick}
                        className={cn(
                          "rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border-2",
                          isFavorite 
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-400" 
                            : "bg-white/95 hover:bg-white text-gray-700 hover:text-red-500 border-white/40"
                        )}
                      >
                        <Heart className={cn("h-4 w-4 transition-all", isFavorite && "fill-current")} />
                      </Button>
                    </motion.div>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        onClick={handleCompareClick}
                        disabled={!canAddToCompare && !isInCompare}
                        className={cn(
                          "rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border-2",
                          isInCompare 
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-400" 
                            : "bg-white/95 hover:bg-white text-gray-700 hover:text-blue-500 border-white/40",
                          !canAddToCompare && !isInCompare && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <GitCompare className={cn("h-4 w-4 transition-all duration-300", isInCompare && "rotate-45")} />
                      </Button>
                    </motion.div>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        onClick={handleViewDetails}
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm border-2 border-primary/40 hover:border-primary/60 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content Section - Flexible with Fixed Structure */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              {/* Header - Fixed Height */}
              <div className="space-y-2 flex-shrink-0">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3.5rem] flex items-start">
                  {manufacturer.name}
                </h3>
                
                <div className="flex items-center gap-2 text-muted-foreground h-5">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{manufacturer.location}</span>
                </div>
              </div>

              {/* Tags Section - Flexible Height */}
              <div className="space-y-3 flex-1">
                <motion.div variants={badgeVariants} className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1 flex-1">
                    {industries.slice(0, 2).map((industry, index) => (
                      <Badge 
                        key={index}
                        variant="secondary" 
                        className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-xs whitespace-nowrap"
                      >
                        {industry.length > 15 ? `${industry.substring(0, 15)}...` : industry}
                      </Badge>
                    ))}
                    {industries.length > 2 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-gray-100 text-gray-600 rounded-lg text-xs whitespace-nowrap"
                      >
                        +{industries.length - 2}
                      </Badge>
                    )}
                  </div>
                </motion.div>

                {/* Certification Tags */}
                {certifications.length > 0 && (
                  <motion.div variants={badgeVariants} className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {certifications.slice(0, 2).map((cert, index) => (
                        <Badge 
                          key={index}
                          variant="secondary" 
                          className="bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-lg border border-green-200 text-xs whitespace-nowrap"
                        >
                          {cert.length > 12 ? `${cert.substring(0, 12)}...` : cert}
                        </Badge>
                      ))}
                      {certifications.length > 2 && (
                        <Badge 
                          variant="secondary" 
                          className="bg-gray-100 text-gray-600 rounded-lg text-xs whitespace-nowrap"
                        >
                          +{certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Description Preview - Always show if available */}
                {manufacturer.description && (
                  <div className="bg-muted/20 rounded-lg p-3 border-l-2 border-primary/30">
                    <div className="text-xs text-muted-foreground mb-1 font-medium">About</div>
                    <div className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                      {manufacturer.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Section - Fixed at Bottom */}
              <div className="space-y-4 flex-shrink-0 mt-auto pt-4">
                {/* Established Year */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {manufacturer.establishedYear}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="truncate">{new Date().getFullYear() - manufacturer.establishedYear} years exp.</span>
                </div>

                {/* Action Button */}
                <motion.div variants={buttonVariants}>
                  <Button
                    onClick={handleViewDetails}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden bg-gradient-to-r from-card via-card/95 to-card/90 border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-6 p-6">
            {/* Logo */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
              <motion.div 
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="w-full h-full"
              >
                {!imageError && manufacturer.logo ? (
                  <img 
                    src={manufacturer.logo} 
                    alt={`${manufacturer.name} logo`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <Building className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                    {manufacturer.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{manufacturer.location}</span>
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
                        "rounded-full transition-all duration-300",
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
                        "rounded-full transition-all duration-300",
                        isInCompare && "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                      )}
                    >
                      <GitCompare className={cn("h-4 w-4", isInCompare && "rotate-45")} />
                    </Button>
                  </motion.div>
                  
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      size="sm"
                      onClick={handleViewDetails}
                      className="rounded-full bg-primary hover:bg-primary/90"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Details Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <div className="flex flex-wrap gap-1">
                    {industries.slice(0, 2).map((industry, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary rounded-lg text-xs">
                        {industry}
                      </Badge>
                    ))}
                    {industries.length > 2 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-lg text-xs">
                        +{industries.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {certifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <div className="flex gap-1">
                      {certifications.slice(0, 2).map((cert, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 rounded-lg border border-green-200 text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {certifications.length > 2 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-lg text-xs">
                          +{certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {manufacturer.establishedYear}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManufacturerCard;
