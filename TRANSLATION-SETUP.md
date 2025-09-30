# Translation System Setup Guide

## Overview
The translation system has been implemented with both backend API and frontend components. This guide explains how to set up and use the translation system.

## Backend Setup

### 1. Environment Variables
Add these environment variables to your `.env` file:

```env
# Translation System Configuration
LANGUAGE_VALUE_CACHE_ENABLE=Y
TRANSLATE_CACHE_DISABLE=N
LANGUAGE_DEFAULT_CODE=en

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379
```

### 2. Database Setup
The translation system uses two main tables:
- `languages` - Stores available languages
- `language_values` - Stores translation key-value pairs

### 3. Populate Translations
Run the following command to populate the database with translations from the JSON files:

```bash
cd backend
npm run populate:translations
```

This script will:
- Create language entries for English, Spanish, and French
- Import hardcoded translation keys and values
- Generate MD5 hashes for translation keys
- Store translations in the database

## Frontend Setup

### 1. Server-Only Translations
The translation system now uses **server-only translations** from the database. Local JSON files have been removed to ensure consistency and centralized management.

### 2. Usage
The translation system works with a simple fallback:

1. **Backend API** - Primary source (from database)
2. **Original Key** - Fallback if translation not found

### 3. Components
- `useTranslation` hook - Main translation functionality
- `Translation` component - Declarative translation wrapper
- `LanguageSwitcher` component - Language selection UI

## API Endpoints

### Translation Endpoints
- `GET /translations/translate/:key` - Get translation for a key
- `POST /translations/translate/format` - Get formatted translation
- `POST /translations/translate/array` - Translate multiple keys
- `POST /translations/refresh` - Refresh translation cache

### Language Management
- `GET /translations/languages` - Get all available languages
- `POST /translations/languages` - Create new language
- `GET /translations/languages/:code/translations` - Get translations for language

### Cache Management
- `POST /translations/cache/clear` - Clear translation cache
- `GET /translations/cache/stats` - Get cache statistics
- `POST /translations/cache/warmup` - Warm up cache

## Usage Examples

### Frontend Usage

```jsx
import { useTranslation } from '../hooks/useTranslation';
import Translation from '../components/Translation';

// Using hook
const { t } = useTranslation();
const translatedText = await t('nav.dashboard');

// Using component
<Translation k="nav.dashboard" fallback="Dashboard" />
```

### Backend Usage

```typescript
// In a service
const translation = await this.dictionaryService.get('en', 'nav.dashboard');
```

## Translation Key Structure

Translation keys use dot notation for nested objects:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "users": "Users"
  },
  "header": {
    "welcome": "Welcome"
  }
}
```

Keys are accessed as: `nav.dashboard`, `header.welcome`

## Adding New Languages

1. Add language entry to database
2. Create translation JSON file
3. Run populate script to import translations
4. Update LanguageSwitcher component if needed

## Troubleshooting

### Common Issues

1. **Translations not loading**
   - Check if backend is running
   - Verify database connection
   - Check Redis connection for caching

2. **Missing translations**
   - Add missing keys directly to the database
   - Use the translation management API endpoints
   - Run populate script to add new translations

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Performance Considerations

- Translations are cached in memory for 1 hour
- Frontend makes API calls for each translation request
- Use `refresh` endpoint to update cache when translations change
- Consider warming up cache for frequently used translations
