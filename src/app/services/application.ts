import { Injectable } from '@angular/core';
import { JobApplication } from '../models/job-application';

@Injectable({
  providedIn: 'root',
})
export class Application {

  
  private applications: JobApplication[] = [
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      location: 'Helsinki',
      status: 'Interview',
      appliedDate: '2026-10-20'

  }, 
{
  id: 2,
      company: 'Microsoft',
      position: 'Junior Software Engineer',
      location: 'Espoo',
      status: 'Applied',
      appliedDate: '2026-10-18'
},
{
  id: 3,
  company: 'Nokia',
  position: 'Software Developer',
  location: 'Espoo',
  status: 'Assessment',
  appliedDate: '2026-10-15'
},
{
  id: 4,
  company: 'KONE',
  position: 'Full Stack Developer',
  location: 'Helsinki',
  status: 'Rejected',
  appliedDate: '2026-10-10'
}
];

getApplications(): JobApplication[] {
  return this.applications;
}

addApplication(application: JobApplication): void {
  this.applications.push(application);
}

updateApplication(updatedApplication: JobApplication): void {
  this.applications = this.applications.map(
    application =>
      application.id === updatedApplication.id
        ? updatedApplication
        : application
  );
}

deleteApplication(id: number): void {
  this.applications = this.applications.filter(
    application => application.id !== id
  );
}

}
