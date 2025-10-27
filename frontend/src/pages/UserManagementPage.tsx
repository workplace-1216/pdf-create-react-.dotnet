import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  XCircle,
  ChevronDown
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Client'
  status: 'Active' | 'Inactive' | 'Pending'
  lastLogin: string
  createdAt: string
  documentsCount: number
}

export const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'All' | 'Admin' | 'Client'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive' | 'Pending'>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showEditStatusDropdown, setShowEditStatusDropdown] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

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

  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@empresa.com',
      role: 'Client',
      status: 'Active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2024-01-01',
      documentsCount: 15
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      role: 'Client',
      status: 'Active',
      lastLogin: '2024-01-15 12:15',
      createdAt: '2024-01-05',
      documentsCount: 8
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      role: 'Client',
      status: 'Pending',
      lastLogin: '2024-01-14 16:45',
      createdAt: '2024-01-10',
      documentsCount: 0
    },
    {
      id: '4',
      name: 'Luis Hernández',
      email: 'luis.hernandez@empresa.com',
      role: 'Client',
      status: 'Inactive',
      lastLogin: '2024-01-10 09:20',
      createdAt: '2023-12-15',
      documentsCount: 23
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@empresa.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-15 15:00',
      createdAt: '2023-11-01',
      documentsCount: 0
    }
  ])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'All' || user.role === filterRole
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/20'
      case 'Inactive': return 'text-red-400 bg-red-400/20'
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />
      case 'Inactive': return <UserX className="h-4 w-4" />
      case 'Pending': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'text-purple-400 bg-purple-400/20'
      case 'Client': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log('Adding user:', newUser)
    setShowAddModal(false)
    setNewUser({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleExportUsers = () => {
    // Prepare data for Excel export
    const excelData = [
      ['Nombre', 'Email', 'Rol', 'Estado', 'Último Acceso', 'Documentos'],
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.lastLogin,
        user.documentsCount.toString()
      ])
    ]

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(excelData)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
    
    // Generate Excel file and download
    XLSX.writeFile(wb, 'usuarios.xlsx')
  }

  return (
    <div className="p-6 px-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
          <p className="text-sm text-blue-200/80">Administrar clientes y permisos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Agregar Admin</span>
          </button>
          <button 
            onClick={handleExportUsers}
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
              <p className="text-sm text-blue-200/70 font-medium mb-1">Total Usuarios</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200/70 font-medium mb-1">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'Active').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-200/70 font-medium mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'Pending').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-200/70 font-medium mb-1">Administradores</p>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Admin').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
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
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48 z-30">
            <CustomDropdown
              value={filterRole}
              onChange={(value) => setFilterRole(value as 'All' | 'Admin' | 'Client')}
              options={[
                { value: 'All', label: 'Todos los roles' },
                { value: 'Admin', label: 'Administradores' },
                { value: 'Client', label: 'Clientes' }
              ]}
              placeholder="Seleccionar rol"
              isOpen={showRoleDropdown}
              onToggle={() => {
                setShowRoleDropdown(!showRoleDropdown)
                setShowStatusDropdown(false)
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <CustomDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'All' | 'Active' | 'Inactive' | 'Pending')}
              options={[
                { value: 'All', label: 'Todos los estados' },
                { value: 'Active', label: 'Activos' },
                { value: 'Inactive', label: 'Inactivos' },
                { value: 'Pending', label: 'Pendientes' }
              ]}
              placeholder="Seleccionar estado"
              isOpen={showStatusDropdown}
              onToggle={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowRoleDropdown(false)
              }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Último Acceso</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Documentos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{new Date(user.lastLogin).toLocaleDateString('es-MX')}</p>
                    <p className="text-xs text-white/60">{new Date(user.lastLogin).toLocaleTimeString('es-MX')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{user.documentsCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 text-white/60 hover:text-white" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4 text-white/60 hover:text-white" />
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

      {/* Add User Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false)
            }
          }}
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 text-white/60 hover:text-white" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Agregar Nuevo Admin</h3>
              </div>
              <p className="text-sm text-blue-200/80">Complete la información del usuario</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="usuario@empresa.com"
                />
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false)
            }
          }}
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 text-white/60 hover:text-white" />
            </button>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Detalles del Usuario</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedUser.name}</h4>
                  <p className="text-sm text-white/60">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Rol</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Estado</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-1">{selectedUser.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-white/60 mb-1">Último Acceso</p>
                <p className="text-sm text-white">{new Date(selectedUser.lastLogin).toLocaleString('es-MX')}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-white/60 mb-1">Documentos Procesados</p>
                <p className="text-lg font-semibold text-white">{selectedUser.documentsCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false)
            }
          }}
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 text-white/60 hover:text-white" />
            </button>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
              </div>
              <p className="text-sm text-blue-200/80">Modificar información del usuario</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue={selectedUser.name}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Estado</label>
                <CustomDropdown
                  value={selectedUser.status}
                  onChange={(value) => {
                    // Update the selected user's status
                    setSelectedUser(prev => prev ? { ...prev, status: value as 'Active' | 'Inactive' | 'Pending' } : null)
                  }}
                  options={[
                    { value: 'Active', label: 'Activo' },
                    { value: 'Inactive', label: 'Inactivo' },
                    { value: 'Pending', label: 'Pendiente' }
                  ]}
                  placeholder="Seleccionar estado"
                  isOpen={showEditStatusDropdown}
                  onToggle={() => setShowEditStatusDropdown(!showEditStatusDropdown)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}