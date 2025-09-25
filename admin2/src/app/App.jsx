import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useState } from 'react'
import { AttributeSetsPage } from '../features/attributes/pages/AttributeSetsPage'
import { AttributesPage } from '../features/attributes/pages/AttributesPage'
import { AttributeValuesPage } from '../features/attributes/pages/AttributeValuesPage'
import { AuthProvider } from '../features/auth/context/AuthProvider'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { CategoriesPage } from '../features/categories/pages/CategoriesPage'
import { ProductsPage } from '../features/products/pages/ProductsPage'
import { RolesPage } from '../features/roles/pages/RolesPage'
import { TranslationsPage } from '../features/translations/pages/TranslationsPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import { LanguageSwitcher } from '../shared/components/LanguageSwitcher'
import { queryClient } from '../shared/lib/queryClient'

function AppContent() {
    const [authScreen, setAuthScreen] = useState('login')
    const [currentUser, setCurrentUser] = useState(null)
    const [currentPage, setCurrentPage] = useState('users')

    if (!currentUser) {
        return authScreen === 'login' ? (
            <LoginPage
                onLoggedIn={(user) => {
                    setCurrentUser(user)
                    setAuthScreen('login')
                }}
                onSwitchToRegister={() => setAuthScreen('register')}
            />
        ) : (
            <RegisterPage
                onRegistered={(user) => {
                    setCurrentUser(user)
                    setAuthScreen('login')
                }}
                onSwitchToLogin={() => setAuthScreen('login')}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <span className="text-sm text-gray-500">Welcome, {currentUser?.name || 'Admin'}</span>
                        <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setCurrentUser(null)}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-800 text-white min-h-screen">
                    <nav className="p-4">
                        <div className="space-y-2">
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('users')}
                            >
                                <i className="fas fa-users mr-3 text-lg" />
                                <span className="font-medium">Users</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'roles' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('roles')}
                            >
                                <i className="fas fa-user-shield mr-3 text-lg" />
                                <span className="font-medium">Roles</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'categories' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('categories')}
                            >
                                <i className="fas fa-tags mr-3 text-lg" />
                                <span className="font-medium">Categories</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'products' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('products')}
                            >
                                <i className="fas fa-box mr-3 text-lg" />
                                <span className="font-medium">Products</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'attributes' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('attributes')}
                            >
                                <i className="fas fa-list mr-3 text-lg" />
                                <span className="font-medium">Attributes</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'attribute-values' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('attribute-values')}
                            >
                                <i className="fas fa-list-alt mr-3 text-lg" />
                                <span className="font-medium">Attribute Values</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'attribute-sets' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('attribute-sets')}
                            >
                                <i className="fas fa-layer-group mr-3 text-lg" />
                                <span className="font-medium">Attribute Sets</span>
                            </button>
                            <button
                                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${currentPage === 'translations' ? 'bg-blue-600' : 'hover:bg-gray-700'
                                    }`}
                                onClick={() => setCurrentPage('translations')}
                            >
                                <i className="fas fa-language mr-3 text-lg" />
                                <span className="font-medium">Translations</span>
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {currentPage === 'users' ? (
                            <UsersPage />
                        ) : currentPage === 'roles' ? (
                            <RolesPage />
                        ) : currentPage === 'categories' ? (
                            <CategoriesPage />
                        ) : currentPage === 'products' ? (
                            <ProductsPage />
                        ) : currentPage === 'attributes' ? (
                            <AttributesPage />
                        ) : currentPage === 'attribute-values' ? (
                            <AttributeValuesPage />
                        ) : currentPage === 'attribute-sets' ? (
                            <AttributeSetsPage />
                        ) : currentPage === 'translations' ? (
                            <TranslationsPage />
                        ) : null}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    )
}