import type { Control, UseFormSetValue } from "react-hook-form";

export interface PalettierType {
  id: number;
  name: string;
  description?: string;
}

export interface PalettierFormData {
  name: string;
  typeId: number | "";
  isNewType: boolean;
  newTypeName: string;
  width: number;
  depth: number;
  height: number;
}

export interface FormData {
  palettiers: PalettierFormData[];
}

export interface CreatePalettierPayload {
  name: string;
  typeId: number;
  width: number;
  depth: number;
  height: number;
}

export interface PalettierFormCardProps {
  index: number;
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  palettierTypes: PalettierType[];
  onAddNewType: (index: number) => Promise<void>;
}

export const createDefaultPalettier = (
  defaultTypeId: number | ""
): PalettierFormData => ({
  name: "",
  typeId: defaultTypeId,
  isNewType: false,
  newTypeName: "",
  width: 1,
  depth: 1,
  height: 1,
});
