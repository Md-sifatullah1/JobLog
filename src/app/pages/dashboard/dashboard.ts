
import { Component } from '@angular/core';
import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  applications: JobApplication[];

constructor(private applicationService: Application) {
  this.applications = this.applicationService.getApplications();
}

get totalApplications(): number {
  return this.applications.length;
}

get totalInterviews(): number {
  return this.applications.filter(
    application => application.status === 'Interview'
  ).length;
}

get totalOffers(): number {
  return this.applications.filter(
    application => application.status === 'Offer'
  ).length;
}
get responseRate(): number {

  if (this.totalApplications === 0) {
    return 0;
  }

  const responses = this.applications.filter(
    application =>
      application.status === 'Assessment' ||
      application.status === 'Interview' ||
      application.status === 'Offer' ||
      application.status === 'Rejected'
  ).length;

  return Math.round(
    (responses / this.totalApplications) * 100
  );
}

get stats() {
  return [
    {
      label: 'Total Applications',
      value: this.totalApplications
    },
    {
      label: 'Interviews',
      value: this.totalInterviews
    },
    {
      label: 'Offers',
      value: this.totalOffers
    },
    {
      label: 'Response Rate',
      value: `${this.responseRate}%`
    }
  ];
}

}