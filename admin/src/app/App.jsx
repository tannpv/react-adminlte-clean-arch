import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UsersPage } from '../features/users/pages/UsersPage'
import { RolesPage } from '../features/roles/pages/RolesPage'
import { ProductsPage } from '../features/products/pages/ProductsPage'
import { CategoriesPage } from '../features/categories/pages/CategoriesPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { useAuth } from '../features/auth/context/AuthProvider'
import { usePermissions } from '../shared/hooks/usePermissions'
import { ApiClient } from '../shared/lib/apiClient'
import { fetchRoles } from '../features/roles/api/rolesApi'
import { fetchProducts } from '../features/products/api/productsApi'
import { getUserDisplayName } from '../shared/lib/userDisplayName'

export default function App() {
  const { user: currentUser, setUser: setCurrentUser, logout } = useAuth()
  const { me } = usePermissions()
  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register'
  const [menu, setMenu] = useState('users') // 'users' | 'roles' | 'categories' | 'products'
  const qc = useQueryClient()

  useEffect(() => {
    if (!currentUser) return
    qc.prefetchQuery({ queryKey: ['me'], queryFn: async () => (await ApiClient.get('/me')).data, staleTime: 10_000 })
    qc.prefetchQuery({ queryKey: ['roles'], queryFn: fetchRoles, staleTime: 5 * 60_000 })
    qc.prefetchQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 })
  }, [currentUser, qc])
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
              <span className="mr-3 d-flex align-items-center">
                {getUserDisplayName(currentUser)}
                {me?.roles?.length ? (
                  <span className="ml-2">
                    {me.roles.map(r => (
                      <span key={r.id} className="badge badge-info ml-1">{r.name}</span>
                    ))}
                  </span>
                ) : null}
              </span>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
            </li>
          ) : null}
        </ul>
      </nav>

      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" className="brand-link">
          <span className="brand-text font-weight-light">My Admin</span>
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
