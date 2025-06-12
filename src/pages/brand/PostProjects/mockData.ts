// Mock data for Post Project UI

export const supplierTypes = [
  { id: 1, name: "Manufacturer" },
  { id: 2, name: "Packaging Supplier" },
  { id: 3, name: "Ingredient Supplier" },
  { id: 4, name: "Secondary Packager" },
  { id: 5, name: "Packaging Services" },
];

export const productCategories = [
  { id: 1, name: "Protein Bar", type: "CATEGORY" as const },
  { id: 2, name: "Chocolate Bar", type: "CATEGORY" as const },
  { id: 3, name: "Powder Supplements", type: "CATEGORY" as const },
  { id: 4, name: "Monster Energy Drink, 16 Fl Oz", type: "PRODUCT" as const },
  { id: 5, name: "Coca-Cola Soda, 591 Ml", type: "PRODUCT" as const },
];

export const projects = [
  {
    id: 1,
    name: "Chocolate Bar",
    created: "2025-06-05",
    status: "in_review",
    details: "Keep an eye out – we may email you for additional project details",
    suppliers: [],
    volume: "10K - 50K",
    units: "Units",
    description: "Organic dark chocolate bar with sea salt and almond pieces.",
    anonymous: false
  },
  {
    id: 2,
    name: "Regular Cola",
    created: "2025-01-28",
    status: "closed",
    details: "You indicated that you're not looking for a manufacturer yet...",
    suppliers: [],
    volume: "50K - 100K",
    units: "Liters",
    description: "Classic cola beverage.",
    anonymous: false
  },
  {
    id: 3,
    name: "Chocolate Bar",
    created: "2024-12-04",
    status: "closed",
    details: "You indicated that you're not looking for a manufacturer yet...",
    suppliers: [],
    volume: "1K - 10K",
    units: "Units",
    description: "Limited edition chocolate bar.",
    anonymous: true
  },
  {
    id: 4,
    name: "White Sandwich Bread",
    created: "2024-11-22",
    status: "closed",
    details: "You indicated that you're not looking for a manufacturer yet...",
    suppliers: [],
    volume: "100K+",
    units: "Pieces",
    description: "Soft white sandwich bread.",
    anonymous: false
  },
  {
    id: 5,
    name: "Paper Bag",
    created: "2024-11-22",
    status: "info_required",
    details: "Please check your email – our team has requested additional project details",
    suppliers: [],
    volume: "10K - 50K",
    units: "Pieces",
    description: "Eco-friendly paper bag for packaging.",
    anonymous: false
  },
];
