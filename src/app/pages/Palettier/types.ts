import type { Control, UseFormSetValue } from "react-hook-form";

export interface PalettierType {
  id: number;
  name: string;
  description?: string;
}

export interface PalettierResponse {
  id: number;
  name: string;
  palettierTypeId: number | null;
  width: number;
  depth: number;
  height: number;
  totalCapacity: number;
  paletteCount: number;
  occupiedPositions: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaletteCountResponse {
  paletteCount: number;
  occupiedPositions: number;
}

export interface PalettierWizardFormData {
  name: string;
  typeId: number | "";
  isNewType: boolean;
  newTypeName: string;
  width: number;
  depth: number;
  height: number;
}

export interface CreatePalettierPayload {
  name: string;
  typeId?: number;
  newTypeName?: string;
  width: number;
  depth: number;
  height: number;
}

export interface UpdatePalettierPayload {
  name?: string;
  palettierTypeId?: number | null;
  width?: number;
  depth?: number;
  height?: number;
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

export const getTypeName = (
  palettierTypeId: number | null | "",
  palettierTypes: PalettierType[]
): string => {
  if (palettierTypeId === null || palettierTypeId === "") return "\u2014";
  const type = palettierTypes.find((t) => t.id === palettierTypeId);
  return type?.name ?? "\u2014";
};

export const WIZARD_DEFAULT_VALUES: PalettierWizardFormData = {
  name: "",
  typeId: "",
  isNewType: false,
  newTypeName: "",
  width: 1,
  depth: 1,
  height: 1,
};
