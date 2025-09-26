# Tailwind CSS Migration Implementation Guide

## Step 1: Install Tailwind CSS

```bash
# Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography

# Initialize Tailwind configuration
npx tailwindcss init -p
```

## Step 2: Configure Tailwind

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 3: Update CSS Entry Point

### src/app/index.jsx
```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../shared/lib/queryClient'
import { AuthProvider } from '../features/auth/context/AuthProvider'

// Replace AdminLTE imports with Tailwind
import './tailwind.css' // New Tailwind CSS file
import './theme.css'    // Keep custom theme overrides

const root = createRoot(document.getElementById('root'))
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  </QueryClientProvider>
)
```

### src/app/tailwind.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
  }
  
  .btn-success {
    @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  
  .card {
    @apply bg-white shadow rounded-lg;
  }
  
  .card-header {
    @apply px-6 py-4 border-b border-gray-200;
  }
  
  .card-body {
    @apply p-6;
  }
  
  .form-group {
    @apply mb-4;
  }
  
  .form-control {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
  }
}
```

## Step 4: Create Base Component Library

### src/shared/components/ui/Button.jsx
```jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

### src/shared/components/ui/Card.jsx
```jsx
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
```

### src/shared/components/ui/Table.jsx
```jsx
import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className={`min-w-full divide-y divide-gray-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', hover = true, ...props }) => {
  const hoverClass = hover ? 'hover:bg-gray-50' : '';
  return (
    <tr className={`${hoverClass} ${className}`} {...props}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = '', header = false, ...props }) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm';
  const headerClasses = header ? 'font-medium text-gray-500 uppercase tracking-wider' : 'text-gray-900';
  
  return (
    <td className={`${baseClasses} ${headerClasses} ${className}`} {...props}>
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;
```

## Step 5: Create Layout Components

### src/shared/components/layout/Sidebar.jsx
```jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';

const Sidebar = () => {
  const { languageCode } = useLanguage();
  const t = useTranslation(languageCode, 'common');

  const navigation = [
    { name: t('users'), href: '/users', icon: 'users' },
    { name: t('roles'), href: '/roles', icon: 'shield' },
    { name: t('categories'), href: '/categories', icon: 'folder' },
    { name: t('products'), href: '/products', icon: 'package' },
    { name: t('attributes'), href: '/attributes', icon: 'tags' },
    { name: t('attribute_values'), href: '/attribute-values', icon: 'list' },
    { name: t('attribute_sets'), href: '/attribute-sets', icon: 'layers' },
    { name: t('storage'), href: '/storage', icon: 'hard-drive' },
    { name: t('translations'), href: '/translations', icon: 'globe' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <h1 className="text-xl font-bold">{t('aurora_admin')}</h1>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="mr-3 h-5 w-5">
                {/* Icon placeholder */}
              </span>
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
```

### src/shared/components/layout/Header.jsx
```jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { languageCode } = useLanguage();
  const t = useTranslation(languageCode, 'common');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {/* Page title will be set by individual pages */}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button className="text-gray-500 hover:text-gray-700">
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### src/shared/components/layout/MainLayout.jsx
```jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
```

## Step 6: Update Package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0",
    "@tanstack/react-query": "^5.52.0",
    "toastr": "^2.1.4"
  },
  "devDependencies": {
    "vite": "^4.5.0",
    "concurrently": "^8.2.2",
    "@tanstack/react-query-devtools": "^5.52.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

## Step 7: Migration Strategy

### Phase 1: Setup (Day 1)
1. Install Tailwind CSS and dependencies
2. Configure Tailwind and PostCSS
3. Create base component library
4. Update CSS entry point

### Phase 2: Layout Migration (Day 2-3)
1. Create new layout components
2. Update App.jsx to use new layout
3. Test basic layout functionality
4. Ensure responsive design works

### Phase 3: Component Migration (Day 4-6)
1. Migrate one page at a time
2. Start with Users page (simplest)
3. Move to Categories, Products, etc.
4. Test each page thoroughly

### Phase 4: Cleanup (Day 7)
1. Remove AdminLTE dependencies
2. Remove Bootstrap dependencies
3. Remove jQuery dependency
4. Optimize bundle size
5. Final testing

## Step 8: Testing Checklist

- [ ] All pages load correctly
- [ ] Navigation works properly
- [ ] Forms submit correctly
- [ ] Tables display data properly
- [ ] Modals open and close
- [ ] Responsive design works on mobile
- [ ] Translations still work
- [ ] No console errors
- [ ] Bundle size is optimized

## Step 9: Rollback Plan

If issues arise during migration:

1. **Keep AdminLTE dependencies commented in package.json**
2. **Maintain backup of current theme.css**
3. **Use Git branches for each migration phase**
4. **Test each phase before moving to next**

## Expected Results

- **Bundle size reduction**: ~93% (from 700KB to 50KB)
- **Faster build times**: No jQuery dependency
- **Better maintainability**: Utility-first approach
- **Modern design**: Clean, consistent interface
- **Better performance**: Optimized CSS and no jQuery
