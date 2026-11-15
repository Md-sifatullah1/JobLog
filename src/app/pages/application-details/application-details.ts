
import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';

@Component({
  selector: 'app-application-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './application-details.html',
  styleUrl: './application-details.scss',
})
export class ApplicationDetails implements OnInit, OnDestroy {

  application: JobApplication | undefined;

  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private applicationService: Application
  ) {}

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.subscription =
      this.applicationService.applications$.subscribe(() => {
        this.application =
          this.applicationService.getApplicationById(id);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
