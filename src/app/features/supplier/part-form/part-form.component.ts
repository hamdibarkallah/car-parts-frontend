import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PartsService } from '../../../core/services/parts.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Part, PartImage } from '../../../core/models/part.model';
import { Category } from '../../../core/models/category.model';
import { VehicleSelectorComponent, VehicleSelection } from '../../../shared/components/vehicle-selector/vehicle-selector.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, VehicleSelectorComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <nav class="flex items-center gap-2 text-sm text-primary-400 mb-6">
        <a routerLink="/supplier" class="hover:text-accent transition-colors">Dashboard</a>
        <span>/</span>
        <a routerLink="/supplier/parts" class="hover:text-accent transition-colors">My Parts</a>
        <span>/</span>
        <span class="text-primary-200">{{ isEdit ? 'Edit Part' : 'New Part' }}</span>
      </nav>

      <h1 class="text-2xl font-bold text-primary-50 tracking-tight mb-8">
        {{ isEdit ? 'Edit Part' : 'Add New Part' }}
      </h1>

      @if (loadingPart()) {
        <div class="flex items-center justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">

          <!-- Basic Info -->
          <div class="card p-6 space-y-5">
            <h2 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Basic Information</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="label">Part Name</label>
                <input type="text" formControlName="name" class="input"
                       [class.input-error]="isInvalid('name')" placeholder="e.g. Front Brake Pad Set" />
                @if (isInvalid('name')) {
                  <p class="mt-1 text-xs text-danger">Name is required</p>
                }
              </div>

              <div>
                <label class="label">Reference / SKU</label>
                <input type="text" formControlName="reference" class="input font-mono"
                       [class.input-error]="isInvalid('reference')" placeholder="e.g. BP-2024-001" />
                @if (isInvalid('reference')) {
                  <p class="mt-1 text-xs text-danger">Reference is required</p>
                }
              </div>

              <div>
                <label class="label">Category</label>
                <select formControlName="category" class="input"
                        [class.input-error]="isInvalid('category')">
                  <option value="" class="bg-primary-800">Select category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id" class="bg-primary-800">{{ cat.name }}</option>
                  }
                </select>
                @if (isInvalid('category')) {
                  <p class="mt-1 text-xs text-danger">Category is required</p>
                }
              </div>

              <div>
                <label class="label">Price (TND)</label>
                <input type="number" formControlName="price" class="input font-mono"
                       [class.input-error]="isInvalid('price')" placeholder="0.00" step="0.01" min="0" />
                @if (isInvalid('price')) {
                  <p class="mt-1 text-xs text-danger">Price is required</p>
                }
              </div>

              <div>
                <label class="label">Quantity in Stock</label>
                <input type="number" formControlName="quantity" class="input font-mono"
                       [class.input-error]="isInvalid('quantity')" placeholder="0" min="0" />
                @if (isInvalid('quantity')) {
                  <p class="mt-1 text-xs text-danger">Quantity is required</p>
                }
              </div>

              <div>
                <label class="label">Condition</label>
                <select formControlName="condition" class="input">
                  <option value="NEW" class="bg-primary-800">New</option>
                  <option value="USED" class="bg-primary-800">Used</option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="label">Description</label>
                <textarea formControlName="description" class="input min-h-[100px] resize-y"
                          placeholder="Describe the part, compatibility notes, etc."></textarea>
              </div>
            </div>
          </div>

          <!-- Vehicle Compatibility -->
          <div class="card p-6 space-y-4">
            <h2 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Vehicle Compatibility</h2>
            <p class="text-xs text-primary-400">Select the vehicle this part is compatible with.</p>
            <app-vehicle-selector
              layout="vertical"
              [showEngine]="true"
              (selectionChange)="onVehicleChange($event)">
            </app-vehicle-selector>
          </div>

          <!-- Images -->
          <div class="card p-6 space-y-4">
            <h2 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Images</h2>

            <!-- Existing images (edit mode) -->
            @if (existingImages().length > 0) {
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                @for (img of existingImages(); track img.id) {
                  <div class="relative group rounded-lg overflow-hidden border border-primary-700">
                    <img [src]="img.image_url || img.image" class="w-full aspect-square object-cover" />
                    <button type="button" (click)="removeExistingImage(img)"
                            class="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger/80 text-white
                                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      &times;
                    </button>
                    @if (img.is_primary) {
                      <div class="absolute bottom-0 left-0 right-0 bg-accent/80 text-white text-[10px] text-center py-0.5">
                        Primary
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Upload area -->
            <div class="border-2 border-dashed border-primary-600 rounded-xl p-6 text-center
                        hover:border-accent/50 transition-colors cursor-pointer"
                 (click)="fileInput.click()"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event)">
              <input #fileInput type="file" accept="image/*" multiple class="hidden"
                     (change)="onFilesSelected($event)" />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto text-primary-500 mb-2" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
              <p class="text-sm text-primary-300">Drag & drop images or <span class="text-accent">browse</span></p>
              <p class="text-xs text-primary-500 mt-1">PNG, JPG up to 5MB each</p>
            </div>

            <!-- Selected files preview -->
            @if (selectedFiles().length > 0) {
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                @for (file of selectedFiles(); track file.name; let i = $index) {
                  <div class="relative group rounded-lg overflow-hidden border border-primary-700">
                    <img [src]="filePreviews()[i]" class="w-full aspect-square object-cover" />
                    <button type="button" (click)="removeSelectedFile(i)"
                            class="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger/80 text-white
                                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      &times;
                    </button>
                    <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 truncate px-1">
                      {{ file.name }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Submit -->
          <div class="flex items-center gap-4">
            <button type="submit" [disabled]="submitting()" class="btn-primary flex-1 sm:flex-none sm:min-w-[200px]">
              @if (submitting()) {
                <app-loading-spinner size="sm" />
                {{ isEdit ? 'Updating...' : 'Creating...' }}
              } @else {
                {{ isEdit ? 'Update Part' : 'Create Part' }}
              }
            </button>
            <a routerLink="/supplier/parts" class="btn-ghost">Cancel</a>
          </div>
        </form>
      }
    </div>
  `
})
export class PartFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  partId: number | null = null;
  categories = signal<Category[]>([]);
  existingImages = signal<PartImage[]>([]);
  selectedFiles = signal<File[]>([]);
  filePreviews = signal<string[]>([]);
  loadingPart = signal(false);
  submitting = signal(false);

  private vehicleBrandId: number | null = null;
  private vehicleModelId: number | null = null;
  private vehicleYearId: number | null = null;
  private vehicleEngineId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private partsService: PartsService,
    private categoryService: CategoryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      reference: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      condition: ['NEW'],
      category: ['', Validators.required]
    });

    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.results)
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.partId = Number(id);
      this.loadPart(this.partId);
    }
  }

  private loadPart(id: number): void {
    this.loadingPart.set(true);
    this.partsService.getPart(id).subscribe({
      next: (part) => {
        this.form.patchValue({
          name: part.name,
          reference: part.reference,
          description: part.description || '',
          price: part.price,
          quantity: part.quantity,
          condition: part.condition,
          category: part.category?.id
        });
        this.vehicleBrandId = part.brand?.id || null;
        this.vehicleModelId = part.model?.id || null;
        this.vehicleYearId = part.model_year?.id || null;
        this.vehicleEngineId = part.engine?.id || null;

        if (part.images && part.images.length > 0) {
          this.existingImages.set(part.images);
        }
        this.loadingPart.set(false);
      },
      error: () => {
        this.toast.error('Failed to load part');
        this.loadingPart.set(false);
        this.router.navigate(['/supplier/parts']);
      }
    });
  }

  onVehicleChange(selection: VehicleSelection): void {
    this.vehicleBrandId = selection.brand?.id || null;
    this.vehicleModelId = selection.model?.id || null;
    this.vehicleYearId = selection.modelYear?.id || null;
    this.vehicleEngineId = selection.engine?.id || null;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    }
  }

  private addFiles(files: File[]): void {
    const current = this.selectedFiles();
    const previews = [...this.filePreviews()];
    for (const file of files) {
      current.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result as string);
        this.filePreviews.set([...previews]);
      };
      reader.readAsDataURL(file);
    }
    this.selectedFiles.set([...current]);
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.update(f => f.filter((_, i) => i !== index));
    this.filePreviews.update(p => p.filter((_, i) => i !== index));
  }

  removeExistingImage(img: PartImage): void {
    this.partsService.deletePartImage(img.id).subscribe({
      next: () => {
        this.existingImages.update(imgs => imgs.filter(i => i.id !== img.id));
        this.toast.success('Image removed');
      },
      error: () => this.toast.error('Failed to remove image')
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.vehicleBrandId || !this.vehicleModelId || !this.vehicleYearId) {
      this.toast.error('Please select a vehicle (at least brand, model, and year)');
      return;
    }

    this.submitting.set(true);
    const data: any = {
      ...this.form.value,
      brand: this.vehicleBrandId,
      model: this.vehicleModelId,
      model_year: this.vehicleYearId
    };
    if (this.vehicleEngineId) data.engine = this.vehicleEngineId;

    const request$ = this.isEdit
      ? this.partsService.updatePart(this.partId!, data)
      : this.partsService.createPart(data);

    request$.subscribe({
      next: (part) => {
        this.uploadImages(part.id);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error ? Object.values(err.error).flat().join(', ') : 'Failed to save part';
        this.toast.error(msg);
      }
    });
  }

  private uploadImages(partId: number): void {
    const files = this.selectedFiles();
    if (files.length === 0) {
      this.onSaveComplete();
      return;
    }

    let uploaded = 0;
    for (let i = 0; i < files.length; i++) {
      const isPrimary = i === 0 && this.existingImages().length === 0;
      this.partsService.uploadPartImage(partId, files[i], isPrimary).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === files.length) this.onSaveComplete();
        },
        error: () => {
          uploaded++;
          if (uploaded === files.length) this.onSaveComplete();
        }
      });
    }
  }

  private onSaveComplete(): void {
    this.submitting.set(false);
    this.toast.success(this.isEdit ? 'Part updated successfully!' : 'Part created successfully!');
    this.router.navigate(['/supplier/parts']);
  }
}
