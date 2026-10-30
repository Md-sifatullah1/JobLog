import { Component } from '@angular/core';
import { ActivatedRoute,Router, RouterLink } from '@angular/router';
import { JobApplication } from '../../models/job-application';
import { FormsModule, NgForm } from '@angular/forms';
import { Application } from '../../services/application';
import { ApplicationStatus, applicationStatuses } from '../../models/application-status';


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

  constructor(
    private applicationService: Application,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.applications = this.applicationService.getApplications();
    const editId = this.route.snapshot.queryParamMap.get('edit');

    if (editId) {
      const application =
        this.applicationService.getApplicationById(Number(editId));
      if (application) {
        this.editApplication(application);
      }
    }
  }

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

  openAddForm() {
    this.editingApplicationId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingApplicationId = null;
  }

  addApplication(form: NgForm) {
    if (form.invalid) {
      return;
    }
  
    const application: JobApplication = {
      id: this.editingApplicationId ?? Date.now(),
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
    
      statusHistory: this.editingApplicationId
        ? this.applicationService.getApplicationById(this.editingApplicationId)?.statusHistory ?? []
        : []
    };
    const wasEditing = this.editingApplicationId != null;
  
    if (this.editingApplicationId === null) {
      this.applicationService.addApplication(application);
    } else {
      this.applicationService.updateApplication(application);
    }
  
    this.applications = this.applicationService.getApplications();
  
    this.resetForm(form);
    this.closeAddForm();

    if (wasEditing) {
      this.clearEditQueryParam();
    }
  }

  deleteApplication(id: number) {
    this.applicationService.deleteApplication(id);
    this.applications = this.applicationService.getApplications();
  }

  get filteredApplications(): JobApplication[] {
    const search = this.searchTerm.toLowerCase();
  
    return this.applications.filter(application => {
  
      const matchesStatus =
        this.selectedStatus === 'All' ||
        application.status === this.selectedStatus;
  
      const matchesSearch =
        application.company.toLowerCase().includes(search) ||
        application.position.toLowerCase().includes(search);
  
      return matchesStatus && matchesSearch;
    });
  }

  get resultCount(): string {
    return `Showing ${this.filteredApplications.length} of ${this.applications.length} applications`;
  }


  resetForm(form: NgForm) {

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

  cancelForm(form: NgForm) {
    const wasEditing = this.editingApplicationId !== null;
    this.resetForm(form);
    this.closeAddForm();
    if (wasEditing) {
      this.clearEditQueryParam();
    }
  }

  editApplication(application: JobApplication) {
    this.editingApplicationId = application.id;
  
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

  clearEditQueryParam() {
    this.router.navigate(['/applications']);
  }

}