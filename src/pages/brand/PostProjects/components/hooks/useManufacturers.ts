import { useState, useEffect } from 'react';
import { projectApi } from '../../../../../lib/api';

interface Manufacturer {
  _id: string;
  id: string;
  name: string;
  companyName?: string;
  logo?: string;
  avatar?: string;
  address?: string;
  location?: string;
  matchScore?: number;
  matchDetails?: Record<string, string>;
  industry?: string;
  certificates?: string | string[];
  website?: string;
  email?: string;
  description?: string;
  companyDescription?: string;
  establishYear?: number;
  establish?: number;
  manufacturerSettings?: {
    productionCapacity?: number;
    certifications?: string[];
    preferredCategories?: string[];
    minimumOrderValue?: number;
  };
  status?: 'pending' | 'contacted' | 'responded' | 'rejected';
}

const useManufacturers = (projectId?: number | string) => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch manufacturers
  useEffect(() => {
    if (!projectId) return;

    const fetchManufacturers = async () => {
      setLoading(true);
      try {
        console.log("Fetching manufacturers for project:", projectId);
        
        const normalizedProjectId = String(projectId).trim();
        const response = await projectApi.getProjectManufacturers(normalizedProjectId);
        
        console.log("Raw manufacturers response:", response);
        
        if (response.success && response.data && Array.isArray(response.data.manufacturers)) {
          // Enhance and normalize manufacturer data
          const enhancedManufacturers = response.data.manufacturers.map((manufacturer: any): Manufacturer => {
            // Ensure all manufacturer objects have consistent properties
            return {
              _id: manufacturer._id,
              id: manufacturer._id || manufacturer.id, // Ensure id exists
              name: manufacturer.name || manufacturer.companyName || 'Unknown Manufacturer',
              companyName: manufacturer.companyName || manufacturer.name,
              logo: manufacturer.logo || manufacturer.avatar,
              avatar: manufacturer.avatar,
              address: manufacturer.address,
              location: manufacturer.address, // Use address as location if available
              matchScore: manufacturer.matchScore || 0,
              matchDetails: manufacturer.matchDetails || {},
              industry: manufacturer.industry || 'Food Manufacturing',
              certificates: manufacturer.certificates || manufacturer.manufacturerSettings?.certifications || [],
              website: manufacturer.website || manufacturer.websiteUrl,
              email: manufacturer.email,
              description: manufacturer.description || manufacturer.companyDescription,
              companyDescription: manufacturer.companyDescription || manufacturer.description,
              establishYear: manufacturer.establish || manufacturer.establishYear,
              establish: manufacturer.establish,
              manufacturerSettings: manufacturer.manufacturerSettings || {},
              // Set default status as pending if not specified
              status: 'pending'
            };
          });
          
          // Sort by match score (descending)
          enhancedManufacturers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          
          console.log("Enhanced manufacturers:", enhancedManufacturers);
          setManufacturers(enhancedManufacturers);
        } else {
          console.log("No manufacturers found or invalid response format");
          setManufacturers([]);
        }
      } catch (err) {
        console.error('Error fetching manufacturers:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch manufacturers'));
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, [projectId]);

  // Contact a manufacturer
  const contactManufacturer = async (manufacturerId: string, message: string) => {
    if (!projectId) return null;
    
    try {
      const normalizedProjectId = String(projectId).trim();
      console.log(`Contacting manufacturer ${manufacturerId} for project ${normalizedProjectId}`);
      
      const response = await projectApi.contactManufacturer(normalizedProjectId, manufacturerId, { message });
      console.log("Contact manufacturer response:", response);
      
      if (response && response.success) {
        // Update the local state with the new status
        setManufacturers(prevManufacturers => 
          prevManufacturers.map(manu => 
            manu.id === manufacturerId ? { ...manu, status: 'contacted' as const } : manu
          )
        );
        
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to contact manufacturer');
      }
    } catch (err) {
      console.error('Error contacting manufacturer:', err);
      throw err;
    }
  };

  // Get match quality label based on score
  const getMatchQualityLabel = (score?: number) => {
    if (!score && score !== 0) return 'Unknown';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Very Good Match';
    if (score >= 60) return 'Good Match';
    if (score >= 50) return 'Moderate Match';
    if (score >= 40) return 'Fair Match';
    return 'Basic Match';
  };

  // Get match quality color based on score
  const getMatchQualityColor = (score?: number, isDark = false) => {
    if (!score && score !== 0) return isDark ? 'text-gray-400' : 'text-gray-500';
    if (score >= 80) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 70) return isDark ? 'text-green-400' : 'text-green-500';
    if (score >= 60) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 50) return isDark ? 'text-blue-400' : 'text-blue-500';
    if (score >= 40) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  return {
    manufacturers,
    loading,
    error,
    contactManufacturer,
    getMatchQualityLabel,
    getMatchQualityColor
  };
};

export default useManufacturers;
