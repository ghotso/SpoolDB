export interface Material {
  id: number;
  name: string;
  is_custom: boolean;
}

export interface Color {
  id: number;
  name: string;
  hex: string | null;
  is_custom: boolean;
}

export interface Template {
  id: number;
  name: string;
  material_id: number;
  manufacturer: string | null;
  starting_weight_g: number;
  empty_weight_g: number | null;
  notes: string | null;
  material?: Material;
}

export interface Filament {
  id: number;
  name: string;
  material_id: number;
  color_id: number;
  manufacturer: string | null;
  template_id: number | null;
  archived: boolean;
  notes: string | null;
  created_at: string;
  material?: Material;
  color?: Color;
  template?: Template;
  remaining_weight_g?: number; // Calculated: sum of all non-archived spools
  spools?: Spool[]; // Child spools
}

export interface Spool {
  id: number;
  filament_id: number;
  starting_weight_g: number;
  empty_weight_g: number | null;
  weight_g: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  filament?: Filament;
}

export interface ConsumptionEntry {
  id: number;
  filament_id: number;
  amount_g: number;
  amount_m: number | null;
  print_name: string | null;
  type: 'success' | 'failed' | 'test' | 'manual';
  notes: string | null;
  created_at: string;
  filament?: Filament;
}

export type ConsumptionType = 'success' | 'failed' | 'test' | 'manual';

export interface CreateMaterialInput {
  name: string;
}

export interface CreateColorInput {
  name: string;
  hex?: string | null;
}

export interface CreateTemplateInput {
  name: string;
  material_id: number;
  manufacturer?: string | null;
  starting_weight_g: number;
  empty_weight_g?: number | null;
  notes?: string | null;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  id: number;
}

export interface CreateFilamentInput {
  name: string;
  material_id: number;
  color_id: number;
  manufacturer?: string | null;
  template_id?: number | null;
  notes?: string | null;
  // When creating a filament, also create initial spool with these weights
  starting_weight_g?: number;
  empty_weight_g?: number | null;
}

export interface UpdateFilamentInput extends Partial<CreateFilamentInput> {
  id: number;
  archived?: boolean;
}

export interface CreateSpoolInput {
  filament_id: number;
  starting_weight_g: number;
  empty_weight_g?: number | null;
  weight_g: number;
}

export interface UpdateSpoolInput {
  id: number;
  starting_weight_g?: number;
  empty_weight_g?: number | null;
  weight_g?: number;
  archived?: boolean;
}

export interface CreateConsumptionInput {
  filament_id: number;
  amount_g: number;
  amount_m?: number | null;
  print_name?: string | null;
  type: ConsumptionType;
  notes?: string | null;
}

export interface UpdateConsumptionInput extends Partial<CreateConsumptionInput> {
  id: number;
}

export interface RestockFilamentInput {
  id: number;
  quantity: number; // Number of spools to create
  weight_per_spool_g: number; // Weight per spool
  empty_weight_g?: number | null; // Empty weight (optional, same for all spools)
}

export interface Setting {
  key: string;
  value: string;
}

export interface Notification {
  id: number;
  filament_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  filament?: Filament;
}

