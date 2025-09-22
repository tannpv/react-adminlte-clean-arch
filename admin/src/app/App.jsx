import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { AttributeSetDetailsPage } from '../features/attributes/pages/AttributeSetDetailsPage'
import { AttributeSetsPage } from '../features/attributes/pages/AttributeSetsPage'
import { AttributesPage } from '../features/attributes/pages/AttributesPage'
import { AttributeValuesPage } from '../features/attributes/pages/AttributeValuesPage'
import { useAuth } from '../features/auth/context/AuthProvider'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { CategoriesPage } from '../features/categories/pages/CategoriesPage'
import { fetchProducts } from '../features/products/api/productsApi'
import { ProductsPage } from '../features/products/pages/ProductsPage'
import { fetchRoles } from '../features/roles/api/rolesApi'
import { RolesPage } from '../features/roles/pages/RolesPage'
import StoragePage from '../features/storage/pages/StoragePage'
import { UsersPage } from '../features/users/pages/UsersPage'
import { usePermissions } from '../shared/hooks/usePermissions'
import { ApiClient } from '../shared/lib/apiClient'
import { getUserDisplayName } from '../shared/lib/userDisplayName'

export default function App() {
  const { user: currentUser, setUser: setCurrentUser, logout } = useAuth()
  const { can, me } = usePermissions()
  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register'
  const [menu, setMenu] = useState('users') // 'users' | 'roles' | 'categories' | 'products' | 'storage' | 'attributes' | 'attribute-values' | 'attribute-sets'
  const [selectedAttributeSetId, setSelectedAttributeSetId] = useState(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (!currentUser) return
    qc.prefetchQuery({ queryKey: ['me'], queryFn: async () => (await ApiClient.get('/me')).data, staleTime: 10_000 })
    qc.prefetchQuery({ queryKey: ['roles'], queryFn: fetchRoles, staleTime: 5 * 60_000 })
    qc.prefetchQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 })
  }, [currentUser, qc, can])
  return (
    <div className="wrapper">
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars"></i></a>
          </li>
        </ul>
        <ul className="navbar-nav ml-auto">
          {currentUser ? (
            <li className="nav-item d-flex align-items-center pr-2">
              <div className="user-chip mr-3">
                <span>{getUserDisplayName(currentUser)}</span>
                {me?.roles?.length ? (
                  <span>
                    {me.roles.map(r => (
                      <span key={r.id} className="badge badge-info">{r.name}</span>
                    ))}
                  </span>
                ) : null}
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
            </li>
          ) : null}
        </ul>
      </nav>

      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" className="brand-link">
          <span className="brand-logo">AA</span>
          <span className="brand-text">Aurora Admin</span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column">
              <li className="nav-header">System</li>
              <li className="nav-item">
                <a href="#" className={`nav-link ${menu === 'users' ? 'active' : ''}`} onClick={() => setMenu('users')}>
                  <i className="nav-icon fas fa-users" />
                  <p>Users</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className={`nav-link ${menu === 'roles' ? 'active' : ''}`} onClick={() => setMenu('roles')}>
                  <i className="nav-icon fas fa-user-shield" />
                  <p>Roles</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className={`nav-link ${menu === 'storage' ? 'active' : ''}`} onClick={() => setMenu('storage')}>
                  <i className="nav-icon fas fa-hdd" />
                  <p>Storage</p>
                </a>
              </li>
              <li className="nav-header">E-Commerce</li>
              <li className="nav-item">
                <a href="#" className={`nav-link ${menu === 'categories' ? 'active' : ''}`} onClick={() => setMenu('categories')}>
                  <i className="nav-icon fas fa-tags" />
                  <p>Categories</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className={`nav-link ${menu === 'products' ? 'active' : ''}`} onClick={() => setMenu('products')}>
                  <i className="nav-icon fas fa-box" />
                  <p>Products</p>
                </a>
              </li>
              {can('attributes:read') && (
                <li className="nav-item">
                  <a href="#" className={`nav-link ${menu === 'attributes' ? 'active' : ''}`} onClick={() => setMenu('attributes')}>
                    <i className="nav-icon fas fa-list" />
                    <p>Attributes</p>
                  </a>
                </li>
              )}
              {can('attribute-values:read') && (
                <li className="nav-item">
                  <a href="#" className={`nav-link ${menu === 'attribute-values' ? 'active' : ''}`} onClick={() => setMenu('attribute-values')}>
                    <i className="nav-icon fas fa-list-ul" />
                    <p>Attribute Values</p>
                  </a>
                </li>
              )}
              {can('attribute-sets:read') && (
                <li className="nav-item">
                  <a href="#" className={`nav-link ${menu === 'attribute-sets' ? 'active' : ''}`} onClick={() => setMenu('attribute-sets')}>
                    <i className="nav-icon fas fa-layer-group" />
                    <p>Attribute Sets</p>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid p-4">
            {currentUser ? (
              menu === 'users' ? (
                <UsersPage />
              ) : menu === 'roles' ? (
                <RolesPage />
              ) : menu === 'categories' ? (
                <CategoriesPage />
              ) : menu === 'storage' ? (
                <StoragePage />
              ) : menu === 'attributes' ? (
                <AttributesPage />
              ) : menu === 'attribute-values' ? (
                <AttributeValuesPage />
              ) : menu === 'attribute-sets' ? (
                selectedAttributeSetId ? (
                  <AttributeSetDetailsPage
                    id={selectedAttributeSetId}
                    onBack={() => setSelectedAttributeSetId(null)}
                  />
                ) : (
                  <AttributeSetsPage
                    onViewDetails={(id) => {
                      setSelectedAttributeSetId(id)
                      setMenu('attribute-sets')
                    }}
                  />
                )
              ) : (
                <ProductsPage />
              )
            ) : authScreen === 'login' ? (
              <LoginPage
                onLoggedIn={(u) => { setCurrentUser(u); setAuthScreen('login') }}
                onSwitchToRegister={() => setAuthScreen('register')}
              />
            ) : (
              <RegisterPage
                onRegistered={(u) => { setCurrentUser(u); setAuthScreen('login') }}
                onSwitchToLogin={() => setAuthScreen('login')}
              />
            )}
          </div>
        </section>
      </div>

      <footer className="main-footer">
        <div className="float-right d-none d-sm-inline">v0.1</div>
        <strong>Copyright &copy; 2025</strong>
      </footer>
    </div>
  )
}
