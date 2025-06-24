"use client"

import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/toaster"
import LoginPage from "./components/LoginPage"
import HomePage from "./components/HomePage"

function AppContent() {
  const { currentUser, loading } = useAuth()
  const isAuthenticated = !!currentUser

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? (
        <HomePage />
      ) : (
        <LoginPage />
      )}
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
