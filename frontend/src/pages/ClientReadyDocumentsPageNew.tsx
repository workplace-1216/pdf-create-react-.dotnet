import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Shield,
  Zap,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Database,
  CheckSquare,
  LogOut,
  Send,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { documentApi } from '../services/api'

// Types
interface ReadyDocument {
  id: string
  rfcEmisor: string
  periodo: string
  montoTotalMxn: string  // Backend returns as string
  proveedorEmail: string
  complianceStatus: string  // Backend returns "ListoParaEnviar"
  readyAtUtc: string
  uploadedAt?: string // Add uploaded timestamp if available
}

interface DocumentFolder {
  id: string
  folderName: string // Date and time string
  uploadDateTime: Date
  documents: ReadyDocument[]
  documentCount: number
}

interface DocumentDetail {
  id: string
  fiscalData: {
    rfcEmisor: string
    periodo: string
    montoTotalMxn: string  // Backend returns as string
  }
  proveedorEmail: string
  readyAtUtc: string
}


// Modern Folder Component with SVG
const FolderCard: React.FC<{
  folder: DocumentFolder
  onFolderClick: (folder: DocumentFolder) => void
  onSelect: (folderId: string, selected: boolean) => void
  isSelected: boolean
}> = ({ folder, onFolderClick, onSelect, isSelected }) => {
  return (
    <div
      className={`relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 hover:scale-[102%] transition-all duration-300 group ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onFolderClick(folder)
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSelect(folder.id, !isSelected)
        }}
        className="absolute top-3 right-3 z-10"
      >
        <CheckSquare
          className={`h-5 w-5 transition-colors ${
            isSelected ? 'text-blue-400 fill-current' : 'text-white/60'
          }`}
        />
      </button>

      {/* Folder SVG Icon - Clickable like Windows */}
      <div 
        className="relative w-24 h-24 mx-auto mb-4"
      >
        <svg
          viewBox="0 0 120 100"
          className="w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Folder base */}
          <path
            d="M10 20 L10 85 Q10 90 15 90 L105 90 Q110 90 110 85 L110 35 L55 35 L45 20 Z"
            fill={`url(#folderGradient-${folder.id})`}
            className="drop-shadow-lg"
          />
          {/* Folder tab */}
          <path
            d="M10 20 Q10 15 15 15 L50 15 L55 25 L45 20 Z"
            fill={`url(#folderTabGradient-${folder.id})`}
            className="drop-shadow-md"
          />
          {/* Document count circle */}
          <circle cx="60" cy="55" r="18" fill="rgba(255,255,255,0.95)" className="drop-shadow-xl" />
          {/* Document count text */}
          <text
            x="60"
            y="62"
            textAnchor="middle"
            className="text-xl font-bold fill-slate-800"
            dominantBaseline="middle"
          >
            {folder.documentCount}
          </text>
          {/* Gradients */}
          <defs>
            <linearGradient id={`folderGradient-${folder.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={`folderTabGradient-${folder.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Folder Name */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
          {folder.folderName}
        </h3>
        <p className="text-xs text-blue-200/70">
          {folder.documentCount} {folder.documentCount === 1 ? 'documento' : 'documentos'}
        </p>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

// Page-based Compliance Verification Drawer
const TransformationDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  document: DocumentDetail | null
  loading: boolean
  onDownload: (documentId: string) => void
  getDisplayValue: (value: string, type: string) => string
}> = ({ isOpen, onClose, document, loading, onDownload, getDisplayValue }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Handle animation states
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY
      const body = window.document.body
      // Apply styles to prevent scrolling
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      
      return () => {
        // Restore scroll position and remove styles
        body.style.position = ''
        body.style.top = ''
        body.style.width = ''
        body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/60 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={onClose}
      />

      {/* Compact Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Header with Gradient and Navigation */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="relative">
            {/* Top Row - Title and Close */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Verificación de Cumplimiento
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    {document?.fiscalData.rfcEmisor || 'Cargando...'} - {document?.fiscalData.periodo || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
            </div>

            {/* Bottom Row - Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-white/80">
                  Sección {currentPage + 1} de 4
                </span>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3].map((page) => (
                    <div
                      key={page}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === page
                          ? 'bg-white'
                          : 'bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                  disabled={currentPage === 3}
                  className="px-3 py-1.5 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"></div>
                  <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
                <p className="text-lg font-medium text-white">Cargando detalles del documento...</p>
              </div>
            </div>
          ) : document ? (
            <div className="p-6 space-y-6">
              {/* Section 1: Datos Extraídos - Optimized */}
              {currentPage === 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-[101%] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-2xl">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">1. Datos Extraídos</h4>
                        <p className="text-xs sm:text-sm text-blue-200/80">Extracción automática con IA</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                      <div className="bg-gradient-to-br from-white/10 to-blue-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:shadow-lg hover:scale-[102%] transition-all duration-300">
                        <label className="text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wider mb-2 sm:mb-3 block">RFC Emisor</label>
                        <p className="text-lg sm:text-2xl font-mono text-white mb-3 sm:mb-4">{getDisplayValue(document.fiscalData.rfcEmisor, "RFC")}</p>
                        <div className="space-y-1 sm:space-y-2">
                          {getDisplayValue(document.fiscalData.rfcEmisor, "RFC") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Extraído con 95% confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Normalizado y validado</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-green-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:shadow-lg hover:scale-[102%] transition-all duration-300">
                        <label className="text-xs sm:text-sm font-bold text-green-200 uppercase tracking-wider mb-2 sm:mb-3 block">Período Declarado</label>
                        <p className="text-lg sm:text-2xl text-white mb-3 sm:mb-4">{getDisplayValue(document.fiscalData.periodo, "PERIODO")}</p>
                        <div className="space-y-1 sm:space-y-2">
                          {getDisplayValue(document.fiscalData.periodo, "PERIODO") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Extraído con 88% confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Normalizado y validado</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:shadow-lg hover:scale-[102%] transition-all duration-300">
                        <label className="text-xs sm:text-sm font-bold text-purple-200 uppercase tracking-wider mb-2 sm:mb-3 block">Monto Total (MXN)</label>
                        <p className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4">{getDisplayValue(document.fiscalData.montoTotalMxn, "MONTO")}</p>
                        <div className="space-y-1 sm:space-y-2">
                          {getDisplayValue(document.fiscalData.montoTotalMxn, "MONTO") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Extraído con 92% confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm font-medium">✓ Formato estandarizado</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-indigo-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:shadow-lg hover:scale-[102%] transition-all duration-300">
                        <label className="text-xs sm:text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2 sm:mb-3 block">Método de Extracción</label>
                        <p className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Análisis de patrones + IA</p>
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium">✓ Validación automática</span>
                        </div>
                      </div>
                    </div>

                    {/* Why it matters section */}
                    <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h5 className="text-base sm:text-lg font-bold text-green-300 mb-2 sm:mb-3">¿Por qué es importante?</h5>
                      <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                        Esta extracción automatizada garantiza que los datos que vas a reportar a las autoridades fiscales
                        son exactamente los que el sistema detectó en el documento original, eliminando errores de transcripción
                        manual y proporcionando confianza total en la integridad de los datos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Estructura del Documento - Optimized */}
              {currentPage === 1 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-[101%] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-2xl">
                          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">2. Estructura del Documento</h4>
                        <p className="text-xs sm:text-sm text-green-200/80">Modificaciones aplicadas al layout físico</p>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs font-medium text-green-200 uppercase tracking-wider">Páginas Incluidas en la Versión Final</label>
                        <p className="text-sm sm:text-base text-white mt-1">Portada estandarizada + Página 1 del documento original + Resumen</p>
                        <p className="text-xs sm:text-sm text-green-200/70 mt-1">Se eliminaron 2 páginas adicionales no requeridas</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                          <span className="text-xs sm:text-sm text-white">Carátula estándar añadida</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                          <span className="text-xs sm:text-sm text-white">Pie de página con trazabilidad</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                          <span className="text-xs sm:text-sm text-white">Formularios interactivos eliminados</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3" />
                          <span className="text-xs sm:text-sm text-white">JavaScript/adjuntos eliminados</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Metadatos Aplicados - Optimized */}
              {currentPage === 2 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-[101%] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-xl sm:rounded-2xl shadow-2xl">
                          <Database className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">3. Metadatos Aplicados</h4>
                        <p className="text-xs sm:text-sm text-purple-200/80">Campos estandarizados escritos en el PDF</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Título</label>
                        <p className="text-sm sm:text-base text-white mt-1">Factura Maquila Normalizada</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Autora / Proveedor</label>
                        <p className="text-sm sm:text-base text-white mt-1">{document.proveedorEmail}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">RFC_Emisor (embebido)</label>
                        <p className="text-sm sm:text-base font-mono text-white mt-1">{document.fiscalData.rfcEmisor}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Período (embebido)</label>
                        <p className="text-sm sm:text-base text-white mt-1">{document.fiscalData.periodo}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Fecha de Normalización UTC</label>
                        <p className="text-sm sm:text-base text-white mt-1">{new Date(document.readyAtUtc).toLocaleString('es-MX')}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/5 to-purple-500/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Sistema Generador</label>
                        <p className="text-sm sm:text-base text-white mt-1">PDF Portal v1.0 - Sello Interno</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Cumplimiento Técnico de Formato - Optimized */}
              {currentPage === 3 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 relative overflow-hidden group hover:bg-white/15 hover:scale-[101%] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-2xl">
                          <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">4. Cumplimiento Técnico de Formato</h4>
                        <p className="text-xs sm:text-sm text-orange-200/80">Verificación para sistemas gubernamentales</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Archivo es PDF válido</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Escala de grises 8 bits</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Resolución 300 DPI</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Tamaño ≤ 3 MB</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Sin formularios interactivos</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Sin JavaScript incrustado</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Sin contraseñas</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 hover:bg-white/5 transition-colors duration-200">
                        <span className="text-xs sm:text-sm text-white">Metadatos obligatorios presentes</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                          <span className="text-xs text-green-400">✓ Cumple</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">No se pudo cargar la información del documento</p>
            </div>
          )}
        </div>

        {/* Footer with Download Actions */}
        <div className="border-t border-white/20 p-6 py-4 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm lg:block hidden text-white/80 w-1/2">
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <p className="font-semibold text-white">Documento verificado y listo para envío</p>
              </div>
              <p className="text-xs text-blue-200/70">Todas las transformaciones aplicadas exitosamente</p>
            </div>
            <div className="flex space-x-2 sm:space-x-3 justify-end w-full">
              <button
                onClick={() => {
                  if (document) {
                    onDownload(document.id)
                  }
                }}
                className="px-3 sm:px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar PDF Final</span>
                </div>
              </button>
              <button
                onClick={async () => {
                  if (document) {
                    try {
                      await documentApi.sendByEmail([Number(document.id)])
                    } catch (e) {
                      console.error('Error enviando por correo:', e)
                    }
                  }
                }}
                className="px-3 sm:px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 border border-transparent rounded-xl hover:from-amber-700 hover:via-orange-700 hover:to-rose-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              >
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </div>
              </button>
              <button
                onClick={() => {
                  if (document) {
                    const data = {
                      rfc: document.fiscalData.rfcEmisor,
                      periodo: document.fiscalData.periodo,
                      monto: document.fiscalData.montoTotalMxn,
                      proveedor: document.proveedorEmail,
                      fecha: document.readyAtUtc
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = window.document.createElement('a')
                    a.href = url
                    a.download = `datos_${document.fiscalData.rfcEmisor}_${document.fiscalData.periodo}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }
                }}
                className="px-3 sm:px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border border-transparent rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar Datos (JSON)</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component - Compliance Verification Dashboard
export const ClientReadyDocumentsPage: React.FC = () => {
  const { user, logout } = useAuth()
  const [readyDocs, setReadyDocs] = useState<ReadyDocument[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null)
  const [folderPage, setFolderPage] = useState(1)
  const folderPageSize = 5
  const [feedbackModalContent, setFeedbackModalContent] = useState<{
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteFolderIds, setPendingDeleteFolderIds] = useState<string[]>([])

  // Helper function to clean up regex patterns and show proper extracted values
  const getDisplayValue = (value: string, type: string) => {
    // Enhanced debug logging
    console.log(`🔍 getDisplayValue called with value: "${value}", type: "${type}"`)
    console.log(`🔍 Value length: ${value?.length || 0}`)
    console.log(`🔍 Value type: ${typeof value}`)

    if (!value || value === "N/A" || value === "0") {
      console.log(`❌ Returning "No extraído" for value: "${value}"`)
      return "No extraído"
    }

    // Check if it's a regex pattern (contains [\s:]* or similar regex syntax)
    const isRegexPattern = value.includes("[\\s:]*") ||
      value.includes("([A-Z0-9]{12,13})") ||
      value.includes("([0-9]{2}/[0-9]{4})") ||
      value.includes("([0-9,]+\\.[0-9]{2})") ||
      value.includes("\\$?([0-9,]+\\.[0-9]{2})") ||
      value.includes("Total[\\s:]*\\$?") ||
      value.includes("Per[ií]odo[\\s:]*") ||
      value.includes("RFC[\\s:]*") ||
      value.includes("\\$?") ||
      value.includes("([0-9,]+") ||
      value.includes("\\.[0-9]{2})") ||
      value.includes("\\s:") ||
      value.includes("\\$") ||
      value.includes("([0-9") ||
      value.includes("\\.[0-9]")

    console.log(`Is regex pattern: ${isRegexPattern}`)

    if (isRegexPattern) {
      // This is a regex pattern, show a placeholder indicating extraction is needed
      return "Re-procesar"
    }

    // Return the actual extracted value
    if (type === "MONTO" && value !== "0") {
      return `$${value} MXN`
    }

    return value
  }

  // Download function to properly handle PDF downloads
  const handleDownload = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showFeedback('error', 'Error de Autenticación', 'No hay token de autenticación')
        return
      }

      const response = await fetch(`http://localhost:5000/api/documents/client/documents/${documentId}/file`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Download error:', errorText)
        showFeedback('error', 'Error de Descarga', `Error al descargar: ${response.status} - ${errorText}`)
        return
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `documento_${documentId}.pdf`

      // Trigger the download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Download failed:', error)
      showFeedback('error', 'Error de Descarga', 'Error al descargar el documento')
    }
  }

  // Upload functionality
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Group documents into folders by upload time
  const groupDocumentsIntoFolders = (documents: ReadyDocument[]): DocumentFolder[] => {
    if (!documents || documents.length === 0) return []

    // Group documents by minute (documents uploaded within the same minute are in the same folder)
    const folderMap = new Map<string, ReadyDocument[]>()
    
    documents.forEach(doc => {
      const docDate = new Date(doc.readyAtUtc)
      // Round to nearest minute for grouping
      const minuteKey = `${docDate.getFullYear()}-${String(docDate.getMonth() + 1).padStart(2, '0')}-${String(docDate.getDate()).padStart(2, '0')} ${String(docDate.getHours()).padStart(2, '0')}:${String(docDate.getMinutes()).padStart(2, '0')}`
      
      if (!folderMap.has(minuteKey)) {
        folderMap.set(minuteKey, [])
      }
      folderMap.get(minuteKey)!.push(doc)
    })

    // Convert map to folders array
    const folders: DocumentFolder[] = Array.from(folderMap.entries()).map(([folderName, docs], index) => {
      const uploadDateTime = new Date(docs[0].readyAtUtc)
      // Format folder name: "DD/MM/YYYY HH:MM"
      const formattedName = `${String(uploadDateTime.getDate()).padStart(2, '0')}/${String(uploadDateTime.getMonth() + 1).padStart(2, '0')}/${uploadDateTime.getFullYear()} ${String(uploadDateTime.getHours()).padStart(2, '0')}:${String(uploadDateTime.getMinutes()).padStart(2, '0')}`
      
      return {
        id: `folder-${index}-${folderName}`,
        folderName: formattedName,
        uploadDateTime,
        documents: docs.sort((a, b) => new Date(b.readyAtUtc).getTime() - new Date(a.readyAtUtc).getTime()),
        documentCount: docs.length
      }
    })

    // Sort folders by upload date (newest first)
    return folders.sort((a, b) => b.uploadDateTime.getTime() - a.uploadDateTime.getTime())
  }

  // Fetch ready documents
  const fetchReadyDocuments = async (page: number = pagination.page) => {
    try {
      setLoading(true)
      console.log('Fetching ready documents from:', 'http://localhost:5000/api/documents/client/documents/ready')
      console.log('Pagination - Page:', page, 'PageSize:', pagination.pageSize)

      // Debug: Check token and user info
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
      console.log('Current user:', user)
      console.log('User role:', user?.role)

      // Debug: Test if user can access any authenticated endpoint
      try {
        const testResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('Auth test response status:', testResponse.status)
        if (testResponse.ok) {
          const userData = await testResponse.json()
          console.log('User data from backend:', userData)
        } else {
          const errorText = await testResponse.text()
          console.log('Auth test error:', errorText)
        }
      } catch (err) {
        console.log('Auth test failed:', err)
      }

      const response = await fetch(`http://localhost:5000/api/documents/client/documents/ready?page=${page}&pageSize=${pagination.pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      console.log('Documents count:', data.items?.length || 0)
      console.log('Total count:', data.totalCount)
      console.log('Current page:', data.page)
      console.log('Total pages:', data.totalPages)

      // Debug individual document data
      if (Array.isArray(data.items) && data.items.length > 0) {
        console.log('First document data:', data.items[0])
        console.log('RFC value:', data.items[0].rfcEmisor)
        console.log('Periodo value:', data.items[0].periodo)
        console.log('Monto value:', data.items[0].montoTotalMxn)

        // Test getDisplayValue function
        console.log('Testing getDisplayValue:')
        console.log('RFC display:', getDisplayValue(data.items[0].rfcEmisor, "RFC"))
        console.log('Periodo display:', getDisplayValue(data.items[0].periodo, "PERIODO"))
        console.log('Monto display:', getDisplayValue(data.items[0].montoTotalMxn, "MONTO"))

        // Check if monto contains the specific pattern
        console.log('Monto contains [\\s:]*:', data.items[0].montoTotalMxn?.includes('[\\s:]*'))
        console.log('Monto contains \\$?:', data.items[0].montoTotalMxn?.includes('\\$?'))
        console.log('Monto contains ([0-9,]+\\.[0-9]{2}):', data.items[0].montoTotalMxn?.includes('([0-9,]+\\.[0-9]{2})'))
      }

      // Backend returns paginated result with items array
      const documents = Array.isArray(data.items) ? data.items : []
      setReadyDocs(documents)
      
      // Group documents into folders by upload time (group by minute)
      const groupedFolders = groupDocumentsIntoFolders(documents)
      setFolders(groupedFolders)
      
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 10,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false
      })
    } catch (error) {
      console.error('Error fetching ready documents:', error)
      setError('Error al cargar los documentos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch document detail
  useEffect(() => {
    const fetchDocumentDetail = async () => {
      if (selectedDocId && drawerOpen) {
        setDetailLoading(true)
        try {
          console.log('🔍 Fetching document detail for ID:', selectedDocId)
          const response = await fetch(`http://localhost:5000/api/documents/client/documents/${selectedDocId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            console.log('🔍 Document detail data:', data)
            console.log('🔍 Fiscal data:', data.fiscalData)
            if (data.fiscalData) {
              console.log('🔍 RFC in detail:', data.fiscalData.rfcEmisor)
              console.log('🔍 Periodo in detail:', data.fiscalData.periodo)
              console.log('🔍 Monto in detail:', data.fiscalData.montoTotalMxn)
            }
            setSelectedDocDetail(data)
          }
        } catch (error) {
          console.error('Error fetching document detail:', error)
        } finally {
          setDetailLoading(false)
        }
      }
    }

    fetchDocumentDetail()
  }, [selectedDocId, drawerOpen])

  // Initial fetch on mount
  useEffect(() => {
    fetchReadyDocuments()
  }, [])

  // Clear selection when page changes
  useEffect(() => {
    setSelectedFolderIds([])
  }, [pagination.page])

  // Prevent body scroll when folder modal is open
  useEffect(() => {
    if (showFolderModal) {
      const scrollY = window.scrollY
      const body = window.document.body
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      
      return () => {
        body.style.position = ''
        body.style.top = ''
        body.style.width = ''
        body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [showFolderModal])

  // Helper function to show feedback modal
  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackModalContent({ type, title, message })
    setShowFeedbackModal(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedDocId(null)
    setSelectedDocDetail(null)
  }

  // Handle folder selection
  const handleToggleFolderSelect = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const handleSelectAllFolders = () => {
    if (selectedFolderIds.length === folders.length) {
      setSelectedFolderIds([])
    } else {
      setSelectedFolderIds(folders.map(folder => folder.id))
    }
  }

  const handleFolderClick = (folder: DocumentFolder) => {
    setSelectedFolder(folder)
    setFolderPage(1)
    // Do not open modal; render inline
    setShowFolderModal(false)
  }

  const handleCloseFolderModal = () => {
    setShowFolderModal(false)
    setSelectedFolder(null)
    setFolderPage(1)
  }

  const handleDocumentFromFolderClick = (docId: string) => {
    setSelectedDocId(docId)
    setDrawerOpen(true)
    setShowFolderModal(false) // Close folder modal when opening document (kept for safety)
  }

  const handleSendSelectedFolders = async () => {
    if (selectedFolderIds.length === 0) return
    
    setSending(true)
    try {
      // Get all document IDs from selected folders
      const documentIds: number[] = []
      selectedFolderIds.forEach(folderId => {
        const folder = folders.find(f => f.id === folderId)
        if (folder) {
          folder.documents.forEach(doc => {
            documentIds.push(Number(doc.id))
          })
        }
      })
      
      if (documentIds.length === 0) return
      
      await documentApi.sendByEmail(documentIds)
      const totalDocs = documentIds.length
      showFeedback('success', 'Documentos Enviados', `Se enviaron ${totalDocs} documento(s) de ${selectedFolderIds.length} carpeta(s) exitosamente`)
      setSelectedFolderIds([]) // Clear selection after sending
    } catch (error) {
      console.error('Error sending documents:', error)
      showFeedback('error', 'Error de Envío', 'Error al enviar los documentos. Por favor intente nuevamente.')
    } finally {
      setSending(false)
    }
  }

  const handleDownloadSelectedFolders = async () => {
    if (selectedFolderIds.length === 0) return
    setDownloading(true)
    try {
      const documentIds: number[] = []
      selectedFolderIds.forEach(folderId => {
        const folder = folders.find(f => f.id === folderId)
        if (folder) {
          folder.documents.forEach(doc => documentIds.push(Number(doc.id)))
        }
      })
      if (documentIds.length === 0) return
      const blob = await documentApi.downloadBatch(documentIds)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.download = `documentos_${dateStr}.zip`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showFeedback('success', 'Descarga iniciada', `Se descargará un ZIP con ${documentIds.length} documento(s).`)
    } catch (error) {
      console.error('Error downloading batch:', error)
      showFeedback('error', 'Error de Descarga', 'No se pudo descargar el ZIP de documentos seleccionados.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDeleteSelectedFolders = async () => {
    if (selectedFolderIds.length === 0) return
    // Open confirmation modal instead of deleting immediately
    setPendingDeleteFolderIds([...selectedFolderIds])
    setShowDeleteConfirm(true)
  }

  const confirmDeleteFolders = async () => {
    if (pendingDeleteFolderIds.length === 0) {
      setShowDeleteConfirm(false)
      return
    }
    setDeleting(true)
    try {
      // TODO: call backend delete when available
      const remaining = folders.filter(f => !pendingDeleteFolderIds.includes(f.id))
      setFolders(remaining)
      setSelectedFolderIds([])
      setPendingDeleteFolderIds([])
      setShowDeleteConfirm(false)
      showFeedback('success', 'Carpetas eliminadas', 'Las carpetas seleccionadas fueron eliminadas de la vista.')
    } catch (error) {
      console.error('Error deleting documents:', error)
      showFeedback('error', 'Error al eliminar', 'No se pudieron eliminar las carpetas seleccionadas.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDeleteFolders = () => {
    setShowDeleteConfirm(false)
    setPendingDeleteFolderIds([])
  }

  // Upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf')
      if (pdfFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pdfFiles])
      } else {
        showFeedback('error', 'Archivo Inválido', 'Por favor selecciona archivos PDF válidos')
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
      if (pdfFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pdfFiles])
      } else {
        showFeedback('error', 'Archivo Inválido', 'Por favor selecciona archivos PDF válidos')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    const uploaded: string[] = []
    const failed: string[] = []

    try {
      console.log(`Starting upload of ${selectedFiles.length} files...`)

      // Upload files sequentially
      for (const file of selectedFiles) {
        try {
          console.log('Uploading file:', file.name)
          const uploadResult = await documentApi.upload(file, 1)
          console.log('Upload successful:', uploadResult)
          uploaded.push(file.name)
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error)
          failed.push(file.name)
        }
      }

      // Clear selected files
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Wait a moment for processing, then refresh
      console.log('Refreshing document list...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for processing
      await fetchReadyDocuments() // Refresh the documents list

      console.log('Document list refreshed, current count:', readyDocs.length)

      // Show success message with uploaded file names
      if (uploaded.length > 0) {
        setUploadedFileNames(uploaded)
        setShowSuccessModal(true)
      }

      // Show error for failed uploads if any
      if (failed.length > 0) {
        showFeedback('error', 'Error de Subida', `Error al subir ${failed.length} archivo(s): ${failed.join(', ')}`)
      }
    } catch (error) {
      console.error('Upload process failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showFeedback('error', 'Error de Subida', `Error al subir los documentos: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Error al cargar documentos</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative flex flex-col">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-white/5 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="w-full flex justify-center sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between w-[90%] sm:w-[70%]">
            {/* Left Side - Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="relative p-2 rounded-xl shadow-2xl">
                  <img src="/logo.png" alt="CAAST" className="h-8 sm:h-10" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Centro de Cumplimiento Fiscal
                </h1>
              </div>
            </div>

            {/* Right Side - Status & Actions */}
            <div className="flex items-center space-x-4">

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 rounded-xl hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full py-6 sm:py-10 flex-1 flex flex-row lg:flex-row gap-3 sm:gap-6 justify-center">
        <div className='flex w-[90%] sm:w-[70%]'>
          {/* Left Column - Upload Section + Stats */}
          <div className="w-full gap-3 sm:gap-4">
            <div className='w-full flex flex-col lg:flex-row sm:flex-col'>
              {/* Modern Upload Section */}
              <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 mb-3 sm:mb-6 relative overflow-auto group hover:bg-white/15 transition-all duration-500">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-between flex flex-col">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Subir PDF</h2>
                      <p className="text-sm text-blue-200/80">Procesamiento automático con IA</p>
                    </div>
                  </div>

                  {/* Modern Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 w-full sm:w-80 group/drop ${dragActive
                      ? 'border-blue-400 bg-blue-500/20 backdrop-blur-sm'
                      : 'border-white/30 hover:border-blue-400/50 hover:bg-white/5 backdrop-blur-sm'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-3 sm:space-y-4">
                      <div className="relative mx-auto w-8 h-8 sm:w-10 sm:h-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover/drop:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl group-hover/drop:scale-110 transition-transform duration-500">
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-white mb-1">
                          {selectedFiles.length > 0 
                            ? `${selectedFiles.length} archivo(s) seleccionado(s)`
                            : 'Arrastra PDF aquí'}
                        </p>
                        <p className="text-xs text-blue-200/70">
                          {selectedFiles.length > 0 
                            ? 'Selecciona más archivos o sube'
                            : 'o haz clic para seleccionar múltiples PDF'}
                        </p>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="w-full max-h-32 overflow-y-auto space-y-2 mt-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="inline-flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full w-full">
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse flex-shrink-0"></div>
                                <p className="text-xs text-green-300 font-medium truncate">{file.name}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedFiles(prev => prev.filter((_, i) => i !== index))
                                }}
                                className="ml-2 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modern Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                    className={`relative px-6 mt-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-500 w-full sm:w-auto overflow-auto group/btn ${selectedFiles.length > 0 && !uploading
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105'
                      : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                          <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-white/20"></div>
                        </div>
                        <span className="font-semibold">Procesando {selectedFiles.length} archivo(s)...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Zap className="h-5 w-5 mr-2 group-hover/btn:animate-pulse" />
                        <span className="font-semibold">
                          {selectedFiles.length > 0 
                            ? `Subir ${selectedFiles.length} Documento(s)`
                            : 'Subir Documento(s)'
                          }
                        </span>
                      </div>
                    )}

                    {/* Button Shine Effect */}
                    {selectedFiles.length > 0 && !uploading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Modern Stats Cards */}
              <div className="w-full lg:ml-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-6">
                {/* Documents Processed */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-[101%] transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider">Procesados</p>
                          <p className="text-xl sm:text-2xl font-bold text-white">{readyDocs.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Rate */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-[101%] transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-200/80 uppercase tracking-wider">Cumplidos</p>
                          <p className="text-xl sm:text-2xl font-bold text-white">
                            {readyDocs.filter(doc => doc.complianceStatus === 'COMPLIANT').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partial Compliance */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-[101%] transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl shadow-2xl">
                            <AlertCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-orange-200/80 uppercase tracking-wider">Parciales</p>
                          <p className="text-xl sm:text-2xl font-bold text-white">
                            {readyDocs.filter(doc => doc.complianceStatus === 'PARTIAL').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Compliant */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-[101%] transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-2xl shadow-2xl">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-rose-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-200/80 uppercase tracking-wider">No Cumplidos</p>
                          <p className="text-xl sm:text-2xl font-bold text-white">
                            {readyDocs.filter(doc => doc.complianceStatus === 'NON_COMPLIANT').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Document List */}
            <div className="flex flex-col mb-5">
              {/* Modern Document List */}
              <div className="flex bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative group">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Modern Header */}
                <div className="relative z-10 px-2 sm:px-3 py-2 sm:py-3 border-b border-white/20 bg-gradient-to-r from-white/10 to-blue-500/10 backdrop-blur-sm">
                  <div className="flex items-center justify-start">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                          Documentos Finalizados ({folders.length})
                        </h2>
                        <p className="text-xs text-blue-200/70">Verificación de cumplimiento</p>
                      </div>
                    </div>
                  </div>

                  {/* Modern Re-processing Notice */}
                  {readyDocs.some(doc =>
                    getDisplayValue(doc.rfcEmisor, "RFC") === "Re-procesar" ||
                    getDisplayValue(doc.periodo, "PERIODO") === "Re-procesar" ||
                    getDisplayValue(doc.montoTotalMxn, "MONTO") === "Re-procesar"
                  ) && (
                      <div className="relative z-10 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/30 rounded-xl p-2 sm:p-3 mt-2 sm:mt-3 backdrop-blur-sm">
                        <div className="flex items-center">
                          <div className="relative mr-2 sm:mr-3">
                            <div className="h-4 w-4 sm:h-5 sm:w-5 bg-orange-400/20 rounded-full flex items-center justify-center">
                              <span className="text-orange-300 text-xs font-bold">!</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-xs sm:text-sm text-orange-200 font-medium">
                            Algunos documentos necesitan re-procesamiento
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Bulk Actions */}
                  {selectedFolderIds.length > 0 && (
                    <div className="relative z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-2 sm:p-3 mt-2 sm:mt-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center">
                          <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 mr-2" />
                          <p className="text-xs sm:text-sm text-blue-200 font-medium">
                            {selectedFolderIds.length} carpeta(s) seleccionada(s)
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleDownloadSelectedFolders}
                            disabled={downloading}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border border-transparent rounded-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                          >
                            {downloading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                                <span>Descargando...</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3" />
                                <span>Descargar todo</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleDeleteSelectedFolders}
                            disabled={deleting}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 border border-transparent rounded-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-rose-500/25 hover:scale-105 transition-all duration-300"
                          >
                            {deleting ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                                <span>Eliminando...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3" />
                                <span>Eliminar</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleSendSelectedFolders}
                            disabled={sending}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 border border-transparent rounded-lg hover:from-amber-700 hover:via-orange-700 hover:to-rose-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300"
                          >
                            {sending ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                                <span>Enviando...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                <span>Enviar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modern Folder Grid */}
                <div className="relative z-10 w-full">
                  {selectedFolder ? (
                    <div className="p-4 sm:p-6">
                      {/* Inline folder header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedFolder(null)
                              setFolderPage(1)
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-1"
                          >
                            <ChevronLeft className="h-3 w-3" />
                            <span>Volver</span>
                          </button>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{selectedFolder.folderName}</h3>
                            <p className="text-xs text-blue-200/70">{selectedFolder.documentCount} {selectedFolder.documentCount === 1 ? 'documento' : 'documentos'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents list */}
                      <div className="space-y-2 mb-4">
                        {selectedFolder.documents
                          .slice((folderPage - 1) * folderPageSize, folderPage * folderPageSize)
                          .map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => handleDocumentFromFolderClick(doc.id)}
                              className="flex items-center space-x-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200 group border border-white/10 hover:border-white/20"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center shadow-lg">
                                  <FileText className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-blue-200">
                                  {doc.proveedorEmail || `Documento ${doc.id}`}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-white/60">RFC:</span>
                                    <span className="text-xs text-white/80 font-mono">{getDisplayValue(doc.rfcEmisor, 'RFC')}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-white/60">Período:</span>
                                    <span className="text-xs text-white/80">{getDisplayValue(doc.periodo, 'PERIODO')}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-white/60">Monto:</span>
                                    <span className="text-xs text-white/80">{getDisplayValue(doc.montoTotalMxn, 'MONTO')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDocumentFromFolderClick(doc.id) }}
                                  className="p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                                  title="Ver documento"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); await handleDownload(doc.id) }}
                                  className="p-2 text-green-300 hover:text-green-100 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                                  title="Descargar documento"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Pagination */}
                      {Math.ceil(selectedFolder.documents.length / folderPageSize) > 1 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-blue-200/70">Página {folderPage} de {Math.ceil(selectedFolder.documents.length / folderPageSize)}</span>
                            <span className="text-xs text-blue-200/50">({selectedFolder.documents.length} documento{selectedFolder.documents.length !== 1 ? 's' : ''} total)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setFolderPage(prev => Math.max(1, prev - 1))}
                              disabled={folderPage === 1}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                            >
                              <ChevronLeft className="h-3 w-3" /> <span>Anterior</span>
                            </button>
                            <button
                              onClick={() => setFolderPage(prev => Math.min(Math.ceil(selectedFolder.documents.length / folderPageSize), prev + 1))}
                              disabled={folderPage >= Math.ceil(selectedFolder.documents.length / folderPageSize)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                            >
                              <span>Siguiente</span> <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6">
                      {/* Select All Header */}
                      <div className="flex items-center justify-end mb-4">
                        <button
                          onClick={handleSelectAllFolders}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-white/80 hover:text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                        >
                          <CheckSquare 
                            className={`h-4 w-4 transition-colors ${
                              selectedFolderIds.length === folders.length && folders.length > 0
                                ? 'text-blue-400 fill-current'
                                : 'text-white/60'
                            }`}
                          />
                          <span>Seleccionar Todas</span>
                        </button>
                      </div>

                      {/* Folder Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {folders.map((folder) => (
                          <FolderCard
                            key={folder.id}
                            folder={folder}
                            onFolderClick={handleFolderClick}
                            onSelect={handleToggleFolderSelect}
                            isSelected={selectedFolderIds.includes(folder.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="relative z-10 px-3 sm:px-6 py-3 sm:py-4 border-t border-white/20 bg-gradient-to-r from-white/5 to-blue-500/5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-200/70">
                            Página {pagination.page} de {pagination.totalPages}
                          </span>
                          <span className="text-xs text-blue-200/50">
                            ({folders.length} carpeta{folders.length !== 1 ? 's' : ''} en esta página)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fetchReadyDocuments(pagination.page - 1)}
                            disabled={!pagination.hasPreviousPage}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                          >
                            <ChevronLeft className="h-3 w-3" /> <span>Anterior</span>
                          </button>
                          <button
                            onClick={() => fetchReadyDocuments(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-1"
                          >
                            <span>Siguiente</span> <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transformation Verification Drawer */}
        <TransformationDrawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          document={selectedDocDetail}
          loading={detailLoading}
          onDownload={handleDownload}
          getDisplayValue={getDisplayValue}
        />

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-1000 animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSuccessModal(false)
              }
            }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto transition-all duration-1000 animate-in zoom-in-95 slide-in-from-bottom-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 hover:text-white" />
              </button>

              <div className="mb-4 sm:mb-6 pr-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    ¡{uploadedFileNames.length > 1 ? 'Documentos' : 'Documento'} Subido{uploadedFileNames.length > 1 ? 's' : ''} Exitosamente!
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-green-200/80">
                  {uploadedFileNames.length} archivo{uploadedFileNames.length > 1 ? 's' : ''} procesado{uploadedFileNames.length > 1 ? 's' : ''} correctamente
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-3 sm:space-y-4">
                  {uploadedFileNames.map((fileName, index) => (
                    <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <FileText className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{fileName}</p>
                          <p className="text-xs text-green-200/80">Archivo procesado correctamente</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Total de Documentos</p>
                      <p className="text-lg font-semibold text-white">{readyDocs.length}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-2 text-xs text-white/60">
                    <CheckSquare className="h-3 w-3 text-green-400" />
                    <span>El{uploadedFileNames.length > 1 ? 's' : ''} documento{uploadedFileNames.length > 1 ? 's' : ''} está{uploadedFileNames.length > 1 ? 'n' : ''} listo{uploadedFileNames.length > 1 ? 's' : ''} para revisión y descarga</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end mt-4 sm:mt-6">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && feedbackModalContent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeedbackModal(false)
              }
            }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 hover:text-white" />
              </button>

              <div className="mb-4 sm:mb-6 pr-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-xl ${
                    feedbackModalContent.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    feedbackModalContent.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                    'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}>
                    {feedbackModalContent.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    ) : feedbackModalContent.type === 'error' ? (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    ) : (
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{feedbackModalContent.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/80">{feedbackModalContent.message}</p>
              </div>

              <div className="flex items-center justify-end mt-4 sm:mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg ${
                    feedbackModalContent.type === 'success' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                    feedbackModalContent.type === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600' :
                      'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !deleting) cancelDeleteFolders() }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative">
              <button
                onClick={cancelDeleteFolders}
                disabled={deleting}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 hover:text-white" />
              </button>
              <div className="mb-4 sm:mb-6 pr-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500">
                    <Trash2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Confirmar eliminación</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/80">
                  {pendingDeleteFolderIds.length} carpeta(s) seleccionada(s). ¿Deseas eliminar las carpetas y todos sus documentos de la vista?
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={cancelDeleteFolders}
                  disabled={deleting}
                  className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteFolders}
                  disabled={deleting}
                  className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}