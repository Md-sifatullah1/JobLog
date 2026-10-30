import { ApplicationStatus } from './application-status';

export interface StatusHistory {
  status: ApplicationStatus;
  changedAt: string;
  interviewDate?: string;
}