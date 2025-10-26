import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSupplierFiles } from '@/hooks/useSupplierFiles'
import { UploadCard } from '@/components/UploadCard'
import { FileTable } from '@/components/FileTable'

/**
 * Supplier dashboard page
 * Main page for suppliers to upload PDFs and manage their files
 */
export default function SupplierDashboardPage() {
  const { token, role, username, logout } = useAuth()
  const { files, loading, error, refreshFiles } = useSupplierFiles()
  const navigate = useNavigate()

  // Redirect to login if not authenticated or not a supplier
  useEffect(() => {
    if (!token || role !== 'Supplier') {
      navigate('/login', { replace: true })
    }
  }, [token, role, navigate])

  // Load files on mount
  useEffect(() => {
    if (token && role === 'Supplier') {
      refreshFiles()
    }
  }, [token, role, refreshFiles])

  // Don't render if not authenticated
  if (!token || role !== 'Supplier') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Hello, {username}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Supplier Portal
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading files
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    onClick={refreshFiles}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-1">
            <UploadCard onUploadSuccess={refreshFiles} />
          </div>

          {/* Files Table */}
          <div className="lg:col-span-1">
            <FileTable files={files} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  )
}
