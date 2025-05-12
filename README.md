<<<<<<< HEAD
# UserRegistrationSystem
User Registration System
=======
# User Registration System

A complete user registration system with admin panel for user management and data export capabilities.

## Features

- User registration form with IP location tracking
- Admin dashboard for user management
- User data export functionality
- Persistent database storage with PostgreSQL
- Responsive UI for all device sizes

## Technology Stack

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query

## Local Development

### Prerequisites

- Node.js v20 or higher
- PostgreSQL database

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Bringovia/UserRegistrationSystem.git
   cd UserRegistrationSystem
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database
   - Create a `.env` file with your database connection string:
     ```
     DATABASE_URL=postgres://username:password@localhost:5432/database_name
     ```

4. Push the schema to the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Option 1: Using the Deployment Script (CentOS 7)

1. Upload the `deploy.sh` file to your server
2. Make it executable:
   ```bash
   chmod +x deploy.sh
   ```
3. Run the script as root:
   ```bash
   sudo ./deploy.sh
   ```
4. Follow the instructions at the end of the script to complete the setup

### Option 2: Manual Deployment

1. Install Node.js 20:
   ```bash
   curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/Bringovia/UserRegistrationSystem.git
   cd UserRegistrationSystem
   ```

3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

4. Set up PM2 for process management:
   ```bash
   sudo npm install -g pm2
   pm2 start dist/index.js --name "registration-app"
   pm2 save
   pm2 startup
   ```

5. Set up Nginx as a reverse proxy:
   ```bash
   sudo yum install -y nginx
   ```
   
   Create a configuration file:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Default Admin Credentials

Username: `admin`  
Password: `password`

**Important**: Change these credentials immediately after deployment.

## License

MIT
>>>>>>> 7181993 (Initial commit)
