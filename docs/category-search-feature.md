# Category Search Feature Documentation

## Overview

The category search feature provides real-time search functionality for categories in the admin interface, allowing users to quickly find categories by name. The implementation follows the same pattern as the existing user search functionality, ensuring consistency across the application.

## Features

- **Real-time Search**: Debounced search with 300ms delay to prevent excessive API calls
- **Case-insensitive Matching**: Search works regardless of case
- **Partial Matching**: Finds categories containing the search term anywhere in the name
- **Smooth UX**: Uses `keepPreviousData` to prevent loading states during search
- **Hierarchical Support**: Search results maintain category tree structure

## Frontend Implementation

### Components

#### `useCategorySearch` Hook
**Location**: `admin/src/features/categories/hooks/useCategorySearch.js`

```javascript
export function useCategorySearch({ debounceMs = 300 } = {}) {
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

**Features**:
- Manages search term state
- Provides debounced search term (300ms delay)
- Prevents excessive API calls during typing

#### Updated CategoriesPage
**Location**: `admin/src/features/categories/pages/CategoriesPage.jsx`

**Key Changes**:
- Added search input field with search icon
- Integrated `useCategorySearch` hook
- Connected search functionality to categories data
- Search UI matches the users page design

```jsx
<div className="search-control">
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text"><i className="fas fa-search" /></span>
    </div>
    <input
      type="search"
      className="form-control"
      placeholder="Search categories..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>
```

#### Updated API Layer
**Location**: `admin/src/features/categories/api/categoriesApi.js`

```javascript
export async function fetchCategories({ search } = {}) {
  const params = {}
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  const res = await ApiClient.get('/categories', { params })
  // ... rest of implementation
}
```

#### Updated useCategories Hook
**Location**: `admin/src/features/categories/hooks/useCategories.js`

**Key Changes**:
- Added search parameter support
- Updated query key to include search term for proper caching
- Added `keepPreviousData: true` for smooth search experience

```javascript
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['categories', { search: searchValue }],
  queryFn: () => fetchCategories({ search: searchValue }),
  enabled,
  staleTime: 5 * 60 * 1000,
  keepPreviousData: true,
})
```

## Backend Implementation

### API Endpoint

**Endpoint**: `GET /api/categories?search=term`

**Query Parameters**:
- `search` (optional): Search term to filter categories by name

**Response Format**:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "parentId": null,
      "parentName": null
    }
  ],
  "tree": [
    {
      "id": 1,
      "name": "Electronics",
      "parentId": null,
      "depth": 0,
      "disabled": false,
      "children": []
    }
  ],
  "hierarchy": [
    {
      "id": 1,
      "label": "Electronics",
      "disabled": false
    }
  ]
}
```

### Controller Layer
**Location**: `backend/src/infrastructure/http/controllers/categories.controller.ts`

```typescript
@Get()
@RequireAnyPermission("categories:read", "products:read", "users:read")
list(@Query("search") search?: string) {
  return this.categoriesService.list(search);
}
```

### Service Layer
**Location**: `backend/src/application/services/categories.service.ts`

```typescript
async list(search?: string): Promise<CategoryTreeResponseDto> {
  const categories = await this.categories.findAll(search);
  // ... rest of implementation
}
```

### Repository Layer
**Location**: `backend/src/infrastructure/persistence/mysql/mysql-category.repository.ts`

```typescript
async findAll(search?: string): Promise<Category[]> {
  let query = "SELECT id, name, parent_id FROM categories";
  const params: any[] = [];

  if (search?.trim()) {
    query += " WHERE LOWER(name) LIKE LOWER(?)";
    params.push(`%${search.trim()}%`);
  }

  query += " ORDER BY name ASC";

  const [rows] = await this.db.execute<CategoryRow[]>(query, params);
  return rows.map(
    (row) => new Category(row.id, row.name, row.parent_id ?? null)
  );
}
```

## Database Query

The search functionality uses a case-insensitive `LIKE` query:

```sql
SELECT id, name, parent_id FROM categories 
WHERE LOWER(name) LIKE LOWER(?) 
ORDER BY name ASC
```

**Parameters**:
- Search term is wrapped with `%` for partial matching
- Both column and search term are converted to lowercase for case-insensitive matching

## Usage Examples

### Frontend Usage

```javascript
// In a React component
const { searchTerm, setSearchTerm, debouncedTerm } = useCategorySearch()
const { categories, tree, hierarchy } = useCategories({ 
  enabled: canView, 
  search: debouncedTerm 
})

// Search input
<input
  type="search"
  placeholder="Search categories..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### API Usage

```bash
# Search for categories containing "electronics"
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/categories?search=electronics"

# Get all categories (no search)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/categories"
```

## Performance Considerations

- **Debouncing**: 300ms delay prevents excessive API calls during typing
- **Query Caching**: React Query caches results based on search term
- **Previous Data**: `keepPreviousData: true` prevents loading states during search
- **Database Indexing**: Consider adding an index on the `name` column for better performance

## Testing

### Manual Testing
1. Navigate to the Categories page
2. Type in the search box to filter categories
3. Verify that results update in real-time
4. Test with various search terms (partial matches, case variations)
5. Verify that the category tree structure is maintained

### API Testing
```bash
# Test search functionality
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/categories?search=test"

# Test without search parameter
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/categories"
```

## Future Enhancements

- **Advanced Search**: Support for searching by parent category name
- **Search Highlighting**: Highlight matching text in results
- **Search History**: Remember recent searches
- **Fuzzy Search**: Support for typos and similar matches
- **Search Analytics**: Track popular search terms

## Related Files

### Frontend
- `admin/src/features/categories/hooks/useCategorySearch.js`
- `admin/src/features/categories/api/categoriesApi.js`
- `admin/src/features/categories/hooks/useCategories.js`
- `admin/src/features/categories/pages/CategoriesPage.jsx`

### Backend
- `backend/src/infrastructure/http/controllers/categories.controller.ts`
- `backend/src/application/services/categories.service.ts`
- `backend/src/domain/repositories/category.repository.ts`
- `backend/src/infrastructure/persistence/mysql/mysql-category.repository.ts`
- `backend/src/application/dto/category-response.dto.ts`
