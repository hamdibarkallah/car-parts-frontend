import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GarageService } from '../../core/services/garage.service';
import { VehicleSelectorComponent } from '../../shared/components/vehicle-selector/vehicle-selector.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { UserVehicle } from '../../core/models/vehicle.model';
import { VehicleSelection } from '../../shared/components/vehicle-selector/vehicle-selector.component';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VehicleSelectorComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">My Garage</h1>
          <p class="text-primary-400 text-sm mt-1">Save your vehicles for quick part search</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="btn-primary flex items-center gap-2">
          @if (showForm()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Cancel
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Vehicle
          }
        </button>
      </div>

      <!-- Add Vehicle Form -->
      @if (showForm()) {
        <div class="card p-6 mb-8 border border-accent/20">
          <h2 class="text-lg font-semibold text-primary-100 mb-4">
            {{ editingVehicle() ? 'Edit Vehicle' : 'Add a Vehicle' }}
          </h2>

          <div class="mb-4">
            <label class="block text-sm font-medium text-primary-300 mb-1">Nickname (optional)</label>
            <input type="text" [(ngModel)]="nickname" placeholder="e.g. My Daily Driver"
                   class="input w-full sm:w-1/2" />
          </div>

          <app-vehicle-selector
            [initialBrandId]="editBrandId()"
            [initialModelId]="editModelId()"
            [initialYearId]="editYearId()"
            [initialEngineId]="editEngineId()"
            (selectionChange)="onVehicleSelected($event)" />

          <div class="flex items-center gap-3 mt-4">
            <label class="flex items-center gap-2 text-sm text-primary-300 cursor-pointer">
              <input type="checkbox" [(ngModel)]="isDefault"
                     class="w-4 h-4 rounded border-primary-600 bg-primary-800 text-accent focus:ring-accent/50" />
              Set as default vehicle
            </label>
          </div>

          <div class="flex gap-3 mt-6">
            <button (click)="saveVehicle()" [disabled]="saving() || !selectedYear"
                    class="btn-primary disabled:opacity-50">
              @if (saving()) {
                <svg class="animate-spin w-4 h-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              } @else {
                {{ editingVehicle() ? 'Update' : 'Save Vehicle' }}
              }
            </button>
            @if (editingVehicle()) {
              <button (click)="cancelEdit()" class="btn-secondary">Cancel</button>
            }
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5"><div class="skeleton h-16 w-full"></div></div>
          }
        </div>
      } @else if (vehicles().length === 0 && !showForm()) {
        <app-empty-state icon="🚗" title="No vehicles saved"
          description="Add your vehicle to quickly find compatible parts.">
          <button (click)="showForm.set(true)" class="btn-primary mt-6">Add Your First Vehicle</button>
        </app-empty-state>
      } @else {
        <div class="space-y-4">
          @for (vehicle of vehicles(); track vehicle.id) {
            <div class="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                 [ngClass]="vehicle.is_default ? 'ring-1 ring-accent/40' : ''">
              <div class="flex items-center gap-4">
                <!-- Car icon -->
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                     [class]="vehicle.is_default ? 'bg-accent/10' : 'bg-primary-800'">
                  🚗
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-primary-100">{{ vehicle.display_name }}</span>
                    @if (vehicle.is_default) {
                      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                        Default
                      </span>
                    }
                  </div>
                  <p class="text-sm text-primary-400 mt-0.5">
                    {{ vehicle.brand_detail.name }} {{ vehicle.model_detail.name }} · {{ vehicle.model_year_detail.year }}
                    @if (vehicle.engine_detail) {
                      · {{ vehicle.engine_detail.name }} ({{ vehicle.engine_detail.horsepower }}hp)
                    }
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <!-- Search parts for this vehicle -->
                <a [routerLink]="['/parts']"
                   [queryParams]="{ brand: vehicle.brand, model: vehicle.model, year: vehicle.model_year, engine: vehicle.engine }"
                   class="btn-secondary text-xs px-3 py-1.5"
                   title="Find parts for this vehicle">
                  🔍 Find Parts
                </a>
                @if (!vehicle.is_default) {
                  <button (click)="setDefault(vehicle)" class="btn-secondary text-xs px-3 py-1.5" title="Set as default">
                    ⭐
                  </button>
                }
                <button (click)="editVehicle(vehicle)" class="btn-secondary text-xs px-3 py-1.5" title="Edit">
                  ✏️
                </button>
                <button (click)="deleteVehicle(vehicle)" class="text-xs px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class GarageComponent implements OnInit {
  vehicles = signal<UserVehicle[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingVehicle = signal<UserVehicle | null>(null);

  editBrandId = signal<number | undefined>(undefined);
  editModelId = signal<number | undefined>(undefined);
  editYearId = signal<number | undefined>(undefined);
  editEngineId = signal<number | undefined>(undefined);

  nickname = '';
  isDefault = false;

  selectedBrand: number | null = null;
  selectedModel: number | null = null;
  selectedYear: number | null = null;
  selectedEngine: number | null = null;

  constructor(private garageService: GarageService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.garageService.loadVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onVehicleSelected(event: VehicleSelection): void {
    this.selectedBrand = event.brand?.id || null;
    this.selectedModel = event.model?.id || null;
    this.selectedYear = event.modelYear?.id || null;
    this.selectedEngine = event.engine?.id || null;
  }

  saveVehicle(): void {
    if (!this.selectedBrand || !this.selectedModel || !this.selectedYear) return;
    this.saving.set(true);

    const data = {
      nickname: this.nickname,
      brand: this.selectedBrand,
      model: this.selectedModel,
      model_year: this.selectedYear,
      engine: this.selectedEngine,
      is_default: this.isDefault
    };

    const editing = this.editingVehicle();
    const req = editing
      ? this.garageService.updateVehicle(editing.id, data)
      : this.garageService.addVehicle(data);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.loadVehicles();
      },
      error: () => this.saving.set(false)
    });
  }

  editVehicle(vehicle: UserVehicle): void {
    this.editingVehicle.set(vehicle);
    this.nickname = vehicle.nickname;
    this.isDefault = vehicle.is_default;
    this.editBrandId.set(vehicle.brand);
    this.editModelId.set(vehicle.model);
    this.editYearId.set(vehicle.model_year);
    this.editEngineId.set(vehicle.engine || undefined);
    this.selectedBrand = vehicle.brand;
    this.selectedModel = vehicle.model;
    this.selectedYear = vehicle.model_year;
    this.selectedEngine = vehicle.engine;
    this.showForm.set(true);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteVehicle(vehicle: UserVehicle): void {
    if (!confirm(`Remove "${vehicle.display_name}" from your garage?`)) return;
    this.garageService.deleteVehicle(vehicle.id).subscribe(() => this.loadVehicles());
  }

  setDefault(vehicle: UserVehicle): void {
    this.garageService.setDefault(vehicle.id).subscribe(() => this.loadVehicles());
  }

  private resetForm(): void {
    this.showForm.set(false);
    this.editingVehicle.set(null);
    this.nickname = '';
    this.isDefault = false;
    this.selectedBrand = null;
    this.selectedModel = null;
    this.selectedYear = null;
    this.selectedEngine = null;
    this.editBrandId.set(undefined);
    this.editModelId.set(undefined);
    this.editYearId.set(undefined);
    this.editEngineId.set(undefined);
  }
}
