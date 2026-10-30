
import { ApplicationStatus } from './application-status';
import { StatusHistory } from './status-history';

export interface JobApplication {
  id: number;
  company: string;
  position: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  jobUrl: string;
  jobDescription: string;
  notes: string;
  statusHistory: StatusHistory[];
  interviewDate: string;
  interviewNotes: string;
}