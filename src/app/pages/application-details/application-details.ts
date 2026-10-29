import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-application-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './application-details.html',
  styleUrl: './application-details.scss',
})
export class ApplicationDetails {

  application: JobApplication | undefined;

  constructor(
    private route: ActivatedRoute,
    private applicationService: Application
  ) {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.application =
      this.applicationService.getApplicationById(id);
  }

}