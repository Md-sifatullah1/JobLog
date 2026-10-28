import { Injectable } from '@angular/core';
import { JobApplication } from '../models/job-application';

@Injectable({
  providedIn: 'root',
})
export class Application {
  
  private storageKey = 'joblog-applications';

  private applications: JobApplication[] = [
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      location: 'Helsinki',
      status: 'Interview',
      appliedDate: '2026-10-20',
      jobUrl: '',
      jobDescription: '',
      notes: ''
    }, 
    {
      id: 2,
      company: 'Microsoft',
      position: 'Junior Software Engineer',
      location: 'Espoo',
      status: 'Applied',
      appliedDate: '2026-10-18',
      jobUrl: '',
      jobDescription: '',
      notes: ''
    },
    {
      id: 3,
      company: 'Nokia',
      position: 'Software Developer',
      location: 'Espoo',
      status: 'Assessment',
      appliedDate: '2026-10-15',
      jobUrl: '',
      jobDescription: '',
      notes: ''
    },
    {
      id: 4,
      company: 'KONE',
      position: 'Full Stack Developer',
      location: 'Helsinki',
      status: 'Rejected',
      appliedDate: '2026-10-10',
      jobUrl: '',
      jobDescription: '',
      notes: ''
    }
];

constructor() {
  this.loadApplications();
}

getApplications(): JobApplication[] {
  return this.applications;
}
getApplicationById(id: number): JobApplication | undefined {
  return this.applications.find(
    application => application.id === id
  );
}

addApplication(application: JobApplication): void {
  this.applications.push(application);
  this.saveApplications();
}

updateApplication(updatedApplication: JobApplication): void {
  this.applications = this.applications.map(
    application =>
      application.id === updatedApplication.id
        ? updatedApplication
        : application
  );

  this.saveApplications();
}

deleteApplication(id: number): void {
  this.applications = this.applications.filter(
    application => application.id !== id
  );
  this.saveApplications();
}

private saveApplications(): void {
  localStorage.setItem(
    this.storageKey,
    JSON.stringify(this.applications)
  );
}

private loadApplications(): void {
  const savedApplications = localStorage.getItem(this.storageKey);

  if (savedApplications) {
    try {
      this.applications = JSON.parse(savedApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  } else {
    this.saveApplications();
  }
}
}

