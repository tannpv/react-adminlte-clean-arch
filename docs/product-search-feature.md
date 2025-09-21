# Product Search Feature

## Overview

The product search feature allows users to quickly find products by searching across product name, SKU, and description fields. This feature follows the same pattern as the existing user and category search functionality.

## Frontend Implementation

### Search Hook

**File**: `admin/src/features/products/hooks/useProductSearch.js`

```javascript
import { useEffect, useState } from 'react'

export function useProductSearch({ debounceMs = 300 } = {}) {
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

### API Integration

**File**: `admin/src/features/products/api/productsApi.js`

The `fetchProducts` function now accepts a search parameter:

```javascript
export async function fetchProducts({ search } = {}) {
  const params = {}
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  const res = await ApiClient.get('/products', { params })
  if (!Array.isArray(res.data)) return []
  return res.data.map(normalizeProduct)
}
```

### Hook Integration

**File**: `admin/src/features/products/hooks/useProducts.js`

The `useProducts` hook now accepts and passes the search parameter:

```javascript
export function useProducts({ search } = {}) {
  const searchValue = search?.trim() || ''

  const { data: rawProducts = [], isLoading, isError, error } = useQuery({
    queryKey: ['products', { search: searchValue }],
    queryFn: () => fetchProducts({ search: searchValue }),
    keepPreviousData: true,
  })
  // ... rest of the hook
}
```

### UI Integration

**File**: `admin/src/features/products/pages/ProductsPage.jsx`

The products page now includes a search input in the header:

```javascript
import { useProductSearch } from '../hooks/useProductSearch'

export function ProductsPage() {
  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  } = useProductSearch()

  const {
    products = [],
    // ... other properties
  } = useProducts({ search: debouncedTerm })

  return (
    <div className="page-card">
      <div className="page-header">
        <div className="page-actions">
          <div className="search-control">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fas fa-search" /></span>
              </div>
              <input
                type="search"
                className="form-control"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* ... other buttons */}
        </div>
      </div>
      {/* ... rest of the component */}
    </div>
  )
}
```

## Backend Implementation

### Controller

**File**: `backend/src/infrastructure/http/controllers/products.controller.ts`

The products controller now accepts a search query parameter:

```typescript
@Get()
@RequireAnyPermission('products:read', 'users:read')
list(@Query('search') search?: string) {
  return this.productsService.list(search)
}
```

### Service

**File**: `backend/src/application/services/products.service.ts`

The products service passes the search parameter to the repository:

```typescript
async list(search?: string): Promise<ProductResponseDto[]> {
  const all = await this.products.findAll(search);
  return all.map((product) => toProductResponse(product));
}
```

### Repository Interface

**File**: `backend/src/domain/repositories/product.repository.ts`

The repository interface now includes an optional search parameter:

```typescript
export interface ProductRepository {
  findAll(search?: string): Promise<Product[]>
  // ... other methods
}
```

### MySQL Implementation

**File**: `backend/src/infrastructure/persistence/mysql/mysql-product.repository.ts`

The MySQL repository implements search across name, SKU, and description fields:

```typescript
async findAll(search?: string): Promise<Product[]> {
  let query = "SELECT * FROM products"
  const params: any[] = []

  if (search?.trim()) {
    query += " WHERE LOWER(name) LIKE LOWER(?) OR LOWER(sku) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)"
    const searchTerm = `%${search.trim()}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }

  query += " ORDER BY updated_at DESC"

  const [rows] = await this.db.execute<ProductRow[]>(query, params);
  return Promise.all(rows.map((row) => this.hydrate(row)));
}
```

## API Usage

### Search Products

**Endpoint**: `GET /api/products?search={term}`

**Parameters**:
- `search` (optional): Search term to filter products by name, SKU, or description

**Example**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/products?search=iPhone"
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "sku": "IPH15PRO-256",
    "description": "Latest iPhone with advanced features",
    "priceCents": 99999,
    "currency": "USD",
    "status": "active",
    "type": "simple",
    "categories": [
      {
        "id": 1,
        "name": "Electronics"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Search Behavior

- **Case-insensitive**: Search is performed using `LOWER()` function
- **Partial matching**: Uses `LIKE` with `%` wildcards for partial matches
- **Multi-field search**: Searches across product name, SKU, and description
- **Debounced**: Frontend debounces search input by 300ms to avoid excessive API calls
- **Real-time**: Results update automatically as user types

## Performance Considerations

- **Database indexing**: Consider adding indexes on `name`, `sku`, and `description` columns for better performance
- **Debouncing**: Frontend debounces search input to reduce API calls
- **Query caching**: React Query caches search results for better user experience
- **Pagination**: For large datasets, consider implementing pagination with search

## Testing

### Postman Collection

The Postman collection includes a "Search Products" request:

- **Method**: GET
- **URL**: `{{baseUrl}}/api/products?search=iPhone`
- **Headers**: Authorization: Bearer {{token}}

### Manual Testing

1. **Login** to get authentication token
2. **Navigate** to Products page in the admin interface
3. **Type** in the search box to filter products
4. **Verify** that results update in real-time
5. **Test** with different search terms (name, SKU, description)

## Future Enhancements

- **Advanced filters**: Add filters for price range, category, status, etc.
- **Search suggestions**: Implement autocomplete/suggestions
- **Search history**: Remember recent searches
- **Full-text search**: Implement more sophisticated search using MySQL full-text indexes
- **Search analytics**: Track popular search terms
