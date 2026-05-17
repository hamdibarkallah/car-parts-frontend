import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Order {
  id: number;
  client: {
    id: number;
    user: {
      username: string;
      email: string;
    };
  };
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  supplier_notes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  part: {
    id: number;
    name: string;
    reference: string;
    price: string;
    primary_image?: string;
  };
  supplier: {
    id: number;
    company_name: string;
  };
  quantity: number;
  price: string;
  total_price: string;
}

export interface CreateOrderRequest {
  // Order is created from cart, no additional data needed
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/`);
  }

  getOrderDetails(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${orderId}/`);
  }

  createOrder(): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/`, {});
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'SUPPLIER_PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'PAID': 'info',
      'SHIPPED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return statusColors[status] || 'secondary';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'SUPPLIER_PENDING': 'En attente de validation',
      'APPROVED': 'Approuvée',
      'REJECTED': 'Rejetée',
      'PAID': 'Payée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return statusTexts[status] || status;
  }

  isPending(status: string): boolean {
    return status === 'SUPPLIER_PENDING';
  }

  isApproved(status: string): boolean {
    return status === 'APPROVED';
  }

  isRejected(status: string): boolean {
    return status === 'REJECTED';
  }

  isCompleted(status: string): boolean {
    return ['PAID', 'SHIPPED', 'DELIVERED'].includes(status);
  }

  canPay(status: string): boolean {
    return status === 'APPROVED';
  }

  canCancel(status: string): boolean {
    return ['SUPPLIER_PENDING', 'APPROVED'].includes(status);
  }
}
