Sports Scheduler
## A Sports Scheduler built using Node.js, Express.js, PostgreSQL, and EJS to streamline event organization, player participation, and admin management.
## Features
- **User Authentication**: Secure registration and login for admins and players.
- **Admin Module**: Create, edit, and delete events. View event participation reports.
- **Player Module**: View available events, register for events, and track participation.
- **Public Interface**: A user-friendly interface for navigation and event discovery.
- **Role-based Access**: Admins and players have different views and functionalities.

## Technologies Used
- **Frontend**: EJS for dynamic views, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Session Management**: express-session
- **Password Hashing**: bcrypt for secure password storage
- **Middleware**: Custom middleware for authentication and authorization

## Routes
/login: Login page for users.
/register: Register page for new users.
/admin-dashboard: Dashboard for admins to manage events.
/add-event: Form for adding a new event.
/edit-event/:id: Edit an existing event.
/player-dashboard: Dashboard for players to view and register for events.
/logout: Log out of the system.
