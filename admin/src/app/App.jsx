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
import TranslationsPage from '../features/translations/pages/TranslationsPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import LanguageSwitcher from '../shared/components/LanguageSwitcher'
import { usePermissions } from '../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../shared/hooks/useTranslation'
import { ApiClient } from '../shared/lib/apiClient'
import { getUserDisplayName } from '../shared/lib/userDisplayName'

export default function App() {
  const { user: currentUser, setUser: setCurrentUser, logout } = useAuth()
  const { can, me } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'common')
  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register'
  const [menu, setMenu] = useState('users') // 'users' | 'roles' | 'categories' | 'products' | 'storage' | 'attributes' | 'attribute-values' | 'attribute-sets' | 'translations'
  const [selectedAttributeSetId, setSelectedAttributeSetId] = useState(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (!currentUser) return
    qc.prefetchQuery({ queryKey: ['me'], queryFn: async () => (await ApiClient.get('/me')).data, staleTime: 10_000 })
    qc.prefetchQuery({ queryKey: ['roles'], queryFn: fetchRoles, staleTime: 5 * 60_000 })
    qc.prefetchQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 })
  }, [currentUser, qc, can])
  return (
    <div className="flex min-h-screen">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center w-full">
        <div className="flex items-center">
          <button className="text-gray-600 hover:text-gray-900 p-2" data-widget="pushmenu">
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <LanguageSwitcher />
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-medium">{getUserDisplayName(currentUser)}</span>
                  {me?.roles?.length ? (
                    <div className="flex space-x-1">
                      {me.roles.map(r => (
                        <span key={r.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                  onClick={logout}
                >
                  {t('logout', 'Logout')}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </nav>

      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="flex items-center p-4 text-white text-xl font-bold">
          <span className="mr-2">AA</span>
          <span>{t('aurora_admin', 'Aurora Admin')}</span>
        </div>
        <div className="p-4">
          <nav className="mt-2">
            <div className="space-y-1">
              <div className="text-gray-400 uppercase text-xs font-bold mt-4 mb-2">{t('system', 'System')}</div>
              <button 
                className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'users' ? 'bg-blue-600' : ''}`}
                onClick={() => setMenu('users')}
              >
                <i className="fas fa-users mr-3" />
                <span>{t('users', 'Users')}</span>
              </button>
              <button 
                className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'roles' ? 'bg-blue-600' : ''}`}
                onClick={() => setMenu('roles')}
              >
                <i className="fas fa-user-shield mr-3" />
                <span>{t('roles', 'Roles')}</span>
              </button>
              <button 
                className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'storage' ? 'bg-blue-600' : ''}`}
                onClick={() => setMenu('storage')}
              >
                <i className="fas fa-hdd mr-3" />
                <span>{t('storage', 'Storage')}</span>
              </button>
              
              <div className="text-gray-400 uppercase text-xs font-bold mt-4 mb-2">{t('e_commerce', 'E-Commerce')}</div>
              <button 
                className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'categories' ? 'bg-blue-600' : ''}`}
                onClick={() => setMenu('categories')}
              >
                <i className="fas fa-tags mr-3" />
                <span>{t('categories', 'Categories')}</span>
              </button>
              <button 
                className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'products' ? 'bg-blue-600' : ''}`}
                onClick={() => setMenu('products')}
              >
                <i className="fas fa-box mr-3" />
                <span>{t('products', 'Products')}</span>
              </button>
              {can('attributes:read') && (
                <button 
                  className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'attributes' ? 'bg-blue-600' : ''}`}
                  onClick={() => setMenu('attributes')}
                >
                  <i className="fas fa-list mr-3" />
                  <span>{t('attributes', 'Attributes')}</span>
                </button>
              )}
              {can('attribute-values:read') && (
                <button 
                  className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'attribute-values' ? 'bg-blue-600' : ''}`}
                  onClick={() => setMenu('attribute-values')}
                >
                  <i className="fas fa-list-ul mr-3" />
                  <span>{t('attribute_values', 'Attribute Values')}</span>
                </button>
              )}
              {can('attribute-sets:read') && (
                <button 
                  className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'attribute-sets' ? 'bg-blue-600' : ''}`}
                  onClick={() => setMenu('attribute-sets')}
                >
                  <i className="fas fa-layer-group mr-3" />
                  <span>{t('attribute_sets', 'Attribute Sets')}</span>
                </button>
              )}
              
              <div className="text-gray-400 uppercase text-xs font-bold mt-4 mb-2">{t('localization', 'Localization')}</div>
              {can('translations:read') && (
                <button 
                  className={`w-full flex items-center py-2 px-4 rounded-md text-white hover:bg-gray-700 ${menu === 'translations' ? 'bg-blue-600' : ''}`}
                  onClick={() => setMenu('translations')}
                >
                  <i className="fas fa-language mr-3" />
                  <span>{t('translations', 'Translations')}</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex-grow flex flex-col">
        <main className="flex-grow p-4">
          <div className="mx-auto">
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
              ) : menu === 'translations' ? (
                <TranslationsPage />
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
        </main>

        <footer className="bg-gray-100 p-4 text-center text-gray-600">
          <div className="flex justify-between items-center">
            <strong>Copyright &copy; 2025</strong>
            <span className="hidden sm:inline">v0.1</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
