import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useState } from 'react'
import { AttributeSetDetailsPage } from '../features/attributes/pages/AttributeSetDetailsPage'
import { AttributeSetsPage } from '../features/attributes/pages/AttributeSetsPage'
import { AttributesPage } from '../features/attributes/pages/AttributesPage'
import { AttributeValuesPage } from '../features/attributes/pages/AttributeValuesPage'
import { AuthProvider } from '../features/auth/context/AuthProvider'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { CategoriesPage } from '../features/categories/pages/CategoriesPage'
import { OrdersPage } from '../features/orders/pages/OrdersPage'
import { ProductsPage } from '../features/products/pages/ProductsPage'
import { RolesPage } from '../features/roles/pages/RolesPage'
import { StoresPage } from '../features/stores/pages/StoresPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import TranslationsPage from '../features/translations/pages/TranslationsPage'
import Sidebar from '../shared/components/layout/Sidebar'
import FloatingToggle from '../shared/components/ui/FloatingToggle'
import NavigationStatus from '../shared/components/ui/NavigationStatus'
import NavigationToggle from '../shared/components/ui/NavigationToggle'
import { NavigationProvider } from '../shared/context/NavigationContext'
import { queryClient } from '../shared/lib/queryClient'

function AppContent() {
    const [authScreen, setAuthScreen] = useState('login')
    const [currentUser, setCurrentUser] = useState(null)
    const [currentPage, setCurrentPage] = useState('users')
    const [attributeSetDetailsId, setAttributeSetDetailsId] = useState(null)

    const handleViewAttributeSetDetails = (id) => {
        setAttributeSetDetailsId(id)
    }

    const handleBackFromAttributeSetDetails = () => {
        setAttributeSetDetailsId(null)
    }

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
                    <div className="flex items-center space-x-4">
                        <NavigationToggle variant="header" />
                        <NavigationStatus />
                        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
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
                {/* Enhanced Sidebar */}
                <Sidebar
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {/* Main Content */}
                <main className="main-content">
                    <div className="main-content-container">
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
                            attributeSetDetailsId ? (
                                <AttributeSetDetailsPage
                                    id={attributeSetDetailsId}
                                    onBack={handleBackFromAttributeSetDetails}
                                />
                            ) : (
                                <AttributeSetsPage onViewDetails={handleViewAttributeSetDetails} />
                            )
                        ) : currentPage === 'stores' ? (
                            <StoresPage />
                        ) : currentPage === 'orders' ? (
                            <OrdersPage />
                        ) : currentPage === 'translations' ? (
                            <TranslationsPage />
                        ) : null}
                    </div>
                </main>
            </div>

            {/* Floating Toggle Button */}
            <FloatingToggle />
        </div>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NavigationProvider>
                    <AppContent />
                </NavigationProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    )
}