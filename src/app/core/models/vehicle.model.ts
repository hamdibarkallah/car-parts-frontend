export interface Brand {
  id: number;
  name: string;
  model_count: number;
  created_at: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  brand: number;
  brand_name: string;
  created_at: string;
}

export interface ModelYear {
  id: number;
  year: number;
  model: number;
  model_name: string;
  brand_name: string;
  created_at: string;
}

export interface Engine {
  id: number;
  name: string;
  type: string;
  horsepower: number;
  model_year: number;
  model_year_display: string;
  created_at: string;
}

export interface UserVehicle {
  id: number;
  nickname: string;
  brand: number;
  model: number;
  model_year: number;
  engine: number | null;
  is_default: boolean;
  brand_detail: { id: number; name: string };
  model_detail: { id: number; name: string };
  model_year_detail: { id: number; year: number };
  engine_detail: { id: number; name: string; type: string; horsepower: number } | null;
  display_name: string;
  created_at: string;
}
