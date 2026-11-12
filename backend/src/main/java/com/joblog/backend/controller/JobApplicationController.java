
package com.joblog.backend.controller;

import com.joblog.backend.entity.ApplicationStatusHistory;
import com.joblog.backend.entity.JobApplication;
import com.joblog.backend.repository.ApplicationStatusHistoryRepository;
import com.joblog.backend.service.JobApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://127.0.0.1:4200"
})
public class JobApplicationController {

    private final JobApplicationService service;
    private final ApplicationStatusHistoryRepository historyRepository;

    public JobApplicationController(
            JobApplicationService service,
            ApplicationStatusHistoryRepository historyRepository) {

        this.service = service;
        this.historyRepository = historyRepository;
    }

    // Get all job applications
    @GetMapping
    public List<JobApplication> getAllApplications() {
        return service.getAllApplications();
    }

    // Get a single job application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(
            @PathVariable Long id) {

        return service.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get the status history of a specific application
    @GetMapping("/{id}/history")
    public ResponseEntity<List<Map<String, Object>>> getApplicationHistory(
            @PathVariable Long id) {

        // Return 404 if the application does not exist
        if (service.getApplicationById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Map<String, Object>> history =
                historyRepository
                        .findByApplicationIdOrderByChangedAtAsc(id)
                        .stream()
                        .map(record -> {
                            Map<String, Object> item = new HashMap<>();

                            item.put("status", record.getStatus());
                            item.put("changedAt", record.getChangedAt());
                            item.put("interviewDate", record.getInterviewDate());

                            return item;
                        })
                        .toList();

        return ResponseEntity.ok(history);
    }

    // Create a new job application
    @PostMapping
    public ResponseEntity<JobApplication> createApplication(
            @RequestBody JobApplication application) {

        application.setId(null);

        JobApplication savedApplication =
                service.createApplication(application);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedApplication);
    }

    // Update an existing job application
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplication application) {

        return service.updateApplication(id, application)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a job application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id) {

        boolean deleted = service.deleteApplication(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
