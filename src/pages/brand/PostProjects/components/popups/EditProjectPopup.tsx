import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { foodProductApi } from "../../../../../lib/api";

interface EditProjectPopupProps {
  visible: boolean;
  onClose: () => void;
  editedProject: any;
  setEditedProject: (project: any) => void;
  onSave: () => void;
  isDarkMode: boolean;
}

// Helper icon function (same as Step3)
const getCategoryIcon = (categoryName: string): string => {
  const categoryIcons: Record<string, string> = {
    Dressing: "🥗",
    "Instant Food": "🍜",
    Miso: "🥣",
    Sauce: "🫙",
    "Seasoning Mix": "🧂",
    "Soy Sauce": "🥢",
    Teriyaki: "🍖",
    Ponzu: "🍋",
    Marinade: "🍖",
    Seasoning: "🧂",
    Ramen: "🍜",
    Udon: "🍜",
    Soba: "🍜",
    Noodles: "🍜",
    Rice: "🍚",
    Sake: "🍶",
    Beer: "🍺",
    Wine: "🍷",
    Tea: "🍵",
    Coffee: "☕",
    Juice: "🧃",
    Water: "💧",
    Beverages: "🥤",
    Beverage: "🥤",
    Drink: "🥤",
    Snacks: "🍿",
    Snack: "🍿",
    Dairy: "🥛",
    Milk: "🥛",
    Bakery: "🍞",
    Bread: "🍞",
    Meat: "🥩",
    Seafood: "🐟",
    Fish: "🐟",
    Vegetables: "🥬",
    Vegetable: "🥬",
    Fruits: "🍎",
    Fruit: "🍎",
    Condiments: "🍯",
    Spices: "🌶️",
    Spice: "🌶️",
    Cereals: "🥣",
    Cereal: "🥣",
    Confectionery: "🍬",
    Candy: "🍬",
    Sweet: "🍬",
    Frozen: "🧊",
    Canned: "🥫",
    Organic: "🌱",
    Health: "💚",
    "Baby Food": "🍼",
    "Pet Food": "🐕",
    Chocolate: "🍫",
    Other: "📦",
  };

  const matchedKey = Object.keys(categoryIcons).find((key) =>
    categoryName.toLowerCase().includes(key.toLowerCase())
  );

  return categoryIcons[matchedKey || "Other"];
};

// Animation variants for suggestions dropdown
const suggestionsVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -10, height: 0 },
};

const EditProjectPopup: React.FC<EditProjectPopupProps> = ({
  visible,
  onClose,
  editedProject,
  setEditedProject,
  onSave,
  isDarkMode,
}) => {
  // Local states copied from Step3 format
  const [productSearchQuery, setProductSearchQuery] = useState(
    editedProject?.name || ""
  );
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  // Fetch product suggestions (food types)
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await foodProductApi.getFoodTypes();
        if (
          res.data?.success &&
          res.data?.data &&
          Array.isArray(res.data.data)
        ) {
          const foodTypes = res.data.data;
          const suggestions = foodTypes.map((type: string, index: number) => ({
            id: index + 1000,
            name: type,
            type: "CATEGORY",
          }));
          setProductSuggestions(suggestions);
        }
      } catch {
        setProductSuggestions([]);
      }
    };
    if (visible) {
      loadSuggestions();
    }
  }, [visible]);

  // Filtered suggestions
  const filteredProducts = productSearchQuery.trim()
    ? productSuggestions.filter((p) =>
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
      )
    : productSuggestions;

  const handleProductSelect = (product: any) => {
    setEditedProject({
      ...editedProject,
      name: product.name,
      selectedProduct: {
        id: product.id,
        name: product.name,
        type: product.type || "CATEGORY",
      },
    });
    setProductSearchQuery(product.name);
    setShowProductSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
    onClose();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-5 border-b ${
                isDarkMode ? "border-slate-700" : "border-slate-200"
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Edit Project
              </h3>
              <motion.button
                className="text-gray-400 hover:text-gray-500"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Product Name Search */}
              <div className="relative product-search-container">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Product Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                    value={productSearchQuery}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value);
                      setShowProductSuggestions(true);
                      setEditedProject({ ...editedProject, name: e.target.value });
                    }}
                    onFocus={() => setShowProductSuggestions(true)}
                    placeholder="Search for a product..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={18} />
                  </div>
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showProductSuggestions && filteredProducts.length > 0 && (
                    <motion.div
                      className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border overflow-hidden max-h-60 overflow-y-auto ${
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200"
                      }`}
                      variants={suggestionsVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {filteredProducts.map((product, idx) => (
                        <motion.div
                          key={product.id}
                          className={`px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors ${
                            isDarkMode
                              ? "hover:bg-slate-600 text-slate-200"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                          onClick={() => handleProductSelect(product)}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10">
                            <span className="text-base">
                              {getCategoryIcon(product.name)}
                            </span>
                          </div>
                          <div className="flex-1 text-sm font-medium truncate">
                            {product.name}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                  rows={3}
                  value={editedProject.description || ""}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter project description"
                />
              </div>

              {/* Additional Requirements */}
                <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Additional Requirements
                </label>
                <textarea
                  className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                  rows={2}
                  value={editedProject.additional || ""}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      additional: e.target.value,
                    })
                  }
                  placeholder="Enter any additional requirements..."
                />
              </div>

              {/* Volume & Units */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Volume
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                    value={editedProject.volume || "10K - 50K"}
                    onChange={(e) =>
                      setEditedProject({ ...editedProject, volume: e.target.value })
                    }
                  >
                    {[
                      "1K - 10K",
                      "10K - 50K",
                      "50K - 100K",
                      "100K - 500K",
                      "500K - 1M",
                      "1M - 5M",
                      "5M - 10M",
                      "10M+",
                    ].map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Units
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                    value={editedProject.units || "Units"}
                    onChange={(e) =>
                      setEditedProject({ ...editedProject, units: e.target.value })
                    }
                  >
                    {[
                      "Units",
                      "Pieces",
                      "Cases",
                      "Pallets",
                      "Containers",
                      "Kilograms",
                      "Pounds",
                      "Liters",
                      "Gallons",
                    ].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visibility toggles */}
              <div className="space-y-3">
                {[
                  {
                    key: "hideFromCurrent",
                    label: "Hide project from current manufacturers",
                  },
                  { key: "anonymous", label: "Post project anonymously" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label
                      className={`text-sm ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </label>
                    <motion.div
                      className={`w-11 h-6 rounded-full p-1 cursor-pointer flex items-center transition-colors ${
                        editedProject[item.key]
                          ? "bg-blue-600 justify-end"
                          : "bg-gray-300 justify-start dark:bg-slate-700"
                      }`}
                      onClick={() =>
                        setEditedProject({
                          ...editedProject,
                          [item.key]: !editedProject[item.key],
                        })
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div className="w-4 h-4 bg-white rounded-full" layout />
                    </motion.div>
                  </div>
                ))}
              </div>
              </div>

            {/* Footer */}
            <div
              className={`flex justify-end gap-3 p-5 border-t ${
                isDarkMode ? "border-slate-700" : "border-slate-200"
              }`}
            >
              <motion.button
                type="button"
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                  Cancel
              </motion.button>
              <motion.button
                type="submit"
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Changes
              </motion.button>
              </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectPopup;
