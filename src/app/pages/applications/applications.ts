
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

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
export class Applications implements OnInit, OnDestroy {

  applications: JobApplication[];

  applicationStatuses = applicationStatuses;

  selectedStatus: ApplicationStatus | 'All' = 'All';

  searchTerm = '';

  selectedSort: SortOption = 'newest';

  pageSize = 10;
  currentPage = 1;

  showAddForm = false;

  editingApplicationId: number | null = null;

  isSaving = false;
  isDeleting = false;
  errorMessage = '';

  private applicationsSubscription?: Subscription;

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.applications =
      this.applicationService.getApplications();
  }


  ngOnInit(): void {
    this.applicationsSubscription =
      this.applicationService.applications$.subscribe(
        applications => {
          this.applications = applications;
  
          const editId =
            this.route.snapshot.queryParamMap.get('edit');
  
          if (editId && !this.showAddForm) {
            const application =
              this.applicationService.getApplicationById(
                Number(editId)
              );
  
            if (application) {
              this.editApplication(application);
            }
          }
  
          if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(
              this.totalPages,
              1
            );
          }
  
          // Notify to update the UI
          // when data arrives asynchronously.
          this.cdr.markForCheck();
        }
      );
  }
  
  ngOnDestroy(): void {
    this.applicationsSubscription?.unsubscribe();
  }

  openAddForm(): void {
    this.editingApplicationId = null;
    this.errorMessage = '';

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
    if (form.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const wasEditing =
      this.editingApplicationId !== null;

    const application: JobApplication = {
      id: this.editingApplicationId ?? 0,
      company: this.newApplication.company,
      position: this.newApplication.position,
      location: this.newApplication.location,
      status: this.newApplication.status,
      appliedDate: this.newApplication.appliedDate,
      jobUrl: this.newApplication.jobUrl,
      jobDescription: this.newApplication.jobDescription,
      notes: this.newApplication.notes,
      interviewDate: this.newApplication.interviewDate,
      interviewNotes: this.newApplication.interviewNotes,
      statusHistory: wasEditing
        ? this.applicationService.getApplicationById(
            this.editingApplicationId!
          )?.statusHistory ?? []
        : []
    };

    const request$ = wasEditing
      ? this.applicationService.updateApplication(application)
      : this.applicationService.addApplication(application);

    request$.subscribe({
      next: () => {
        this.isSaving = false;

        this.resetForm(form);
        this.closeAddForm();

        if (wasEditing) {
          this.clearEditQueryParam();
        }
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          'Unable to save the application. Please try again.';

        console.error(
          'Application save failed:',
          error
        );

        window.alert(this.errorMessage);
      }
    });
  }

  deleteApplication(id: number): void {
    if (this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.applicationService.deleteApplication(id).subscribe({
      next: () => {
        this.isDeleting = false;

        if (this.currentPage > this.totalPages) {
          this.currentPage = Math.max(
            this.totalPages,
            1
          );
        }
      },
      error: error => {
        this.isDeleting = false;
        this.errorMessage =
          'Unable to delete the application. Please try again.';

        console.error(
          'Application deletion failed:',
          error
        );

        window.alert(this.errorMessage);
      }
    });
  }

  get filteredApplications(): JobApplication[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    let results = this.applications.filter(
      application => {
        const matchesStatus =
          this.selectedStatus === 'All' ||
          application.status === this.selectedStatus;

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

        return matchesStatus && matchesSearch;
      }
    );

    // Sort a copy to avoid changing the original array.
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
            a.company.localeCompare(b.company)
        );
        break;

      case 'company-za':
        results.sort(
          (a, b) =>
            b.company.localeCompare(a.company)
        );
        break;

      case 'status':
        results.sort(
          (a, b) =>
            a.status.localeCompare(b.status)
        );
        break;
    }

    return results;
  }

  get totalPages(): number {
    return Math.ceil(
      this.filteredApplications.length / this.pageSize
    );
  }

  get paginatedApplications(): JobApplication[] {
    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    return this.filteredApplications.slice(
      startIndex,
      endIndex
    );
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];

    for (let page = 1; page <= this.totalPages; page++) {
      pages.push(page);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  previousPage(): void {
    this.changePage(this.currentPage - 1);
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
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
    this.currentPage = 1;
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
    this.editingApplicationId = application.id;
    this.errorMessage = '';

    this.newApplication = {
      company: application.company,
      position: application.position,
      location: application.location,
      status: application.status,
      appliedDate: application.appliedDate,
      jobUrl: application.jobUrl ?? '',
      jobDescription: application.jobDescription ?? '',
      notes: application.notes ?? '',
      interviewDate: application.interviewDate ?? '',
      interviewNotes: application.interviewNotes ?? ''
    };

    this.showAddForm = true;
  }

  clearEditQueryParam(): void {
    this.router.navigate(['/applications']);
  }
}
