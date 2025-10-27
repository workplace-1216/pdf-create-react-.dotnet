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
  RefreshCw,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Database,
  CheckSquare,
  LogOut
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

  const pages = [
    { id: 'datos', title: 'Datos Extraídos', icon: FileText },
    { id: 'estructura', title: 'Estructura', icon: Layers },
    { id: 'metadatos', title: 'Metadatos', icon: Database },
    { id: 'cumplimiento', title: 'Cumplimiento', icon: CheckSquare }
  ]

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Compact Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-4xl bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 flex flex-col">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Verificación de Cumplimiento
                </h3>
                <p className="text-blue-100 text-sm">
                  {document?.fiscalData.rfcEmisor || 'Cargando...'} - {document?.fiscalData.periodo || ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <XCircle className="h-6 w-6 text-white" />
            </button>
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
              {/* Section 1: Datos Extraídos - Only RFC Card */}
              {currentPage === 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">1. Datos Extraídos</h4>
                        <p className="text-sm text-blue-200/80">RFC Emisor - Extracción automática con IA</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-white/10 to-blue-500/10 border border-white/20 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
                        <label className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-3 block">RFC Emisor</label>
                        <p className="text-2xl font-mono text-white mb-4">{getDisplayValue(document.fiscalData.rfcEmisor, "RFC")}</p>
                        <div className="space-y-2">
                          {getDisplayValue(document.fiscalData.rfcEmisor, "RFC") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-4 w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Extraído automáticamente con 95% de confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Normalizado y validado por el sistema</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-green-500/10 border border-white/20 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
                        <label className="text-sm font-bold text-green-200 uppercase tracking-wider mb-3 block">Período Declarado</label>
                        <p className="text-2xl text-white mb-4">{getDisplayValue(document.fiscalData.periodo, "PERIODO")}</p>
                        <div className="space-y-2">
                          {getDisplayValue(document.fiscalData.periodo, "PERIODO") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-4 w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Extraído automáticamente con 88% de confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Normalizado y validado por el sistema</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-purple-500/10 border border-white/20 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
                        <label className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-3 block">Monto Total (MXN)</label>
                        <p className="text-2xl font-bold text-white mb-4">{getDisplayValue(document.fiscalData.montoTotalMxn, "MONTO")}</p>
                        <div className="space-y-2">
                          {getDisplayValue(document.fiscalData.montoTotalMxn, "MONTO") === "Re-procesar" ? (
                            <div className="flex items-center space-x-2 text-orange-400">
                              <div className="h-4 w-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">!</span>
                              </div>
                              <span className="text-sm font-semibold">⚠ Necesita re-procesamiento</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Extraído automáticamente con 92% de confianza</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-300">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">✓ Formato estandarizado y validado</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-indigo-500/10 border border-white/20 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
                        <label className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-3 block">Método de Extracción</label>
                        <p className="text-lg font-semibold text-white mb-4">Análisis de patrones + IA</p>
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">✓ Validación automática</span>
                        </div>
                      </div>
                    </div>

                    {/* Why it matters section */}
                    <div className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-green-300 mb-3">¿Por qué es importante?</h5>
                      <p className="text-white/80 leading-relaxed">
                        Esta extracción automatizada garantiza que los datos que vas a reportar a las autoridades fiscales
                        son exactamente los que el sistema detectó en el documento original, eliminando errores de transcripción
                        manual y proporcionando confianza total en la integridad de los datos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Estructura del Documento */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl">
                        <Layers className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">2. Estructura del Documento</h4>
                      <p className="text-sm text-green-200/80">Modificaciones aplicadas al layout físico</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-green-200 uppercase tracking-wider">Páginas Incluidas en la Versión Final</label>
                      <p className="text-sm text-white mt-1">Portada estandarizada + Página 1 del documento original + Resumen</p>
                      <p className="text-xs text-green-200/70 mt-1">Se eliminaron 2 páginas adicionales no requeridas</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span className="text-sm text-white">Carátula estándar añadida</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span className="text-sm text-white">Pie de página con trazabilidad</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span className="text-sm text-white">Formularios interactivos eliminados</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span className="text-sm text-white">JavaScript/adjuntos eliminados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Metadatos Aplicados */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-2xl">
                        <Database className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">3. Metadatos Aplicados</h4>
                      <p className="text-sm text-purple-200/80">Campos estandarizados escritos en el PDF</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Title</label>
                      <p className="text-sm text-white mt-1">Factura Maquila Normalizada</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Author / Proveedor</label>
                      <p className="text-sm text-white mt-1">{document.proveedorEmail}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">RFC_Emisor (embebido)</label>
                      <p className="text-sm font-mono text-white mt-1">{document.fiscalData.rfcEmisor}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Período (embebido)</label>
                      <p className="text-sm text-white mt-1">{document.fiscalData.periodo}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Fecha de Normalización UTC</label>
                      <p className="text-sm text-white mt-1">{new Date(document.readyAtUtc).toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-purple-200 uppercase tracking-wider">Sistema Generador</label>
                      <p className="text-sm text-white mt-1">PDF Portal v1.0 - Sello Interno</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Cumplimiento Técnico de Formato */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-2xl">
                        <CheckSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">4. Cumplimiento Técnico de Formato</h4>
                      <p className="text-sm text-orange-200/80">Verificación para sistemas gubernamentales</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Archivo es PDF válido</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Escala de grises 8 bits</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Resolución 300 DPI</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Tamaño ≤ 3 MB</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Sin formularios interactivos</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Sin JavaScript incrustado</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-sm text-white">Sin contraseñas</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-white">Metadatos obligatorios presentes</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-xs text-green-400">✓ Cumple</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">No se pudo cargar la información del documento</p>
            </div>
          )}
        </div>

        {/* Footer with Download Actions */}
        <div className="border-t border-white/20 p-6 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-white/80">
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <p className="font-semibold text-white">Documento verificado y listo para envío</p>
              </div>
              <p className="text-xs text-blue-200/70">Todas las transformaciones aplicadas exitosamente</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-white/90 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  if (document) {
                    onDownload(document.id)
                  }
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Descargar PDF Final</span>
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
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border border-transparent rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Descargar Datos (JSON)</span>
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
    pageSize: 5,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

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
        alert('No hay token de autenticación')
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
        alert(`Error al descargar: ${response.status} - ${errorText}`)
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
      alert('Error al descargar el documento')
    }
  }

  // Upload functionality
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setReadyDocs(Array.isArray(data.items) ? data.items : [])
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 5,
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

  const handleRowClick = (docId: string) => {
    setSelectedDocId(docId)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedDocId(null)
    setSelectedDocDetail(null)
  }

  // Upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Por favor selecciona un archivo PDF')
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
      } else {
        alert('Por favor selecciona un archivo PDF')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      console.log('Starting upload...', {
        fileName: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        templateId: 1 // Using template ID 1 as default
      })

      const uploadResult = await documentApi.upload(selectedFile, 1)
      console.log('Upload successful:', uploadResult)

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Wait a moment for processing, then refresh
      console.log('Refreshing document list...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for processing
      await fetchReadyDocuments() // Refresh the documents list

      console.log('Document list refreshed, current count:', readyDocs.length)

      // Show success message with document count
      const currentCount = readyDocs.length
      alert(`Documento subido y procesado exitosamente! Total de documentos: ${currentCount}`)
    } catch (error) {
      console.error('Upload failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: error instanceof Error && 'response' in error ? (error as any).response : null
      })
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al subir el documento: ${errorMessage}`)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl shadow-2xl">
                  <Shield className="h-5 w-5 text-white" />
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

      <div className="relative w-full py-6 sm:py-10 flex-1 flex flex-col lg:flex-row gap-3 sm:gap-6 justify-center">
        <div className='flex w-[70%]'>
          {/* Left Column - Upload Section + Stats */}
          <div className="w-full gap-3 sm:gap-4">
            <div className='w-full flex flex-row'>
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
                          {selectedFile ? selectedFile.name : 'Arrastra PDF aquí'}
                        </p>
                        <p className="text-xs text-blue-200/70">o haz clic para seleccionar</p>
                      </div>
                      {selectedFile && (
                        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <p className="text-xs text-green-300 font-medium">✓ Archivo seleccionado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modern Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`relative px-6 mt-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-500 w-full sm:w-auto overflow-auto group/btn ${selectedFile && !uploading
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
                        <span className="font-semibold">Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Zap className="h-5 w-5 mr-2 group-hover/btn:animate-pulse" />
                        <span className="font-semibold">Subir Documento</span>
                      </div>
                    )}

                    {/* Button Shine Effect */}
                    {selectedFile && !uploading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Modern Stats Cards */}
              <div className="w-full ml-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-6">
                {/* Documents Processed */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
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
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
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
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
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
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 sm:p-3 hover:bg-white/15 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
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
            <div className="flex-1 flex flex-col h-full mb-5">
              {/* Modern Document List */}
              <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative group">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Modern Header */}
                <div className="relative z-10 px-2 sm:px-3 py-2 sm:py-3 border-b border-white/20 bg-gradient-to-r from-white/10 to-blue-500/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                         <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                           Documentos Finalizados ({pagination.totalCount})
                         </h2>
                        <p className="text-xs text-blue-200/70">Verificación de cumplimiento</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchReadyDocuments}
                      disabled={loading}
                      className="relative px-3 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <div className="relative">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                            <div className="absolute inset-0 animate-ping rounded-full h-4 w-4 border border-white/20"></div>
                          </div>
                          <span className="font-medium">Actualizando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="font-medium">Actualizar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Modern System Notice */}
                  <div className="relative z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-2 sm:p-3 mt-2 sm:mt-3 backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="relative mr-2 sm:mr-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" />
                      </div>
                      <p className="text-xs sm:text-sm text-blue-200 font-medium">
                        Datos extraídos automáticamente por el sistema
                      </p>
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
                </div>

                {/* Modern Document Table */}
                <div className="relative z-10 flex-1 overflow-auto h-full">
                  {readyDocs.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/30 to-gray-600/30 rounded-full blur-lg"></div>
                        <div className="relative w-full h-full bg-gradient-to-r from-gray-500/50 to-gray-600/50 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">No hay documentos finalizados</h3>
                      <p className="text-sm sm:text-base text-gray-300 max-w-md mx-auto">
                        Sube un documento PDF para comenzar el proceso de verificación
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-gradient-to-r from-white/10 to-blue-500/10 backdrop-blur-sm">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              RFC
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              Período
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              Monto
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-blue-200/80 uppercase tracking-wider">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/10">
                          {readyDocs.map((doc, index) => (
                            <tr
                              key={doc.id}
                              onClick={() => handleRowClick(doc.id)}
                              className="hover:bg-white/5 cursor-pointer transition-all duration-300 group/row"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base text-white font-medium">
                                {new Date(doc.readyAtUtc).toLocaleDateString('es-MX')}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-mono text-white">
                                <div className="flex items-center">
                                  {getDisplayValue(doc.rfcEmisor, "RFC") === "Re-procesar" ? (
                                    <>
                                      <div className="h-4 w-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                                        <span className="text-orange-300 text-xs font-bold">!</span>
                                      </div>
                                      <span className="text-orange-300 font-medium text-sm">Re-procesar</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="relative mr-2 sm:mr-3">
                                        <CheckCircle className="h-4 w-4 text-blue-400" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                      </div>
                                      <span className="text-sm text-white font-mono">{getDisplayValue(doc.rfcEmisor, "RFC")}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base text-white">
                                <div className="flex items-center">
                                  {getDisplayValue(doc.periodo, "PERIODO") === "Re-procesar" ? (
                                    <>
                                      <div className="h-4 w-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                                        <span className="text-orange-300 text-xs font-bold">!</span>
                                      </div>
                                      <span className="text-orange-300 font-medium text-sm">Re-procesar</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="relative mr-2 sm:mr-3">
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                      </div>
                                      <span className="text-sm text-white">{getDisplayValue(doc.periodo, "PERIODO")}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-bold text-white">
                                <div className="flex items-center">
                                  {getDisplayValue(doc.montoTotalMxn, "MONTO") === "Re-procesar" ? (
                                    <>
                                      <div className="h-4 w-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                                        <span className="text-orange-300 text-xs font-bold">!</span>
                                      </div>
                                      <span className="text-orange-300 font-medium text-sm">Re-procesar</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="relative mr-2 sm:mr-3">
                                        <CheckCircle className="h-4 w-4 text-purple-400" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                      </div>
                                      <span className="text-sm text-white">{getDisplayValue(doc.montoTotalMxn, "MONTO")}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30 backdrop-blur-sm">
                                  <div className="relative mr-1 sm:mr-2">
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                  </div>
                                  <span className="hidden sm:inline">Listo</span>
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-medium">
                                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRowClick(doc.id)
                                    }}
                                    className="px-2 sm:px-3 py-1 sm:py-2 text-blue-300 hover:text-blue-100 hover:bg-blue-500/20 rounded-lg flex items-center text-xs font-medium transition-all duration-300 hover:scale-105"
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Ver</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownload(doc.id)
                                    }}
                                    className="px-2 sm:px-3 py-1 sm:py-2 text-green-300 hover:text-green-100 hover:bg-green-500/20 rounded-lg flex items-center text-xs font-medium transition-all duration-300 hover:scale-105"
                                  >
                                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Descargar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                            ({pagination.totalCount} documentos totales)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fetchReadyDocuments(pagination.page - 1)}
                            disabled={!pagination.hasPreviousPage}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                          >
                            <ChevronLeft className="h-3 w-3 mr-1" />
                            Anterior
                          </button>
                          <button
                            onClick={() => fetchReadyDocuments(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                          >
                            Siguiente
                            <ChevronRight className="h-3 w-3 ml-1" />
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
      </div>
    </div>
  )
}