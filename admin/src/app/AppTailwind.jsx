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
import TailwindDemoPage from '../features/demo/pages/TailwindDemoPage'
import { fetchProducts } from '../features/products/api/productsApi'
import { ProductsPage } from '../features/products/pages/ProductsPage'
import { fetchRoles } from '../features/roles/api/rolesApi'
import { RolesPage } from '../features/roles/pages/RolesPage'
import StoragePage from '../features/storage/pages/StoragePage'
import TranslationsPage from '../features/translations/pages/TranslationsPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import MainLayout from '../shared/components/layout/MainLayout'
import { usePermissions } from '../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../shared/hooks/useTranslation'
import { ApiClient } from '../shared/lib/apiClient'
import { getUserDisplayName } from '../shared/lib/userDisplayName'

export default function AppTailwind() {
    const { user: currentUser, setUser: setCurrentUser, logout } = useAuth()
    const { can, me } = usePermissions()
    const { languageCode } = useLanguage()
    const { t } = useTranslation(languageCode, 'common')
    const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register'
    const [menu, setMenu] = useState('demo') // 'demo' | 'users' | 'roles' | 'categories' | 'products' | 'storage' | 'attributes' | 'attribute-values' | 'attribute-sets' | 'translations'
    const [selectedAttributeSetId, setSelectedAttributeSetId] = useState(null)
    const qc = useQueryClient()

    useEffect(() => {
        if (!currentUser) return
        qc.prefetchQuery({ queryKey: ['me'], queryFn: async () => (await ApiClient.get('/me')).data, staleTime: 10_000 })
        qc.prefetchQuery({ queryKey: ['roles'], queryFn: fetchRoles, staleTime: 5 * 60_000 })
        qc.prefetchQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 })
    }, [currentUser, qc, can])

    // If user is not logged in, show auth pages
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {authScreen === 'login' ? t('login', 'Sign in to your account') : t('register', 'Create your account')}
                    </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {authScreen === 'login' ? (
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
                </div>
            </div>
        )
    }

    // Render the main application with Tailwind layout
    return (
        <MainLayout menu={menu} setMenu={setMenu}>
            <div className="space-y-6">
                {/* User info and logout */}
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {getUserDisplayName(currentUser).charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {getUserDisplayName(currentUser)}
                                </p>
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
                        </div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t('logout', 'Logout')}
                        </button>
                    </div>
                </div>

                {/* Main content */}
                {menu === 'demo' ? (
                    <TailwindDemoPage />
                ) : menu === 'users' ? (
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
                )}
            </div>
        </MainLayout>
    )
}
