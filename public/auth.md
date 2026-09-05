# EcoTracker Agent Authentication

EcoTracker is a biodiversity monitoring platform. Authentication is required to submit or manage observations.

## Authentication Method

EcoTracker uses email/password and OAuth 2.0 (Google) for user authentication.

## Agent Registration

AI agents wishing to interact with EcoTracker's data should:

1. Register an account at https://ecotracking.base44.app/register
2. Use email+password credentials to authenticate
3. Include the returned session token in subsequent API requests

## Public Endpoints

The following routes are publicly accessible without authentication:
- `GET /` — Community map and recent observations
- `GET /about` — Platform information
- `GET /contact` — Contact form

## Protected Endpoints

The following routes require authentication:
- `POST /api/` — All data-mutation endpoints
- `GET /admin` — Admin dashboard (role: admin only)

## Contact

For API access or integration inquiries, use the contact form at https://ecotracking.base44.app/contact
