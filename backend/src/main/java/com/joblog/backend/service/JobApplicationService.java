
package com.joblog.backend.service;

import com.joblog.backend.entity.JobApplication;
import com.joblog.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    public List<JobApplication> getAllApplications() {
        return repository.findAll();
    }

    public Optional<JobApplication> getApplicationById(Long id) {
        return repository.findById(id);
    }

    public JobApplication createApplication(JobApplication application) {
        return repository.save(application);
    }

    public Optional<JobApplication> updateApplication(
            Long id, JobApplication updatedApplication) {

        return repository.findById(id).map(existingApplication -> {

            existingApplication.setCompany(updatedApplication.getCompany());
            existingApplication.setPosition(updatedApplication.getPosition());
            existingApplication.setLocation(updatedApplication.getLocation());
            existingApplication.setStatus(updatedApplication.getStatus());
            existingApplication.setAppliedDate(updatedApplication.getAppliedDate());

            return repository.save(existingApplication);
        });
    }

    public boolean deleteApplication(Long id) {

        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
