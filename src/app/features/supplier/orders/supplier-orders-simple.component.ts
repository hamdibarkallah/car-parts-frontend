import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupplierOrdersService, Order, OrderStats, OrderValidationRequest } from '../../../core/services/supplier-orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-orders-simple',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">📦 Mes Commandes Fournisseur</h1>
          <p class="text-sm text-primary-400 mt-1">{{ totalCount() }} commandes à traiter</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Total</p>
              <p class="text-2xl font-bold text-primary-50">{{ stats().total_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center">
              <span class="text-xl">📊</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">En attente</p>
              <p class="text-2xl font-bold text-warning">{{ stats().pending_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <span class="text-xl">⏰</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Approuvées</p>
              <p class="text-2xl font-bold text-success">{{ stats().approved_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <span class="text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Rejetées</p>
              <p class="text-2xl font-bold text-danger">{{ stats().rejected_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-danger/20 flex items-center justify-center">
              <span class="text-xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex space-x-1 mb-6">
        <button (click)="selectedStatus.set('')" 
                [class]="selectedStatus() === '' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Toutes ({{ totalCount() }})
        </button>
        <button (click)="selectedStatus.set('SUPPLIER_PENDING')" 
                [class]="selectedStatus() === 'SUPPLIER_PENDING' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          En attente ({{ stats().pending_orders }})
        </button>
        <button (click)="selectedStatus.set('APPROVED')" 
                [class]="selectedStatus() === 'APPROVED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Approuvées ({{ stats().approved_orders }})
        </button>
        <button (click)="selectedStatus.set('REJECTED')" 
                [class]="selectedStatus() === 'REJECTED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Rejetées ({{ stats().rejected_orders }})
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-4 flex items-center gap-4">
              <div class="skeleton w-16 h-16 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton h-4 w-1/3"></div>
                <div class="skeleton h-3 w-1/4"></div>
              </div>
              <div class="skeleton h-8 w-20"></div>
            </div>
          }
        </div>
      } @else if (filteredOrders().length === 0) {
        <app-empty-state
          icon="📦"
          title="Aucune commande trouvée"
          description="Vous n'avez aucune commande pour le moment">
        </app-empty-state>
      } @else {
        <!-- Orders Table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-primary-700">
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Commande</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Client</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Date</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Total</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th class="text-right text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.id) {
                  <tr class="border-b border-primary-800 hover:bg-primary-800/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-700 overflow-hidden shrink-0 flex items-center justify-center">
                          <span class="text-primary-500 text-xs">📦</span>
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-primary-100 line-clamp-1">Commande #{{ order.id }}</p>
                          <p class="text-xs text-primary-400">{{ order.items.length }} article(s)</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-medium text-primary-100">{{ order.client.user.username }}</p>
                      <p class="text-xs text-primary-400">{{ order.client.user.email }}</p>
                    </td>
                    <td class="px-4 py-3 text-primary-300">
                      {{ formatDate(order.created_at) }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-accent">{{ order.total_price }} TND</span>
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="'badge-' + ordersService.getStatusColor(order.status)" class="text-xs">
                        {{ ordersService.getStatusText(order.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="viewOrderDetails(order)" 
                                class="btn-primary text-xs px-3 py-1">
                          👁️ Voir
                        </button>
                        
                        @if (ordersService.canValidate(order.status)) {
                          <button (click)="quickApprove(order)" 
                                  class="btn-success text-xs px-3 py-1">
                            ✅ Approuver
                          </button>
                          
                          <button (click)="quickReject(order)" 
                                  class="btn-danger text-xs px-3 py-1">
                            ❌ Rejeter
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class SupplierOrdersSimpleComponent implements OnInit {
  orders = signal<Order[]>([]);
  stats = signal<OrderStats>({
    total_orders: 0,
    pending_orders: 0,
    approved_orders: 0,
    rejected_orders: 0,
    completed_orders: 0
  });
  loading = signal(true);
  selectedStatus = signal('');
  totalCount = signal(0);

  constructor(
    private router: Router,
    private ordersService: SupplierOrdersService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStats();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.totalCount.set(orders.length);
        this.loading.set(false);
        console.log('✅ Orders loaded:', orders.length);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('❌ Error loading orders:', err);
        this.toast.error(err.error?.error || 'Failed to load orders');
      }
    });
  }

  loadStats(): void {
    this.ordersService.getOrderStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        console.log('✅ Stats loaded:', stats);
      },
      error: (err) => {
        console.error('❌ Error loading stats:', err);
      }
    });
  }

  filteredOrders(): Order[] {
    const status = this.selectedStatus();
    if (!status) return this.orders();
    return this.orders().filter(order => order.status === status);
  }

  quickApprove(order: Order): void {
    console.log('🟢 Quick approving order:', order.id);
    
    if (!confirm(`Êtes-vous sûr de vouloir approuver la commande #${order.id} ?`)) return;
    
    const validation: OrderValidationRequest = {
      action: 'approve',
      notes: 'Approuvée rapidement depuis le tableau'
    };

    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        console.log('✅ Order approved:', response);
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('❌ Error approving order:', err);
        this.toast.error(err.error?.error || 'Failed to approve order');
      }
    });
  }

  quickReject(order: Order): void {
    console.log('🔴 Quick rejecting order:', order.id);
    
    const notes = prompt(`Pourquoi rejetez-vous la commande #${order.id} ?`);
    if (notes === null || !notes.trim()) {
      this.toast.warning('Veuillez indiquer la raison du rejet');
      return;
    }
    
    const validation: OrderValidationRequest = {
      action: 'reject',
      notes: notes.trim()
    };

    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        console.log('✅ Order rejected:', response);
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('❌ Error rejecting order:', err);
        this.toast.error(err.error?.error || 'Failed to reject order');
      }
    });
  }

  viewOrderDetails(order: Order): void {
    console.log('👁️ Viewing order details:', order.id);
    this.router.navigate(['/supplier/orders', order.id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
