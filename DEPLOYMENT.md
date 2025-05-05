# Sweet Delights - Hostinger Deployment Guide

This guide provides step-by-step instructions for deploying the Sweet Delights application on Hostinger with MySQL database integration.

## Prerequisites

- A Hostinger account with Node.js hosting plan
- Access to Hostinger's MySQL database service
- Basic knowledge of SSH and command line operations

## Step 1: Set Up MySQL Database

1. Log in to your Hostinger control panel
2. Navigate to "Databases" > "MySQL Databases"
3. Create a new database named `havesomee`
4. Create a database user and assign it to the database
5. Note down the database credentials (hostname, username, password)

## Step 2: Prepare Your Application

1. Clone the repository to your local machine
2. Create a `.env` file based on the `.env.example` template
3. Fill in the MySQL database credentials from Step 1
4. Run `npm install` to install dependencies
5. Test the application locally with `npm run dev`

## Step 3: Deploy to Hostinger

### Option 1: Using Git

1. In your Hostinger control panel, set up Git deployment
2. Add the Hostinger Git repository as a remote:
   \`\`\`
   git remote add hostinger ssh://u123456789@hostname.hostinger.com/~/public_html
   \`\`\`
3. Push your code to Hostinger:
   \`\`\`
   git push hostinger main
   \`\`\`

### Option 2: Manual Upload

1. Build your application locally:
   \`\`\`
   npm run build
   \`\`\`
2. Connect to your Hostinger account via FTP or SSH
3. Upload the following files and directories:
   - `.next/`
   - `public/`
   - `node_modules/` (or run `npm install` on the server)
   - `package.json`
   - `package-lock.json`
   - `server.js`
   - `hostinger.config.js`
   - `.env` (with production values)
   - `scripts/`

## Step 4: Configure Environment Variables

1. In your Hostinger control panel, navigate to "Advanced" > "Environment Variables"
2. Add the following environment variables:
   - `MYSQL_HOST`: Your MySQL hostname
   - `MYSQL_PORT`: MySQL port (usually 3306)
   - `MYSQL_DATABASE`: Database name (havesomee)
   - `MYSQL_USER`: Database username
   - `MYSQL_PASSWORD`: Database password
   - `NEXT_PUBLIC_BASE_URL`: Your website URL
   - `ADMIN_SESSION_SECRET`: A secure random string
   - `NODE_ENV`: production

## Step 5: Run Database Migrations

1. Connect to your Hostinger account via SSH
2. Navigate to your application directory
3. Run the migration script:
   \`\`\`
   node scripts/migrate.js
   \`\`\`

## Step 6: Start the Application

1. In your Hostinger control panel, navigate to "Website" > "Node.js"
2. Set the entry point to `server.js`
3. Start the Node.js application

## Step 7: Verify Deployment

1. Visit your website URL to ensure the application is running correctly
2. Test the admin login at `/admin/login` using the default credentials:
   - Username: admin
   - Password: admin123
3. Change the default admin password immediately after first login

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:
1. Verify your database credentials in the environment variables
2. Check if your database user has the correct permissions
3. Ensure the database server allows connections from your hosting environment

### Application Not Starting

If the application fails to start:
1. Check the error logs in your Hostinger control panel
2. Verify that all dependencies are installed correctly
3. Ensure the Node.js version is compatible (v14+ recommended)

### Static Assets Not Loading

If static assets (images, CSS, etc.) are not loading:
1. Check if the `public` directory was uploaded correctly
2. Verify that the Next.js build was completed successfully
3. Clear your browser cache and try again

## Maintenance

### Updating the Application

To update your application:
1. Make changes to your local repository
2. Test locally with `npm run dev`
3. Deploy using the same method as initial deployment
4. If database schema changes were made, run migrations again

### Database Backups

Regular database backups are recommended:
1. Use Hostinger's built-in backup tools
2. Set up automated backups in your Hostinger control panel
3. Periodically download a local copy of your database

## Security Considerations

1. Change the default admin credentials immediately
2. Use strong, unique passwords for all accounts
3. Keep your Node.js and npm packages updated
4. Enable HTTPS for your domain
5. Regularly review application logs for suspicious activity
