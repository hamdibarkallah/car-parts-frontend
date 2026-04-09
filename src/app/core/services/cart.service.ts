import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = environment.apiUrl;
  private cartData = signal<Cart | null>(null);

  readonly cart = this.cartData.asReadonly();
  readonly itemCount = computed(() => this.cartData()?.item_count ?? 0);
  readonly total = computed(() => this.cartData()?.total ?? '0');

  constructor(private http: HttpClient) {}

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart/`).pipe(
      tap(cart => this.cartData.set(cart))
    );
  }

  addItem(partId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/cart/add/`, { part_id: partId, quantity }).pipe(
      tap(cart => this.cartData.set(cart))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/cart/items/${itemId}/`, { quantity }).pipe(
      tap(cart => this.cartData.set(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/cart/items/${itemId}/`).pipe(
      tap(cart => this.cartData.set(cart))
    );
  }

  clearLocalCart(): void {
    this.cartData.set(null);
  }
}
