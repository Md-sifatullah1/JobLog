
package com.joblog.backend.service;

import com.joblog.backend.entity.JobDocument;
import com.joblog.backend.repository.JobDocumentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class JobDocumentService {

    private static final int DOCUMENT_LIMIT = 10;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> DOCUMENT_TYPES = Set.of(
        "Resume", "Cover Letter", "Certificate",
        "Portfolio", "Other"
    );

    private final JobDocumentRepository repository;

    public JobDocumentService(JobDocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<JobDocument> getAllDocuments() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public JobDocument getDocument(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Document not found"
            ));
    }

    @Transactional
    public JobDocument createDocument(
        String name,
        String type,
        String notes,
        MultipartFile file
    ) throws IOException {

        if (repository.count() >= DOCUMENT_LIMIT) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Document limit reached"
            );
        }

        validateMetadata(name, type);
        validateFile(file);

        JobDocument document = new JobDocument();

        document.setName(name.trim());
        document.setType(type);
        document.setNotes(notes == null ? "" : notes);
        document.setDateAdded(LocalDate.now());

        setFile(document, file);

        return repository.save(document);
    }

    @Transactional
    public JobDocument updateDocument(
        Long id,
        String name,
        String type,
        String notes,
        MultipartFile file
    ) throws IOException {

        JobDocument document = getDocument(id);

        validateMetadata(name, type);

        document.setName(name.trim());
        document.setType(type);
        document.setNotes(notes == null ? "" : notes);

        if (file != null && !file.isEmpty()) {
            validateFile(file);
            setFile(document, file);
        }

        return repository.save(document);
    }

    @Transactional
    public void deleteDocument(Long id) {
        JobDocument document = getDocument(id);
        repository.delete(document);
    }

    private void validateMetadata(String name, String type) {
        if (name == null || name.isBlank() ||
            name.length() > 255 ||
            type == null || !DOCUMENT_TYPES.contains(type)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid document name or type"
            );
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A file is required"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "File exceeds the 5 MB limit"
            );
        }

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid filename"
            );
        }

        String normalized = filename.replace('\\', '/');
        normalized = normalized.substring(
            normalized.lastIndexOf('/') + 1
        );

        if (normalized.isBlank() || normalized.length() > 255) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid filename"
            );
        }

        String extension = normalized.toLowerCase();

        if (!extension.endsWith(".pdf") &&
            !extension.endsWith(".doc") &&
            !extension.endsWith(".docx")) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only PDF, DOC and DOCX files are allowed"
            );
        }

        String contentType = file.getContentType();

        boolean validType =
            (extension.endsWith(".pdf") &&
             "application/pdf".equals(contentType)) ||
            (extension.endsWith(".doc") &&
             "application/msword".equals(contentType)) ||
            (extension.endsWith(".docx") &&
             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                 .equals(contentType));

        if (!validType) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "File extension and content type do not match"
            );
        }

        // MIME type is supplied by the client. Validate actual
        // file signatures/content before exposing this publicly.
    }

    private void setFile(
        JobDocument document,
        MultipartFile file
    ) throws IOException {

        String filename = file.getOriginalFilename()
            .replace('\\', '/');

        filename = filename.substring(
            filename.lastIndexOf('/') + 1
        );

        document.setFileName(filename);
        document.setFileSize(file.getSize());
        document.setFileType(file.getContentType());
        document.setFileData(file.getBytes());
    }
}
