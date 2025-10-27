import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  FileText,
  Users,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalDocuments: 1247,
    activeUsers: 89,
    templates: 12,
    processedToday: 45,
    pendingReview: 8,
    systemHealth: 99.8
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user', message: 'Nuevo cliente registrado', time: '2 min', status: 'success' },
    { id: 2, type: 'document', message: 'Documento procesado exitosamente', time: '5 min', status: 'success' },
    { id: 3, type: 'template', message: 'Plantilla actualizada', time: '10 min', status: 'warning' },
    { id: 4, type: 'system', message: 'Sistema optimizado', time: '15 min', status: 'info' },
    { id: 5, type: 'document', message: 'Documento requiere revisión', time: '20 min', status: 'error' }
  ])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-auto flex flex-col">
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

      {/* Modern Header */}
      <div className="relative z-10 bg-gradient-to-r from-white/5 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl shadow-2xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
              </div>
            </div>

            {/* Right Side - Status & Actions */}
            <div className="flex items-center space-x-3">

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 rounded-lg hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <LogOut className="h-3 w-3 mr-1.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full py-6 sm:py-10 flex-1 flex flex-col lg:flex-row gap-3 sm:gap-6 justify-center">
        <div className='flex w-[70%]'>
          {/* Left Column - Stats Cards */}
          <div className="flex flex-col space-y-4 mr-5 w-full">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Total Documents */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200/70 font-medium">Total Documentos</p>
                      <p className="text-lg font-bold text-white">{stats.totalDocuments.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">+12% este mes</span>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-200/70 font-medium">Usuarios Activos</p>
                      <p className="text-lg font-bold text-white">{stats.activeUsers}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">En línea ahora</span>
                  </div>
                </div>
              </div>

              {/* Processed Today */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-orange-200/70 font-medium">Procesados Hoy</p>
                      <p className="text-lg font-bold text-white">{stats.processedToday}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-orange-400" />
                    <span className="text-xs text-orange-400">En tiempo real</span>
                  </div>
                </div>
              </div>

              {/* Pending Review */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-200/70 font-medium">Pendientes</p>
                      <p className="text-lg font-bold text-white">{stats.pendingReview}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Requieren revisión</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg mr-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Acciones Rápidas</h3>
                    <p className="text-sm text-indigo-200/80">Gestiona el sistema con un clic</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  
                  <Link
                    to="/admin/documents"
                    className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-green-300 transition-colors">Gestión de Documentos</p>
                        <p className="text-xs text-white/60">Ver y administrar todos los documentos</p>
                      </div>
                    </div>
                  </Link>

                  <button className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Gestión de Usuarios</p>
                        <p className="text-xs text-white/60">Administrar clientes y permisos</p>
                      </div>
                    </div>
                  </button>

                  <button className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-orange-300 transition-colors">Reportes y Analytics</p>
                        <p className="text-xs text-white/60">Estadísticas y métricas del sistema</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="flex flex-col w-full">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Header */}
              <div className="relative z-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-white/10 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Actividad Reciente</h3>
                      <p className="text-sm text-blue-200/80">Últimas acciones del sistema</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">En tiempo real</span>
                  </div>
                </div>
              </div>

              {/* Activity List */}
              <div className="relative z-10 flex-1 overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div className={`w-3 h-3 rounded-full ${activity.status === 'success' ? 'bg-green-400' :
                          activity.status === 'warning' ? 'bg-yellow-400' :
                            activity.status === 'error' ? 'bg-red-400' :
                              'bg-blue-400'
                        } animate-pulse`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.message}</p>
                        <p className="text-xs text-white/60">{activity.time}</p>
                      </div>
                      <div className="text-xs text-white/40">
                        {activity.type === 'user' && <Users className="h-4 w-4" />}
                        {activity.type === 'document' && <FileText className="h-4 w-4" />}
                        {activity.type === 'template' && <Settings className="h-4 w-4" />}
                        {activity.type === 'system' && <Shield className="h-4 w-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
