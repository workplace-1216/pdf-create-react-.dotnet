import React, { useState } from 'react'
import {
  FileText,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Server
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Mock data for charts
const documentTrendsData = [
  { name: 'Ene', documents: 120, processed: 115 },
  { name: 'Feb', documents: 150, processed: 145 },
  { name: 'Mar', documents: 180, processed: 175 },
  { name: 'Abr', documents: 200, processed: 195 },
  { name: 'May', documents: 220, processed: 215 },
  { name: 'Jun', documents: 250, processed: 245 },
  { name: 'Jul', documents: 280, processed: 275 },
  { name: 'Ago', documents: 300, processed: 295 },
  { name: 'Sep', documents: 320, processed: 315 },
  { name: 'Oct', documents: 350, processed: 345 },
  { name: 'Nov', documents: 380, processed: 375 },
  { name: 'Dic', documents: 400, processed: 395 }
]

const userActivityData = [
  { time: '00:00', users: 5 },
  { time: '04:00', users: 2 },
  { time: '08:00', users: 25 },
  { time: '12:00', users: 45 },
  { time: '16:00', users: 60 },
  { time: '20:00', users: 35 },
  { time: '24:00', users: 8 }
]

const documentStatusData = [
  { name: 'Procesados', value: 85, color: '#10B981' },
  { name: 'Pendientes', value: 10, color: '#F59E0B' },
  { name: 'Error', value: 5, color: '#EF4444' }
]

const systemMetricsData = [
  { name: 'CPU', value: 45, max: 100 },
  { name: 'RAM', value: 68, max: 100 },
  { name: 'Disco', value: 32, max: 100 },
  { name: 'Red', value: 78, max: 100 }
]

export const AdminDashboardPage: React.FC = () => {
  const [stats] = useState({
    totalDocuments: 1247,
    activeUsers: 89,
    templates: 12,
    processedToday: 45,
    pendingReview: 8,
    systemHealth: 99.8,
    revenue: 125000,
    conversionRate: 78.5
  })

  const [recentActivity] = useState([
    { id: 1, type: 'user', message: 'Nuevo cliente registrado', time: '2 min', status: 'success' },
    { id: 2, type: 'document', message: 'Documento procesado exitosamente', time: '5 min', status: 'success' },
    { id: 3, type: 'template', message: 'Plantilla actualizada', time: '10 min', status: 'warning' },
    { id: 4, type: 'system', message: 'Sistema optimizado', time: '15 min', status: 'info' },
    { id: 5, type: 'document', message: 'Documento requiere revisión', time: '20 min', status: 'error' }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-blue-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 px-20 space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-200/70 font-medium mb-1">Total Documentos</p>
              <p className="text-2xl font-bold text-white">{stats.totalDocuments.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-2">+145 este mes</p>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-green-200/70 font-medium mb-1">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-xs text-green-400 mt-2">En línea ahora</p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+15%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-yellow-200/70 font-medium mb-1">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-2">+$18K este mes</p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Excelente</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-200/70 font-medium mb-1">Salud del Sistema</p>
              <p className="text-2xl font-bold text-white">{stats.systemHealth}%</p>
              <p className="text-xs text-green-400 mt-2">Todo funcionando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Trends Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Tendencias de Documentos</h3>
              <p className="text-sm text-blue-200/80">Últimos 12 meses</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-white">Documentos</span>
              <div className="w-3 h-3 bg-green-400 rounded-full ml-2"></div>
              <span className="text-xs text-white">Procesados</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={documentTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="documents" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="processed" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Actividad de Usuarios</h3>
              <p className="text-sm text-blue-200/80">Últimas 24 horas</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">En tiempo real</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Area type="monotone" dataKey="users" stroke="#10B981" fill="rgba(16, 185, 129, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Status Pie Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Estado de Documentos</h3>
              <p className="text-sm text-blue-200/80">Distribución actual</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={documentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {documentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* System Metrics */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Métricas del Sistema</h3>
              <p className="text-sm text-blue-200/80">Rendimiento actual</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Estable</span>
            </div>
          </div>
          <div className="space-y-4">
            {systemMetricsData.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-white">{metric.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{metric.value}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Actividad Reciente</h3>
              <p className="text-sm text-blue-200/80">Últimas acciones</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">En tiempo real</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)} animate-pulse`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.message}</p>
                  <p className="text-xs text-white/60">{activity.time}</p>
                </div>
                <div className="text-white/40">
                  {getStatusIcon(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}