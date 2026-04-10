import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserVehicle } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class GarageService {
  private readonly apiUrl = environment.apiUrl;
  
  vehicles = signal<UserVehicle[]>([]);
  defaultVehicle = signal<UserVehicle | null>(null);

  constructor(private http: HttpClient) {}

  loadVehicles(): Observable<UserVehicle[]> {
    return this.http.get<UserVehicle[]>(`${this.apiUrl}/garage/`).pipe(
      tap(vehicles => {
        this.vehicles.set(vehicles);
        this.defaultVehicle.set(vehicles.find(v => v.is_default) || null);
      })
    );
  }

  addVehicle(data: { nickname?: string; brand: number; model: number; model_year: number; engine?: number | null; is_default?: boolean }): Observable<UserVehicle> {
    return this.http.post<UserVehicle>(`${this.apiUrl}/garage/`, data);
  }

  updateVehicle(id: number, data: Partial<UserVehicle>): Observable<UserVehicle> {
    return this.http.patch<UserVehicle>(`${this.apiUrl}/garage/${id}/`, data);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/garage/${id}/`);
  }

  setDefault(id: number): Observable<UserVehicle> {
    return this.http.post<UserVehicle>(`${this.apiUrl}/garage/${id}/set-default/`, {});
  }
}
