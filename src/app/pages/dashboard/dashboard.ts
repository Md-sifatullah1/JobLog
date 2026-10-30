
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
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

get totalRejected(): number {
  return this.applications.filter(
    application => application.status === 'Rejected'
  ).length;
}

get recentApplications(): JobApplication[] {
  return this.applications
    .slice()
    .sort(
      (a, b) =>
        new Date(b.appliedDate).getTime() -
        new Date(a.appliedDate).getTime()
    )
    .slice(0, 5);
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
      label: 'Rejected',
      value: this.totalRejected
    },
    {
      label: 'Response Rate',
      value: `${this.responseRate}%`
    }
  ];
}

}