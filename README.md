# LearnLens AI

LearnLens AI is a developer knowledge management and learning platform. It helps developers discover technical documentation, explore DevOps learning resources, and save personal learning notes.

## Application Features

- Developer learning dashboard
- Learning Resource Finder
- Technology filters for Linux, AWS, Docker, Kubernetes, Terraform, Jenkins, and Git
- Search learning resources by keyword
- Links to official documentation and tutorials
- Create and view personal learning notes
- PostgreSQL database for persistent note storage
- Redis caching for notes
- Backend health-check endpoint

## Technology Stack

### Application
- React
- TypeScript
- Python
- FastAPI

### Data Storage
- PostgreSQL
- pgvector-enabled PostgreSQL image
- Redis

### Containerization
- Docker
- Docker Compose
- Nginx

### Cloud Infrastructure
- AWS EC2
- AWS VPC and networking
- Terraform infrastructure configuration

## Current Deployment

The application is deployed on an Ubuntu EC2 instance in AWS using Docker Compose.

Application URL:
http://44.193.197.206

Health-check endpoint:
http://44.193.197.206/api/health

## Run the Application

Clone the repository:

    git clone https://github.com/sahilsarfaraz9492-deep/learnlens-ai.git
    cd learnlens-ai

Create your environment file:

    cp .env.example .env

Update .env with your own secure database credentials.

Start the application:

    docker compose up -d --build

Check running containers:

    docker compose ps

Check application health:

    curl http://localhost/api/health

## DevOps Roadmap

The following stages are planned or in progress. They are not all implemented yet.

- [x] Initial full-stack application
- [x] Docker containerization
- [x] Docker Compose deployment
- [x] AWS EC2 deployment
- [x] Learning Resource Finder
- [x] PostgreSQL persistence and Redis caching
- [ ] Jenkins CI/CD pipeline
- [ ] Amazon ECR image publishing
- [ ] Automated deployment pipeline
- [ ] Ansible configuration management
- [ ] Kubernetes deployment
- [ ] Prometheus and Grafana monitoring
- [ ] Centralized logging
- [ ] Final end-to-end testing and documentation

## Project Status

The initial application and AWS EC2 deployment are operational. The project is being extended into an end-to-end DevOps automation project.
