import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsSection from "./ProjectDetailsSection";
import ServiceEditPopup from "../popups/ServiceEditPopup";

interface ProjectDetailsInfoProps {
  projectDetails: any;
  isDarkMode?: boolean;
}

const ProjectDetailsInfo: React.FC<ProjectDetailsInfoProps> = ({ projectDetails, isDarkMode: propIsDarkMode }) => {
  const { theme } = useTheme();
  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : theme === 'dark';
  const { toast } = useToast();
  
  // Section expand states
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Service edit states
  const [packagingEditPopupVisible, setPackagingEditPopupVisible] = useState(false);
  const [ingredientsEditPopupVisible, setIngredientsEditPopupVisible] = useState(false);
  const [consultantsEditPopupVisible, setConsultantsEditPopupVisible] = useState(false);
  const [editedServiceData, setEditedServiceData] = useState<any>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };
  
  const handleEditPackaging = () => {
    setEditedServiceData({
      title: "Packaging",
      items: projectDetails?.packaging || [],
    });
    setPackagingEditPopupVisible(true);
  };
  
  const handleEditIngredients = () => {
    setEditedServiceData({
      title: "Ingredients",
      items: projectDetails?.ingredients || [],
    });
    setIngredientsEditPopupVisible(true);
  };
  
  const handleEditConsultants = () => {
    setEditedServiceData({
      title: "Consultants",
      items: projectDetails?.consultants || [],
    });
    setConsultantsEditPopupVisible(true);
  };
  
  const handleSaveServiceChanges = () => {
    if (!editedServiceData) return;

    try {
      // In a real app, you would update the backend with the changes
      // For now, we'll just show a success toast
      toast({
        title: "Success",
        description: `${editedServiceData.title} updated successfully`,
      });

      // Close all popups
      setPackagingEditPopupVisible(false);
      setIngredientsEditPopupVisible(false);
      setConsultantsEditPopupVisible(false);
    } catch (err) {
      console.error(`Error updating ${editedServiceData.title.toLowerCase()}:`, err);
      toast({
        title: "Error",
        description: `Failed to update ${editedServiceData.title.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Project Requirements */}
      <div className="mb-6">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Project Requirements
        </h2>
        
        <div className={`p-6 rounded-lg border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            {projectDetails?.requirements || "No special requirements specified."}
          </p>
        </div>
      </div>
      
      {/* Packaging Section */}
      <ProjectDetailsSection
        title="Packaging"
        icon="packaging"
        isExpanded={expandedSections.includes("packaging")}
        onToggle={() => toggleSection("packaging")}
        onEdit={handleEditPackaging}
        items={projectDetails?.packaging || []}
        isDarkMode={isDarkMode}
      />
      
      {/* Ingredients Section */}
      <ProjectDetailsSection
        title="Ingredients"
        icon="ingredients"
        isExpanded={expandedSections.includes("ingredients")}
        onToggle={() => toggleSection("ingredients")}
        onEdit={handleEditIngredients}
        items={projectDetails?.ingredients || []}
        isDarkMode={isDarkMode}
      />
      
      {/* Consultants Section */}
      <ProjectDetailsSection
        title="Consultants"
        icon="consultants"
        isExpanded={expandedSections.includes("consultants")}
        onToggle={() => toggleSection("consultants")}
        onEdit={handleEditConsultants}
        items={projectDetails?.consultants || []}
        isDarkMode={isDarkMode}
      />
      
      {/* Service Edit Popups */}
      <ServiceEditPopup
        visible={packagingEditPopupVisible || ingredientsEditPopupVisible || consultantsEditPopupVisible}
        onClose={() => {
          setPackagingEditPopupVisible(false);
          setIngredientsEditPopupVisible(false);
          setConsultantsEditPopupVisible(false);
        }}
        serviceData={editedServiceData}
        setServiceData={setEditedServiceData}
        onSave={handleSaveServiceChanges}
        isDarkMode={isDarkMode}
      />
    </motion.div>
  );
};

export default ProjectDetailsInfo;