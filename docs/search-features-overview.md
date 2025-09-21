# Search Features Overview

This document provides a quick overview of all search functionality implemented in the React AdminLTE Clean Architecture application.

## Available Search Features

### 1. User Search
**Location**: Users page (`/users`)
**Implementation**: Real-time search with debouncing
**Search Field**: User name and email
**API Endpoint**: `GET /api/users?search=term`

**Features**:
- Debounced search (300ms delay)
- Case-insensitive matching
- Partial matching on name and email fields
- Smooth UX with `keepPreviousData`

### 2. Category Search
**Location**: Categories page (`/categories`)
**Implementation**: Real-time search with debouncing
**Search Field**: Category name
**API Endpoint**: `GET /api/categories?search=term`

**Features**:
- Debounced search (300ms delay)
- Case-insensitive matching
- Partial matching on category name
- Maintains hierarchical tree structure
- Smooth UX with `keepPreviousData`

## Common Implementation Pattern

Both search features follow the same implementation pattern:

### Frontend Pattern
1. **Search Hook**: Custom hook with debouncing logic
2. **API Integration**: Updated API functions to accept search parameters
3. **Query Integration**: React Query hooks with search-aware caching
4. **UI Components**: Search input with consistent styling

### Backend Pattern
1. **Controller**: Accept search query parameter
2. **Service**: Pass search parameter to repository
3. **Repository**: Implement SQL LIKE query with case-insensitive matching
4. **Database**: Use `LOWER()` function for case-insensitive comparison

## Search Hook Template

```javascript
// useSearch.js
import { useEffect, useState } from 'react'

export function useSearch({ debounceMs = 300 } = {}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, debounceMs)

    return () => clearTimeout(handle)
  }, [debounceMs, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  }
}
```

## Search UI Template

```jsx
// Search input component
<div className="search-control">
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text"><i className="fas fa-search" /></span>
    </div>
    <input
      type="search"
      className="form-control"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>
```

## Backend Repository Template

```typescript
// Repository implementation
async findAll(search?: string): Promise<Entity[]> {
  let query = "SELECT * FROM table_name";
  const params: any[] = [];

  if (search?.trim()) {
    query += " WHERE LOWER(name) LIKE LOWER(?)";
    params.push(`%${search.trim()}%`);
  }

  query += " ORDER BY name ASC";

  const [rows] = await this.db.execute<EntityRow[]>(query, params);
  return rows.map(row => new Entity(row));
}
```

## Performance Considerations

### Frontend
- **Debouncing**: 300ms delay prevents excessive API calls
- **Query Caching**: React Query caches based on search terms
- **Previous Data**: `keepPreviousData: true` prevents loading states
- **Stale Time**: 5-minute cache for better performance

### Backend
- **Database Indexing**: Consider indexes on searchable columns
- **Query Optimization**: Use prepared statements for security
- **Case-insensitive**: Use `LOWER()` function for consistent matching

## Future Search Features

Potential areas for additional search functionality:

1. **Product Search**: Search products by name, description, or category
2. **Role Search**: Search roles by name or permissions
3. **File Search**: Search uploaded files by name or metadata
4. **Global Search**: Cross-entity search functionality
5. **Advanced Search**: Multiple field search with filters

## Testing Search Features

### Manual Testing Checklist
- [ ] Search input appears and functions correctly
- [ ] Debouncing works (no excessive API calls)
- [ ] Case-insensitive matching works
- [ ] Partial matching works
- [ ] Empty search returns all results
- [ ] Search results update in real-time
- [ ] Loading states are handled smoothly
- [ ] Search works with special characters

### API Testing
```bash
# Test search endpoint
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/endpoint?search=term"

# Test without search parameter
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/endpoint"
```

## Related Documentation

- [Category Search Feature](category-search-feature.md) - Detailed category search documentation
- [Backend Module Boundaries](../backend/docs/module-boundaries.md) - Backend architecture
- [API Endpoints](../README.md#api-endpoints-base-api) - Complete API reference
