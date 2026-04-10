import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="space-y-6 animate-pulse">
          <div class="skeleton h-6 w-48"></div>
          <div class="card p-6 space-y-4">
            <div class="skeleton h-5 w-1/3"></div>
            <div class="skeleton h-4 w-1/2"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
          </div>
        </div>
      } @else if (order()) {
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-primary-400 mb-6">
          <a routerLink="/orders" class="hover:text-accent transition-colors">{{ 'ORDERS.TITLE' | translate }}</a>
          <span>/</span>
          <span class="text-primary-200">{{ 'ORDERS.ORDER' | translate }} #{{ order()!.id }}</span>
        </nav>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-primary-50 tracking-tight">{{ 'ORDERS.ORDER' | translate }} #{{ order()!.id }}</h1>
            <p class="text-sm text-primary-400 mt-1">Placed on {{ order()!.created_at | date:'fullDate' }}</p>
          </div>
          <span [ngClass]="{
            'badge-pending': order()!.status === 'PENDING',
            'badge-paid': order()!.status === 'PAID',
            'badge-in-stock': order()!.status === 'DELIVERED',
            'badge-out-of-stock': order()!.status === 'CANCELLED'
          }" class="text-sm px-4 py-1.5">
            {{ order()!.status }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items -->
          <div class="lg:col-span-2 space-y-4">
            <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">{{ 'ORDERS.ITEMS' | translate }}</h3>
            @for (item of order()!.items; track item.id) {
              <div class="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                  <a [routerLink]="['/parts', item.part]"
                     class="font-semibold text-primary-100 hover:text-accent transition-colors">
                    {{ item.part_detail.name }}
                  </a>
                  <p class="text-xs text-primary-400 font-mono">{{ item.part_detail.reference }}</p>
                  <p class="text-xs text-primary-400">Sold by {{ item.supplier_detail.business_name }}</p>
                </div>
                <div class="text-right space-y-1">
                  <p class="text-sm text-primary-300">
                    {{ item.quantity }} x <span class="font-mono">{{ item.price }} TND</span>
                  </p>
                  <p class="text-lg font-bold text-accent font-mono">{{ item.total_price }} TND</p>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24 space-y-4">
              <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }}</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-primary-300">
                  <span>Items</span>
                  <span>{{ order()!.items.length }}</span>
                </div>
                <div class="flex justify-between text-primary-300">
                  <span>Shipping</span>
                  <span class="text-success">Free</span>
                </div>
                <div class="border-t border-primary-700 pt-3 flex justify-between">
                  <span class="font-semibold text-primary-100">{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-xl font-bold text-accent font-mono">{{ order()!.total_price }} TND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
