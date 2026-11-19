# LearnLens AI — End-to-End DevOps Project

An end-to-end DevOps implementation of a developer learning resource platform, deployed on AWS using Docker, Terraform, Ansible, Jenkins, Amazon EKS, Prometheus, and Grafana.

## Project Overview

LearnLens AI helps developers discover technical learning resources, explore documentation, and save personal learning notes.

This project demonstrates the deployment and automation of a full-stack application using modern DevOps practices, including infrastructure as code, configuration management, CI/CD, containerization, Kubernetes orchestration, and monitoring.

## Application Features

- Developer learning dashboard
- Learning Resource Finder
- Technology filters for Linux, AWS, Docker, Kubernetes, Terraform, Jenkins, and Git
- Search learning resources by keyword
- Links to technical documentation and tutorials
- Create and view personal learning notes
- PostgreSQL database for persistent storage
- Redis service integration
- Backend health-check endpoint

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Backend | Python, FastAPI |
| Database | PostgreSQL, pgvector image |
| Cache / Supporting Service | Redis |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |
| Cloud | AWS EC2, VPC, EKS, ECR |
| Infrastructure as Code | Terraform |
| Configuration Management | Ansible |
| CI/CD | Jenkins |
| Orchestration | Kubernetes, Amazon EKS |
| Monitoring | Prometheus, Grafana |
| Version Control | Git, GitHub |

## Architecture

```text
                    Developer
                        |
                        v
                  GitHub Repository
                        |
                        v
                  Jenkins CI/CD
                        |
             +----------+----------+
             |                     |
             v                     v
       Ansible Setup          AWS EKS Deployment
             |                     |
             v                     v
        AWS EC2 Server        Kubernetes Cluster
             |                     |
       Docker Compose         +----+----------------+
             |                |    |       |        |
             v                v    v       v        v
        Application          Frontend Backend PostgreSQL Redis
                              |
                              v
                        AWS LoadBalancer

              Amazon ECR stores container images

              Prometheus --> Metrics Collection
                    |
                    v
                 Grafana
              Monitoring Dashboard

             Terraform --> Infrastructure
```

## DevOps Implementation

### 1. Infrastructure as Code — Terraform

- Created AWS infrastructure configurations using Terraform.
- Managed infrastructure through reusable configuration files.
- Used Terraform to provision and manage AWS resources.

### 2. Configuration Management — Ansible

- Created Ansible inventory and playbooks.
- Organized configuration tasks using roles.
- Automated server configuration and application setup.
- Verified connectivity and configuration through Jenkins.

### 3. Containerization — Docker

- Containerized the frontend and backend.
- Configured PostgreSQL and Redis services.
- Used Docker Compose to run the application.
- Used Nginx to serve the frontend.

### 4. CI/CD — Jenkins

Implemented a Jenkins pipeline connected to the GitHub repository.

Pipeline stages:

1. Checkout — Retrieve source code from GitHub.
2. Ansible Connectivity Test — Verify server connectivity.
3. Ansible Configuration — Apply server configuration.
4. Deploy to EC2 — Deploy the application using Docker Compose.
5. Deploy to Amazon EKS — Apply Kubernetes manifests and verify deployment health.

The pipeline completed successfully, with all five stages passing.

### 5. Container Registry — Amazon ECR

- Created separate ECR repositories for frontend and backend images.
- Built and pushed application images to Amazon ECR.
- Configured Kubernetes deployments to use the ECR images.

### 6. Container Orchestration — Amazon EKS

Deployed the application to an Amazon EKS cluster.

Kubernetes resources include:

- Frontend Deployment and LoadBalancer Service
- Backend Deployment and ClusterIP Service
- PostgreSQL Deployment and Service
- Redis Deployment and Service
- PersistentVolumeClaim for PostgreSQL
- GP3 StorageClass using the AWS EBS CSI driver

PostgreSQL persistent storage was verified by creating a test note and confirming that it remained available after refreshing the application.

### 7. Monitoring — Prometheus and Grafana

Implemented monitoring inside the EKS cluster.

**Prometheus**
- Collects Kubernetes and node metrics.
- Scrapes Kubernetes API server and node targets.
- Uses Node Exporter and Kube State Metrics.

**Grafana**
- Connected to Prometheus as its data source.
- Imported a Kubernetes monitoring dashboard.
- Displays cluster, namespace, node, and resource metrics.

Prometheus targets were verified healthy, and both EKS nodes were reporting metrics.

## Repository Structure

```text
LearnLens-AI/
│
├── ansible/
│   ├── inventory/
│   ├── playbooks/
│   └── roles/
│
├── backend/
│
├── frontend/
│
├── k8s/
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── gp3-storageclass.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres.yaml
│   └── redis.yaml
│
├── terraform/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

## Local Application Setup

### Prerequisites

- Git
- Docker
- Docker Compose

### Clone the Repository

```bash
git clone https://github.com/sahilsarfaraz9492-deep/learnlens-ai.git

cd learnlens-ai
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Update the environment variables with your own database credentials and configuration.

### Start the Application

```bash
docker compose up -d --build
```

### Verify Containers

```bash
docker compose ps
```

### Test Backend Health

```bash
curl http://localhost/api/health
```

Expected health response:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "application": "LearnLens AI"
}
```

## Kubernetes Deployment

The Kubernetes manifests are available in the `k8s/` directory.

Before deployment:

1. Configure access to your Amazon EKS cluster.
2. Create the `learnlens` namespace.
3. Create the required `learnlens-db-secret` Kubernetes Secret.
4. Ensure the ECR images are available and the manifest image references are correct.

Apply the manifests:

```bash
kubectl apply -f k8s/
```

Check deployments:

```bash
kubectl get deployments -n learnlens
```

Check pods:

```bash
kubectl get pods -n learnlens
```

Check services:

```bash
kubectl get services -n learnlens
```

**Security:** Never commit `.env`, Kubernetes Secrets, passwords, AWS credentials, private keys, or Terraform state files to GitHub.

## Project Verification

The following checks were successfully completed:

| Verification | Result |
|---|---|
| Jenkins CI/CD pipeline | SUCCESS |
| Ansible connectivity | Passed |
| Ansible configuration | Passed |
| EC2 application deployment | Passed |
| Amazon EKS deployment | Passed |
| Frontend HTTP response | 200 OK |
| Backend health check | Healthy |
| PostgreSQL connection | Connected |
| Redis connection | Connected |
| EKS worker nodes | 2/2 Ready |
| Application pods | 4/4 Running |
| Prometheus targets | Healthy |
| Grafana dashboard | Metrics visible |

## Key DevOps Skills Demonstrated

- Linux and server administration
- Git and GitHub
- AWS infrastructure
- Terraform
- Ansible
- Docker and Docker Compose
- Jenkins CI/CD
- Amazon ECR
- Kubernetes and Amazon EKS
- Persistent storage with AWS EBS CSI
- Prometheus monitoring
- Grafana dashboards
- Application deployment and troubleshooting

## Important Cost Consideration

The Amazon EKS environment was created for project demonstration and testing. AWS resources such as EC2 worker nodes, EBS volumes, and LoadBalancers can incur charges.

Destroy temporary infrastructure after completing the demonstration. Preserve any resources you still need, and verify that associated AWS resources have been cleaned up.

## Author

**Muhammad Sahil Sarfaraz**

DevOps Engineer Aspirant

GitHub: https://github.com/sahilsarfaraz9492-deep

---

*This is a hands-on DevOps portfolio project demonstrating the deployment, automation, orchestration, and monitoring of a full-stack application on AWS.*
