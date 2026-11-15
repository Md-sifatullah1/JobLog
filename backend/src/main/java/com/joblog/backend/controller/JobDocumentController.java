
package com.joblog.backend.controller;

import com.joblog.backend.entity.JobDocument;
import com.joblog.backend.service.JobDocumentService;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {
    "http://localhost:4200",
    "http://127.0.0.1:4200"
})
public class JobDocumentController {

    private final JobDocumentService service;

    public JobDocumentController(JobDocumentService service) {
        this.service = service;
    }

    public record DocumentResponse(
        Long id,
        String name,
        String type,
        String fileName,
        Long fileSize,
        String fileType,
        LocalDate dateAdded,
        String notes
    ) {}

    private DocumentResponse toResponse(JobDocument document) {
        return new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getType(),
            document.getFileName(),
            document.getFileSize(),
            document.getFileType(),
            document.getDateAdded(),
            document.getNotes()
        );
    }

    @GetMapping
    public List<DocumentResponse> getAll() {
        return service.getAllDocuments()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @GetMapping("/{id}")
    public DocumentResponse getOne(@PathVariable Long id) {
        return toResponse(service.getDocument(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse create(
        @RequestParam String name,
        @RequestParam String type,
        @RequestParam(required = false) String notes,
        @RequestParam MultipartFile file
    ) throws IOException {

        return toResponse(
            service.createDocument(name, type, notes, file)
        );
    }

    @PutMapping(
        value = "/{id}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public DocumentResponse update(
        @PathVariable Long id,
        @RequestParam String name,
        @RequestParam String type,
        @RequestParam(required = false) String notes,
        @RequestParam(required = false) MultipartFile file
    ) throws IOException {

        return toResponse(
            service.updateDocument(id, name, type, notes, file)
        );
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {

        JobDocument document = service.getDocument(id);

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment()
                    .filename(document.getFileName())
                    .build()
                    .toString()
            )
            .contentLength(document.getFileSize())
            .body(document.getFileData());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteDocument(id);
    }
}
