export interface CartItem {
  id: number;
  part: number;
  part_detail: {
    id: number;
    name: string;
    reference: string;
    price: string;
    condition: string;
    supplier: string;
    in_stock: boolean;
    available_quantity: number;
  };
  quantity: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
  item_count: number;
  created_at: string;
  updated_at: string;
}
