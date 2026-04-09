import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { PaginatedResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(rootOnly = false, parentId?: number): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams();
    if (rootOnly) params = params.set('root', 'true');
    if (parentId) params = params.set('parent', parentId.toString());
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories/`, { params });
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}/`);
  }
}
