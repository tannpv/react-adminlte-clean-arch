import React from 'react'
import { UsersPage } from './presentation/pages/UsersPage'
import { getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase } from './composition/container'

export default function App() {
  return (
    <div className="wrapper">
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars"></i></a>
          </li>
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
            <UsersPage
              getUsersUseCase={getUsersUseCase}
              createUserUseCase={createUserUseCase}
              updateUserUseCase={updateUserUseCase}
              deleteUserUseCase={deleteUserUseCase}
            />
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
