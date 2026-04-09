import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderListItem } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-primary-50 tracking-tight mb-8">My Orders</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 flex justify-between">
              <div class="space-y-2">
                <div class="skeleton h-4 w-32"></div>
                <div class="skeleton h-3 w-48"></div>
              </div>
              <div class="skeleton h-8 w-20"></div>
            </div>
          }
        </div>
      } @else if (orders().length === 0) {
        <app-empty-state
          icon="📋"
          title="No orders yet"
          description="Your order history will appear here after you place your first order.">
          <a routerLink="/parts" class="btn-primary mt-6">Browse Parts</a>
        </app-empty-state>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <a [routerLink]="['/orders', order.id]"
               class="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 block">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-primary-100">Order #{{ order.id }}</span>
                  <span [ngClass]="{
                    'badge-pending': order.status === 'PENDING',
                    'badge-paid': order.status === 'PAID',
                    'badge-in-stock': order.status === 'DELIVERED',
                    'badge-out-of-stock': order.status === 'CANCELLED'
                  }">
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-sm text-primary-400">
                  {{ order.item_count }} item{{ order.item_count > 1 ? 's' : '' }}
                  · {{ order.created_at | date:'mediumDate' }}
                </p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-xl font-bold text-accent font-mono">{{ order.total_price }} TND</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-500" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class OrderListComponent implements OnInit {
  orders = signal<OrderListItem[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
