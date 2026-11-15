
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JobDocument, DocumentType } from '../models/job-document';

@Injectable({
  providedIn: 'root',
})
export class Document {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    '/api/documents';

  readonly documentLimit = 10;

  getDocuments(): Observable<JobDocument[]> {
    return this.http.get<JobDocument[]>(this.apiUrl);
  }

  getDocumentById(id: number): Observable<JobDocument> {
    return this.http.get<JobDocument>(
      `${this.apiUrl}/${id}`
    );
  }

  addDocument(
    name: string,
    type: DocumentType,
    notes: string,
    file: File
  ): Observable<JobDocument> {

    const formData = new FormData();

    formData.append('name', name);
    formData.append('type', type);
    formData.append('notes', notes);
    formData.append('file', file, file.name);

    return this.http.post<JobDocument>(
      this.apiUrl,
      formData
    );
  }

  updateDocument(
    id: number,
    name: string,
    type: DocumentType,
    notes: string,
    file?: File
  ): Observable<JobDocument> {

    const formData = new FormData();

    formData.append('name', name);
    formData.append('type', type);
    formData.append('notes', notes);

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<JobDocument>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/download`,
      { responseType: 'blob' }
    );
  }
}
