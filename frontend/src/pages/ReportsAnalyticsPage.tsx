import React, { useEffect, useState } from 'react'
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
import { adminApi } from '../services/api'
import type { ReportsAnalyticsResponse } from '../types/api'

// Pie colors mapping
const TYPE_COLORS: string[] = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export const ReportsAnalyticsPage: React.FC = () => {
  const [selectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<ReportsAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (period: '7d' | '30d' | '90d' | '1y') => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminApi.getAnalytics(period)
      setData(res)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('No se pudieron cargar los reportes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(selectedPeriod)
  }, [])

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    
    try {
      await fetchAnalytics(selectedPeriod)
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
      ['Total Documentos', (data?.stats.totalDocuments ?? 0).toString(), selectedPeriod],
      ['Documentos Hoy', (data?.stats.processedToday ?? 0).toString(), selectedPeriod],
      ['Tiempo Promedio', data?.stats.averageProcessingTime ?? '-', selectedPeriod],
      ['Tasa de Éxito', `${data?.stats.successRate ?? 0}%`, selectedPeriod],
      ['Total Usuarios', (data?.stats.totalUsers ?? 0).toString(), selectedPeriod],
      ['Usuarios Activos', (data?.stats.activeUsers ?? 0).toString(), selectedPeriod],
      ['Tasa de Crecimiento', `${data?.stats.growthRate ?? 0}%`, selectedPeriod]
    ]
    const metricsWs = XLSX.utils.aoa_to_sheet(metricsData)
    XLSX.utils.book_append_sheet(wb, metricsWs, 'Métricas Clave')
    
    // Sheet 2: Monthly Trends
    const trendsData = [
      ['Mes', 'Documentos', 'Procesados', 'Errores'],
      ...((data?.monthlyTrends || []).map(item => [
        item.month,
        item.documents.toString(),
        item.processed.toString(),
        item.errors.toString()
      ]))
    ]
    const trendsWs = XLSX.utils.aoa_to_sheet(trendsData)
    XLSX.utils.book_append_sheet(wb, trendsWs, 'Tendencias Mensuales')
    
    // Sheet 3: User Activity
    const activityData = [
      ['Hora', 'Usuarios', 'Documentos'],
      ...((data?.userActivity || []).map(item => [
        item.time,
        item.users.toString(),
        item.documents.toString()
      ]))
    ]
    const activityWs = XLSX.utils.aoa_to_sheet(activityData)
    XLSX.utils.book_append_sheet(wb, activityWs, 'Actividad de Usuarios')
    
    // Sheet 4: Document Types
    const typesData = [
      ['Tipo', 'Cantidad'],
      ...((data?.documentTypes || []).map(item => [
        item.name,
        item.value.toString()
      ]))
    ]
    const typesWs = XLSX.utils.aoa_to_sheet(typesData)
    XLSX.utils.book_append_sheet(wb, typesWs, 'Tipos de Documentos')
    
    // Generate Excel file and download
    XLSX.writeFile(wb, `reportes_${selectedPeriod}.xlsx`)
  }

  if (loading && !data) {
    return (
      <div className="p-6 px-20">
        <div className="text-white">Cargando reportes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 px-20">
        <div className="text-red-300">{error}</div>
      </div>
    )
  }


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
                <span className="text-sm font-medium">+{data?.stats.growthRate ?? 0}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-200/70 font-medium mb-1">Total Documentos</p>
              <p className="text-2xl font-bold text-white">{data?.stats.totalDocuments.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-2">+{data?.stats.processedToday} hoy</p>
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
              <p className="text-2xl font-bold text-white">{data?.stats.successRate}%</p>
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
              <p className="text-2xl font-bold text-white">{data?.stats.averageProcessingTime}</p>
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
              <p className="text-2xl font-bold text-white">{data?.stats.activeUsers}</p>
              <p className="text-xs text-green-400 mt-2">de {data?.stats.totalUsers} total</p>
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
            <LineChart data={data?.monthlyTrends || []}>
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
            <AreaChart data={data?.userActivity || []}>
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
                data={(data?.documentTypes || []).map((d, i) => ({ ...d, color: TYPE_COLORS[i % TYPE_COLORS.length] }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(data?.documentTypes || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
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
            <BarChart data={data?.processingTime || []}>
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
            {(data?.errorTypes || []).map((error, index) => (
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
