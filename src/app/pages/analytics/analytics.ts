import { Component } from '@angular/core';

import { JobApplication } from '../../models/job-application';
import {
  ApplicationStatus,
  applicationStatuses
} from '../../models/application-status';
import { Application } from '../../services/application';

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {

  applications: JobApplication[];

  constructor(private applicationService: Application) {
    this.applications =
      this.applicationService.getApplications();
  }

  // -----------------------------
  // Basic totals
  // -----------------------------

  get totalApplications(): number {
    return this.applications.length;
  }

  get responseRate(): number {

    if (this.totalApplications === 0) {
      return 0;
    }
  
    const respondedApplications =
      this.applications.filter(
        application =>
          application.statusHistory?.some(
            history =>
              history.status === 'Assessment' ||
              history.status === 'Interview' ||
              history.status === 'Offer' ||
              history.status === 'Rejected'
          )
      ).length;
  
    return Math.round(
      (respondedApplications /
        this.totalApplications) * 100
    );
  }

  get interviewRate(): number {
    return this.calculateHistoricalRate('Interview');
  }

  get offerRate(): number {
    return this.calculateHistoricalRate('Offer');
  }

  get rejectionRate(): number {
    return this.calculateHistoricalRate('Rejected');
  }

  // -----------------------------
  // Current status distribution
  // -----------------------------

  get statusBreakdown() {
    return applicationStatuses.map(status => {

      const count = this.countByStatus(status);

      const percentage =
        this.totalApplications === 0
          ? 0
          : Math.round(
              (count / this.totalApplications) * 100
            );

      return {
        status: status,
        count: count,
        percentage: percentage
      };
    });
  }

  private countByStatus(
    status: ApplicationStatus
  ): number {

    return this.applications.filter(
      application =>
        application.status === status
    ).length;
  }

  // -----------------------------
  // Historical conversion rates
  // -----------------------------

  private calculateHistoricalRate(
    status: ApplicationStatus
  ): number {

    if (this.totalApplications === 0) {
      return 0;
    }

    const applicationsReachedStatus =
      this.applications.filter(
        application =>
          application.statusHistory?.some(
            history =>
              history.status === status
          )
      ).length;

    return Math.round(
      (applicationsReachedStatus /
        this.totalApplications) * 100
    );
  }

  // -----------------------------
  // Conversion funnel
  // -----------------------------

  get conversionFunnel() {

    const stages: ApplicationStatus[] = [
      'Applied',
      'Assessment',
      'Interview',
      'Offer'
    ];

    const stageCounts = stages.map(
      status =>
        this.applications.filter(
          application =>
            this.hasReachedStatus(
              application,
              status
            )
        ).length
    );

    return stages.map(
      (status, index) => {

        const count =
          stageCounts[index];

        let conversionRate = 0;

        if (index === 0) {

          conversionRate =
            this.totalApplications === 0
              ? 0
              : Math.round(
                  (count /
                    this.totalApplications) *
                    100
                );

        } else {

          const previousCount =
            stageCounts[index - 1];

          conversionRate =
            previousCount === 0
              ? 0
              : Math.round(
                  (count /
                    previousCount) *
                    100
                );
        }

        return {
          status: status,
          count: count,
          conversionRate: conversionRate
        };
      }
    );
  }

  private hasReachedStatus(
    application: JobApplication,
    status: ApplicationStatus
  ): boolean {

    return application.statusHistory?.some(
      history =>
        history.status === status
    ) ?? false;
  }

  // -----------------------------
  // Application activity
  // -----------------------------

  get monthlyApplications() {

    const months: {
      month: string;
      count: number;
    }[] = [];

    const today = new Date();

    for (let i = 5; i >= 0; i--) {

      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const month =
        date.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        });

      months.push({
        month: month,
        count: 0
      });
    }

    for (const application of this.applications) {

      const applicationDate =
        new Date(application.appliedDate);

      const month =
        applicationDate.toLocaleString(
          'en-US',
          {
            month: 'short',
            year: 'numeric'
          }
        );

      const existingMonth =
        months.find(
          item =>
            item.month === month
        );

      if (existingMonth) {
        existingMonth.count++;
      }
    }

    const maxCount = Math.max(
      ...months.map(
        item => item.count
      ),
      0
    );

    return months.map(item => ({
      month: item.month,
      count: item.count,
      percentage:
        maxCount === 0
          ? 0
          : Math.round(
              (item.count / maxCount) *
                100
            )
    }));
  }
}