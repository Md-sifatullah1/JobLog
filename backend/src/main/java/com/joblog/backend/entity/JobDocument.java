
package com.joblog.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "job_documents")
public class JobDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private LocalDate dateAdded;

    @Column(columnDefinition = "TEXT")
    private String notes;

   @org.hibernate.annotations.JdbcTypeCode(
    org.hibernate.type.SqlTypes.VARBINARY
    )
    @Column(name = "file_data", nullable = false, columnDefinition = "bytea")
    private byte[] fileData;

    public JobDocument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDate getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDate dateAdded) {
        this.dateAdded = dateAdded;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) {
        this.notes = notes;
    }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }
}
