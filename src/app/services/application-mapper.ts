
import { JobApplication } from '../models/job-application';
import {
  ApiJobApplication,
  ApiJobApplicationRequest,
  ApiStatusHistory
} from './application-api';

export function toJobApplication(
  application: ApiJobApplication,
  history: ApiStatusHistory[]
): JobApplication {
  return {
    id: application.id,
    company: application.company,
    position: application.position,
    location: application.location,
    status: application.status,
    appliedDate: application.appliedDate,
    jobUrl: application.jobUrl ?? '',
    jobDescription: application.jobDescription ?? '',
    notes: application.notes ?? '',
    interviewDate: application.interviewDate ?? '',
    interviewNotes: application.interviewNotes ?? '',
    statusHistory: history.map(record => ({
      status: record.status,
      changedAt: record.changedAt,
      ...(record.interviewDate
        ? { interviewDate: record.interviewDate }
        : {})
    }))
  };
}

export function toApiRequest(
  application: JobApplication
): ApiJobApplicationRequest {
  return {
    company: application.company,
    position: application.position,
    location: application.location,
    status: application.status,
    appliedDate: application.appliedDate,
    jobUrl: application.jobUrl,
    jobDescription: application.jobDescription,
    notes: application.notes,
    interviewDate: application.interviewDate || null,
    interviewNotes: application.interviewNotes
  };
}
