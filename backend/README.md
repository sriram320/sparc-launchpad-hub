# SPARC Club Web Platform Backend

A production-ready FastAPI backend for the SPARC Club web platform. This backend powers user authentication, event management, QR-code attendance, blog/gallery uploads, and profile management.

## Architecture

- **Framework**: FastAPI (Python 3.11+) with Pydantic models and async SQLAlchemy
- **Database**: AWS RDS PostgreSQL with Alembic migrations
- **Authentication**: AWS Cognito with Google & Microsoft OAuth
- **Storage**: AWS S3 for images, videos, QR codes, and profile pictures
- **Deployment**: Docker container deployed to AWS Elastic Beanstalk or ECS/Fargate
- **CI/CD**: GitHub Actions workflow for build/test/deploy
- **Secrets Management**: AWS Secrets Manager or Parameter Store

## Features

- Role-based Access Control (member, host, superadmin)
- Event management and registrations
- QR code generation for event attendance
- Blog post management
- Gallery image uploads
- User profile management

## Getting Started

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for local development)
- AWS account (for production deployment)

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/sparc-launchpad-hub.git
cd sparc-launchpad-hub/backend
```

2. Create a `.env` file from the example
```bash
cp .env.example .env
# Edit .env with your local settings
```

3. Start the development environment with Docker Compose
```bash
docker-compose up -d
```

4. Run database migrations
```bash
docker-compose exec api alembic upgrade head
```

5. The API will be available at http://localhost:8000
   - API documentation: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Running Tests

```bash
docker-compose exec api pytest
```

## API Endpoints

- **Authentication & Profiles**
  - POST /api/v1/auth/login - Cognito OAuth redirect
  - GET /api/v1/auth/me - Get user info from JWT
  - PATCH /api/v1/users/me - Edit profile

- **Events**
  - POST /api/v1/events - Create new event (host only)
  - GET /api/v1/events - List events (public)
  - GET /api/v1/events/{id} - Get event details
  - PATCH /api/v1/events/{id} - Edit event (host only)
  - DELETE /api/v1/events/{id} - Delete event (host only)
  - PATCH /api/v1/events/{id}/toggle-paid - Mark paid/unpaid (host only)

- **Registrations & Attendance**
  - POST /api/v1/registrations/{event_id}/register - Register for event
  - GET /api/v1/registrations/me - List user's bookings
  - PATCH /api/v1/registrations/{id}/checkin-start - Mark session start
  - PATCH /api/v1/registrations/{id}/checkin-end - Mark session end

- **Blog**
  - POST /api/v1/blog - Create post (host only)
  - GET /api/v1/blog - List posts
  - GET /api/v1/blog/{id} - View post
  - PATCH /api/v1/blog/{id} - Edit post (author/host)
  - DELETE /api/v1/blog/{id} - Delete post (author/host)

- **Gallery**
  - POST /api/v1/gallery - Upload image (host only)
  - GET /api/v1/gallery - List images

## Deployment

### AWS Setup Instructions

1. Create RDS PostgreSQL instance
2. Create S3 buckets: sparc-gallery, sparc-qrcodes, sparc-profilepics
3. Configure AWS Cognito User Pool with Google/Microsoft identity providers
4. Store credentials in AWS Secrets Manager

### CI/CD Pipeline

The GitHub Actions workflow will:

1. Run tests on pull requests
2. Build and push Docker image to ECR on merge to main
3. Deploy to ECS/Fargate on merge to main

## Project Structure

```
app/
├── api/
│   ├── endpoints/
│   │   ├── auth.py
│   │   ├── blog.py
│   │   ├── events.py
│   │   ├── gallery.py
│   │   ├── registrations.py
│   │   └── users.py
│   └── api.py
├── core/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── qrcode_utils.py
│   └── storage.py
├── crud/
│   ├── base.py
│   ├── blog.py
│   ├── event.py
│   ├── gallery.py
│   ├── registration.py
│   └── user.py
├── models/
│   ├── base.py
│   ├── blog.py
│   ├── event.py
│   ├── gallery.py
│   ├── registration.py
│   └── user.py
├── schemas/
│   ├── base.py
│   ├── blog.py
│   ├── event.py
│   ├── gallery.py
│   ├── registration.py
│   └── user.py
└── main.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.