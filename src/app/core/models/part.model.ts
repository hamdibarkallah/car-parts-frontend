export interface Part {
  id: number;
  name: string;
  reference: string;
  description?: string;
  price: string;
  quantity: number;
  condition: 'NEW' | 'USED';
  supplier: number;
  supplier_name: string;
  brand: number;
  brand_name: string;
  model: number;
  model_name: string;
  model_year: number;
  model_year_value: number;
  engine?: number;
  engine_name?: string;
  category: number;
  category_name: string;
  images: PartImage[];
  primary_image?: string;
  in_stock: boolean;
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
