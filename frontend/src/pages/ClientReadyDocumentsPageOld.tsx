import React, { useState, useEffect } from 'react'
import { Download, X, Calendar, Building2 } from 'lucide-react'

// Types
interface ReadyDocument {
  id: string
  proveedorEmail: string
  readyAtUtc: string
  rfc_emisor: string
  periodo: string
  monto_total_mxn: string
  complianceStatus: string
}

interface DocumentDetail {
  id: string
  proveedorEmail: string
  readyAtUtc: string
  fiscalData: {
    rfc_emisor: string
    periodo: string
    monto_total_mxn: string
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
}

// Helper Components
const BadgeStatus: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'ListoParaEnviar') {
    return (
      <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5">
        Listo para Enviar
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5">
      {status}
    </span>
  )
}

const ComplianceFlag: React.FC<{ value: boolean; label: string }> = ({ value, label }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-gray-800">{label}</span>
    <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
      {value ? 'Sí' : 'No'}
    </span>
  </div>
)

const Drawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  document: DocumentDetail | null
  loading: boolean
}> = ({ isOpen, onClose, document, loading }) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full max-w-xl w-full bg-white shadow-xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {document?.fiscalData.rfc_emisor || 'Cargando...'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : document ? (
            <div className="space-y-6">
              {/* 1. Datos extraídos */}
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Datos extraídos
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">RFC Emisor:</span>
                    <span className="text-sm text-gray-800 ml-2 font-mono">
                      {document.fiscalData.rfc_emisor}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Período:</span>
                    <span className="text-sm text-gray-800 ml-2">
                      {document.fiscalData.periodo}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="text-sm text-gray-800 ml-2 font-semibold">
                      ${document.fiscalData.monto_total_mxn} MXN
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Información capturada automáticamente del PDF después de la normalización.
                </p>
              </div>

              {/* 2. Estructura del documento */}
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Estructura del documento
                </h4>
                <div className="space-y-1">
                  <ComplianceFlag
                    value={document.documentStructure.addedStandardCoverPage}
                    label="Carátula estándar agregada"
                  />
                  <ComplianceFlag
                    value={document.documentStructure.addedFooterTraceability}
                    label="Pie de página con trazabilidad"
                  />
                  <ComplianceFlag
                    value={document.documentStructure.removedExtraPages}
                    label="Páginas extra eliminadas"
                  />
                  <ComplianceFlag
                    value={document.documentStructure.removedInteractiveElements}
                    label="Elementos interactivos removidos"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  {document.documentStructure.structureNote}
                </p>
              </div>

              {/* 3. Metadatos aplicados */}
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Metadatos aplicados
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Título:</span>
                    <span className="text-sm text-gray-800 ml-2">
                      {document.appliedMetadata.title}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">RFC en metadatos:</span>
                    <span className="text-sm text-gray-800 ml-2 font-mono">
                      {document.appliedMetadata.rfcEmisorField}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Período en metadatos:</span>
                    <span className="text-sm text-gray-800 ml-2">
                      {document.appliedMetadata.periodoField}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Normalizado el:</span>
                    <span className="text-sm text-gray-800 ml-2">
                      {formatDate(document.appliedMetadata.normalizedAtUtc)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Normalizado por:</span>
                    <span className="text-sm text-gray-800 ml-2">
                      {document.appliedMetadata.normalizedByEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Cumplimiento técnico de formato */}
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Cumplimiento técnico de formato
                </h4>
                <div className="space-y-1">
                  <ComplianceFlag
                    value={document.technicalCompliance.isPdf}
                    label="Archivo PDF válido"
                  />
                  <ComplianceFlag
                    value={document.technicalCompliance.grayscale8bit}
                    label="Escala de grises (8 bits)"
                  />
                  <ComplianceFlag
                    value={document.technicalCompliance.dpi300}
                    label="Resolución 300 DPI"
                  />
                  <ComplianceFlag
                    value={document.technicalCompliance.sizeUnder3MB}
                    label="Tamaño <= 3 MB"
                  />
                  <ComplianceFlag
                    value={document.technicalCompliance.noInteractiveStuff}
                    label="Sin formularios / JS / contraseña"
                  />
                  <ComplianceFlag
                    value={document.technicalCompliance.hasRequiredMetadata}
                    label="Metadatos requeridos presentes"
                  />
                </div>
              </div>

              {/* 5. Descargas */}
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Descargas
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(document.downloadLinks.pdfFinalUrl, '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF normalizado
                  </button>
                  <button
                    onClick={() => window.open(document.downloadLinks.dataJsonUrl, '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar datos (JSON/XML)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudo cargar la información del documento
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Component
export const ClientReadyDocumentsPage: React.FC = () => {
  const [readyDocs, setReadyDocs] = useState<ReadyDocument[]>([])
  const [filterRFC, setFilterRFC] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch ready documents on mount
  useEffect(() => {
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
        setReadyDocs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

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
          setSelectedDocDetail(null)
        } finally {
          setDetailLoading(false)
        }
      }

      fetchDocumentDetail()
    }
  }, [selectedDocId, drawerOpen])

  // Filter documents
  const filteredDocs = readyDocs.filter(doc => {
    const matchesRFC = !filterRFC || doc.rfc_emisor.toLowerCase().includes(filterRFC.toLowerCase())
    const matchesPeriodo = !filterPeriodo || doc.periodo.toLowerCase().includes(filterPeriodo.toLowerCase())
    return matchesRFC && matchesPeriodo
  })

  // Handle row click
  const handleViewDocument = (docId: string) => {
    setSelectedDocId(docId)
    setDrawerOpen(true)
  }

  // Close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedDocId(null)
    setSelectedDocDetail(null)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-xl shadow p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Documentos listos para enviar al gobierno
          </h1>
          <p className="text-gray-600">
            Estos archivos ya fueron convertidos automáticamente al formato requerido, con metadatos 
            estandarizados, reestructuración de contenido y validación técnica. Puede descargarlos y 
            subirlos directamente.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por RFC
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filterRFC}
                onChange={(e) => setFilterRFC(e.target.value)}
                placeholder="Ej: ABC123456789"
                className="pl-10 input-field"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Período
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                placeholder="Ej: 08/2025"
                className="pl-10 input-field"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error al cargar documentos</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No se encontraron documentos</div>
            <div className="text-sm text-gray-400">
              {readyDocs.length === 0 
                ? 'No hay documentos listos para enviar'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listo en
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFC Emisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total (MXN)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(doc.readyAtUtc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {doc.rfc_emisor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${doc.monto_total_mxn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.proveedorEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BadgeStatus status={doc.complianceStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDocument(doc.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Ver / Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Drawer */}
        <Drawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          document={selectedDocDetail}
          loading={detailLoading}
        />
      </div>
    </div>
  )
}