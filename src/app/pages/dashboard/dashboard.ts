
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {

  applications: JobApplication[] = [];

  private applicationsSubscription?: Subscription;

  constructor(
    private applicationService: Application,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.applicationsSubscription =
      this.applicationService.applications$.subscribe(
        applications => {
          this.applications = applications;
          this.cdr.markForCheck();
        }
      );
  }

  ngOnDestroy(): void {
    this.applicationsSubscription?.unsubscribe();
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
