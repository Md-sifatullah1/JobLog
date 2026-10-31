import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  JobDocument,
  DocumentType,
  documentTypes
} from '../../models/job-document';

import { Document } from '../../services/document';

@Component({
  selector: 'app-documents',
  imports: [FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class Documents {

  documents: JobDocument[];

  documentTypes = documentTypes;

  readonly maxFileSize = 5 * 1024 * 1024;

  selectedFileError = '';
  originalFileName = '';

  showAddForm = false;

  editingDocumentId: number | null = null;

  newDocument: {
    name: string;
    type: DocumentType;
    fileName: string;
    fileSize: number;
    fileType: string;
    dateAdded: string;
    notes: string;
  } = this.createEmptyDocument();

  constructor(
    private documentService: Document
  ) {
    this.documents =
      this.documentService.getDocuments();
  }

  get documentLimit(): number {
    return this.documentService.documentLimit;
  }

  get documentCount(): number {
    return this.documents.length;
  }

  get remainingSlots(): number {
    return this.documentService
      .getRemainingDocumentSlots();
  }

  get hasReachedLimit(): boolean {
    return this.documentService
      .hasReachedLimit();
  }

  openAddForm(): void {

    if (this.hasReachedLimit) {
      return;
    }

    this.editingDocumentId = null;
    this.newDocument =
      this.createEmptyDocument();

    this.showAddForm = true;
  }

  editDocument(document: JobDocument): void {

    this.editingDocumentId = document.id;
    this.selectedFileError = '';
    this.originalFileName = document.fileName;
  
    this.newDocument = {
      name: document.name,
      type: document.type,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileType: document.fileType,
      dateAdded: document.dateAdded,
      notes: document.notes
    };
  
    this.showAddForm = true;
  }

  saveDocument(form: NgForm): void {

    if (form.invalid) {
      return;
    }

    if (this.editingDocumentId !== null) {

      const updatedDocument: JobDocument = {
        id: this.editingDocumentId,
        ...this.newDocument
      };

      this.documentService
        .updateDocument(updatedDocument);

    } else {

      const document: JobDocument = {
        id: Date.now(),
        ...this.newDocument
      };

      const added =
        this.documentService
          .addDocument(document);

      if (!added) {
        return;
      }
    }

    this.refreshDocuments();
    this.closeForm();
  }

  deleteDocument(id: number): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this document?'
      );

    if (!confirmed) {
      return;
    }

    this.documentService.deleteDocument(id);

    this.refreshDocuments();
  }

  closeForm(): void {

    this.showAddForm = false;
    this.editingDocumentId = null;
    this.selectedFileError = '';
    this.originalFileName = '';

    this.newDocument =
      this.createEmptyDocument();
  }

  formatFileSize(bytes: number): string {

    if (bytes < 1000) {
      return `${bytes} B`;
    }

    if (bytes < 1000000) {
      return `${(bytes / 1000).toFixed(1)} KB`;
    }

    return `${(bytes / 1000000).toFixed(1)} MB`;
  }

  private refreshDocuments(): void {
    this.documents =
      this.documentService.getDocuments();
  }

  private createEmptyDocument() {
    return {
      name: '',
      type: 'Resume' as DocumentType,
      fileName: '',
      fileSize: 0,
      fileType: '',
      dateAdded:
        new Date().toISOString().split('T')[0],
      notes: ''
    };
  }

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;
  
    const file = input.files?.[0];
  
    this.selectedFileError = '';
  
    if (!file) {
      return;
    }
  
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  
    if (!allowedTypes.includes(file.type)) {
      this.selectedFileError =
        'Please select a PDF, DOC or DOCX file.';
  
      input.value = '';
      return;
    }
  
    if (file.size > this.maxFileSize) {
      this.selectedFileError =
        'The selected file must be smaller than 5 MB.';
  
      input.value = '';
      return;
    }
  
    this.newDocument.fileName = file.name;
    this.newDocument.fileSize = file.size;
    this.newDocument.fileType = file.type;
  }

  getOriginalFileName(): string {
    return this.originalFileName;
  }
}