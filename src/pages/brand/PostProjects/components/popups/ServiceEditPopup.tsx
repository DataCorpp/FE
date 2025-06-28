import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
}

interface ServiceEditPopupProps {
  visible: boolean;
  onClose: () => void;
  serviceData: any;
  setServiceData: (data: any) => void;
  onSave: () => void;
  isDarkMode: boolean;
}

const ServiceEditPopup: React.FC<ServiceEditPopupProps> = ({
  visible,
  onClose,
  serviceData,
  setServiceData,
  onSave,
  isDarkMode,
}) => {
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ name: "", description: "" });

  if (!visible || !serviceData) return null;

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const updatedItems = [
      ...serviceData.items,
      {
        ...newItem,
        id: `item-${Date.now()}`, // Generate a temporary ID
      },
    ];
    
    setServiceData({
      ...serviceData,
      items: updatedItems,
    });
    
    // Reset the new item form
    setNewItem({ name: "", description: "" });
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = serviceData.items.filter((item: ServiceItem) => item.id !== id);
    setServiceData({
      ...serviceData,
      items: updatedItems,
    });
  };

  const handleUpdateItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = serviceData.items.map((item: ServiceItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    
    setServiceData({
      ...serviceData,
      items: updatedItems,
    });
  };

  const handleNewItemChange = (field: keyof ServiceItem, value: string | number) => {
    setNewItem({
      ...newItem,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-3xl rounded-xl p-6 my-8 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Edit {serviceData.title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-black"}
              >
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Current {serviceData.title} Items
                </h3>
                
                <div className="space-y-4">
                  {serviceData.items && serviceData.items.length > 0 ? (
                    serviceData.items.map((item: ServiceItem) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-lg border ${
                          isDarkMode 
                            ? "bg-slate-700/50 border-slate-600" 
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              <div className="md:col-span-5">
                                <Label
                                  htmlFor={`name-${item.id}`}
                                  className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                                >
                                  Name
                                </Label>
                                <Input
                                  id={`name-${item.id}`}
                                  value={item.name || ""}
                                  onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                                  className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label
                                  htmlFor={`quantity-${item.id}`}
                                  className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                                >
                                  Quantity
                                </Label>
                                <Input
                                  id={`quantity-${item.id}`}
                                  type="number"
                                  value={item.quantity || ""}
                                  onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                                  className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label
                                  htmlFor={`unit-${item.id}`}
                                  className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                                >
                                  Unit
                                </Label>
                                <Input
                                  id={`unit-${item.id}`}
                                  value={item.unit || ""}
                                  onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                                  className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                                />
                              </div>
                              
                              <div className="md:col-span-3 flex items-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className={`p-2 ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"}`}
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <Label
                                htmlFor={`desc-${item.id}`}
                                className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                              >
                                Description
                              </Label>
                              <Textarea
                                id={`desc-${item.id}`}
                                value={item.description || ""}
                                onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                                className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No items added yet. Use the form below to add items.
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`p-5 rounded-lg border mt-8 ${
                isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
              }`}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Add New Item
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <Label
                      htmlFor="new-name"
                      className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Name
                    </Label>
                    <Input
                      id="new-name"
                      value={newItem.name || ""}
                      onChange={(e) => handleNewItemChange("name", e.target.value)}
                      className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="new-quantity"
                      className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Quantity
                    </Label>
                    <Input
                      id="new-quantity"
                      type="number"
                      value={newItem.quantity || ""}
                      onChange={(e) => handleNewItemChange("quantity", e.target.value)}
                      className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="new-unit"
                      className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Unit
                    </Label>
                    <Input
                      id="new-unit"
                      value={newItem.unit || ""}
                      onChange={(e) => handleNewItemChange("unit", e.target.value)}
                      className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                    />
                  </div>
                  
                  <div className="md:col-span-3 flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-1 w-full"
                      onClick={handleAddItem}
                      disabled={!newItem.name}
                    >
                      <Plus size={16} /> Add Item
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Label
                    htmlFor="new-desc"
                    className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Description
                  </Label>
                  <Textarea
                    id="new-desc"
                    value={newItem.description || ""}
                    onChange={(e) => handleNewItemChange("description", e.target.value)}
                    className={isDarkMode ? "bg-slate-600 border-slate-500 text-white" : ""}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceEditPopup;
