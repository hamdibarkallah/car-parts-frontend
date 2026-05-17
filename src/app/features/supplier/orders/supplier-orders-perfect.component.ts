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
  selector: 'app-supplier-orders-perfect',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- DEBUG: Component loaded -->
      <div style="background: red; color: white; padding: 10px; margin: 10px 0;">
        🚀🚀🚀 COMPONENT LOADED - SupplierOrdersPerfectComponent
      </div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary-50 tracking-tight">📦 Commandes Fournisseur</h1>
          <p class="text-sm text-primary-400 mt-1">Gérez vos commandes : {{ totalCount() }} commandes trouvées</p>
        </div>
        <button (click)="refreshData()" class="btn-primary">
          🔄 Actualiser
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card p-6 border-2 border-primary-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Total Commandes</p>
              <p class="text-3xl font-bold text-primary-50">{{ stats().total_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-2 border-warning">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">En Attente</p>
              <p class="text-3xl font-bold text-warning">{{ stats().pending_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <span class="text-2xl">⏰</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-2 border-success">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Approuvées</p>
              <p class="text-3xl font-bold text-success">{{ stats().approved_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <span class="text-2xl">✅</span>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-2 border-danger">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-primary-400">Rejetées</p>
              <p class="text-3xl font-bold text-danger">{{ stats().rejected_orders }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-danger/20 flex items-center justify-center">
              <span class="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button (click)="selectedStatus.set('')" 
                [class]="selectedStatus() === '' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm font-medium">
          📋 Toutes ({{ totalCount() }})
        </button>
        <button (click)="selectedStatus.set('SUPPLIER_PENDING')" 
                [class]="selectedStatus() === 'SUPPLIER_PENDING' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm font-medium">
          ⏰ En Attente ({{ stats().pending_orders }})
        </button>
        <button (click)="selectedStatus.set('APPROVED')" 
                [class]="selectedStatus() === 'APPROVED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm font-medium">
          ✅ Approuvées ({{ stats().approved_orders }})
        </button>
        <button (click)="selectedStatus.set('REJECTED')" 
                [class]="selectedStatus() === 'REJECTED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm font-medium">
          ❌ Rejetées ({{ stats().rejected_orders }})
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-6 flex items-center gap-4">
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
        <!-- ORDERS TABLE WITH BUTTONS -->
        <div class="card overflow-hidden border-2 border-primary-700">
          <div class="bg-primary-800 px-6 py-4 border-b border-primary-700">
            <h2 class="text-lg font-semibold text-primary-50">Liste des Commandes</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-primary-800">
                <tr>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Commande</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Client</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Date</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Articles</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Total</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">Statut</th>
                  <th class="text-right text-xs font-medium text-primary-400 uppercase tracking-wider px-6 py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-700">
                @for (order of filteredOrders(); track order.id) {
                  <tr class="hover:bg-primary-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center mr-3">
                          <span class="text-primary-300 font-bold">#{{ order.id }}</span>
                        </div>
                        <div>
                          <p class="font-medium text-primary-100">Commande #{{ order.id }}</p>
                          <p class="text-xs text-primary-400">{{ order.items.length }} article(s)</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="font-medium text-primary-100">{{ order.client.user.username }}</p>
                      <p class="text-xs text-primary-400">{{ order.client.user.email }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-primary-300">{{ formatDate(order.created_at) }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <div class="space-y-1">
                        @for (item of order.items.slice(0, 2); track item.id) {
                          <p class="text-xs text-primary-300">• {{ item.part.name }}</p>
                        }
                        @if (order.items.length > 2) {
                          <p class="text-xs text-primary-400">+{{ order.items.length - 2 }} autre(s)...</p>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="font-bold text-lg text-accent">{{ order.total_price }} TND</p>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'badge-' + ordersService.getStatusColor(order.status)" class="text-xs font-medium px-3 py-1 rounded-full">
                        {{ ordersService.getStatusText(order.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <!-- VIEW ORDER BUTTON -->
                        <button (click)="viewOrderDetails(order)" 
                                class="btn-primary text-xs px-3 py-2 font-medium">
                          👁️ Voir
                        </button>
                        
                        <!-- APPROVE BUTTON - ALWAYS VISIBLE FOR TESTING -->
                        <button (click)="quickApprove(order)" 
                                class="btn-success text-xs px-3 py-2 font-medium">
                          ✅ Approuver
                        </button>
                        
                        <!-- REJECT BUTTON - ALWAYS VISIBLE FOR TESTING -->
                        <button (click)="quickReject(order)" 
                                class="btn-danger text-xs px-3 py-2 font-medium">
                          ❌ Rejeter
                        </button>
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
export class SupplierOrdersPerfectComponent implements OnInit {
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
    public ordersService: SupplierOrdersService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    console.log('🚀🚀🚀 SupplierOrdersPerfectComponent initialized');
    this.loadOrders();
    this.loadStats();
  }

  refreshData(): void {
    console.log('🔄 Refreshing data...');
    this.loadOrders();
    this.loadStats();
  }

  loadOrders(): void {
    console.log('📦 Loading orders...');
    this.loading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        console.log('✅ Orders loaded successfully:', orders.length, 'orders');
        this.orders.set(orders);
        this.totalCount.set(orders.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading orders:', err);
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to load orders');
      }
    });
  }

  loadStats(): void {
    console.log('📊 Loading stats...');
    this.ordersService.getOrderStats().subscribe({
      next: (stats) => {
        console.log('✅ Stats loaded:', stats);
        this.stats.set(stats);
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
    console.log('🟢🟢🟢 QUICK APPROVE CLICKED - Order ID:', order.id);
    console.log('🟢 Order status:', order.status);
    console.log('🟢 Can validate:', this.ordersService.canValidate(order.status));
    
    if (!confirm(`✅ Confirmer l'approbation de la commande #${order.id} ?\n\nTotal: ${order.total_price} TND\nClient: ${order.client.user.username}`)) {
      console.log('🟢 User cancelled approval');
      return;
    }
    
    const validation: OrderValidationRequest = {
      action: 'approve',
      notes: 'Commande approuvée par le fournisseur'
    };

    console.log('📤 Sending approval request to:', `${this.ordersService['baseUrl']}/supplier/orders/${order.id}/validate/`);
    console.log('📤 Request payload:', validation);
    
    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        console.log('✅ Order approved successfully:', response);
        this.toast.success(`✅ Commande #${order.id} approuvée avec succès !`);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('❌ Error approving order:', err);
        console.error('❌ Error details:', err.error);
        this.toast.error(err.error?.error || 'Failed to approve order');
      }
    });
  }

  quickReject(order: Order): void {
    console.log('🔴🔴🔴 QUICK REJECT CLICKED - Order ID:', order.id);
    console.log('🔴 Order status:', order.status);
    console.log('🔴 Can validate:', this.ordersService.canValidate(order.status));
    
    const notes = prompt(`❌ Pourquoi rejetez-vous la commande #${order.id} ?\n\nClient: ${order.client.user.username}\nTotal: ${order.total_price} TND\n\nVeuillez indiquer la raison du rejet:`);
    if (notes === null || !notes.trim()) {
      console.log('🔴 User cancelled rejection or no notes provided');
      this.toast.warning('⚠️ Veuillez indiquer la raison du rejet');
      return;
    }
    
    const validation: OrderValidationRequest = {
      action: 'reject',
      notes: notes.trim()
    };

    console.log('📤 Sending rejection request to:', `${this.ordersService['baseUrl']}/supplier/orders/${order.id}/validate/`);
    console.log('📤 Request payload:', validation);
    
    this.ordersService.validateOrder(order.id, validation).subscribe({
      next: (response) => {
        console.log('✅ Order rejected successfully:', response);
        this.toast.success(`❌ Commande #${order.id} rejetée avec succès !`);
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('❌ Error rejecting order:', err);
        console.error('❌ Error details:', err.error);
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
