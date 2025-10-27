import React, { useState } from 'react'
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
  const [filterType, setFilterType] = useState<'All' | 'Factura' | 'Recibo' | 'Extracto'>('All')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
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
    
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/15 flex items-center justify-between"
        >
          <span className="text-left">{selectedOption?.label || placeholder}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  onToggle()
                }}
                className={`w-full px-4 py-3 text-left text-white hover:bg-white/15 transition-colors duration-200 ${
                  value === option.value ? 'bg-white/20' : ''
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

  const [documents] = useState<Document[]>([
    {
      id: '1',
      fileName: 'factura_enero_2024.pdf',
      uploader: 'María González',
      uploadDate: '2024-01-15 14:30',
      status: 'Completado',
      fileSize: '2.3 MB',
      documentType: 'Factura',
      extractedData: {
        rfc: 'ABC123456789',
        periodo: '01/2024',
        monto: '$15,450.00'
      }
    },
    {
      id: '2',
      fileName: 'recibo_febrero_2024.pdf',
      uploader: 'Carlos Rodríguez',
      uploadDate: '2024-01-15 12:15',
      status: 'Procesando',
      fileSize: '1.8 MB',
      documentType: 'Recibo',
      extractedData: {
        rfc: 'DEF987654321',
        periodo: '02/2024',
        monto: '$8,750.00'
      }
    },
    {
      id: '3',
      fileName: 'estado_cuenta_marzo.pdf',
      uploader: 'Ana Martínez',
      uploadDate: '2024-01-14 16:45',
      status: 'Error',
      fileSize: '3.1 MB',
      documentType: 'Extracto',
      extractedData: {
        rfc: 'N/A',
        periodo: 'N/A',
        monto: 'N/A'
      }
    },
    {
      id: '4',
      fileName: 'factura_abril_2024.pdf',
      uploader: 'Luis Hernández',
      uploadDate: '2024-01-10 09:20',
      status: 'Pendiente de revisión',
      fileSize: '2.7 MB',
      documentType: 'Factura',
      extractedData: {
        rfc: 'GHI456789123',
        periodo: '04/2024',
        monto: '$22,100.00'
      }
    },
    {
      id: '5',
      fileName: 'recibo_mayo_2024.pdf',
      uploader: 'Patricia López',
      uploadDate: '2024-01-08 11:30',
      status: 'Completado',
      fileSize: '1.5 MB',
      documentType: 'Recibo',
      extractedData: {
        rfc: 'JKL789123456',
        periodo: '05/2024',
        monto: '$12,300.00'
      }
    }
  ])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploader.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || doc.status === filterStatus
    const matchesType = filterType === 'All' || doc.documentType === filterType
    
    return matchesSearch && matchesStatus && matchesType
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

  return (
    <div className="p-6 px-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Documentos</h2>
          <p className="text-sm text-blue-200/80">Administrar documentos procesados y pendientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportDocuments}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200/70 font-medium mb-1">Total Documentos</p>
              <p className="text-2xl font-bold text-white">{documents.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200/70 font-medium mb-1">Procesados</p>
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'Completado').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-200/70 font-medium mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'Procesando').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-200/70 font-medium mb-1">Con Errores</p>
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'Error').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <CustomDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'All' | 'Procesando' | 'Completado' | 'Error' | 'Pendiente de revisión')}
              options={[
                { value: 'All', label: 'Todos los estados' },
                { value: 'Completado', label: 'Completados' },
                { value: 'Procesando', label: 'En Proceso' },
                { value: 'Error', label: 'Con Errores' },
                { value: 'Pendiente de revisión', label: 'Pendientes' }
              ]}
              placeholder="Seleccionar estado"
              isOpen={showStatusDropdown}
              onToggle={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowTypeDropdown(false)
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <CustomDropdown
              value={filterType}
              onChange={(value) => setFilterType(value as 'All' | 'Factura' | 'Recibo' | 'Extracto')}
              options={[
                { value: 'All', label: 'Todos los tipos' },
                { value: 'Factura', label: 'Facturas' },
                { value: 'Recibo', label: 'Recibos' },
                { value: 'Extracto', label: 'Estados de Cuenta' }
              ]}
              placeholder="Seleccionar tipo"
              isOpen={showTypeDropdown}
              onToggle={() => {
                setShowTypeDropdown(!showTypeDropdown)
                setShowStatusDropdown(false)
              }}
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Documento</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Subido por</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Datos Extraídos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{doc.fileName}</p>
                        <p className="text-xs text-white/60">{doc.fileSize}</p>
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
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-white">{doc.uploader}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{new Date(doc.uploadDate).toLocaleDateString('es-MX')}</p>
                    <p className="text-xs text-white/60">{new Date(doc.uploadDate).toLocaleTimeString('es-MX')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-white">{doc.extractedData.rfc}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-white">{doc.extractedData.periodo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 text-white/60 hover:text-white" />
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                      >
                        <Download className="h-4 w-4 text-white/60 hover:text-blue-400 group-hover:text-blue-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl h-[90vh] p-4 sm:p-6 relative flex flex-col">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 z-10"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 hover:text-white" />
            </button>

            {/* Header */}
            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{selectedDocument.fileName}</h3>
                  <p className="text-xs sm:text-sm text-blue-200/80">
                    {selectedDocument.documentType} • {selectedDocument.fileSize} • Subido por {selectedDocument.uploader}
                  </p>
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-white/5 rounded-xl p-4 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-lg">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Vista previa del PDF</p>
                  <p className="text-xs text-white/40 mb-4">
                    {selectedDocument.fileName}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleDownloadDocument(selectedDocument)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
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
                <p className="text-xs text-white/60 mb-1">Estado</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedDocument.status === 'Completado' ? 'text-green-400 bg-green-400/20' :
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
                <p className="text-xs text-white/60 mb-1">RFC</p>
                <p className="text-sm text-white">{selectedDocument.extractedData.rfc}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-white/60 mb-1">Período</p>
                <p className="text-sm text-white">{selectedDocument.extractedData.periodo}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
