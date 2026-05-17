import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PartsService } from '../../../core/services/parts.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageDebugService } from '../../../core/services/image-debug.service';
import { Part } from '../../../core/models/part.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-parts-debug',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">🔍 My Parts - DEBUG MODE</h1>
          <p class="text-sm text-primary-400 mt-1">{{ totalCount() }} parts listed</p>
        </div>
        <button (click)="testAllImages()" class="btn-primary text-sm">
          🧪 Test All Images
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full sm:w-80 mb-6">
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
               class="input pl-10" placeholder="Search your parts..." />
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
      } @else if (parts().length === 0) {
        <app-empty-state
          icon="🔧"
          title="No parts found"
          description="Try adjusting your search criteria">
        </app-empty-state>
      } @else {
        <!-- Parts Table with DEBUG INFO -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-primary-700">
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Part</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Reference</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Price</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Stock</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Condition</th>
                  <th class="text-left text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Image Status</th>
                  <th class="text-right text-xs font-medium text-primary-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (part of parts(); track part.id) {
                  <tr class="border-b border-primary-800 hover:bg-primary-800/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-700 overflow-hidden shrink-0 flex items-center justify-center">
                          @if (part.primary_image) {
                            <img [src]="part.primary_image" [alt]="part.name" 
                                 class="w-full h-full object-cover"
                                 (error)="onImageError(part, $event)"
                                 (load)="onImageLoad(part, $event)" />
                          } @else {
                            <span class="text-primary-500 text-xs">🔧</span>
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-primary-100 line-clamp-1">{{ part.name }}</p>
                          <p class="text-xs text-primary-400 sm:hidden">{{ part.reference }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-primary-300 font-mono text-xs hidden sm:table-cell">{{ part.reference }}</td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-accent font-mono">{{ part.price }} TND</span>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <span [class]="part.is_in_stock ? 'text-success' : 'text-danger'" class="font-medium">
                        {{ part.quantity }}
                      </span>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <span [class]="part.condition === 'NEW' ? 'badge-new' : 'badge-used'" class="text-xs">
                        {{ part.condition }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span [class]="getImageStatusClass(part)" class="text-xs px-2 py-1 rounded">
                          {{ getImageStatusText(part) }}
                        </span>
                        <button (click)="testSingleImage(part)" 
                                class="p-1.5 rounded-lg text-primary-400 hover:text-accent hover:bg-primary-700 transition-colors"
                                title="Test Image">
                          🧪
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/supplier/parts', part.id, 'edit']"
                           class="p-1.5 rounded-lg text-primary-400 hover:text-accent hover:bg-primary-700 transition-colors"
                           title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          </svg>
                        </a>
                        <button (click)="deletePart(part)"
                                class="p-1.5 rounded-lg text-primary-400 hover:text-danger hover:bg-primary-700 transition-colors"
                                title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
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

      <!-- Debug Panel -->
      <div class="card p-6 mt-8">
        <h3 class="text-lg font-semibold text-primary-200 mb-4">🔍 Debug Information</h3>
        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Image Status Summary:</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (status of imageStatusSummary(); track status.status) {
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" [style.background-color]="status.color"></span>
                  <span class="text-sm">{{ status.status }}: {{ status.count }}</span>
                </div>
              }
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Recent Debug Logs:</h4>
            <div class="bg-primary-900 rounded-lg p-4 max-h-40 overflow-y-auto">
              @for (log of debugLogs(); track log.id) {
                <div class="text-xs mb-2" [class]="log.type === 'error' ? 'text-danger' : log.type === 'success' ? 'text-success' : 'text-primary-400'">
                  <span class="font-mono">{{ log.timestamp }}</span>
                  <span>{{ log.message }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyPartsDebugComponent implements OnInit {
  parts = signal<Part[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  searchQuery = '';
  debugLogs = signal<Array<{id: number, timestamp: string, message: string, type: 'error' | 'success' | 'info'}>>([]);
  private searchTimeout: any;

  constructor(
    private partsService: PartsService,
    private auth: AuthService,
    private toast: ToastService,
    private imageDebug: ImageDebugService
  ) {}

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.loading.set(true);
    const supplierId = this.auth.user()?.id;
    const filters: any = { supplier: supplierId };
    if (this.searchQuery) filters.search = this.searchQuery;

    this.partsService.getParts(filters).subscribe({
      next: (res) => {
        this.parts.set(res.results);
        this.totalCount.set(res.count);
        this.loading.set(false);
        this.addLog(`Loaded ${res.results.length} parts`, 'info');
        this.checkImageStatus();
      },
      error: (err) => {
        this.loading.set(false);
        this.addLog(`Failed to load parts: ${err.message}`, 'error');
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadParts(), 300);
  }

  testAllImages(): void {
    this.addLog('Testing all images accessibility...', 'info');
    
    this.parts().forEach(part => {
      if (part.primary_image) {
        this.imageDebug.testImageAccess(part.primary_image).subscribe({
          next: () => {
            this.addLog(`✅ Image accessible: ${part.primary_image}`, 'success');
          },
          error: (err) => {
            this.addLog(`❌ Image inaccessible: ${part.primary_image} - ${err.message}`, 'error');
          }
        });
      } else {
        this.addLog(`⚠️  Pas d'image pour: ${part.name}`, 'info');
      }
    });
  }

  testSingleImage(part: Part): void {
    if (part.primary_image) {
      this.addLog(`Test de l'image: ${part.primary_image}`, 'info');
      this.imageDebug.testImageAccess(part.primary_image).subscribe({
        next: () => {
          this.addLog(`✅ Image ${part.name} accessible`, 'success');
        },
        error: (err) => {
          this.addLog(`❌ Image ${part.name} inaccessible: ${err.message}`, 'error');
          this.imageDebug.logImageIssue(part.primary_image, err);
        }
      });
    }
  }

  onImageLoad(part: Part, event: any): void {
    this.addLog(`✅ Image chargée: ${part.name} - ${part.primary_image || 'NO_IMAGE'}`, 'success');
  }

  onImageError(part: Part, event: any): void {
    const errorMsg = event.target?.error || 'Unknown error';
    this.addLog(`❌ Erreur de chargement: ${part.name} - ${errorMsg}`, 'error');
    if (part.primary_image) {
      this.imageDebug.logImageIssue(part.primary_image, errorMsg);
    }
  }

  checkImageStatus(): void {
    const total = this.parts().length;
    const withImages = this.parts().filter(p => p.primary_image).length;
    const withoutImages = total - withImages;
    
    this.imageStatusSummary.set([
      { status: 'Avec images', count: withImages, color: '#10b981' },
      { status: 'Sans images', count: withoutImages, color: '#ef4444' }
    ]);
  }

  imageStatusSummary = signal<Array<{status: string, count: number, color: string}>>([]);

  addLog(message: string, type: 'error' | 'success' | 'info'): void {
    const log = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    this.debugLogs.update(logs => [log, ...logs].slice(0, 50)); // Keep last 50 logs
  }

  deletePart(part: Part): void {
    if (!confirm(\`Are you sure you want to delete "\${part.name}"?\`)) return;
    this.partsService.deletePart(part.id).subscribe({
      next: () => {
        this.toast.success(\`"\${part.name}" deleted\`);
        this.parts.update(parts => parts.filter(p => p.id !== part.id));
        this.totalCount.update(c => c - 1);
        this.addLog(\`Pièce supprimée: \${part.name}\`, 'info');
      },
      error: (err) => {
        this.addLog(\`Erreur suppression: \${err.message}\`, 'error');
        this.toast.error(err.error?.error || 'Failed to delete part');
      }
    });
  }
}
