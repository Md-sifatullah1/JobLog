
import { Injectable, inject, signal } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  forkJoin,
  of,
  switchMap,
  map,
  tap,
  catchError,
  throwError
} from 'rxjs';

import { JobApplication } from '../models/job-application';
import { ApplicationApi, ApiJobApplication } from './application-api';
import {
  toJobApplication,
  toApiRequest
} from './application-mapper';

@Injectable({
  providedIn: 'root'
})
export class Application {

  private readonly applicationApi = inject(ApplicationApi);

  private applications: JobApplication[] = [];
  readonly applicationsSignal = signal<JobApplication[]>([]);

  private readonly applicationsSubject =
    new BehaviorSubject<JobApplication[]>([]);

  readonly applications$ =
    this.applicationsSubject.asObservable();

  private publishApplications(): void {
    const updatedApplications = [...this.applications];
    
    this.applicationsSignal.set(updatedApplications);
    this.applicationsSubject.next(updatedApplications);
    }

  getApplications(): JobApplication[] {
    return this.applications;
  }

  getApplicationById(
    id: number
  ): JobApplication | undefined {
    return this.applications.find(
      application => application.id === id
    );
  }

  private loadHistory(
    application: ApiJobApplication
  ): Observable<JobApplication> {
    return this.applicationApi
      .getApplicationHistory(application.id)
      .pipe(
        map(history =>
          toJobApplication(application, history)
        )
      );
  }

  loadFromBackend(): void {
    this.refreshApplications().subscribe({
      error: error => {
        console.error(
          'Failed to load applications:',
          error
        );
      }
    });
  }

  refreshApplications(): Observable<JobApplication[]> {
    return this.applicationApi.getApplications().pipe(
      switchMap(applications => {
        if (applications.length === 0) {
          return of([] as JobApplication[]);
        }

        return forkJoin(
          applications.map(application =>
            this.loadHistory(application)
          )
        );
      }),
      tap(applications => {
        this.applications.splice(
          0,
          this.applications.length,
          ...applications
        );

        this.publishApplications();
      })
    );
  }

  addApplication(
    application: JobApplication
  ): Observable<JobApplication> {
    return this.applicationApi
      .createApplication(toApiRequest(application))
      .pipe(
        switchMap(saved =>
          this.loadHistory(saved)
        ),
        tap(saved => {
          this.applications.push(saved);
          this.publishApplications();
        }),
        catchError(error => {
          console.error(
            'Failed to create application:',
            error
          );
          return throwError(() => error);
        })
      );
  }

  updateApplication(
    application: JobApplication
  ): Observable<JobApplication> {
    return this.applicationApi
      .updateApplication(
        application.id,
        toApiRequest(application)
      )
      .pipe(
        switchMap(saved =>
          this.loadHistory(saved)
        ),
        tap(saved => {
          const index = this.applications.findIndex(
            item => item.id === saved.id
          );

          if (index !== -1) {
            this.applications.splice(index, 1, saved);
          } else {
            this.applications.push(saved);
          }

          this.publishApplications();
        }),
        catchError(error => {
          console.error(
            'Failed to update application:',
            error
          );
          return throwError(() => error);
        })
      );
  }

  deleteApplication(
    id: number
  ): Observable<void> {
    return this.applicationApi.deleteApplication(id).pipe(
      tap(() => {
        const index = this.applications.findIndex(
          application => application.id === id
        );

        if (index !== -1) {
          this.applications.splice(index, 1);
        }

        this.publishApplications();
      }),
      catchError(error => {
        console.error(
          'Failed to delete application:',
          error
        );
        return throwError(() => error);
      })
    );
  }
}
