
package com.joblog.backend.service;

import com.joblog.backend.entity.ApplicationStatusHistory;
import com.joblog.backend.entity.JobApplication;
import com.joblog.backend.repository.ApplicationStatusHistoryRepository;
import com.joblog.backend.repository.JobApplicationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final ApplicationStatusHistoryRepository historyRepository;

    public JobApplicationService(
            JobApplicationRepository repository,
            ApplicationStatusHistoryRepository historyRepository) {

        this.repository = repository;
        this.historyRepository = historyRepository;
    }

    // Get all job applications
    public List<JobApplication> getAllApplications() {
        return repository.findAll();
    }

    // Get a single job application by ID
    public Optional<JobApplication> getApplicationById(Long id) {
        return repository.findById(id);
    }

    // Create a new application and its initial status history
    @Transactional
    public JobApplication createApplication(JobApplication application) {

        application.setId(null);

        JobApplication savedApplication = repository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setApplication(savedApplication);
        history.setStatus(savedApplication.getStatus());
        history.setChangedAt(LocalDateTime.now());

        if ("Interview".equals(savedApplication.getStatus())) {
            history.setInterviewDate(savedApplication.getInterviewDate());
        }

        historyRepository.save(history);

        return savedApplication;
    }

    // Update an application and maintain its status history
    @Transactional
    public Optional<JobApplication> updateApplication(
            Long id, JobApplication updatedApplication) {

        return repository.findById(id).map(existingApplication -> {

            boolean statusChanged = !Objects.equals(
                    existingApplication.getStatus(),
                    updatedApplication.getStatus()
            );

            // Update existing application fields
            existingApplication.setCompany(updatedApplication.getCompany());
            existingApplication.setPosition(updatedApplication.getPosition());
            existingApplication.setLocation(updatedApplication.getLocation());
            existingApplication.setStatus(updatedApplication.getStatus());
            existingApplication.setAppliedDate(updatedApplication.getAppliedDate());

            // Update additional application fields
            existingApplication.setJobUrl(updatedApplication.getJobUrl());
            existingApplication.setJobDescription(updatedApplication.getJobDescription());
            existingApplication.setNotes(updatedApplication.getNotes());
            existingApplication.setInterviewDate(updatedApplication.getInterviewDate());
            existingApplication.setInterviewNotes(updatedApplication.getInterviewNotes());

            JobApplication savedApplication = repository.save(existingApplication);

            // Case 1: Application status has changed
            if (statusChanged) {

                ApplicationStatusHistory history = new ApplicationStatusHistory();
                history.setApplication(savedApplication);
                history.setStatus(savedApplication.getStatus());
                history.setChangedAt(LocalDateTime.now());

                if ("Interview".equals(savedApplication.getStatus())) {
                    history.setInterviewDate(savedApplication.getInterviewDate());
                }

                historyRepository.save(history);

            }
            // Case 2: Status remains Interview
            else if ("Interview".equals(savedApplication.getStatus())) {

                List<ApplicationStatusHistory> historyRecords =
                        historyRepository.findByApplicationIdOrderByChangedAtAsc(id);

                for (ApplicationStatusHistory history : historyRecords) {

                    if ("Interview".equals(history.getStatus())) {
                        history.setInterviewDate(savedApplication.getInterviewDate());
                    }
                }

                historyRepository.saveAll(historyRecords);
            }

            return savedApplication;
        });
    }

    // Delete an application and its status history
    @Transactional
    public boolean deleteApplication(Long id) {

        if (!repository.existsById(id)) {
            return false;
        }

        List<ApplicationStatusHistory> historyRecords =
                historyRepository.findByApplicationIdOrderByChangedAtAsc(id);

        historyRepository.deleteAll(historyRecords);

        repository.deleteById(id);

        return true;
    }
}
