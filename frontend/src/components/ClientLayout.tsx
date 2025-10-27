import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, FileText } from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main content */}
      <main>
        <div>
          {children}
        </div>
      </main>
    </div>
  )
}
