export interface Part {
  id: number;
  name: string;
  reference: string;
  description?: string;
  price: string;
  quantity: number;
  condition: 'NEW' | 'USED';
  supplier: { id: number; business_name: string; user: { id: number; username: string } };
  supplier_name: string;
  brand: { id: number; name: string };
  brand_name: string;
  model: { id: number; name: string };
  model_name: string;
  model_year: { id: number; year: number };
  model_year_value: number;
  engine?: { id: number; name: string; type: string; horsepower: number } | null;
  engine_name?: string;
  category: { id: number; name: string };
  category_name: string;
  images: PartImage[];
  primary_image?: string;
  is_in_stock: boolean;
  available_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PartImage {
  id: number;
  part: number;
  image: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface PartFilters {
  supplier?: number;
  brand?: number;
  model?: number;
  model_year?: number;
  engine?: number;
  category?: number;
  condition?: 'NEW' | 'USED';
  in_stock?: boolean;
  search?: string;
  page?: number;
  price_min?: number;
  price_max?: number;
}
