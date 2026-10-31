export type DocumentType =
  | 'Resume'
  | 'Cover Letter'
  | 'Certificate'
  | 'Portfolio'
  | 'Other';

export interface JobDocument {
  id: number;
  name: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  dateAdded: string;
  notes: string;
}

export const documentTypes: DocumentType[] = [
  'Resume',
  'Cover Letter',
  'Certificate',
  'Portfolio',
  'Other'
];