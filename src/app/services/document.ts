import { Injectable } from '@angular/core';

import { JobDocument } from '../models/job-document';

@Injectable({
  providedIn: 'root',
})
export class Document {

  private storageKey = 'joblog-documents';

  readonly documentLimit = 10;

  private documents: JobDocument[] = [
    {
      id: 1,
      name: 'Software Developer CV',
      type: 'Resume',
      fileName: 'software-developer-cv.pdf',
      fileSize: 1240000,
      fileType: 'application/pdf',
      dateAdded: '2026-10-25',
      notes: 'Main CV for software development positions'
    },
    {
      id: 2,
      name: 'Degree Certificate',
      type: 'Certificate',
      fileName: 'degree-certificate.pdf',
      fileSize: 850000,
      fileType: 'application/pdf',
      dateAdded: '2026-10-27',
      notes: 'Bachelor degree certificate'
    }
  ];

  constructor() {
    this.loadDocuments();
  }

  getDocuments(): JobDocument[] {
    return this.documents;
  }

  getDocumentById(id: number): JobDocument | undefined {
    return this.documents.find(
      document => document.id === id
    );
  }

  addDocument(document: JobDocument): boolean {

    if (this.hasReachedLimit()) {
      return false;
    }

    this.documents.push(document);
    this.saveDocuments();

    return true;
  }

  updateDocument(updatedDocument: JobDocument): void {

    this.documents = this.documents.map(
      document =>
        document.id === updatedDocument.id
          ? updatedDocument
          : document
    );

    this.saveDocuments();
  }

  deleteDocument(id: number): void {

    this.documents = this.documents.filter(
      document => document.id !== id
    );

    this.saveDocuments();
  }

  hasReachedLimit(): boolean {
    return this.documents.length >= this.documentLimit;
  }

  getRemainingDocumentSlots(): number {
    return Math.max(
      this.documentLimit - this.documents.length,
      0
    );
  }

  private saveDocuments(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.documents)
    );
  }

  private loadDocuments(): void {

    const savedDocuments =
      localStorage.getItem(this.storageKey);

    if (savedDocuments) {

      try {

        this.documents =
          JSON.parse(savedDocuments);

      } catch (error) {

        console.error(
          'Failed to load documents:',
          error
        );

      }

    } else {

      this.saveDocuments();

    }
  }
}