import React, { useState } from 'react'
import {
  Download,
  RefreshCw,
  FileText,
  Users,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import * as XLSX from 'xlsx'

// Mock data for charts
const monthlyTrendsData = [
  { month: 'Ene', documents: 120, processed: 115, errors: 5 },
  { month: 'Feb', documents: 150, processed: 145, errors: 5 },
  { month: 'Mar', documents: 180, processed: 175, errors: 5 },
  { month: 'Abr', documents: 200, processed: 195, errors: 5 },
  { month: 'May', documents: 220, processed: 215, errors: 5 },
  { month: 'Jun', documents: 250, processed: 245, errors: 5 },
  { month: 'Jul', documents: 280, processed: 275, errors: 5 },
  { month: 'Ago', documents: 300, processed: 295, errors: 5 },
  { month: 'Sep', documents: 320, processed: 315, errors: 5 },
  { month: 'Oct', documents: 350, processed: 345, errors: 5 },
  { month: 'Nov', documents: 380, processed: 375, errors: 5 },
  { month: 'Dic', documents: 400, processed: 395, errors: 5 }
]

const userActivityData = [
  { time: '00:00', users: 5, documents: 2 },
  { time: '04:00', users: 2, documents: 1 },
  { time: '08:00', users: 25, documents: 15 },
  { time: '12:00', users: 45, documents: 35 },
  { time: '16:00', users: 60, documents: 50 },
  { time: '20:00', users: 35, documents: 25 },
  { time: '24:00', users: 8, documents: 3 }
]

const documentTypesData = [
  { name: 'Facturas', value: 45, color: '#3B82F6' },
  { name: 'Recibos', value: 30, color: '#10B981' },
  { name: 'Estados de Cuenta', value: 20, color: '#F59E0B' },
  { name: 'Otros', value: 5, color: '#EF4444' }
]

const processingTimeData = [
  { range: '0-30s', count: 120 },
  { range: '30s-1m', count: 85 },
  { range: '1-2m', count: 45 },
  { range: '2-5m', count: 20 },
  { range: '5m+', count: 5 }
]

const errorTypesData = [
  { type: 'Formato Inválido', count: 15, percentage: 40 },
  { type: 'Datos Faltantes', count: 10, percentage: 27 },
  { type: 'Calidad de Imagen', count: 8, percentage: 21 },
  { type: 'Otros', count: 4, percentage: 12 }
]

export const ReportsAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Force component re-render by updating state
      setSelectedPeriod(prev => prev)
      
      // Show success feedback
      console.log('Data refreshed successfully for period:', selectedPeriod)
      
      // You could also trigger a page reload if needed:
      // window.location.reload()
      
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportReports = () => {
    // Prepare data for Excel export with multiple sheets
    const wb = XLSX.utils.book_new()
    
    // Sheet 1: Key Metrics
    const metricsData = [
      ['Métrica', 'Valor', 'Período'],
      ['Total Documentos', stats.totalDocuments.toString(), selectedPeriod],
      ['Documentos Hoy', stats.processedToday.toString(), selectedPeriod],
      ['Tiempo Promedio', stats.averageProcessingTime, selectedPeriod],
      ['Tasa de Éxito', `${stats.successRate}%`, selectedPeriod],
      ['Total Usuarios', stats.totalUsers.toString(), selectedPeriod],
      ['Usuarios Activos', stats.activeUsers.toString(), selectedPeriod],
      ['Ingresos', `$${stats.revenue.toLocaleString()}`, selectedPeriod],
      ['Tasa de Crecimiento', `${stats.growthRate}%`, selectedPeriod]
    ]
    const metricsWs = XLSX.utils.aoa_to_sheet(metricsData)
    XLSX.utils.book_append_sheet(wb, metricsWs, 'Métricas Clave')
    
    // Sheet 2: Monthly Trends
    const trendsData = [
      ['Mes', 'Documentos', 'Procesados', 'Errores'],
      ...monthlyTrendsData.map(item => [
        item.month,
        item.documents.toString(),
        item.processed.toString(),
        item.errors.toString()
      ])
    ]
    const trendsWs = XLSX.utils.aoa_to_sheet(trendsData)
    XLSX.utils.book_append_sheet(wb, trendsWs, 'Tendencias Mensuales')
    
    // Sheet 3: User Activity
    const activityData = [
      ['Hora', 'Usuarios', 'Documentos'],
      ...userActivityData.map(item => [
        item.time,
        item.users.toString(),
        item.documents.toString()
      ])
    ]
    const activityWs = XLSX.utils.aoa_to_sheet(activityData)
    XLSX.utils.book_append_sheet(wb, activityWs, 'Actividad de Usuarios')
    
    // Sheet 4: Document Types
    const typesData = [
      ['Tipo', 'Cantidad', 'Color'],
      ...documentTypesData.map(item => [
        item.name,
        item.value.toString(),
        item.color
      ])
    ]
    const typesWs = XLSX.utils.aoa_to_sheet(typesData)
    XLSX.utils.book_append_sheet(wb, typesWs, 'Tipos de Documentos')
    
    // Generate Excel file and download
    XLSX.writeFile(wb, `reportes_${selectedPeriod}.xlsx`)
  }

  const [stats] = useState({
    totalDocuments: 2847,
    processedToday: 45,
    averageProcessingTime: '1.2m',
    successRate: 98.5,
    totalUsers: 89,
    activeUsers: 67,
    revenue: 125000,
    growthRate: 12.5
  })


  return (
    <div className="p-6 px-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes y Analytics</h2>
          <p className="text-sm text-blue-200/80">Análisis detallado del rendimiento del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
          <button 
            onClick={handleExportReports}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+{stats.growthRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-200/70 font-medium mb-1">Total Documentos</p>
              <p className="text-2xl font-bold text-white">{stats.totalDocuments.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-2">+{stats.processedToday} hoy</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+2.1%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-green-200/70 font-medium mb-1">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
              <p className="text-xs text-green-400 mt-2">Excelente rendimiento</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-sm font-medium">-15%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-yellow-200/70 font-medium mb-1">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-white">{stats.averageProcessingTime}</p>
              <p className="text-xs text-green-400 mt-2">Mejorando eficiencia</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-200/70 font-medium mb-1">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-xs text-green-400 mt-2">de {stats.totalUsers} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Tendencias Mensuales</h3>
              <p className="text-sm text-blue-200/80">Documentos procesados vs errores</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-white">Documentos</span>
              <div className="w-3 h-3 bg-green-400 rounded-full ml-2"></div>
              <span className="text-xs text-white">Procesados</span>
              <div className="w-3 h-3 bg-red-400 rounded-full ml-2"></div>
              <span className="text-xs text-white">Errores</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="documents" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="processed" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity */}
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
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500'
                }} 
              />
              <Area type="monotone" dataKey="users" stroke="#10B981" fill="rgba(16, 185, 129, 0.2)" />
              <Area type="monotone" dataKey="documents" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Types */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Tipos de Documentos</h3>
              <p className="text-sm text-blue-200/80">Distribución actual</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={documentTypesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {documentTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(224, 216, 216, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500'
                }} 
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Processing Time */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Tiempo de Procesamiento</h3>
              <p className="text-sm text-blue-200/80">Distribución por rangos</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processingTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500'
                }} 
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error Analysis */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Análisis de Errores</h3>
              <p className="text-sm text-blue-200/80">Tipos más comunes</p>
            </div>
          </div>
          <div className="space-y-4">
            {errorTypesData.map((error, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-white">{error.type}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{error.count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${error.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/60">{error.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
