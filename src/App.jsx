import React, { useEffect, useState } from 'react'
import { UsersPage } from './presentation/pages/UsersPage'
import { LoginPage } from './presentation/pages/LoginPage'
import { RegisterPage } from './presentation/pages/RegisterPage'
import { getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase, loginUseCase, registerUseCase } from './composition/container'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setCurrentUser(JSON.parse(u))
  }, [])
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }
  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register'
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
              <span className="mr-3">{currentUser.name}</span>
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
              <li className="nav-item">
                <a href="#" className="nav-link active">
                  <i className="nav-icon fas fa-users"></i>
                  <p>Users</p>
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
              <UsersPage
                getUsersUseCase={getUsersUseCase}
                createUserUseCase={createUserUseCase}
                updateUserUseCase={updateUserUseCase}
                deleteUserUseCase={deleteUserUseCase}
              />
            ) : authScreen === 'login' ? (
              <LoginPage
                loginUseCase={loginUseCase}
                onLoggedIn={(u) => { setCurrentUser(u); setAuthScreen('login') }}
                onSwitchToRegister={() => setAuthScreen('register')}
              />
            ) : (
              <RegisterPage
                registerUseCase={registerUseCase}
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
