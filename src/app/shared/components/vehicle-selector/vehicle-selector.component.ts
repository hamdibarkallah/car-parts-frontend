import { Component, OnInit, OnChanges, SimpleChanges, signal, computed, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Brand, VehicleModel, ModelYear, Engine } from '../../../core/models/vehicle.model';
import { TranslateModule } from '@ngx-translate/core';

export interface VehicleSelection {
  brand?: Brand;
  model?: VehicleModel;
  modelYear?: ModelYear;
  engine?: Engine;
}

@Component({
  selector: 'app-vehicle-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div [class]="layout === 'horizontal' ? 'flex flex-wrap gap-3 items-end' : 'space-y-4'">
      <!-- Brand -->
      <div [class]="layout === 'horizontal' ? 'flex-1 min-w-[160px]' : ''">
        <label class="label">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 inline mr-1 text-accent" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
          {{ 'VEHICLE.BRAND' | translate }}
        </label>
        <select
          [ngModel]="selectedBrandId()"
          (ngModelChange)="onBrandChange($event)"
          class="input text-sm"
          [disabled]="loadingBrands()">
          <option [ngValue]="null" class="bg-primary-800">
            {{ loadingBrands() ? ('VEHICLE.LOADING' | translate) : ('VEHICLE.SELECT_BRAND' | translate) }}
          </option>
          @for (brand of brands(); track brand.id) {
            <option [ngValue]="brand.id" class="bg-primary-800">{{ brand.name }}</option>
          }
        </select>
      </div>

      <!-- Model -->
      <div [class]="layout === 'horizontal' ? 'flex-1 min-w-[160px]' : ''">
        <label class="label">{{ 'VEHICLE.MODEL' | translate }}</label>
        <select
          [ngModel]="selectedModelId()"
          (ngModelChange)="onModelChange($event)"
          class="input text-sm"
          [disabled]="!selectedBrandId() || loadingModels()">
          <option [ngValue]="null" class="bg-primary-800">
            {{ loadingModels() ? ('VEHICLE.LOADING' | translate) : (!selectedBrandId() ? ('VEHICLE.BRAND_FIRST' | translate) : ('VEHICLE.SELECT_MODEL' | translate)) }}
          </option>
          @for (model of models(); track model.id) {
            <option [ngValue]="model.id" class="bg-primary-800">{{ model.name }}</option>
          }
        </select>
      </div>

      <!-- Year -->
      <div [class]="layout === 'horizontal' ? 'flex-1 min-w-[120px]' : ''">
        <label class="label">{{ 'VEHICLE.YEAR' | translate }}</label>
        <select
          [ngModel]="selectedYearId()"
          (ngModelChange)="onYearChange($event)"
          class="input text-sm"
          [disabled]="!selectedModelId() || loadingYears()">
          <option [ngValue]="null" class="bg-primary-800">
            {{ loadingYears() ? ('VEHICLE.LOADING' | translate) : (!selectedModelId() ? ('VEHICLE.MODEL_FIRST' | translate) : ('VEHICLE.SELECT_YEAR' | translate)) }}
          </option>
          @for (year of years(); track year.id) {
            <option [ngValue]="year.id" class="bg-primary-800">{{ year.year }}</option>
          }
        </select>
      </div>

      <!-- Engine (optional) -->
      @if (showEngine) {
        <div [class]="layout === 'horizontal' ? 'flex-1 min-w-[180px]' : ''">
          <label class="label">{{ 'VEHICLE.ENGINE' | translate }} <span class="text-primary-500 text-xs">{{ 'VEHICLE.ENGINE_OPTIONAL' | translate }}</span></label>
          <select
            [ngModel]="selectedEngineId()"
            (ngModelChange)="onEngineChange($event)"
            class="input text-sm"
            [disabled]="!selectedYearId() || loadingEngines()">
            <option [ngValue]="null" class="bg-primary-800">
              {{ loadingEngines() ? ('VEHICLE.LOADING' | translate) : (!selectedYearId() ? ('VEHICLE.YEAR_FIRST' | translate) : ('VEHICLE.ANY_ENGINE' | translate)) }}
            </option>
            @for (engine of engines(); track engine.id) {
              <option [ngValue]="engine.id" class="bg-primary-800">
                {{ engine.name }} · {{ engine.type }} · {{ engine.horsepower }}hp
              </option>
            }
          </select>
        </div>
      }

      <!-- Clear button -->
      @if (hasSelection()) {
        <button (click)="clearAll()" class="btn-ghost text-xs px-3 py-2 shrink-0"
                [class.self-end]="layout === 'horizontal'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
          {{ 'VEHICLE.CLEAR' | translate }}
        </button>
      }
    </div>
  `
})
export class VehicleSelectorComponent implements OnInit, OnChanges {
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() showEngine = true;
  @Input() initialBrandId?: number;
  @Input() initialModelId?: number;
  @Input() initialYearId?: number;
  @Input() initialEngineId?: number;
  @Output() selectionChange = new EventEmitter<VehicleSelection>();

  private initialized = false;

  brands = signal<Brand[]>([]);
  models = signal<VehicleModel[]>([]);
  years = signal<ModelYear[]>([]);
  engines = signal<Engine[]>([]);

  selectedBrandId = signal<number | null>(null);
  selectedModelId = signal<number | null>(null);
  selectedYearId = signal<number | null>(null);
  selectedEngineId = signal<number | null>(null);

  loadingBrands = signal(false);
  loadingModels = signal(false);
  loadingYears = signal(false);
  loadingEngines = signal(false);

  hasSelection = computed(() => !!this.selectedBrandId());

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) return;
    if (changes['initialBrandId'] && this.initialBrandId && this.brands().length > 0) {
      this.restoreInitialValues();
    }
  }

  private restoreInitialValues(): void {
    if (!this.initialBrandId || this.initialized) return;
    this.initialized = true;
    this.selectedBrandId.set(this.initialBrandId);
    this.loadingModels.set(true);
    this.vehicleService.getModels(this.initialBrandId).subscribe({
      next: (res) => {
        this.models.set(res.results);
        this.loadingModels.set(false);
        if (this.initialModelId) {
          this.selectedModelId.set(this.initialModelId);
          this.loadingYears.set(true);
          this.vehicleService.getModelYears(this.initialModelId).subscribe({
            next: (res2) => {
              this.years.set(res2.results);
              this.loadingYears.set(false);
              if (this.initialYearId) {
                this.selectedYearId.set(this.initialYearId);
                this.loadingEngines.set(true);
                this.vehicleService.getEngines(this.initialYearId).subscribe({
                  next: (res3) => {
                    this.engines.set(res3.results);
                    this.loadingEngines.set(false);
                    if (this.initialEngineId) {
                      this.selectedEngineId.set(this.initialEngineId);
                    }
                    this.emitSelection();
                  },
                  error: () => this.loadingEngines.set(false)
                });
              } else { this.emitSelection(); }
            },
            error: () => this.loadingYears.set(false)
          });
        } else { this.emitSelection(); }
      },
      error: () => this.loadingModels.set(false)
    });
  }

  private loadBrands(): void {
    this.loadingBrands.set(true);
    this.vehicleService.getBrands().subscribe({
      next: (res) => {
        this.brands.set(res.results);
        this.loadingBrands.set(false);
        if (this.initialBrandId && !this.initialized) {
          this.restoreInitialValues();
        }
      },
      error: () => this.loadingBrands.set(false)
    });
  }

  onBrandChange(brandId: number | null): void {
    this.selectedBrandId.set(brandId);
    this.selectedModelId.set(null);
    this.selectedYearId.set(null);
    this.selectedEngineId.set(null);
    this.models.set([]);
    this.years.set([]);
    this.engines.set([]);

    if (brandId) {
      this.loadingModels.set(true);
      this.vehicleService.getModels(brandId).subscribe({
        next: (res) => { this.models.set(res.results); this.loadingModels.set(false); },
        error: () => this.loadingModels.set(false)
      });
    }
    this.emitSelection();
  }

  onModelChange(modelId: number | null): void {
    this.selectedModelId.set(modelId);
    this.selectedYearId.set(null);
    this.selectedEngineId.set(null);
    this.years.set([]);
    this.engines.set([]);

    if (modelId) {
      this.loadingYears.set(true);
      this.vehicleService.getModelYears(modelId).subscribe({
        next: (res) => { this.years.set(res.results); this.loadingYears.set(false); },
        error: () => this.loadingYears.set(false)
      });
    }
    this.emitSelection();
  }

  onYearChange(yearId: number | null): void {
    this.selectedYearId.set(yearId);
    this.selectedEngineId.set(null);
    this.engines.set([]);

    if (yearId) {
      this.loadingEngines.set(true);
      this.vehicleService.getEngines(yearId).subscribe({
        next: (res) => { this.engines.set(res.results); this.loadingEngines.set(false); },
        error: () => this.loadingEngines.set(false)
      });
    }
    this.emitSelection();
  }

  onEngineChange(engineId: number | null): void {
    this.selectedEngineId.set(engineId);
    this.emitSelection();
  }

  clearAll(): void {
    this.selectedBrandId.set(null);
    this.selectedModelId.set(null);
    this.selectedYearId.set(null);
    this.selectedEngineId.set(null);
    this.models.set([]);
    this.years.set([]);
    this.engines.set([]);
    this.emitSelection();
  }

  private emitSelection(): void {
    const selection: VehicleSelection = {};
    const brandId = this.selectedBrandId();
    const modelId = this.selectedModelId();
    const yearId = this.selectedYearId();
    const engineId = this.selectedEngineId();

    if (brandId) selection.brand = this.brands().find(b => b.id === brandId);
    if (modelId) selection.model = this.models().find(m => m.id === modelId);
    if (yearId) selection.modelYear = this.years().find(y => y.id === yearId);
    if (engineId) selection.engine = this.engines().find(e => e.id === engineId);

    this.selectionChange.emit(selection);
  }
}
