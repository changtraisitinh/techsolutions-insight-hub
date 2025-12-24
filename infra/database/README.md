# Database Management

This directory contains database management tools for the Insight Hub project.

## Prisma Setup
We use Prisma as a powerful tool for viewing and editing data in the PostgreSQL database.

### Prerequisites
- Node.js installed
- Docker container `insight-hub-postgres` running (`cd ../docker && docker-compose up -d`)

### How to View/Edit Data
To start the visual database editor (Prisma Studio):

```bash
cd infra/database
npm install
npx prisma studio
```

This will automatically load the configuration and open a web interface at `http://localhost:5555`.
- Browse all extraction jobs and leads.
- Search and filter data.
- Edit existing records.
- Delete or export data.

### Schema Maintenance
The Prisma schema (`prisma/schema.prisma`) is mapped to the Python SQLAlchemy models in `services/maps-intelligence/database.py`. If you update the Python models, please update the Prisma schema to match.
