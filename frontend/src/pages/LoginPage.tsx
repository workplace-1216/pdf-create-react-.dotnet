import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Sparkles, CheckCircle } from 'lucide-react'
import { getRoleBasedRoute } from '../utils/roleNavigation'

export const LoginPage: React.FC = () => {
  const { login, register, user } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const route = getRoleBasedRoute(user)
      navigate(route)
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
        // Navigation will be handled by useEffect when user state updates
      } else {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const registeredUser = await register({
          email: formData.email,
          tempPassword: formData.password
        })
        // Navigate to role-based page after successful registration
        // For client users, navigate directly to client page
        if (registeredUser.role === 'Client') {
          navigate('/client')
        } else {
          const route = getRoleBasedRoute(registeredUser)
          navigate(route)
        }
      }
    } catch (err: any) {
      // Handle different error response formats
      let errorMessage = 'An error occurred'

      if (err.response?.data) {
        // Check if error message is directly in response data
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Advanced Animated Background (disabled for white theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden">
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

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Modern Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-6 group flex items-center justify-center">
            <img src="/logo.png" alt="CAAST" className="h-12 sm:h-20" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-2">
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
          </h2>
          <p className="text-black text-sm sm:text-base">
            {isLogin ? 'Accede a tu centro de cumplimiento fiscal' : 'Crea tu cuenta y comienza a procesar documentos'}
          </p>
        </div>

        {/* Modern Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#64c7cd]/30 p-8 relative overflow-hidden group">
          {/* Glassmorphism Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-100 rounded-2xl p-1 border border-[#64c7cd]/30">
                <button
                  type="button"
                  onClick={toggleMode}
                  className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isLogin
                      ? 'bg-[#eb3089] text-white shadow-lg'
                      : 'text-black hover:text-black hover:bg-gray-200'
                    }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={toggleMode}
                  className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${!isLogin
                      ? 'bg-[#eb3089] text-white shadow-lg'
                      : 'text-black hover:text-black hover:bg-gray-200'
                    }`}
                >
                  Registrarse
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-[#64c7cd]/30 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#64c7cd] focus:border-transparent transition-all duration-300"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-[#64c7cd]/30 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#64c7cd] focus:border-transparent transition-all duration-300 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black mb-2">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-300 focus:ring-red-400'
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                              ? 'border-[#a5cc55] focus:ring-[#a5cc55]'
                              : 'border-[#64c7cd]/30 focus:ring-[#64c7cd]'
                          }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black transition-colors duration-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <div className="mt-2 flex items-center space-x-2 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <p className="text-sm">Las contraseñas no coinciden</p>
                      </div>
                    )}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="mt-2 flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <p className="text-sm">Las contraseñas coinciden</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-[#eb3089] text-white font-semibold rounded-2xl shadow-2xl hover:bg-[#eb3089]/80 focus:outline-none focus:ring-2 focus:ring-[#64c7cd] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        {isLogin ? (
                          <>
                            <Zap className="h-5 w-5" />
                            <span>Iniciar Sesión</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>Crear Cuenta</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Features Preview */}
        <div className="text-center">
          <p className="text-black text-sm mb-4">Características incluidas:</p>
          <div className="flex justify-center space-x-6 text-xs text-black">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-[#64c7cd] rounded-full"></div>
              <span>Procesamiento IA</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-[#eb3089] rounded-full"></div>
              <span>Cumplimiento Fiscal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-[#a5cc55] rounded-full"></div>
              <span>Verificación Automática</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}