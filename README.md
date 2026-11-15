# JobLog

**A full-stack job application organizing system built with Angular, Spring Boot, and PostgreSQL.**

JobLog helps users organize job applications, track recruitment progress, manage interviews, store documents, and analyze job search activity.

JobLog can run locally on macOS, Windows, and Linux. The automated launcher has currently been implemented and tested on macOS.

## Features

### Application Management
- Create, view, edit, and delete job applications.
- Track applications through Saved, Applied, Assessment, Interview, Offer, and Rejected statuses.
- Store company information, job descriptions, application links, and personal notes.
- Search, filter, sort, and navigate through application records.
- View individual application details.

### Dashboard and Analytics
- View application statistics and recruitment progress.
- Monitor applications across different statuses.
- Explore visual summaries of job search activity.

### Interview Management
- Schedule interviews and record interview details.
- Manage interview dates and notes.
- Track changes in application status over time.

### Document Management
- Upload and organize resumes, cover letters, certificates, and other documents.
- Download, update, and delete stored files.
- Store document contents directly in PostgreSQL.
- Validate supported file formats and upload sizes.

### Local Application Features
- Run the application locally without cloud hosting.
- Access the frontend and backend through a single local server.
- Store job application data persistently in PostgreSQL.
- Use a macOS launcher with Keychain credential integration.
- Create timestamped PostgreSQL backups on macOS.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 21, TypeScript, HTML, SCSS |
| UI | Lucide Icons |
| State Management | RxJS |
| Backend | Java, Spring Boot 4 |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL 17 |
| API | REST, JSON, multipart file uploads |
| Build Tools | Angular CLI, npm, Maven Wrapper |
| Testing | Vitest, Spring Boot testing dependencies |
| Version Control | Git, GitHub |

## Architecture

JobLog uses a three-layer architecture:

```text
Angular Frontend
      |
      | HTTP / REST API
      v
Spring Boot Backend
      |
      | Spring Data JPA / Hibernate
      v
PostgreSQL Database
```

The Angular frontend handles user interaction, routing, and application state.

Spring Boot provides REST endpoints for managing job applications, application status history, and documents.

PostgreSQL stores application records, status changes, document metadata, and uploaded file contents.

Spring Boot can also serve the compiled Angular frontend, allowing the application to run from a single address.

## Getting Started

### Prerequisites

- Windows, macOS, or Linux
- Node.js and npm
- Java JDK 21 or later
- PostgreSQL 17
- Git

The project includes a Maven Wrapper, so a separate Maven installation is not required.

### Installation

Clone the repository:

```bash
git clone https://github.com/Md-sifatullah1/JobLog.git
cd JobLog
```

Install frontend dependencies:

```bash
npm install
```

### Database Configuration

Create a PostgreSQL database named `joblog` and a database user named `joblog_app` with appropriate permissions.

The backend uses the following connection settings:

```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/joblog
spring.datasource.username=joblog_app
spring.datasource.password=${DB_PASSWORD}
```

Set the `DB_PASSWORD` environment variable to the database user's password before starting Spring Boot.

Database credentials should never be committed to Git.

## Running JobLog

### macOS (Automated Launcher)

On the configured macOS environment, run:

```bash
./start-joblog.sh
```

Alternatively, double-click `JobLog.command` in Finder.

The launcher checks PostgreSQL availability, prepares the Angular frontend when necessary, and starts Spring Boot.

The launcher can retrieve the database password from macOS Keychain after the corresponding entry has been configured.

Open:

**http://localhost:8080**

### Windows (Development Mode)

Ensure PostgreSQL is running and the `joblog` database has been configured.

Open PowerShell in the project directory and set the database password for the current session:

```powershell
$env:DB_PASSWORD = Read-Host "PostgreSQL password" -MaskInput
```

Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Open a second PowerShell terminal in the project root:

```powershell
npm start
```

Open:

**http://localhost:4200**

The Angular development proxy forwards `/api` requests to Spring Boot on port 8080.

The Windows setup uses separate development servers. A dedicated Windows launcher has not yet been implemented or tested.

### Linux (Development Mode)

Ensure PostgreSQL is running and the database has been configured.

Set the database password:

```bash
read -s -p "PostgreSQL password: " DB_PASSWORD
echo
export DB_PASSWORD
```

Start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

In another terminal, start Angular:

```bash
npm start
```

Open:

**http://localhost:4200**

A dedicated Linux launcher has not yet been implemented or tested.

## Production Frontend Build

Build Angular:

```bash
npm run build
```

The generated browser assets are located in:

```text
dist/JobLog/browser/
```

The macOS startup script prepares these files for serving through Spring Boot.

## Database Backups

On macOS, create a database backup using:

```bash
./backup-joblog.sh
```

Backups are stored outside the repository in:

```text
~/JobLog-backups/
```

Each backup uses PostgreSQL's custom archive format and includes application data and stored documents.

On Windows and Linux, PostgreSQL's `pg_dump` utility can be used to create equivalent backups.

For additional protection, copies should be kept on a separate storage device.

## Project Structure

```text
JobLog/
├── backend/
│   └── src/main/
│       ├── java/com/joblog/backend/
│       │   ├── controller/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       └── resources/
├── src/
│   └── app/
│       ├── components/
│       ├── models/
│       ├── pages/
│       └── services/
├── public/
├── angular.json
├── proxy.conf.json
├── start-joblog.sh
├── backup-joblog.sh
├── JobLog.command
└── README.md
```

## Screenshots

Screenshots of the dashboard, application management, analytics, interview management, and document management pages will be added here.

## Current Scope

JobLog is a single-user application intended for local use.

The frontend, backend, and database use cross-platform technologies. The automated startup and backup scripts are currently designed for macOS.

The application does not require cloud hosting or a remote database. Authentication and multi-user access are outside the current scope.

## Future Improvements

- Automated launchers for Windows and Linux.
- Improved automated testing coverage.
- Additional analytics.
- Database migration management.
- Further user interface refinements.
- Multi-user system when I have enough money 🐸🐸

## Author

Developed by [Md-sifatullah1](https://github.com/Md-sifatullah1).