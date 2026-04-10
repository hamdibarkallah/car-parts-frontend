import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderListItem } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<OrderListItem[]> {
    return this.http.get<OrderListItem[]>(`${this.apiUrl}/orders/`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}/`);
  }

  createOrder(): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/`, {});
  }
}
