# Team Management System

This module provides a complete team management system for Medicare, allowing administrators to create, update, and manage teams within the organization.

## Features

- Create teams with names, emails, descriptions, and labels
- Assign owners and members from staff
- Track all changes with a comprehensive audit log
- Flexible team organization with labels

## Models

### Team Model

The main Team model is stored in `team.model.js`, with the following key fields:

- `name`: The team's display name
- `email`: The team's email address (must be @medicares.in)
- `description`: Optional description of the team's purpose
- `owners`: Array of Staff ObjectIDs who have full control over the team
- `members`: Array of Staff ObjectIDs who belong to the team
- `labels`: Array of string labels for categorization
- `auditLog`: Array of audit log entries tracking all changes
- `createdBy`: Reference to the Staff who created the team
- `isActive`: Boolean indicating if the team is active

## Routes

Team management API routes are available at:

- `GET /api/teams` - List all teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:id` - Get a specific team
- `PUT /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team
- `POST /api/teams/:teamId/members/:memberId` - Add a member to a team
- `DELETE /api/teams/:teamId/members/:memberId` - Remove a member from a team
- `POST /api/teams/:teamId/owners/:ownerId` - Add an owner to a team
- `DELETE /api/teams/:teamId/owners/:ownerId` - Remove an owner from a team
- `GET /api/teams/:teamId/eligible-staff` - Get staff who can be added to a team

## Related Components

The associated frontend components can be found in `Frontend/src/components/Admin/Team/`. 