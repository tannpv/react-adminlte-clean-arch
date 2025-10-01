# Next Steps - Authentication System Setup

## ✅ Completed Steps

1. **Dependencies Installed**: All required packages for JWT authentication
2. **Code Implementation**: Complete authentication system implemented
3. **Build Success**: Project compiles without errors
4. **Environment Setup**: `.env` file created with default values

## 🔄 Current Status

The authentication system is implemented but needs database setup to run properly.

## 📋 Next Steps Required

### 1. Database Setup

**Option A: Use Existing Database**
```bash
# If you have MySQL running, update the .env file:
cd apps/api
nano .env

# Update these values:
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
```

**Option B: Start Fresh Database**
```bash
# Install MySQL (if not installed)
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server

# Start MySQL service
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE adminlte_clean_arch;
```

### 2. Run Database Migration

```bash
cd apps/api

# Run the migration to add password column
npm run migration:run
```

### 3. Start the Apps API

```bash
cd apps/api
npm run start:dev
```

### 4. Test Authentication

```bash
# Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 5. Start Admin Frontend

```bash
cd admin
npm run dev
```

### 6. Test Full Integration

1. Open http://localhost:5177 in your browser
2. Try to login with the credentials you created
3. Verify that the admin interface works with the new API

## 🛠️ Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists

### Port Conflicts
- Apps API runs on port 3001
- Admin frontend runs on port 5177
- Check if ports are available: `lsof -i :3001` and `lsof -i :5177`

### CORS Issues
- Update `FRONTEND_URL` in `.env` to match your admin frontend URL
- Default: `http://localhost:5177`

## 📁 File Structure

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── api/             # Auth endpoints
│   │   │   ├── application/     # Business logic & DTOs
│   │   │   └── infrastructure/  # JWT strategy
│   │   └── users/               # User management
│   ├── migrations/              # Database migrations
│   └── infrastructure/          # Database & config
├── .env                         # Environment variables
└── test-auth.js                 # Test script
```

## 🔐 Security Notes

- Change `JWT_SECRET` in `.env` to a strong, unique value
- Use HTTPS in production
- Consider implementing rate limiting
- Add password complexity requirements

## 📞 Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify database connection
3. Ensure all dependencies are installed
4. Check port availability

The authentication system is ready to use once the database is properly configured!

