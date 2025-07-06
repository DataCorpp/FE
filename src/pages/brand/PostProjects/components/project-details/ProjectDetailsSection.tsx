import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Edit, Package, Coffee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectDetailsSectionProps {
  title: string;
  icon: "packaging" | "ingredients" | "consultants";
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  items: any[];
  isDarkMode: boolean;
}

const ProjectDetailsSection: React.FC<ProjectDetailsSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  onEdit,
  items,
  isDarkMode,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "packaging":
        return <Package size={20} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />;
      case "ingredients":
        return <Coffee size={20} className={isDarkMode ? "text-green-400" : "text-green-600"} />;
      case "consultants":
        return <Users size={20} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (icon) {
      case "packaging":
        return isDarkMode ? "border-blue-800" : "border-blue-200";
      case "ingredients":
        return isDarkMode ? "border-green-800" : "border-green-200";
      case "consultants":
        return isDarkMode ? "border-purple-800" : "border-purple-200";
      default:
        return isDarkMode ? "border-slate-700" : "border-slate-200";
    }
  };

  const getHeaderBgColor = () => {
    switch (icon) {
      case "packaging":
        return isDarkMode ? "bg-blue-900/30" : "bg-blue-50";
      case "ingredients":
        return isDarkMode ? "bg-green-900/30" : "bg-green-50";
      case "consultants":
        return isDarkMode ? "bg-purple-900/30" : "bg-purple-50";
      default:
        return isDarkMode ? "bg-slate-800" : "bg-gray-50";
    }
  };

  return (
    <div
      className={`mb-6 border rounded-lg overflow-hidden ${getBorderColor()}`}
    >
      <div
        className={`flex justify-between items-center p-4 cursor-pointer ${getHeaderBgColor()}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {renderIcon()}
          <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <span
            className={`text-sm ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            ({items?.length || 0} items)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-black"}
          >
            <Edit size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-black"}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`p-4 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
        >
          {items && items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-3 rounded-md ${
                    isDarkMode
                      ? "bg-slate-700/50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </p>
                      {item.description && (
                        <p
                          className={`mt-1 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {(item.quantity || item.unit) && (
                      <div
                        className={`px-3 py-1 rounded-md text-sm ${
                          isDarkMode
                            ? "bg-slate-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.quantity} {item.unit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No {title.toLowerCase()} items specified yet.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProjectDetailsSection;
