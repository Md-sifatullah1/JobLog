import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';


@Component({
  selector: 'app-interviews',
  imports: [RouterLink, DatePipe],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss',
})
export class Interviews {

  interviews: JobApplication[] = [];

  constructor(private applicationService: Application) {
    this.loadInterviews();
  }

  private loadInterviews(): void {
    this.interviews =
      this.applicationService
        .getApplications()
        .filter(application => application.status === 'Interview');
  }
}