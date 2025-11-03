import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Download,
  Search,
  Eye,
  Clock,
  Calendar,
  User,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  XCircle
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { adminApi } from '../services/api'
import type { AdminDocument } from '../types/api'

interface Document {
  id: string
  fileName: string
  uploader: string
  uploadDate: string
  status: 'Procesando' | 'Completado' | 'Error' | 'Pendiente de revisión'
  fileSize: string
  documentType: string
  extractedData: {
    rfc: string
    periodo: string
    monto: string
  }
}

export const DocumentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Procesando' | 'Completado' | 'Error' | 'Pendiente de revisión'>('All')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Custom Dropdown Component
  const CustomDropdown: React.FC<{
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder: string
    isOpen: boolean
    onToggle: () => void
    className?: string
  }> = ({ value, onChange, options, placeholder, isOpen, onToggle, className = '' }) => {
    const selectedOption = options.find(option => option.value === value)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      if (!isOpen) return
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          onToggle()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }, [isOpen, onToggle])

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full px-4 py-3 bg-white border border-[#64c7cd]/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#64c7cd] focus:border-transparent transition-all duration-300 hover:bg-[#64c7cd]/5 flex items-center justify-between"
        >
          <span className="text-left">{selectedOption?.label || placeholder}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-[#64c7cd]/30 rounded-xl shadow-2xl overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  onToggle()
                }}
                className={`w-full px-4 py-3 text-left text-black hover:bg-[#64c7cd]/10 transition-colors duration-200 ${value === option.value ? 'bg-white/20' : ''
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleExportDocuments = () => {
    // Prepare data for Excel export
    const excelData = [
      ['Archivo', 'Subido por', 'Fecha', 'Estado', 'Tipo', 'RFC', 'Período', 'Monto'],
      ...documents.map(doc => [
        doc.fileName,
        doc.uploader,
        doc.uploadDate,
        doc.status,
        doc.documentType,
        doc.extractedData.rfc,
        doc.extractedData.periodo,
        doc.extractedData.monto
      ])
    ]

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos')

    // Generate Excel file and download
    XLSX.writeFile(wb, 'documentos.xlsx')
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowPdfModal(true)
  }

  const handleDownloadDocument = (document: Document) => {
    // TODO: Implement actual PDF download functionality
    console.log('Downloading PDF:', document.fileName)
    // Create a mock PDF download
    const link = window.document.createElement('a')
    link.href = '#' // Replace with actual PDF URL
    link.download = document.fileName
    link.click()
  }

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    fetchDocuments()
  }, [currentPage, searchTerm, filterStatus])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const status = filterStatus === 'All' ? undefined : filterStatus
      const search = searchTerm || undefined

      const response = await adminApi.getDocuments(currentPage, pageSize, search, status)

      // Convert AdminDocument to Document format
      const convertedDocuments: Document[] = response.items.map(adminDoc => ({
        id: adminDoc.id,
        fileName: adminDoc.fileName,
        uploader: adminDoc.uploader,
        uploadDate: adminDoc.uploadDate,
        status: adminDoc.status as 'Procesando' | 'Completado' | 'Error' | 'Pendiente de revisión',
        fileSize: adminDoc.fileSize,
        documentType: adminDoc.documentType,
        extractedData: {
          rfc: adminDoc.extractedData.rfc,
          periodo: adminDoc.extractedData.periodo,
          monto: adminDoc.extractedData.monto
        }
      }))

      setDocuments(convertedDocuments)
      setTotalDocuments(response.totalCount)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const statusOk = filterStatus === 'All' || doc.status === filterStatus
    const searchOk = !searchTerm ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploader.toLowerCase().includes(searchTerm.toLowerCase())
    return statusOk && searchOk
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'text-green-400 bg-green-400/20'
      case 'Procesando': return 'text-blue-400 bg-blue-400/20'
      case 'Error': return 'text-red-400 bg-red-400/20'
      case 'Pendiente de revisión': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completado': return <CheckCircle className="h-4 w-4" />
      case 'Procesando': return <Clock className="h-4 w-4" />
      case 'Error': return <AlertCircle className="h-4 w-4" />
      case 'Pendiente de revisión': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Factura': return 'text-purple-400 bg-purple-400/20'
      case 'Recibo': return 'text-blue-400 bg-blue-400/20'
      case 'Extracto': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  if (loading && documents.length === 0) {
    return (
      <div className="p-6 px-20 flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Cargando documentos...</div>
      </div>
    )
  }

  return (
    <div className="p-6 px-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Gestión de Documentos</h2>
          <p className="text-sm text-black">Administrar documentos procesados y pendientes ({totalDocuments} documentos)</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportDocuments}
            className="flex items-center px-4 py-2 text-sm font-medium text-black bg-[#64c7cd]/10 border border-[#64c7cd]/30 rounded-lg hover:bg-[#64c7cd]/20 hover:border-[#64c7cd]/40 transition-all duration-300 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar</span>
          </button>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-[#64c7cd]/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium mb-1">Total Documentos</p>
              <p className="text-2xl font-bold text-black">{documents.length}</p>
            </div>
            <div className="p-3 bg-[#64c7cd] rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-[#64c7cd]/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium mb-1">Procesados</p>
              <p className="text-2xl font-bold text-black">{documents.filter(d => d.status === 'Completado').length}</p>
            </div>
            <div className="p-3 bg-[#a5cc55] rounded-xl">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-[#64c7cd]/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-black">{documents.filter(d => d.status === 'Procesando').length}</p>
            </div>
            <div className="p-3 bg-[#eb3089] rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-[#64c7cd]/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium mb-1">Con Errores</p>
              <p className="text-2xl font-bold text-black">{documents.filter(d => d.status === 'Error').length}</p>
            </div>
            <div className="p-3 bg-[#eb3089] rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-[#64c7cd]/40 p-6 mb-6">
        <div className="flex flex-col md:flex-row sm:flex-row lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#64c7cd]/30 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#64c7cd] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <CustomDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'All' | 'Completado' | 'Error')}
              options={[
                { value: 'All', label: 'Todos los estados' },
                { value: 'Completado', label: 'Completados' },
                { value: 'Error', label: 'Con Errores' }
              ]}
              placeholder="Seleccionar estado"
              isOpen={showStatusDropdown}
              onToggle={() => {
                setShowStatusDropdown(!showStatusDropdown)
              }}
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-2xl hover:shadow-lg border border-[#64c7cd]/30 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64c7cd]/15 border-b border-[#64c7cd]/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Documento</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Subido por</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Datos Extraídos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-black mb-1">No hay documentos</p>
                      <p className="text-sm text-black/60">No se encontraron documentos con los filtros aplicados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#64c7cd] rounded-lg">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{doc.fileName}</p>
                        <p className="text-xs text-black/60">{doc.fileSize}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(doc.documentType)}`}>
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1">{doc.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#64c7cd] rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-black">{doc.uploader}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-black">{new Date(doc.uploadDate).toLocaleDateString('es-MX')}</p>
                    <p className="text-xs text-black/60">{new Date(doc.uploadDate).toLocaleTimeString('es-MX')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-black">{doc.extractedData.rfc}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-black">{doc.extractedData.periodo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 text-black hover:text-black" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                      >
                        <Download className="h-4 w-4 text-black hover:text-blue-600 group-hover:text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-black mb-1">No hay documentos</p>
                <p className="text-sm text-black/60">No se encontraron documentos con los filtros aplicados</p>
              </div>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-4 border-b border-[#64c7cd]/20 last:border-b-0 hover:bg-[#64c7cd]/5 transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#64c7cd] rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{doc.fileName}</p>
                    <p className="text-xs text-black/60">{doc.fileSize}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 text-black" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 text-black" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-black/60 mb-1">Tipo</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.documentType)}`}>
                    {doc.documentType}
                  </span>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Estado</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    <span className="ml-1">{doc.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Subido por</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#64c7cd] rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-black">{doc.uploader}</span>
                  </div>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Fecha</p>
                  <p className="text-black">{new Date(doc.uploadDate).toLocaleDateString('es-MX')}</p>
                  <p className="text-black/60">{new Date(doc.uploadDate).toLocaleTimeString('es-MX')}</p>
                </div>
                <div>
                  <p className="text-black/60 mb-1">RFC</p>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 text-[#64c7cd]" />
                    <span className="text-black">{doc.extractedData.rfc}</span>
                  </div>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Período / Monto</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-[#a5cc55]" />
                      <span className="text-black">{doc.extractedData.periodo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-[#eb3089]" />
                      <span className="text-black">{doc.extractedData.monto}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>



      {/* PDF View Modal */}
      {showPdfModal && selectedDocument && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPdfModal(false)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-6xl h-[90vh] p-4 sm:p-6 relative flex flex-col">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 z-10"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black hover:text-black" />
            </button>

            {/* Header */}
            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#64c7cd] rounded-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black">{selectedDocument.fileName}</h3>
                  <p className="text-xs sm:text-sm text-black">
                    {selectedDocument.documentType} • {selectedDocument.fileSize} • Subido por {selectedDocument.uploader}
                  </p>
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-white rounded-xl p-4 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-white rounded-lg">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-black mx-auto mb-4" />
                  <p className="text-black mb-2">Vista previa del PDF</p>
                  <p className="text-xs text-black mb-4">
                    {selectedDocument.fileName}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleDownloadDocument(selectedDocument)}
                      className="px-4 py-2 text-sm font-medium text-black bg-[#64c7cd]/10 rounded-xl hover:bg-[#64c7cd]/20 transition-all duration-300 hover:scale-105 shadow-md flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-black/60 mb-1">Estado</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedDocument.status === 'Completado' ? 'text-green-400 bg-green-400/20' :
                  selectedDocument.status === 'Procesando' ? 'text-blue-400 bg-blue-400/20' :
                    selectedDocument.status === 'Error' ? 'text-red-400 bg-red-400/20' :
                      'text-yellow-400 bg-yellow-400/20'
                  }`}>
                  {selectedDocument.status === 'Completado' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {selectedDocument.status === 'Procesando' && <Clock className="h-3 w-3 mr-1" />}
                  {selectedDocument.status === 'Error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {selectedDocument.status === 'Pendiente de revisión' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {selectedDocument.status}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-black mb-1">RFC</p>
                <p className="text-sm text-black">{selectedDocument.extractedData.rfc}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-black mb-1">Período</p>
                <p className="text-sm text-black">{selectedDocument.extractedData.periodo}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
