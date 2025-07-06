import { useState, useEffect } from 'react';
import { useToast } from '../../../../../hooks/use-toast';
import { projectApi, Project, ProjectData } from '../../../../../lib/api';
import useManufacturers from './useManufacturers';
import type { ProductCategory, SupplierType } from '../../types';

interface ProjectDetails {
  id: string | number;
  name: string;
  description: string;
  created: string;
  status: 'draft' | 'active' | 'in_review' | 'paused' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high';
  volume: string;
  volumeUnit: string;
  units?: string;
  productCategory?: ProductCategory;
  supplierType?: SupplierType;
  timeline?: string;
  budget?: number;
  budgetCurrency?: string;
  requirements?: string;
  additional?: string;
  packaging?: string[];
  packagingObjects?: Array<{ id: number; name: string; material: string }>;
  ingredients?: any[];
  consultants?: any[];
  allergen?: string[];
  certification?: string[];
  location?: string[];
  anonymous?: boolean;
  hideFromCurrent?: boolean;
}

const useProjectDetails = (
  projectId?: number | string,
  selectedProduct?: ProductCategory | null,
  selectedSupplierType?: SupplierType | null,
  initialData?: any
) => {
  const { toast } = useToast();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [editedProject, setEditedProject] = useState<Partial<ProjectDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>('active');

  // Debug logs
  console.log("useProjectDetails Hook - ProjectId:", projectId);
  console.log("useProjectDetails Hook - ProjectId Type:", typeof projectId);
  console.log("useProjectDetails Hook - InitialData:", initialData);
  console.log("useProjectDetails Hook - SelectedProduct:", selectedProduct);

  // Xử lý projectId để đảm bảo đúng định dạng khi gọi API
  const normalizedProjectId = projectId ? String(projectId).trim() : undefined;

  // Use manufacturers hook to get manufacturers data
  const { manufacturers, loading: manufacturersLoading } = useManufacturers(normalizedProjectId);

  // Fetch project details
  useEffect(() => {
    if (!normalizedProjectId) {
      console.log("No projectId provided, using initialData if available");
      // If we're coming from previous steps with initialData, use that
      if (initialData && selectedProduct) {
        console.log("Using initialData:", initialData);
        const projectData = {
          ...initialData,
          productCategory: selectedProduct,
          supplierType: selectedSupplierType,
        };
        setProjectDetails(projectData);
        setEditedProject(projectData);
      }
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching project details for ID:", normalizedProjectId);
        
        // Check if projectId looks like a MongoDB ObjectId
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(normalizedProjectId);
        
        if (!isMongoId) {
          console.log("ProjectId doesn't look like a valid MongoDB ObjectId");
          throw new Error("Invalid project ID format");
        }
        
        // Try to fetch the project directly by ID
        try {
          console.log("Attempting to fetch with getProjectById");
          const response = await projectApi.getProjectById(normalizedProjectId);
          console.log("getProjectById response:", response);
          
          if (response?.success && response?.data?.project) {
            const projectData = response.data.project;
            console.log("Found project data:", projectData);
            
            const formattedData: ProjectDetails = {
              id: projectData._id,
              name: projectData.name,
              description: projectData.description,
              created: projectData.createdAt,
              status: projectData.status,
              priority: 'medium',
              volume: projectData.volume,
              volumeUnit: projectData.units,
              productCategory: projectData.selectedProduct as unknown as ProductCategory,
              supplierType: projectData.selectedSupplierType as unknown as SupplierType,
              timeline: projectData.timeline ? JSON.stringify(projectData.timeline) : undefined,
              requirements: projectData.additional,
              packaging: projectData.packaging,
            };
            
            console.log("Formatted project data:", formattedData);
            setProjectDetails(formattedData);
            setEditedProject(formattedData);
            setProjectStatus(projectData.status);
            setLoading(false);
            return; // Success - exit early
          }
        } catch (directError) {
          console.error("Error with direct getProjectById:", directError);
        }
        
        // Fallback: Try to find the project in the projects list
        console.log("Attempting to fetch with getProjects as fallback");
        const projectsResponse = await projectApi.getProjects();
        
        if (projectsResponse?.success && projectsResponse?.data?.projects) {
          const foundProject = projectsResponse.data.projects.find(
            p => p._id === normalizedProjectId || p._id.toString() === normalizedProjectId
          );
          
          if (foundProject) {
            console.log("Found project in projects list:", foundProject);
            const formattedData: ProjectDetails = {
              id: foundProject._id,
              name: foundProject.name,
              description: foundProject.description,
              created: foundProject.createdAt,
              status: foundProject.status,
              priority: 'medium',
              volume: foundProject.volume,
              volumeUnit: foundProject.units,
              productCategory: foundProject.selectedProduct as unknown as ProductCategory,
              supplierType: foundProject.selectedSupplierType as unknown as SupplierType,
              timeline: foundProject.timeline ? JSON.stringify(foundProject.timeline) : undefined,
              requirements: foundProject.additional,
              packaging: foundProject.packaging,
            };
            
            setProjectDetails(formattedData);
            setEditedProject(formattedData);
            setProjectStatus(foundProject.status);
            setLoading(false);
            return; // Success - exit early
          }
        }
        
        // If we get here, no project was found
        console.error("No project data found for ID:", normalizedProjectId);
        setError(new Error('Project not found'));
        toast({
          title: 'Error',
          description: 'Project not found. The ID may be invalid.',
          variant: 'destructive',
        });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project details';
        console.error('Error fetching project details:', errorMessage, err);
        setError(err instanceof Error ? err : new Error('Failed to fetch project details'));
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [normalizedProjectId, selectedProduct, selectedSupplierType, initialData, toast]);

  // Edit project handler
  const handleEditProject = () => {
    console.log("useProjectDetails: handleEditProject called");
    setEditedProject(projectDetails || {});
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    console.log("useProjectDetails: handleSaveChanges called with", editedProject);
    if (!editedProject || !normalizedProjectId) return;

    try {
      const projectDataToUpdate: Partial<ProjectData> = {
        name: editedProject.name,
        description: editedProject.description,
        volume: String(editedProject.volume),
        units: editedProject.volumeUnit || editedProject.units,
        additional: editedProject.requirements || editedProject.additional,
        // Add packaging, allergen, and certification fields
        packaging: Array.isArray(editedProject.packaging) ? editedProject.packaging : [],
        packagingObjects: Array.isArray(editedProject.packagingObjects) ? editedProject.packagingObjects : [],
        location: Array.isArray(editedProject.location) ? editedProject.location : ["Global"],
        allergen: Array.isArray(editedProject.allergen) ? editedProject.allergen : [],
        certification: Array.isArray(editedProject.certification) ? editedProject.certification : [],
        // Include visibility settings
        anonymous: Boolean(editedProject.anonymous),
        hideFromCurrent: Boolean(editedProject.hideFromCurrent),
      };
      
      console.log("Updating project with data:", projectDataToUpdate);
      const response = await projectApi.updateProject(normalizedProjectId, projectDataToUpdate);
      console.log("Update project response:", response);
      
      if (response.success && response.data && response.data.project) {
        const updatedProject = response.data.project;
        const formattedData: ProjectDetails = {
          id: updatedProject._id,
          name: updatedProject.name,
          description: updatedProject.description,
          created: updatedProject.createdAt,
          status: updatedProject.status,
          priority: 'medium',
          volume: updatedProject.volume,
          volumeUnit: updatedProject.units,
          productCategory: updatedProject.selectedProduct as unknown as ProductCategory,
          supplierType: updatedProject.selectedSupplierType as unknown as SupplierType,
          timeline: updatedProject.timeline ? JSON.stringify(updatedProject.timeline) : undefined,
          requirements: updatedProject.additional,
          packaging: updatedProject.packaging,
          packagingObjects: updatedProject.packagingObjects,
          allergen: updatedProject.allergen,
          certification: updatedProject.certification,
          anonymous: updatedProject.anonymous,
          hideFromCurrent: updatedProject.hideFromCurrent,
          location: updatedProject.location
        };
        setProjectDetails(formattedData);
        setProjectStatus(updatedProject.status);
      }
      
      toast({
        title: 'Success',
        description: 'Project details updated successfully',
      });
    } catch (err) {
      console.error("Error saving project changes:", err);
      toast({
        title: 'Error',
        description: 'Failed to update project details',
        variant: 'destructive',
      });
    }
  };

  // Pause project handlers
  const handlePauseProject = () => {
    console.log("useProjectDetails: handlePauseProject called");
    // This function prepares the project for pausing but does not execute the API call
  };

  const handleConfirmPause = async () => {
    console.log("useProjectDetails: handleConfirmPause called");
    if (!normalizedProjectId) return;

    try {
      console.log("Pausing project with ID:", normalizedProjectId);
      const response = await projectApi.updateProjectStatus(normalizedProjectId, 'paused');
      console.log("Pause project response:", response);
      
      if (response.success) {
        console.log("Project paused successfully, updating state");
        setProjectDetails(prev => prev ? { ...prev, status: 'paused' } : null);
        setProjectStatus('paused');
        toast({
          title: 'Success',
          description: 'Project paused successfully',
        });
      } else {
        throw new Error(response.message || "API returned success: false");
      }
    } catch (err) {
      console.error('Error pausing project:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to pause project: Unknown error';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Cancel project handlers
  const handleCancelProject = () => {
    console.log("useProjectDetails: handleCancelProject called");
    // This function prepares the project for cancellation but does not execute the API call
  };

  const handleConfirmCancel = async () => {
    console.log("useProjectDetails: handleConfirmCancel called");
    if (!normalizedProjectId) return;

    try {
      console.log("Cancelling project with ID:", normalizedProjectId);
      const response = await projectApi.updateProjectStatus(normalizedProjectId, 'cancelled');
      console.log("Cancel project response:", response);
      
      if (response.success) {
        console.log("Project cancelled successfully, updating state");
        setProjectDetails(prev => prev ? { ...prev, status: 'cancelled' } : null);
        setProjectStatus('cancelled');
        toast({
          title: 'Success',
          description: 'Project cancelled successfully',
        });
      } else {
        throw new Error(response.message || "API returned success: false");
      }
    } catch (err) {
      console.error('Error cancelling project:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to cancel project: Unknown error';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Resume project handler
  const handleResumeProject = async () => {
    console.log("useProjectDetails: handleResumeProject called");
    if (!normalizedProjectId) return;

    try {
      console.log("Resuming project with ID:", normalizedProjectId);
      const response = await projectApi.updateProjectStatus(normalizedProjectId, 'active');
      console.log("Resume project response:", response);
      
      if (response.success) {
        console.log("Project resumed successfully, updating state");
        setProjectDetails(prev => prev ? { ...prev, status: 'active' } : null);
        setProjectStatus('active');
        toast({
          title: 'Success',
          description: 'Project resumed successfully',
        });
      } else {
        throw new Error(response.message || "API returned success: false");
      }
    } catch (err) {
      console.error('Error resuming project:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to resume project: Unknown error';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return {
    projectDetails,
    loading: loading || manufacturersLoading,
    error,
    editedProject,
    setEditedProject,
    manufacturers,
    projectStatus,
    handleEditProject,
    handleSaveChanges,
    handlePauseProject,
    handleCancelProject,
    handleConfirmPause,
    handleConfirmCancel,
    handleResumeProject,
  };
};

export default useProjectDetails;
