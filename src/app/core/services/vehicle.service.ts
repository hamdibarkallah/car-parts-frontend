import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, VehicleModel, ModelYear, Engine } from '../models/vehicle.model';
import { PaginatedResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBrands(): Observable<PaginatedResponse<Brand>> {
    return this.http.get<PaginatedResponse<Brand>>(`${this.apiUrl}/brands/`);
  }

  getModels(brandId?: number): Observable<PaginatedResponse<VehicleModel>> {
    let params = new HttpParams();
    if (brandId) params = params.set('brand', brandId.toString());
    return this.http.get<PaginatedResponse<VehicleModel>>(`${this.apiUrl}/models/`, { params });
  }

  getModelYears(modelId?: number): Observable<PaginatedResponse<ModelYear>> {
    let params = new HttpParams();
    if (modelId) params = params.set('model', modelId.toString());
    return this.http.get<PaginatedResponse<ModelYear>>(`${this.apiUrl}/model-years/`, { params });
  }

  getEngines(modelYearId?: number): Observable<PaginatedResponse<Engine>> {
    let params = new HttpParams();
    if (modelYearId) params = params.set('model_year', modelYearId.toString());
    return this.http.get<PaginatedResponse<Engine>>(`${this.apiUrl}/engines/`, { params });
  }
}
