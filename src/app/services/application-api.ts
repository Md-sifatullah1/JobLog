
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationStatus } from '../models/application-status';

// Represents an application returned by Spring Boot
export interface ApiJobApplication {
  id: number;
  company: string;
  position: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;

  jobUrl: string | null;
  jobDescription: string | null;
  notes: string | null;

  interviewDate: string | null;
  interviewNotes: string | null;
}

// Represents a status history record returned by Spring Boot
export interface ApiStatusHistory {
  status: ApplicationStatus;
  changedAt: string;
  interviewDate: string | null;
}

// Data sent when creating or updating an application
export type ApiJobApplicationRequest =
  Omit<ApiJobApplication, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class ApplicationApi {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    '/api/applications';

  // GET /api/applications
  getApplications(): Observable<ApiJobApplication[]> {
    return this.http.get<ApiJobApplication[]>(
      this.apiUrl
    );
  }

  // GET /api/applications/{id}
  getApplicationById(
    id: number
  ): Observable<ApiJobApplication> {

    return this.http.get<ApiJobApplication>(
      `${this.apiUrl}/${id}`
    );
  }

  // GET /api/applications/{id}/history
  getApplicationHistory(
    id: number
  ): Observable<ApiStatusHistory[]> {

    return this.http.get<ApiStatusHistory[]>(
      `${this.apiUrl}/${id}/history`
    );
  }

  // POST /api/applications
  createApplication(
    application: ApiJobApplicationRequest
  ): Observable<ApiJobApplication> {

    return this.http.post<ApiJobApplication>(
      this.apiUrl,
      application
    );
  }

  // PUT /api/applications/{id}
  updateApplication(
    id: number,
    application: ApiJobApplicationRequest
  ): Observable<ApiJobApplication> {

    return this.http.put<ApiJobApplication>(
      `${this.apiUrl}/${id}`,
      application
    );
  }

  // DELETE /api/applications/{id}
  deleteApplication(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
