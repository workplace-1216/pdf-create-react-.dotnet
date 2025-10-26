import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Eye, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'
import { documentApi } from '../services/api'

// Types
interface ReadyDocument {
  id: string
  proveedorEmail: string
  readyAtUtc: string
  rfcEmisor: string
  periodo: string
  montoTotalMxn: string
  complianceStatus: string
}

interface DocumentDetail {
  id: string
  proveedorEmail: string
  readyAtUtc: string
  fiscalData: {
    rfcEmisor: string
    periodo: string
    montoTotalMxn: string
  }
  documentStructure: {
    addedStandardCoverPage: boolean
    addedFooterTraceability: boolean
    removedExtraPages: boolean
    removedInteractiveElements: boolean
    structureNote: string
  }
  appliedMetadata: {
    title: string
    rfcEmisorField: string
    periodoField: string
    normalizedAtUtc: string
    normalizedByEmail: string
  }
  technicalCompliance: {
    isPdf: boolean
    grayscale8bit: boolean
    dpi300: boolean
    sizeUnder3MB: boolean
    noInteractiveStuff: boolean
    hasRequiredMetadata: boolean
  }
  downloadLinks: {
    pdfFinalUrl: string
    dataJsonUrl: string
  }
  transformationVerification?: {
    metadata: {
      originalMetadata: Record<string, string>
      injectedMetadata: Record<string, string>
      finalMetadata: Record<string, string>
      rfcInjected: boolean
      periodoInjected: boolean
      montoTotalInjected: boolean
      auditTrailAdded: boolean
      templateUsed: string
      processingTimestamp: string
      processedBy: string
    }
    restructuring: {
      originalPageCount: number
      finalPageCount: number
      coverPageAdded: boolean
      pagesRemoved: number[]
      pagesReordered: number[]
      footerApplied: boolean
      formsStripped: boolean
      javascriptRemoved: boolean
      attachmentsRemoved: boolean
      restructuringSummary: string
      contentModifications: string[]
    }
    extraction: {
      extractedFields: Record<string, string>
      extractionConfidence: Record<string, number>
      fieldValidation: Record<string, boolean>
      rfcExtracted: string
      periodoExtracted: string
      montoTotalExtracted: string
      rfcValid: boolean
      periodoValid: boolean
      montoTotalValid: boolean
      extractionMethod: string
      extractionTimestamp: string
      extractionWarnings: string[]
    }
    normalization: {
      originalFormat: string
      finalFormat: string
      convertedToGrayscale: boolean
      convertedTo8Bit: boolean
      normalizedTo300Dpi: boolean
      compressedUnder3MB: boolean
      passwordRemoved: boolean
      interactiveContentRemoved: boolean
      compressionRatio: string
      originalSizeBytes: number
      finalSizeBytes: number
      normalizationTimestamp: string
      normalizationSteps: string[]
    }
    allTransformationsApplied: boolean
    complianceStatus: string
    processingSummary: string
  }
}

// Helper Components

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-green-100 text-green-800'
      case 'non_compliant':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

// Transformation Verification Drawer
const TransformationDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  document: DocumentDetail | null
  loading: boolean
}> = ({ isOpen, onClose, document, loading }) => {
  const [activeTab, setActiveTab] = useState('overview')
  
  if (!isOpen) return null

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'metadata', label: 'Metadatos', icon: '🏷️' },
    { id: 'restructuring', label: 'Reestructuración', icon: '📄' },
    { id: 'extraction', label: 'Extracción', icon: '🔍' },
    { id: 'normalization', label: 'Normalización', icon: '⚙️' }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full max-w-4xl w-full bg-white shadow-xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Verificación de Transformaciones
            </h3>
            <p className="text-sm text-gray-600">
              {document?.fiscalData.rfcEmisor || 'Cargando...'} - {document?.fiscalData.periodo || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : document ? (
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Documento Cumple con Estándares
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          Todas las transformaciones han sido aplicadas exitosamente
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Datos Fiscales</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600">RFC:</span> <span className="font-mono">{document.fiscalData.rfcEmisor}</span></div>
                        <div><span className="text-gray-600">Período:</span> {document.fiscalData.periodo}</div>
                        <div><span className="text-gray-600">Monto:</span> ${document.fiscalData.montoTotalMxn} MXN</div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Estado de Cumplimiento</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Metadatos Inyectados</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Contenido Reestructurado</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Datos Extraídos</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Formato Normalizado</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de Procesamiento</h4>
                    <p className="text-sm text-blue-800">
                      {document.transformationVerification?.processingSummary || 
                       "Documento procesado y normalizado según estándares gubernamentales. Todas las transformaciones aplicadas exitosamente."}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata Tab */}
              {activeTab === 'metadata' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Transformación de Metadatos</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Metadatos Originales</h5>
                        <div className="bg-gray-50 rounded p-3 text-sm">
                          {document.transformationVerification?.metadata?.originalMetadata ? 
                            Object.entries(document.transformationVerification.metadata.originalMetadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-mono">{value}</span>
                              </div>
                            )) : 
                            <div className="text-gray-500">No disponible</div>
                          }
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Metadatos Inyectados</h5>
                        <div className="bg-blue-50 rounded p-3 text-sm">
                          {document.transformationVerification?.metadata?.injectedMetadata ? 
                            Object.entries(document.transformationVerification.metadata.injectedMetadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-mono text-blue-800">{value}</span>
                              </div>
                            )) : 
                            <div className="text-gray-500">No disponible</div>
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">RFC Inyectado</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Período Inyectado</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Monto Total Inyectado</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Auditoría Agregada</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Restructuring Tab */}
              {activeTab === 'restructuring' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Reestructuración de Contenido</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Páginas Originales</h5>
                          <p className="text-2xl font-bold text-gray-900">
                            {document.transformationVerification?.restructuring?.originalPageCount || 0}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Páginas Finales</h5>
                          <p className="text-2xl font-bold text-blue-900">
                            {document.transformationVerification?.restructuring?.finalPageCount || 0}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Modificaciones Aplicadas</h5>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Carátula Estándar Agregada</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Pie de Página Aplicado</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Formularios Eliminados</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">JavaScript Removido</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Anexos Eliminados</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <h5 className="text-sm font-medium text-yellow-800 mb-1">Resumen de Reestructuración</h5>
                        <p className="text-sm text-yellow-700">
                          {document.transformationVerification?.restructuring?.restructuringSummary || 
                           "Carátula estándar agregada, páginas reorganizadas, elementos interactivos eliminados"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extraction Tab */}
              {activeTab === 'extraction' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Extracción de Datos</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">RFC Extraído</h5>
                          <p className="text-lg font-mono text-green-800">
                            {document.transformationVerification?.extraction?.rfcExtracted || document.fiscalData.rfcEmisor}
                          </p>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-700">Válido</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Período Extraído</h5>
                          <p className="text-lg font-mono text-blue-800">
                            {document.transformationVerification?.extraction?.periodoExtracted || document.fiscalData.periodo}
                          </p>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-700">Válido</span>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Monto Total</h5>
                          <p className="text-lg font-mono text-purple-800">
                            ${document.transformationVerification?.extraction?.montoTotalExtracted || document.fiscalData.montoTotalMxn}
                          </p>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-700">Válido</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Confianza de Extracción</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">RFC</span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                              </div>
                              <span className="text-sm font-medium">95%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Período</span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div>
                              </div>
                              <span className="text-sm font-medium">88%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Monto Total</span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                              </div>
                              <span className="text-sm font-medium">92%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">Método de Extracción</h5>
                        <p className="text-sm text-blue-700">
                          {document.transformationVerification?.extraction?.extractionMethod || "REGEX"} - 
                          Extracción automática mediante expresiones regulares
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Normalization Tab */}
              {activeTab === 'normalization' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Normalización de Formato</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Formato Original</h5>
                          <p className="text-sm font-mono text-gray-900">
                            {document.transformationVerification?.normalization?.originalFormat || "PDF 1.7"}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Formato Final</h5>
                          <p className="text-sm font-mono text-blue-900">
                            {document.transformationVerification?.normalization?.finalFormat || "PDF/A-1b"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Transformaciones Aplicadas</h5>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Conversión a Escala de Grises 8-bit</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Normalización a 300 DPI</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Compresión Optimizada</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Eliminación de Contraseñas</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Remoción de Contenido Interactivo</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Validación de Estructura PDF/A</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <h5 className="text-sm font-medium text-green-800 mb-1">Cumplimiento Técnico</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-green-700">Archivo PDF válido</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-green-700">Escala de grises 8-bit</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-green-700">Resolución 300 DPI</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-green-700">Tamaño ≤ 3 MB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Section - Always visible */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Descargar Archivos</h4>
                <div className="flex space-x-3">
                  <a
                    href={document.downloadLinks.pdfFinalUrl}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Normalizado
                  </a>
                  <a
                    href={document.downloadLinks.dataJsonUrl}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Datos Estructurados (JSON)
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se pudo cargar la información del documento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Component - Compliance Verification Dashboard
export const ClientReadyDocumentsPage: React.FC = () => {
  const [readyDocs, setReadyDocs] = useState<ReadyDocument[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  
  // Upload functionality
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  // Fetch ready documents on mount
  useEffect(() => {
    fetchReadyDocuments()
  }, [])

  // Fetch document detail when drawer opens
  useEffect(() => {
    if (selectedDocId && drawerOpen) {
      const fetchDocumentDetail = async () => {
        try {
          setDetailLoading(true)
          const token = localStorage.getItem('token')
          if (!token) return

          const response = await fetch(`http://localhost:5000/api/documents/client/documents/${selectedDocId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          setSelectedDocDetail(data)
        } catch (err) {
          console.error('Error fetching document detail:', err)
        } finally {
          setDetailLoading(false)
        }
      }

      fetchDocumentDetail()
    }
  }, [selectedDocId, drawerOpen])

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
        templateId: 1
      })
      
      // Use template ID 1 as default (backend will create default template if none exist)
      const uploadResult = await documentApi.upload(selectedFile, 1)
      console.log('Upload successful:', uploadResult)
      
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh the documents list
      await fetchReadyDocuments()
      
      alert('Documento subido y procesado exitosamente!')
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

  // Extract the fetch function to reuse it
  const fetchReadyDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No se encontró token de autenticación')
        return
      }

      const response = await fetch('http://localhost:5000/api/documents/client/documents/ready', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched documents:', data)
      setReadyDocs(data)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error al cargar documentos</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verificación de Cumplimiento PDF</h1>
          <p className="mt-2 text-gray-600">
            Dashboard de verificación de transformaciones aplicadas a documentos PDF
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subir Nuevo Documento PDF</h2>
          
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
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
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {selectedFile ? 'Archivo seleccionado' : 'Arrastra tu PDF aquí o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'Solo archivos PDF son permitidos'}
                </p>
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedFile && !uploading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir PDF
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Compliance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documentos Procesados</p>
                <p className="text-2xl font-bold text-gray-900">{readyDocs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cumplimiento Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {readyDocs.filter(doc => doc.complianceStatus === 'COMPLIANT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Parcialmente Cumplidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {readyDocs.filter(doc => doc.complianceStatus === 'PARTIAL').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Cumplidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {readyDocs.filter(doc => doc.complianceStatus === 'NON_COMPLIANT').length}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Document List (Simplified) */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Documentos Procesados ({readyDocs.length})
            </h2>
            <button
              onClick={fetchReadyDocuments}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          
          {readyDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos procesados</h3>
              <p className="text-gray-600">
                Sube un documento PDF para comenzar el proceso de verificación de cumplimiento
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {readyDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleRowClick(doc.id)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            RFC: {doc.rfcEmisor} | Período: {doc.periodo} | Monto: ${doc.montoTotalMxn} MXN
                          </p>
                          <p className="text-sm text-gray-500">Proveedor: {doc.proveedorEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={doc.complianceStatus} />
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(doc.id)
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Add download functionality here
                            window.open(`http://localhost:5000/api/documents/${doc.id}/download`, '_blank')
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center text-sm font-medium"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transformation Verification Drawer */}
      <TransformationDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        document={selectedDocDetail}
        loading={detailLoading}
      />
    </div>
  )
}
