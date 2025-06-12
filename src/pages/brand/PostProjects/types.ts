export type ProductCategory = {
  id: number;
  name: string;
  type: "CATEGORY" | "PRODUCT";
};

export type SupplierType = {
  id: number;
  name: string;
};

export type Project = {
  id: number;
  name: string;
  created: string;
  status: "in_review" | "closed" | "info_required";
  details: string;
  suppliers: any[];
  supplierType?: SupplierType;
};
