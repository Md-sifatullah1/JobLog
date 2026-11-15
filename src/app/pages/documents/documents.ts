
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

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
export class Documents implements OnInit {

  documents: JobDocument[] = [];
  documentTypes = documentTypes;

  readonly maxFileSize = 5 * 1024 * 1024;

  isLoading = true;
  isSaving = false;
  isDeleting = false;
  downloadingId: number | null = null;

  errorMessage = '';
  selectedFileError = '';
  originalFileName = '';

  showAddForm = false;
  editingDocumentId: number | null = null;

  selectedFile: File | null = null;

  newDocument = this.createEmptyDocument();

  constructor(
    private documentService: Document,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  get documentLimit(): number {
    return this.documentService.documentLimit;
  }

  get documentCount(): number {
    return this.documents.length;
  }

  get remainingSlots(): number {
    return Math.max(
      this.documentLimit - this.documentCount,
      0
    );
  }

  get hasReachedLimit(): boolean {
    return this.documentCount >= this.documentLimit;
  }

  private loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.documentService.getDocuments()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: documents => {
          this.documents = documents;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to load documents:', error);
          this.errorMessage =
            'Unable to load documents. Check that the backend is running.';
          this.cdr.markForCheck();
        }
      });
  }

  openAddForm(): void {
    if (this.hasReachedLimit || this.isLoading) {
      return;
    }

    this.editingDocumentId = null;
    this.selectedFile = null;
    this.selectedFileError = '';
    this.originalFileName = '';
    this.errorMessage = '';

    this.newDocument = this.createEmptyDocument();
    this.showAddForm = true;
  }

  editDocument(document: JobDocument): void {
    this.editingDocumentId = document.id;
    this.selectedFile = null;
    this.selectedFileError = '';
    this.originalFileName = document.fileName;
    this.errorMessage = '';

    this.newDocument = {
      id:document.id,
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
    if (form.invalid || this.isSaving || this.selectedFileError) {
      return;
    }

    if (this.editingDocumentId === null && !this.selectedFile) {
      this.selectedFileError = 'Please select a file.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const { name, type, notes } = this.newDocument;

    const request$ = this.editingDocumentId !== null
      ? this.documentService.updateDocument(
          this.editingDocumentId,
          name,
          type,
          notes,
          this.selectedFile ?? undefined
        )
      : this.documentService.addDocument(
          name,
          type,
          notes,
          this.selectedFile!
        );

    request$
      .pipe(finalize(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: savedDocument => {
          const index = this.documents.findIndex(
            document => document.id === savedDocument.id
          );

          if (index >= 0) {
            this.documents = this.documents.map(
              document =>
                document.id === savedDocument.id
                  ? savedDocument
                  : document
            );
          } else {
            this.documents = [
              ...this.documents,
              savedDocument
            ];
          }

          this.closeForm();
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to save document:', error);
          this.errorMessage =
            'Unable to save the document. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  deleteDocument(id: number): void {
    if (this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.documentService.deleteDocument(id)
      .pipe(finalize(() => {
        this.isDeleting = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(
            document => document.id !== id
          );
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to delete document:', error);
          this.errorMessage =
            'Unable to delete the document. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  downloadDocument(document: JobDocument): void {
    if (this.downloadingId !== null) {
      return;
    }

    this.downloadingId = document.id;
    this.errorMessage = '';

    this.documentService.downloadDocument(document.id)
      .pipe(finalize(() => {
        this.downloadingId = null;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');

          link.href = url;
          link.download = document.fileName;

          window.document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to download document:', error);
          this.errorMessage =
            'Unable to download the document.';
          this.cdr.markForCheck();
        }
      });
  }

  closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.showAddForm = false;
    this.editingDocumentId = null;
    this.selectedFile = null;
    this.selectedFileError = '';
    this.originalFileName = '';

    this.newDocument = this.createEmptyDocument();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.selectedFileError = '';
    this.selectedFile = null;

    if (!file) {
      if (this.editingDocumentId === null) {
        this.clearSelectedFileMetadata();
      } else {
        this.restoreOriginalFileMetadata();
      }
      return;
    }

    const allowedTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension ||
        allowedTypes[extension] !== file.type) {
      this.selectedFileError =
        'Please select a valid PDF, DOC or DOCX file.';
      input.value = '';
      this.restoreOriginalFileMetadata();
      return;
    }

    if (file.size === 0 || file.size > this.maxFileSize) {
      this.selectedFileError =
        'The selected file must be between 1 byte and 5 MB.';
      input.value = '';
      this.restoreOriginalFileMetadata();
      return;
    }

    this.selectedFile = file;
    this.newDocument.fileName = file.name;
    this.newDocument.fileSize = file.size;
    this.newDocument.fileType = file.type;
  }

  private clearSelectedFileMetadata(): void {
    this.newDocument.fileName = '';
    this.newDocument.fileSize = 0;
    this.newDocument.fileType = '';
  }

  private restoreOriginalFileMetadata(): void {
    if (this.editingDocumentId === null) {
      this.clearSelectedFileMetadata();
      return;
    }

    const existing = this.documents.find(
      document => document.id === this.editingDocumentId
    );

    if (existing) {
      this.newDocument.fileName = existing.fileName;
      this.newDocument.fileSize = existing.fileSize;
      this.newDocument.fileType = existing.fileType;
    }
  }

  getOriginalFileName(): string {
    return this.originalFileName;
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

  private createEmptyDocument(): JobDocument {
    return {
      id: 0,
      name: '',
      type: 'Resume' as DocumentType,
      fileName: '',
      fileSize: 0,
      fileType: '',
      dateAdded: new Date().toISOString().split('T')[0],
      notes: ''
    };
  }
}
