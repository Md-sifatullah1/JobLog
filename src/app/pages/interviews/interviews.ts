
import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { JobApplication } from '../../models/job-application';
import { Application } from '../../services/application';

@Component({
  selector: 'app-interviews',
  imports: [RouterLink, DatePipe],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss',
})
export class Interviews implements OnInit, OnDestroy {

  interviews: JobApplication[] = [];

  private subscription?: Subscription;

  constructor(
    private applicationService: Application
  ) {}

  ngOnInit(): void {
    this.subscription =
      this.applicationService.applications$.subscribe(
        applications => {
          this.interviews = applications.filter(
            application =>
              application.status === 'Interview'
          );
        }
      );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
