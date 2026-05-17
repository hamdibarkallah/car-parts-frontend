import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageDebugService {
  constructor(private http: HttpClient) {}

  testImageAccess(imageUrl: string): Observable<any> {
    // Test if image URL is accessible
    return this.http.head(imageUrl, { responseType: 'text' });
  }

  testAllImages(): Observable<any> {
    // Test all media files
    return this.http.get(`${environment.apiUrl}/parts/`, { responseType: 'text' });
  }

  logImageIssue(imageUrl: string, error: any): void {
    console.group('🖼️ IMAGE DEBUG SERVICE');
    console.log('Image URL:', imageUrl);
    console.log('Error:', error);
    console.log('Full URL:', this.getFullImageUrl(imageUrl));
    console.groupEnd();
  }

  private getFullImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('/media/')) {
      return `http://localhost:8000${imageUrl}`;
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${environment.apiUrl.replace('/api', '')}${imageUrl}`;
  }
}
