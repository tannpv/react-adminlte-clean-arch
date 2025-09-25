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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" data-widget="pushmenu">
            <i className="fas fa-bars text-lg"></i>
          </button>
        </div>
        <div className="flex items-center space-x-6">
          {currentUser ? (
            <>
              <LanguageSwitcher />
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {getUserDisplayName(currentUser).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-sm">{getUserDisplayName(currentUser)}</span>
                    {me?.roles?.length ? (
                      <div className="flex space-x-1">
                        {me.roles.map(r => (
                          <span key={r.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm" 
                  onClick={logout}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  {t('logout', 'Logout')}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex-shrink-0 shadow-xl min-h-screen">
        <div className="flex items-center p-6 border-b border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">AA</span>
          </div>
          <div>
            <span className="text-white text-lg font-bold">{t('aurora_admin', 'Aurora Admin')}</span>
            <p className="text-gray-400 text-xs">Admin Dashboard</p>
          </div>
        </div>
        <div className="p-4">
          <nav className="mt-2">
            <div className="space-y-2">
              <div className="text-gray-400 uppercase text-xs font-semibold tracking-wider mt-6 mb-3 px-3">{t('system', 'System')}</div>
              <button
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'users'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
                  }`}
                onClick={() => setMenu('users')}
              >
                <i className="fas fa-users mr-3 text-lg group-hover:text-blue-300" />
                <span className="font-medium">{t('users', 'Users')}</span>
                {menu === 'users' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'roles'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
                  }`}
                onClick={() => setMenu('roles')}
              >
                <i className="fas fa-user-shield mr-3 text-lg group-hover:text-blue-300" />
                <span className="font-medium">{t('roles', 'Roles')}</span>
                {menu === 'roles' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'storage'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
                  }`}
                onClick={() => setMenu('storage')}
              >
                <i className="fas fa-hdd mr-3 text-lg group-hover:text-blue-300" />
                <span className="font-medium">{t('storage', 'Storage')}</span>
                {menu === 'storage' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </button>

              <div className="text-gray-400 uppercase text-xs font-semibold tracking-wider mt-6 mb-3 px-3">{t('e_commerce', 'E-Commerce')}</div>
              <button
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'categories'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
                  }`}
                onClick={() => setMenu('categories')}
              >
                <i className="fas fa-tags mr-3 text-lg group-hover:text-blue-300" />
                <span className="font-medium">{t('categories', 'Categories')}</span>
                {menu === 'categories' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'products'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                  : 'hover:bg-gray-700 hover:transform hover:scale-105'
                  }`}
                onClick={() => setMenu('products')}
              >
                <i className="fas fa-box mr-3 text-lg group-hover:text-blue-300" />
                <span className="font-medium">{t('products', 'Products')}</span>
                {menu === 'products' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </button>
              {can('attributes:read') && (
                <button
                  className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'attributes'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                    : 'hover:bg-gray-700 hover:transform hover:scale-105'
                    }`}
                  onClick={() => setMenu('attributes')}
                >
                  <i className="fas fa-list mr-3 text-lg group-hover:text-blue-300" />
                  <span className="font-medium">{t('attributes', 'Attributes')}</span>
                  {menu === 'attributes' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              )}
              {can('attribute-values:read') && (
                <button
                  className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'attribute-values'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                    : 'hover:bg-gray-700 hover:transform hover:scale-105'
                    }`}
                  onClick={() => setMenu('attribute-values')}
                >
                  <i className="fas fa-list-ul mr-3 text-lg group-hover:text-blue-300" />
                  <span className="font-medium">{t('attribute_values', 'Attribute Values')}</span>
                  {menu === 'attribute-values' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              )}
              {can('attribute-sets:read') && (
                <button
                  className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'attribute-sets'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                    : 'hover:bg-gray-700 hover:transform hover:scale-105'
                    }`}
                  onClick={() => setMenu('attribute-sets')}
                >
                  <i className="fas fa-layer-group mr-3 text-lg group-hover:text-blue-300" />
                  <span className="font-medium">{t('attribute_sets', 'Attribute Sets')}</span>
                  {menu === 'attribute-sets' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              )}

              <div className="text-gray-400 uppercase text-xs font-semibold tracking-wider mt-6 mb-3 px-3">{t('localization', 'Localization')}</div>
              {can('translations:read') && (
                <button
                  className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 group ${menu === 'translations'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transform scale-105'
                    : 'hover:bg-gray-700 hover:transform hover:scale-105'
                    }`}
                  onClick={() => setMenu('translations')}
                >
                  <i className="fas fa-language mr-3 text-lg group-hover:text-blue-300" />
                  <span className="font-medium">{t('translations', 'Translations')}</span>
                  {menu === 'translations' && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              )}
            </div>
          </nav>
        </div>
      </aside>

        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          <main className="flex-grow p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
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

        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <strong className="text-gray-900">Copyright &copy; 2025</strong>
              <span className="text-gray-500">Aurora Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm">Version</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                v0.1
              </span>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </div>
  )
}
