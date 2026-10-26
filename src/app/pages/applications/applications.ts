import { Component } from '@angular/core';
import { JobApplication } from '../../models/job-application';
import { FormsModule, NgForm } from '@angular/forms';
import { Application } from '../../services/application';

@Component({
  selector: 'app-applications',
  imports: [FormsModule],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications {

  applications: JobApplication[];

  constructor(private applicationService: Application){
    this.applications = this.applicationService.getApplications();

  }

  showAddForm = false;

  newApplication = {
    company: '',
    position: '',
    location: '',
    status: 'Applied',
    appliedDate: ''
  };

  openAddForm() {
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
  }

  addApplication(form: NgForm) {

    if (form.invalid) {
      return;
    }
  
    const application: JobApplication = {
      id: Date.now(),
      company: this.newApplication.company,
      position: this.newApplication.position,
      location: this.newApplication.location,
      status: this.newApplication.status,
      appliedDate: this.newApplication.appliedDate
    };
  
    this.applicationService.addApplication(application);
  
    this.resetForm(form);
  
    this.closeAddForm();
  }

  deleteApplication(id: number) {
    this.applicationService.deleteApplication(id);
    this.applications = this.applicationService.getApplications();
  }

  resetForm(form: NgForm) {

    form.resetForm();
  
    this.newApplication = {
      company: '',
      position: '',
      location: '',
      status: 'Applied',
      appliedDate: ''
    };
  }

  cancelForm(form: NgForm) {
    this.resetForm(form);
    this.closeAddForm();
  }
}