import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderListItem } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-supplier-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <nav class="flex items-center gap-2 text-sm text-primary-400 mb-2">
        <a routerLink="/supplier" class="hover:text-accent transition-colors">Dashboard</a>
        <span>/</span>
        <span class="text-primary-200">Incoming Orders</span>
      </nav>
      <h1 class="text-2xl font-bold text-primary-50 tracking-tight mb-2">Incoming Orders</h1>
      <p class="text-sm text-primary-400 mb-8">Orders that contain your parts</p>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 space-y-3">
              <div class="skeleton h-5 w-32"></div>
              <div class="skeleton h-4 w-48"></div>
              <div class="skeleton h-4 w-24"></div>
            </div>
          }
        </div>
      } @else if (orders().length === 0) {
        <app-empty-state
          icon="📦"
          title="No orders yet"
          description="When customers order your parts, they'll appear here.">
        </app-empty-state>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="card p-5 hover:border-primary-600 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="font-semibold text-primary-100">Order #{{ order.id }}</h3>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                  <p class="text-xs text-primary-400 mt-1">
                    {{ order.created_at | date:'medium' }} · {{ order.client_username }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-accent font-mono">{{ order.total_price }} TND</p>
                  <p class="text-xs text-primary-400">{{ order.item_count }} item(s)</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SupplierOrdersComponent implements OnInit {
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-warning/10 text-warning';
      case 'CONFIRMED': return 'bg-accent/10 text-accent';
      case 'SHIPPED': return 'bg-info/10 text-info';
      case 'DELIVERED': return 'bg-success/10 text-success';
      case 'CANCELLED': return 'bg-danger/10 text-danger';
      default: return 'bg-primary-700 text-primary-400';
    }
  }
}
