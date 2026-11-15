
package com.joblog.backend.repository;

import com.joblog.backend.entity.JobDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobDocumentRepository
        extends JpaRepository<JobDocument, Long> {
}
