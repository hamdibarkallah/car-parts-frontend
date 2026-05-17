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
  selector: 'app-supplier-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">📦 Commandes</h1>
          <p class="text-sm text-primary-400 mt-1">{{ totalCount() }} commandes reçues</p>
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
        <div class="space-y-4">
          @for (order of filteredOrders(); track order.id) {
            <div class="card p-6">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <!-- Order Info -->
                <div class="flex-1">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center shrink-0">
                      <span class="text-xl">📦</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-semibold text-primary-50">Commande #{{ order.id }}</h3>
                        <span [class]="'badge-' + ordersService.getStatusColor(order.status)" class="text-xs">
                          {{ ordersService.getStatusText(order.status) }}
                        </span>
                      </div>
                      
                      <div class="space-y-1 text-sm text-primary-400">
                        <p>Client: {{ order.client.user.username }}</p>
                        <p>Date: {{ formatDate(order.created_at) }}</p>
                        <p>Total: <span class="font-bold text-accent">{{ order.total_price }} TND</span></p>
                        @if (order.supplier_notes) {
                          <p class="text-info">Notes: {{ order.supplier_notes }}</p>
                        }
                      </div>
                      
                      <!-- Order Items -->
                      <div class="mt-4 space-y-2">
                        @for (item of order.items; track item.id) {
                          <div class="flex items-center gap-3 p-3 bg-primary-800/50 rounded-lg">
                            @if (item.part.primary_image) {
                              <img [src]="item.part.primary_image" [alt]="item.part.name" 
                                   class="w-12 h-12 rounded-lg object-cover" />
                            } @else {
                              <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center">
                                <span class="text-xs">🔧</span>
                              </div>
                            }
                            <div class="flex-1 min-w-0">
                              <p class="font-medium text-primary-100 text-sm">{{ item.part.name }}</p>
                              <p class="text-xs text-primary-400">{{ item.part.reference }} • {{ item.quantity }}x • {{ item.price }} TND</p>
                            </div>
                            <div class="text-right">
                              <p class="font-bold text-accent text-sm">{{ item.total_price }} TND</p>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  <button (click)="viewOrderDetails(order)" 
                          class="btn-primary text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir Commande
                  </button>
                  
                  @if (ordersService.canValidate(order.status)) {
                    <button (click)="quickApprove(order)" 
                            class="btn-success text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Approuver
                    </button>
                    
                    <button (click)="quickReject(order)" 
                            class="btn-danger text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Rejeter
                    </button>
                  }
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
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to load orders');
      }
    });
  }

  loadStats(): void {
    this.ordersService.getOrderStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  filteredOrders(): Order[] {
    const status = this.selectedStatus();
    if (!status) return this.orders();
    return this.orders().filter(order => order.status === status);
  }

  approveOrder(order: Order): void {
    if (!confirm(`Êtes-vous sûr de vouloir approuver la commande #${order.id} ?`)) return;
    
    const validation: OrderValidationRequest = {
      action: 'approve',
      notes: ''
    };

    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to approve order');
      }
    });
  }

  rejectOrder(order: Order): void {
    const notes = prompt(`Pourquoi rejetez-vous la commande #${order.id} ? (Optionnel)`);
    if (notes === null) return; // User cancelled
    
    const validation: OrderValidationRequest = {
      action: 'reject',
      notes: notes || ''
    };

    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to reject order');
      }
    });
  }

  quickApprove(order: Order): void {
    if (!confirm(`Êtes-vous sûr de vouloir approuver rapidement la commande #${order.id} ?`)) return;
    
    const validation: OrderValidationRequest = {
      action: 'approve',
      notes: 'Approuvée rapidement depuis le tableau'
    };

    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to approve order');
      }
    });
  }

  quickReject(order: Order): void {
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
        this.toast.success(response.message);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to reject order');
      }
    });
  }

  viewOrderDetails(order: Order): void {
    // Navigate to order details page
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
