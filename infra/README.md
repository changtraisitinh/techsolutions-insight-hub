# Infrastructure

Infrastructure as code for Insight Hub deployment.

## Directories

### [docker](./docker/)
Docker configurations for local development.

**Files:**
- `docker-compose.yml` - All services
- `Dockerfile.base` - Base image
- Individual service Dockerfiles

### [k8s](./k8s/)
Kubernetes manifests for production deployment.

**Includes:**
- Deployments
- Services
- Ingress
- ConfigMaps
- Secrets

### [terraform](./terraform/)
Terraform configurations for cloud resources.

**Providers:**
- AWS (ECS, RDS, S3)
- Google Cloud (optional)
- Cloudflare (CDN, DNS)

### [environments](./environments/)
Environment-specific configurations.

**Environments:**
- `dev/` - Local development
- `staging/` - Staging environment
- `prod/` - Production environment

## Getting Started

### Local Development (Docker)

```bash
cd infra/docker
docker-compose up
```

### Production (Kubernetes)

```bash
cd infra/k8s
kubectl apply -f .
```

### Cloud Resources (Terraform)

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Documentation

See individual README files in each directory for detailed instructions.
