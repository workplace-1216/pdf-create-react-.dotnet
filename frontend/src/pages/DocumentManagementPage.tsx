import React, { useState } from 'react'
import {
  FileText,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Clock,
  Calendar,
  User,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface Document {
  id: string
  fileName: string
  uploader: string
  uploadDate: string
  status: 'Processing' | 'Completed' | 'Error' | 'Pending Review'
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
  const [filterStatus, setFilterStatus] = useState<'All' | 'Processing' | 'Completed' | 'Error' | 'Pending Review'>('All')
  const [filterType, setFilterType] = useState<'All' | 'Invoice' | 'Receipt' | 'Statement'>('All')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

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

  const [documents] = useState<Document[]>([
    {
      id: '1',
      fileName: 'factura_enero_2024.pdf',
      uploader: 'María González',
      uploadDate: '2024-01-15 14:30',
      status: 'Completed',
      fileSize: '2.3 MB',
      documentType: 'Invoice',
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
      status: 'Processing',
      fileSize: '1.8 MB',
      documentType: 'Receipt',
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
      documentType: 'Statement',
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
      status: 'Pending Review',
      fileSize: '2.7 MB',
      documentType: 'Invoice',
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
      status: 'Completed',
      fileSize: '1.5 MB',
      documentType: 'Receipt',
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
      case 'Completed': return 'text-green-400 bg-green-400/20'
      case 'Processing': return 'text-blue-400 bg-blue-400/20'
      case 'Error': return 'text-red-400 bg-red-400/20'
      case 'Pending Review': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" />
      case 'Processing': return <Clock className="h-4 w-4" />
      case 'Error': return <AlertCircle className="h-4 w-4" />
      case 'Pending Review': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Invoice': return 'text-purple-400 bg-purple-400/20'
      case 'Receipt': return 'text-blue-400 bg-blue-400/20'
      case 'Statement': return 'text-green-400 bg-green-400/20'
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
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'Completed').length}</p>
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
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'Processing').length}</p>
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
              onChange={(value) => setFilterStatus(value as 'All' | 'Processing' | 'Completed' | 'Error' | 'Pending Review')}
              options={[
                { value: 'All', label: 'Todos los estados' },
                { value: 'Completed', label: 'Completados' },
                { value: 'Processing', label: 'En Proceso' },
                { value: 'Error', label: 'Con Errores' },
                { value: 'Pending Review', label: 'Pendientes' }
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
              onChange={(value) => setFilterType(value as 'All' | 'Invoice' | 'Receipt' | 'Statement')}
              options={[
                { value: 'All', label: 'Todos los tipos' },
                { value: 'Invoice', label: 'Facturas' },
                { value: 'Receipt', label: 'Recibos' },
                { value: 'Statement', label: 'Estados de Cuenta' }
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
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                        <Eye className="h-4 w-4 text-white/60 hover:text-white" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                        <Download className="h-4 w-4 text-white/60 hover:text-white" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                        <MoreHorizontal className="h-4 w-4 text-white/60 hover:text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
