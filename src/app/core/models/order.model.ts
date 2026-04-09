export interface OrderItem {
  id: number;
  part: number;
  part_detail: {
    id: number;
    name: string;
    reference: string;
  };
  supplier: number;
  supplier_detail: {
    id: number;
    business_name: string;
  };
  quantity: number;
  price: string;
  total_price: string;
}

export interface Order {
  id: number;
  client: number;
  client_username: string;
  total_price: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderListItem {
  id: number;
  client_username: string;
  total_price: string;
  status: string;
  item_count: number;
  created_at: string;
}
