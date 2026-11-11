
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiJobApplication {
  id: number;
  company: string;
  position: string;
  location: string;
  status: string;
  appliedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationApi {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8080/api/applications';

  getApplications(): Observable<ApiJobApplication[]> {
    return this.http.get<ApiJobApplication[]>(this.apiUrl);
  }
}
