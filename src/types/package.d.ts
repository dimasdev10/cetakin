import type { Package, PackageField, FieldType } from "@prisma/client";

export type PackageWithFields = Package & {
  requiredFields: PackageField[];
};

export interface PackageFieldConfig {
  id?: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired: boolean;
  options: string[];
  order: number;
}

export interface PackageFormData {
  name: string;
  image: string;
  description: string;
  price: number;
  requiredFields: PackageFieldConfig[];
}

// Type untuk error handling
export type PackageFieldErrors = {
  fieldName?: { message: string };
  fieldLabel?: { message: string };
  fieldType?: { message: string };
  isRequired?: { message: string };
  options?: { message: string };
  order?: { message: string };
};
