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
      appliedDate: '2026-10-10',
      jobUrl: '',
      jobDescription: '',
      notes: '',
      statusHistory: [
        {
          status: 'Interview',
          changedAt: '2026-10-10T10:00:00'
        }
      ],
      interviewDate: '',
      interviewNotes: ''
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
      notes: '',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: '2026-10-12T10:00:00'
        }
      ],
      interviewDate: '',
      interviewNotes: ''
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
      notes: '',
      statusHistory: [
        {
          status: 'Assessment',
          changedAt: '2026-10-12T10:00:00'
        }
      ],
      interviewDate: '',
      interviewNotes: ''
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
      notes: '',
      statusHistory: [
        {
          status: 'Rejected',
          changedAt: '2026-10-12T10:00:00'
        }
      ],
      interviewDate: '',
      interviewNotes: ''
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

  application.statusHistory = [
    {
      status: application.status,
      changedAt: new Date().toISOString()
    }
  ];

  this.applications.push(application);

  this.saveApplications();
}

updateApplication(updatedApplication: JobApplication): void {
  this.applications = this.applications.map(
    application => {
      if (application.id === updatedApplication.id) {

        let statusHistory = [
          ...(application.statusHistory ?? [])
        ];

        // Case 1: the application status changed
        if (application.status !== updatedApplication.status) {

          statusHistory.push({
            status: updatedApplication.status,
            changedAt: new Date().toISOString(),
            interviewDate:
              updatedApplication.status === 'Interview'
                ? updatedApplication.interviewDate
                : undefined
          });

        }

        // Case 2: application is still in Interview,
        // but its interview date may have been changed
        else if (updatedApplication.status === 'Interview') {

          statusHistory = statusHistory.map(history =>
            history.status === 'Interview'
              ? {
                  ...history,
                  interviewDate: updatedApplication.interviewDate
                }
              : history
          );

        }

        updatedApplication.statusHistory = statusHistory;

        return updatedApplication;
      }

      return application;
    }
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

