# auth.md

EcoTracker uses token-based authentication managed by the Base44 platform.

## Authentication Methods

- **Email/Password** — standard credential login
- **Google OAuth** — single sign-on via Google

## Agent Registration

AI agents interacting with EcoTracker's public MCP server (`/.well-known/mcp.json`) do not require authentication for read-only access to public entities (Announcements, InvasiveWatchlist).

Agents requiring write access or access to user-scoped data must authenticate via the Base44 auth flow. Contact the EcoTracker team via `/contact` for integration enquiries.

## Endpoints

- Login: `https://ecotracking.base44.app/login`
- Register: `https://ecotracking.base44.app/register`
- MCP Server: see `/.well-known/mcp.json`
