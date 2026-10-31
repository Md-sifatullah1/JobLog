import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { JobApplication } from '../../models/job-application';

import {
  ApplicationStatus,
  applicationStatuses
} from '../../models/application-status';

import { Application } from '../../services/application';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'company-az'
  | 'company-za'
  | 'status';

@Component({
  selector: 'app-applications',
  imports: [FormsModule, RouterLink],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications {

  applications: JobApplication[];

  applicationStatuses = applicationStatuses;

  selectedStatus: ApplicationStatus | 'All' = 'All';

  searchTerm = '';

  selectedSort: SortOption = 'newest';

  showAddForm = false;

  editingApplicationId: number | null = null;

  newApplication: {
    company: string;
    position: string;
    location: string;
    status: ApplicationStatus;
    appliedDate: string;
    jobUrl: string;
    jobDescription: string;
    notes: string;
    interviewDate: string;
    interviewNotes: string;
  } = {
    company: '',
    position: '',
    location: '',
    status: 'Applied',
    appliedDate: '',
    jobUrl: '',
    jobDescription: '',
    notes: '',
    interviewDate: '',
    interviewNotes: ''
  };

  constructor(
    private applicationService: Application,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.applications =
      this.applicationService.getApplications();

    const editId =
      this.route.snapshot.queryParamMap.get('edit');

    if (editId) {

      const application =
        this.applicationService
          .getApplicationById(Number(editId));

      if (application) {
        this.editApplication(application);
      }
    }
  }


  openAddForm(): void {

    this.editingApplicationId = null;

    this.newApplication = {
      company: '',
      position: '',
      location: '',
      status: 'Applied',
      appliedDate: '',
      jobUrl: '',
      jobDescription: '',
      notes: '',
      interviewDate: '',
      interviewNotes: ''
    };

    this.showAddForm = true;
  }


  closeAddForm(): void {

    this.showAddForm = false;

    this.editingApplicationId = null;
  }


  addApplication(form: NgForm): void {

    if (form.invalid) {
      return;
    }


    const application: JobApplication = {

      id:
        this.editingApplicationId ??
        Date.now(),

      company:
        this.newApplication.company,

      position:
        this.newApplication.position,

      location:
        this.newApplication.location,

      status:
        this.newApplication.status,

      appliedDate:
        this.newApplication.appliedDate,

      jobUrl:
        this.newApplication.jobUrl,

      jobDescription:
        this.newApplication.jobDescription,

      notes:
        this.newApplication.notes,

      interviewDate:
        this.newApplication.interviewDate,

      interviewNotes:
        this.newApplication.interviewNotes,

      statusHistory:
        this.editingApplicationId
          ? this.applicationService
              .getApplicationById(
                this.editingApplicationId
              )
              ?.statusHistory ?? []
          : []
    };


    const wasEditing =
      this.editingApplicationId !== null;


    if (this.editingApplicationId === null) {

      this.applicationService
        .addApplication(application);

    } else {

      this.applicationService
        .updateApplication(application);
    }


    this.applications =
      this.applicationService
        .getApplications();


    this.resetForm(form);

    this.closeAddForm();


    if (wasEditing) {
      this.clearEditQueryParam();
    }
  }


  deleteApplication(id: number): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this application?'
      );

    if (!confirmed) {
      return;
    }


    this.applicationService
      .deleteApplication(id);


    this.applications =
      this.applicationService
        .getApplications();
  }


  get filteredApplications(): JobApplication[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    let results =
      this.applications.filter(
        application => {

          const matchesStatus =
            this.selectedStatus === 'All' ||
            application.status ===
              this.selectedStatus;


          const matchesSearch =
            search === '' ||

            application.company
              .toLowerCase()
              .includes(search) ||

            application.position
              .toLowerCase()
              .includes(search) ||

            application.location
              .toLowerCase()
              .includes(search);


          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );


    /*
     * Create a copy before sorting.
     *
     * Array.sort() changes the original array.
     * We do not want to change this.applications.
     */
    results = [...results];


    switch (this.selectedSort) {

      case 'newest':

        results.sort(
          (a, b) =>
            new Date(b.appliedDate).getTime() -
            new Date(a.appliedDate).getTime()
        );

        break;


      case 'oldest':

        results.sort(
          (a, b) =>
            new Date(a.appliedDate).getTime() -
            new Date(b.appliedDate).getTime()
        );

        break;


      case 'company-az':

        results.sort(
          (a, b) =>
            a.company.localeCompare(
              b.company
            )
        );

        break;


      case 'company-za':

        results.sort(
          (a, b) =>
            b.company.localeCompare(
              a.company
            )
        );

        break;


      case 'status':

        results.sort(
          (a, b) =>
            a.status.localeCompare(
              b.status
            )
        );

        break;
    }


    return results;
  }


  get hasActiveFilters(): boolean {

    return (
      this.searchTerm.trim() !== '' ||
      this.selectedStatus !== 'All'
    );
  }


  get resultCount(): string {

    return `Showing ${
      this.filteredApplications.length
    } of ${
      this.applications.length
    } applications`;
  }


  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.selectedSort = 'newest';
  }


  resetForm(form: NgForm): void {

    form.resetForm();


    this.newApplication = {

      company: '',

      position: '',

      location: '',

      status: 'Applied',

      appliedDate: '',

      jobUrl: '',

      jobDescription: '',

      notes: '',

      interviewDate: '',

      interviewNotes: ''
    };
  }


  cancelForm(form: NgForm): void {

    const wasEditing =
      this.editingApplicationId !== null;


    this.resetForm(form);

    this.closeAddForm();


    if (wasEditing) {
      this.clearEditQueryParam();
    }
  }


  editApplication(
    application: JobApplication
  ): void {

    this.editingApplicationId =
      application.id;


    this.newApplication = {

      company:
        application.company,

      position:
        application.position,

      location:
        application.location,

      status:
        application.status,

      appliedDate:
        application.appliedDate,

      jobUrl:
        application.jobUrl ?? '',

      jobDescription:
        application.jobDescription ?? '',

      notes:
        application.notes ?? '',

      interviewDate:
        application.interviewDate ?? '',

      interviewNotes:
        application.interviewNotes ?? ''
    };


    this.showAddForm = true;
  }


  clearEditQueryParam(): void {

    this.router.navigate(
      ['/applications']
    );
  }

}