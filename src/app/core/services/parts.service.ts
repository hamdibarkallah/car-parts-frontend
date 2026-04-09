import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Part, PartImage, PartFilters } from '../models/part.model';
import { PaginatedResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class PartsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getParts(filters?: PartFilters): Observable<PaginatedResponse<Part>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Part>>(`${this.apiUrl}/parts/`, { params });
  }

  getPart(id: number): Observable<Part> {
    return this.http.get<Part>(`${this.apiUrl}/parts/${id}/`);
  }

  createPart(data: FormData): Observable<Part> {
    return this.http.post<Part>(`${this.apiUrl}/parts/`, data);
  }

  updatePart(id: number, data: any): Observable<Part> {
    return this.http.put<Part>(`${this.apiUrl}/parts/${id}/`, data);
  }

  deletePart(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parts/${id}/`);
  }

  getPartImages(partId: number): Observable<PartImage[]> {
    return this.http.get<PartImage[]>(`${this.apiUrl}/parts/${partId}/images/`);
  }

  uploadPartImage(partId: number, file: File, isPrimary = false): Observable<PartImage> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', isPrimary.toString());
    return this.http.post<PartImage>(`${this.apiUrl}/parts/${partId}/images/`, formData);
  }

  deletePartImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}/`);
  }
}
