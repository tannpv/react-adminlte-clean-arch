const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'API server is working!', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Simple mock authentication
    if (email === 'admin@example.com' && password === 'password') {
        res.json({
            user: {
                id: 1,
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                roles: [{ name: 'admin', permissions: ['users.manage'] }]
            },
            token: 'mock-jwt-token',
            expiresIn: '24h'
        });
    } else if (email === 'tannpv@gmail.com' && password === '1234567890') {
        res.json({
            user: {
                id: 2,
                email: 'tannpv@gmail.com',
                firstName: 'Tan',
                lastName: 'Nguyen',
                roles: [{ name: 'admin', permissions: ['users.manage'] }]
            },
            token: 'mock-jwt-token-tan',
            expiresIn: '24h'
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/api/v1/users', (req, res) => {
    res.json({
        data: [
            {
                id: 1,
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                isActive: true,
                roles: [{ name: 'admin', permissions: ['users.manage'] }]
            },
            {
                id: 2,
                email: 'tannpv@gmail.com',
                firstName: 'Tan',
                lastName: 'Nguyen',
                isActive: true,
                roles: [{ name: 'admin', permissions: ['users.manage'] }]
            }
        ],
        total: 2,
        page: 1,
        limit: 10
    });
});

// User profile endpoint
app.get('/api/v1/me', (req, res) => {
    res.json({
        id: 2,
        email: 'tannpv@gmail.com',
        firstName: 'Tan',
        lastName: 'Nguyen',
        isActive: true,
        roles: [{
            name: 'admin',
            permissions: [
                'users.manage',
                'users.create',
                'users.update',
                'users.delete',
                'users.view',
                'roles.manage',
                'roles.create',
                'roles.update',
                'roles.delete',
                'roles.view'
            ]
        }]
    });
});

// Translation endpoints
app.get('/api/v1/translations/translate/:key', (req, res) => {
    const { key } = req.params;

    // Mock translations
    const translations = {
        'nav.dashboard': 'Dashboard',
        'nav.users': 'Users',
        'nav.roles': 'Roles',
        'nav.orders': 'Orders',
        'nav.stores': 'Stores',
        'nav.translations': 'Translations',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',
        'users.title': 'User Management',
        'users.create': 'Create User',
        'users.edit': 'Edit User',
        'users.delete': 'Delete User',
        'roles.title': 'Role Management',
        'roles.create': 'Create Role',
        'roles.edit': 'Edit Role',
        'roles.delete': 'Delete Role'
    };

    const translation = translations[key] || key;
    res.json({ translation });
});

// Languages endpoint
app.get('/api/v1/translations/languages', (req, res) => {
    res.json([
        {
            id: 1,
            code: 'en',
            name: 'English',
            nativeName: 'English',
            isActive: true,
            isDefault: true
        },
        {
            id: 2,
            code: 'es',
            name: 'Spanish',
            nativeName: 'Español',
            isActive: true,
            isDefault: false
        },
        {
            id: 3,
            code: 'fr',
            name: 'French',
            nativeName: 'Français',
            isActive: true,
            isDefault: false
        },
        {
            id: 4,
            code: 'de',
            name: 'German',
            nativeName: 'Deutsch',
            isActive: true,
            isDefault: false
        }
    ]);
});

// Translation refresh endpoint
app.post('/api/v1/translations/refresh', (req, res) => {
    const { languageCode } = req.body;

    // Mock refresh response
    res.json({
        success: true,
        message: `Translations refreshed for language: ${languageCode}`,
        languageCode: languageCode,
        timestamp: new Date().toISOString()
    });
});

// Roles endpoint
app.get('/api/v1/roles', (req, res) => {
    res.json({
        data: [
            {
                id: 1,
                name: 'Administrator',
                description: 'Full system access',
                permissions: [
                    'users.manage',
                    'users.create',
                    'users.update',
                    'users.delete',
                    'users.view',
                    'roles.manage',
                    'roles.create',
                    'roles.update',
                    'roles.delete',
                    'roles.view'
                ],
                isActive: true
            },
            {
                id: 2,
                name: 'Manager',
                description: 'Management access',
                permissions: [
                    'users.view',
                    'users.update',
                    'roles.view'
                ],
                isActive: true
            },
            {
                id: 3,
                name: 'User',
                description: 'Basic user access',
                permissions: [
                    'users.view'
                ],
                isActive: true
            }
        ],
        total: 3,
        page: 1,
        limit: 10
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
    console.log(`📡 Test endpoint: http://localhost:${PORT}/api/v1/test`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`👥 Users endpoint: http://localhost:${PORT}/api/v1/users`);
    console.log(`👤 Me endpoint: http://localhost:${PORT}/api/v1/me`);
    console.log(`🌐 Translations endpoint: http://localhost:${PORT}/api/v1/translations/translate/:key`);
    console.log(`🛡️ Roles endpoint: http://localhost:${PORT}/api/v1/roles`);
});
