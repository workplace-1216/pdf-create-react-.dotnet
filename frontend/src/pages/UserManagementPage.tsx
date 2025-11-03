import React, { useState, useEffect, useRef } from 'react'
import {
  Users,
  User,
  UserPlus,
  Search,
  Trash2,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { adminApi } from '../services/api'
import type { AdminUser } from '../types/api'
import { useAuth } from '../contexts/AuthContext'

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Cliente'
  status: 'Activo' | 'Inactivo' | 'Pendiente'
  lastLogin: string
  createdAt: string
  documentsCount: number
}

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'All' | 'Admin' | 'Cliente'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Activo' | 'Inactivo' | 'Pendiente'>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showEditStatusDropdown, setShowEditStatusDropdown] = useState(false)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  } | null>(null)

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
                className={`w-full px-4 py-3 text-left text-black hover:bg-[#64c7cd]/10 transition-colors duration-200 ${
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

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filterRole, filterStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const role = filterRole === 'All' ? undefined : filterRole
      const status = filterStatus === 'All' ? undefined : filterStatus
      const search = searchTerm || undefined

      const response = await adminApi.getUsers(currentPage, pageSize, search, role, status)
      
      // Convert AdminUser to User format
      const convertedUsers: User[] = response.items.map(adminUser => ({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role as 'Admin' | 'Cliente',
        status: adminUser.status as 'Activo' | 'Inactivo' | 'Pendiente',
        lastLogin: adminUser.lastLogin,
        createdAt: adminUser.lastLogin, // Using lastLogin as createdAt for now
        documentsCount: adminUser.documentsCount
      }))

      setUsers(convertedUsers)
      setTotalUsers(response.totalCount)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'text-green-400 bg-green-400/20'
      case 'Inactivo': return 'text-red-400 bg-red-400/20'
      case 'Pendiente': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Activo': return <CheckCircle className="h-4 w-4" />
      case 'Inactivo': return <UserX className="h-4 w-4" />
      case 'Pendiente': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'text-purple-400 bg-purple-400/20'
      case 'Cliente': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const handleAddUser = async () => {
    // Validate form data
    if (!newUser.name.trim()) {
      setFeedback({ type: 'info', title: 'Validación requerida', message: 'Por favor ingrese el nombre completo' })
      return
    }
    
    if (!newUser.email.trim()) {
      setFeedback({ type: 'info', title: 'Validación requerida', message: 'Por favor ingrese el correo electrónico' })
      return
    }
    
    // Require admin email domain
    if (!newUser.email.trim().toLowerCase().endsWith('@admin.com')) {
      setFeedback({ type: 'error', title: 'Correo inválido', message: 'El correo del administrador debe terminar con @admin.com' })
      return
    }
    
    if (!newUser.password.trim()) {
      setFeedback({ type: 'info', title: 'Validación requerida', message: 'Por favor ingrese la contraseña' })
      return
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      setFeedback({ type: 'error', title: 'Contraseñas no coinciden', message: 'Las contraseñas no coinciden' })
      return
    }
    
    if (newUser.password.length < 6) {
      setFeedback({ type: 'info', title: 'Contraseña muy corta', message: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setIsCreatingAdmin(true)

    try {
      // Create admin user object
      const adminUser = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password
      }

      await adminApi.createAdmin(adminUser)
      setFeedback({
        type: 'success',
        title: 'Administrador creado',
        message: `Admin ${adminUser.name} creado exitosamente`
      })
      
      // Close modal and reset form
      setShowAddModal(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
      
      // Refresh user list
      fetchUsers()
      
    } catch (error) {
      console.error('Error creating admin user:', error)
      const apiMessage = (error as any)?.response?.data
      setFeedback({
        type: 'error',
        title: 'Error al crear administrador',
        message: typeof apiMessage === 'string' ? apiMessage : 'Error al crear el admin. Por favor intente nuevamente.'
      })
    } finally {
      setIsCreatingAdmin(false)
    }
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

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        // Prevent deleting the currently logged-in user
        if (currentUser && selectedUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
          setFeedback({
            type: 'error',
            title: 'Operación no permitida',
            message: 'No puedes eliminar tu propia cuenta.'
          })
          return
        }

        await adminApi.deleteUser(selectedUser.id)
        setFeedback({
          type: 'success',
          title: 'Usuario eliminado',
          message: `Usuario ${selectedUser.name} eliminado exitosamente`
        })
        setShowDeleteModal(false)
        setSelectedUser(null)
        // Refresh user list
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        const apiMessage = (error as any)?.response?.data
        setFeedback({
          type: 'error',
          title: 'Error al eliminar',
          message: typeof apiMessage === 'string' ? apiMessage : 'Error al eliminar el usuario. Por favor intente nuevamente.'
        })
      }
    }
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

  if (loading && users.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:px-20 flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:px-20">
      {/* Feedback Modal */}
      {feedback && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFeedback(null)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-md sm:max-w-lg p-6 relative">
            <button
              onClick={() => setFeedback(null)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 text-black hover:text-black" />
            </button>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-xl ${
                feedback.type === 'success' ? 'bg-green-500' : feedback.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {feedback.type === 'success' && <CheckCircle className="h-5 w-5 text-black" />}
                {feedback.type === 'error' && <AlertCircle className="h-5 w-5 text-black" />}
                {feedback.type === 'info' && <AlertCircle className="h-5 w-5 text-black" />}
              </div>
              <div>
                <h4 className="text-black text-lg font-semibold mb-1">{feedback.title}</h4>
                <p className="text-black text-sm">{feedback.message}</p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setFeedback(null)}
                className="px-5 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black">Gestión de Usuarios</h2>
          <p className="text-xs sm:text-sm text-black">Administrar clientes y permisos ({totalUsers} usuarios)</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-[#a5cc55] border border-[#a5cc55]/20 rounded-lg hover:bg-[#a5cc55]/80 transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Agregar Admin</span>
          </button>
          <button 
            onClick={handleExportUsers}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-[#64c7cd] border border-[#64c7cd]/20 rounded-lg hover:bg-[#64c7cd]/80 transition-all duration-300 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-black font-medium mb-1">Total Usuarios</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{users.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-[#64c7cd] rounded-xl">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-black font-medium mb-1">Usuarios Activos</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{users.filter(u => u.status === 'Activo').length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-[#a5cc55] rounded-xl">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-black font-medium mb-1">Pendientes</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{users.filter(u => u.status === 'Pendiente').length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-[#eb3089] rounded-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-black font-medium mb-1">Administradores</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{users.filter(u => u.role === 'Admin').length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-[#64c7cd] rounded-xl">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48 z-30">
            <CustomDropdown
              value={filterRole}
              onChange={(value) => setFilterRole(value as 'All' | 'Admin' | 'Cliente')}
              options={[
                { value: 'All', label: 'Todos los roles' },
                { value: 'Admin', label: 'Administradores' },
                { value: 'Cliente', label: 'Clientes' }
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
          <div className="sm:w-48">
            <CustomDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'All' | 'Activo' | 'Inactivo' | 'Pendiente')}
              options={[
                { value: 'All', label: 'Todos los estados' },
                { value: 'Activo', label: 'Activos' },
                { value: 'Inactivo', label: 'Inactivos' },
                { value: 'Pendiente', label: 'Pendientes' }
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
      <div className="bg-white rounded-2xl shadow-2xl hover:shadow-lg border border-[#64c7cd]/30 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64c7cd]/15 border-b border-[#64c7cd]/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Último Acceso</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Documentos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-black">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-black mb-1">No hay usuarios</p>
                      <p className="text-sm text-black/60">No se encontraron usuarios con los filtros aplicados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#64c7cd] rounded-full flex items-center justify-center">
                        <span className="text-black font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{user.name}</p>
                        <p className="text-xs text-black">{user.email}</p>
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
                    <p className="text-sm text-black">{new Date(user.lastLogin).toLocaleDateString('es-MX')}</p>
                    <p className="text-xs text-black">{new Date(user.lastLogin).toLocaleTimeString('es-MX')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-black">{user.documentsCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 text-black hover:text-black" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4 text-black hover:text-black" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group"
                      >
                        <Trash2 className="h-4 w-4 text-black hover:text-red-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <User className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-black mb-1">No hay usuarios</p>
                <p className="text-sm text-black/60">No se encontraron usuarios con los filtros aplicados</p>
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => (
            <div key={user.id} className="p-4 border-b border-[#64c7cd]/20 last:border-b-0 hover:bg-[#64c7cd]/5 transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#64c7cd] rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{user.name}</p>
                    <p className="text-xs text-black">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewUser(user)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 text-black hover:text-black" />
                  </button>
                  <button 
                    onClick={() => handleEditUser(user)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 text-black hover:text-black" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group"
                  >
                    <Trash2 className="h-4 w-4 text-black hover:text-red-600 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-black/60 mb-1">Rol</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Estado</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    <span className="ml-1">{user.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Último Acceso</p>
                  <p className="text-black">{new Date(user.lastLogin).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <p className="text-black/60 mb-1">Documentos</p>
                  <p className="text-black font-medium">{user.documentsCount}</p>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalUsers > pageSize && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 p-4">
          <div className="text-sm text-black">
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalUsers)} de {totalUsers} usuarios
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-1 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#64c7cd] text-white hover:bg-[#64c7cd]/80 hover:scale-105'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(totalUsers / pageSize)) }, (_, i) => {
                const totalPages = Math.ceil(totalUsers / pageSize)
                let pageNum: number
                
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-[#64c7cd] text-white'
                        : 'bg-white text-black border border-[#64c7cd]/30 hover:bg-[#64c7cd]/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalUsers / pageSize), prev + 1))}
              disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-1 ${
                currentPage >= Math.ceil(totalUsers / pageSize)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#64c7cd] text-white hover:bg-[#64c7cd]/80 hover:scale-105'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black hover:text-black" />
            </button>

            {/* Header */}
            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#a5cc55] rounded-xl">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black">Agregar Nuevo Admin</h3>
              </div>
              <p className="text-xs sm:text-sm text-black">Complete la información del usuario</p>
            </div>

            {/* Form */}
            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                  placeholder="usuario@empresa.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-black transition-colors duration-200 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                disabled={isCreatingAdmin}
                className={`px-4 sm:px-6 py-2 text-sm font-medium text-white bg-[#a5cc55] rounded-xl hover:bg-[#a5cc55]/80 transition-all duration-300 hover:scale-105 shadow-lg order-1 sm:order-2 ${isCreatingAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isCreatingAdmin ? 'Creando...' : 'Crear Admin'}
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
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black hover:text-black" />
            </button>

            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#64c7cd] rounded-xl">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black">Detalles del Usuario</h3>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64c7cd] rounded-full flex items-center justify-center">
                  <span className="text-black font-semibold text-sm sm:text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-black">{selectedUser.name}</h4>
                  <p className="text-xs sm:text-sm text-black/60">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                  <p className="text-xs text-black/60 mb-1">Rol</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                  <p className="text-xs text-black/60 mb-1">Estado</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-1">{selectedUser.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <p className="text-xs text-black/60 mb-1">Último Acceso</p>
                <p className="text-sm text-black">{new Date(selectedUser.lastLogin).toLocaleString('es-MX')}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <p className="text-xs text-black/60 mb-1">Documentos Procesados</p>
                <p className="text-lg font-semibold text-black">{selectedUser.documentsCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 sm:mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-white bg-[#64c7cd] rounded-xl hover:bg-[#64c7cd]/80 transition-all duration-300 hover:scale-105 shadow-lg"
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
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black hover:text-black" />
            </button>

            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#eb3089] rounded-xl">
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black">Editar Usuario</h3>
              </div>
              <p className="text-xs sm:text-sm text-black">Modificar información del usuario</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue={selectedUser.name}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Estado</label>
                <CustomDropdown
                  value={selectedUser.status}
                  onChange={(value) => {
                    // Update the selected user's status
                    setSelectedUser(prev => prev ? { ...prev, status: value as 'Activo' | 'Inactivo' | 'Pendiente' } : null)
                  }}
                  options={[
                    { value: 'Activo', label: 'Activo' },
                    { value: 'Inactivo', label: 'Inactivo' },
                    { value: 'Pendiente', label: 'Pendiente' }
                  ]}
                  placeholder="Seleccionar estado"
                  isOpen={showEditStatusDropdown}
                  onToggle={() => setShowEditStatusDropdown(!showEditStatusDropdown)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-black transition-colors duration-200 order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-[#eb3089] rounded-xl hover:bg-[#eb3089]/80 transition-all duration-300 hover:scale-105 shadow-lg order-1 sm:order-2"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false)
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#64c7cd]/30 w-full max-w-md sm:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-black hover:text-black" />
            </button>

            <div className="mb-4 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#eb3089] rounded-xl">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black">Confirmar Eliminación</h3>
              </div>
              <p className="text-xs sm:text-sm text-black">Esta acción no se puede deshacer</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 bg-[#eb3089]/10 border border-[#eb3089]/40 rounded-xl shadow-sm">
                <p className="text-sm text-black mb-2">
                  ¿Estás seguro de que quieres eliminar al usuario <span className="font-semibold text-[#eb3089]">{selectedUser.name}</span>?
                </p>
                <p className="text-xs text-black">
                  Se eliminarán todos los datos asociados con este usuario, incluyendo documentos y historial.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#64c7cd]/20 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#64c7cd] rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold text-sm">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{selectedUser.name}</p>
                    <p className="text-xs text-black">{selectedUser.email}</p>
                    <p className="text-xs text-black">{selectedUser.role} • {selectedUser.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-black bg-white border border-[#64c7cd]/40 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-sm order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-[#eb3089] rounded-xl hover:bg-[#eb3089]/80 transition-all duration-300 hover:scale-105 shadow-lg order-1 sm:order-2"
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}