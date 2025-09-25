import React, { useState } from 'react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('users')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome, Admin</span>
            <button className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${
                  currentPage === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                onClick={() => setCurrentPage('users')}
              >
                <i className="fas fa-users mr-3 text-lg" />
                <span className="font-medium">Users</span>
              </button>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg text-white transition-all duration-200 ${
                  currentPage === 'roles' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                onClick={() => setCurrentPage('roles')}
              >
                <i className="fas fa-user-shield mr-3 text-lg" />
                <span className="font-medium">Roles</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'users' ? (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Users Management</h2>
                </div>
                <div className="card-body">
                  <p className="text-gray-600">Users page content will be here...</p>
                </div>
              </div>
            ) : currentPage === 'roles' ? (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Roles Management</h2>
                </div>
                <div className="card-body">
                  <p className="text-gray-600">Roles page content will be here...</p>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
