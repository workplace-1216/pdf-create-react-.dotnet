import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Shield,
  LogOut,
  Home,
  UserCheck,
  FileCheck,
  PieChart,
  MoreHorizontal
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'users', label: 'Gestión de Usuarios', icon: UserCheck, path: '/admin/users' },
    { id: 'documents', label: 'Gestión de Documentos', icon: FileCheck, path: '/admin/documents' },
    { id: 'reports', label: 'Reportes y Analytics', icon: PieChart, path: '/admin/reports' }
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col relative z-10`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="relative p-2 rounded-xl shadow-2xl">
                <img src="/logo.png" alt="CAAST" className="h-12 sm:h-12" />
              </div>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-blue-200/80">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                    : 'hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {sidebarOpen && (
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 hover:border-red-400/30 transition-all duration-300 group w-full"
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-red-500/20">
              <LogOut className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-sm font-medium text-white/80 group-hover:text-white">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-white/5 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <MoreHorizontal className="h-5 w-5 text-white" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
                <p className="text-sm text-blue-200/80">Sistema de gestión integral</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
