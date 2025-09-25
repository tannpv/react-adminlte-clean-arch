# Component Migration Mapping: AdminLTE → Tailwind CSS

## Layout Components

### Main Layout Structure
```jsx
// AdminLTE Structure
<div className="wrapper">
  <nav className="main-header navbar navbar-expand navbar-white navbar-light">
    {/* Header content */}
  </nav>
  <aside className="main-sidebar sidebar-dark-primary elevation-4">
    {/* Sidebar content */}
  </aside>
  <div className="content-wrapper">
    {/* Main content */}
  </div>
</div>

// Tailwind Equivalent
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow-sm border-b border-gray-200">
    {/* Header content */}
  </header>
  <div className="flex">
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      {/* Sidebar content */}
    </aside>
    <main className="flex-1 p-6">
      {/* Main content */}
    </main>
  </div>
</div>
```

### Sidebar Navigation
```jsx
// AdminLTE
<nav className="mt-2">
  <ul className="nav nav-pills nav-sidebar flex-column">
    <li className="nav-item">
      <a href="#" className="nav-link">
        <i className="nav-icon fas fa-tachometer-alt"></i>
        <p>Dashboard</p>
      </a>
    </li>
  </ul>
</nav>

// Tailwind
<nav className="mt-2">
  <ul className="space-y-1">
    <li>
      <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
        <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          {/* Icon */}
        </svg>
        Dashboard
      </a>
    </li>
  </ul>
</nav>
```

## Content Components

### Info Box (Statistics Cards)
```jsx
// AdminLTE
<div className="info-box">
  <span className="info-box-icon bg-info">
    <i className="far fa-envelope"></i>
  </span>
  <div className="info-box-content">
    <span className="info-box-text">Messages</span>
    <span className="info-box-number">1,410</span>
  </div>
</div>

// Tailwind
<div className="bg-white overflow-hidden shadow rounded-lg">
  <div className="p-5">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            {/* Icon */}
          </svg>
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">Messages</dt>
          <dd className="text-lg font-medium text-gray-900">1,410</dd>
        </dl>
      </div>
    </div>
  </div>
</div>
```

### Cards
```jsx
// AdminLTE
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
  </div>
  <div className="card-body">
    <p>Card content</p>
  </div>
</div>

// Tailwind
<div className="bg-white shadow rounded-lg">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-medium text-gray-900">Card Title</h3>
  </div>
  <div className="p-6">
    <p>Card content</p>
  </div>
</div>
```

## Form Components

### Form Groups
```jsx
// AdminLTE
<div className="form-group">
  <label htmlFor="email">Email</label>
  <input type="email" className="form-control" id="email" />
</div>

// Tailwind
<div className="mb-4">
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input 
    type="email" 
    id="email"
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
  />
</div>
```

### Buttons
```jsx
// AdminLTE
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Danger</button>

// Tailwind
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Primary
</button>
<button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
  Secondary
</button>
<button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
  Success
</button>
<button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
  Danger
</button>
```

## Table Components

### Basic Tables
```jsx
// AdminLTE
<table className="table table-striped table-hover">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>John Doe</td>
      <td>
        <button className="btn btn-sm btn-primary">Edit</button>
        <button className="btn btn-sm btn-danger">Delete</button>
      </td>
    </tr>
  </tbody>
</table>

// Tailwind
<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
  <table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-900">Edit</button>
            <button className="text-red-600 hover:text-red-900">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Modal Components

### Basic Modal
```jsx
// AdminLTE
<div className="modal fade" id="exampleModal">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title">Modal Title</h4>
        <button type="button" className="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div className="modal-body">
        <p>Modal content</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>

// Tailwind
<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
  <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
    <div className="mt-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Modal Title</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mb-4">
        <p>Modal content</p>
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          Close
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save changes
        </button>
      </div>
    </div>
  </div>
</div>
```

## Utility Classes

### Spacing
| AdminLTE | Tailwind | Description |
|----------|----------|-------------|
| `mb-3` | `mb-3` | Margin bottom |
| `mt-2` | `mt-2` | Margin top |
| `p-3` | `p-3` | Padding all |
| `px-4` | `px-4` | Padding horizontal |
| `py-2` | `py-2` | Padding vertical |

### Text
| AdminLTE | Tailwind | Description |
|----------|----------|-------------|
| `text-center` | `text-center` | Text center |
| `text-right` | `text-right` | Text right |
| `text-muted` | `text-gray-500` | Muted text |
| `font-weight-bold` | `font-bold` | Bold text |
| `text-uppercase` | `uppercase` | Uppercase text |

### Colors
| AdminLTE | Tailwind | Description |
|----------|----------|-------------|
| `text-primary` | `text-blue-600` | Primary text |
| `text-success` | `text-green-600` | Success text |
| `text-danger` | `text-red-600` | Danger text |
| `text-warning` | `text-yellow-600` | Warning text |
| `text-info` | `text-blue-500` | Info text |

## Migration Checklist

### Phase 1: Setup
- [ ] Install Tailwind CSS
- [ ] Configure tailwind.config.js
- [ ] Update Vite configuration
- [ ] Create base component library

### Phase 2: Layout
- [ ] Migrate main layout structure
- [ ] Update sidebar navigation
- [ ] Migrate header component
- [ ] Update content wrapper

### Phase 3: Components
- [ ] Create reusable Button component
- [ ] Create reusable Card component
- [ ] Create reusable Table component
- [ ] Create reusable Modal component
- [ ] Create reusable Form components

### Phase 4: Pages
- [ ] Migrate Users page
- [ ] Migrate Categories page
- [ ] Migrate Products page
- [ ] Migrate Roles page
- [ ] Migrate Attributes pages
- [ ] Migrate Translations page
- [ ] Migrate Storage page

### Phase 5: Cleanup
- [ ] Remove AdminLTE dependencies
- [ ] Remove Bootstrap dependencies
- [ ] Remove jQuery dependency
- [ ] Clean up unused CSS
- [ ] Optimize bundle size
- [ ] Test all functionality
