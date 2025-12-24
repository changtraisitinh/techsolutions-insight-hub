# Scripts

Operational and growth automation scripts.

## Directories

### [lead-import](./lead-import/)
Batch import leads from various sources.

**Scripts:**
- `import-csv.sh` - Import from CSV file
- `import-google-maps.sh` - Bulk Google Maps extraction

### [audit-generator](./audit-generator/)
Generate business audit reports.

**Scripts:**
- `generate-audit.sh` - Create full business audit
- `batch-audit.sh` - Bulk audit generation

### [email-campaign](./email-campaign/)
Email campaign automation.

**Scripts:**
- `send-campaign.sh` - Send email campaign
- `track-responses.sh` - Track email responses

### [crm-sync](./crm-sync/)
Synchronize with external CRM systems.

**Scripts:**
- `sync-hubspot.sh` - HubSpot integration
- `sync-pipedrive.sh` - Pipedrive integration

### [reporting](./reporting/)
Analytics and reporting scripts.

**Scripts:**
- `monthly-report.sh` - Generate monthly metrics
- `customer-dashboard.sh` - Customer performance dashboard

## Usage

```bash
# Example: Import leads from CSV
./scripts/lead-import/import-csv.sh leads.csv --industry=fnb

# Example: Generate audit
./scripts/audit-generator/generate-audit.sh --business-id=uuid
```

## Development

Scripts are written in Bash/Python and use service APIs.
