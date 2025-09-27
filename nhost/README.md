# Nhost Setup for Clinic Management System

This directory contains the Nhost backend configuration for the clinic management system.

## Prerequisites

1. Install Nhost CLI:
```bash
npm install -g @nhost/cli
```

2. Create a Nhost account at https://nhost.io

## Development Setup

1. Initialize the Nhost project:
```bash
nhost login
nhost init
```

2. Start the local development environment:
```bash
nhost dev
```

This will start:
- PostgreSQL database on port 5432
- Hasura GraphQL API on port 8080
- Nhost Auth on port 9999
- Nhost Storage on port 8000
- Nhost Functions on port 7777

3. Apply migrations and seed data:
```bash
# Migrations are applied automatically when running nhost dev
# Seeds can be applied manually if needed
```

4. Configure Google OAuth:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add the client ID to your environment variables
   - Update the nhost.toml file with your Google OAuth settings

## Database Schema

The database includes the following main tables:

### SaaS Multi-Tenant Core
- `subscription_plans` - Available subscription plans
- `feature_flags` - Configurable features
- `plan_features` - Features included in each plan
- `tenants` - Clinic instances (multi-tenant isolation)
- `tenant_feature_overrides` - Custom feature access per tenant
- `tenant_usage` - Usage tracking for billing
- `billing_history` - Billing and payment records

### Business Logic
- `users` - System users with role-based access
- `patients` - Patient records
- `professionals` - Healthcare professionals
- `appointments` - Appointment scheduling
- `materials` - Inventory items
- `material_categories` - Inventory categorization
- `material_entries` - Stock movements
- `waiting_list` - Patient waiting list
- `anamnesis_templates` - Digital anamnesis forms
- `anamnesis_forms` - Completed anamnesis instances

## Security Features

### Row Level Security (RLS)
All tenant-specific tables have RLS policies that ensure:
- Users can only access data from their own tenant
- Super admins have global access
- Proper isolation between different clinics

### Role-Based Access Control
- `super_admin` - Global system administration
- `owner` - Clinic owner with full tenant access
- `admin` - Tenant administrator
- `professional` - Healthcare professional
- `receptionist` - Front desk operations
- `user` - Basic user access

## GraphQL API

The Hasura GraphQL API provides:
- Automatic CRUD operations for all tables
- Real-time subscriptions
- Role-based permissions
- Relationship queries
- Custom business logic via functions

Access the GraphQL playground at: http://localhost:8080/console

## Environment Variables

Copy `.env.local` and configure:
- `VITE_NHOST_SUBDOMAIN` - Your Nhost project subdomain
- `VITE_NHOST_REGION` - Your Nhost region
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Production Deployment

1. Create a Nhost project in the cloud
2. Deploy using Nhost CLI:
```bash
nhost deploy
```

3. Configure production environment variables
4. Set up custom domain and SSL certificates
5. Configure Google OAuth for production URLs

## Monitoring

- Database metrics available in Nhost dashboard
- GraphQL query analytics
- Authentication logs
- Storage usage tracking