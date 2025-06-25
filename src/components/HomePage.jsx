
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from "firebase/firestore"
import { db } from "../firebase"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Progress } from "./ui/progress"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { Toaster } from "./ui/toaster"
import { useToast } from "./ui/use-toast"
import {
  Search,
  Plus,
  Shield,
  Key,
  Globe,
  Mail,
  CreditCard,
  Briefcase,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Star,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Home,
  Lock,
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
  LayoutDashboard,
  LockKeyhole,
  KeyRound,
  Bookmark,
  ArrowRight
} from "lucide-react"
import { cn } from "../lib/utils"

// Default categories that will be available for selection
const defaultCategories = ["personal", "work", "social", "email", "banking"]

const mockPasswords = [
  {
    id: "1",
    name: "Gmail",
    username: "john.doe@gmail.com",
    password: "MyStr0ng!Pass123",
    url: "https://gmail.com",
    category: "email",
    notes: "Primary email account",
    favorite: true,
    lastUsed: "2 hours ago",
    strength: 85,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "GitHub",
    username: "johndoe",
    password: "C0d3r!2024#Secure",
    url: "https://github.com",
    category: "work",
    notes: "Development account",
    favorite: false,
    lastUsed: "1 day ago",
    strength: 92,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Netflix",
    username: "john.doe@gmail.com",
    password: "Movie!Night2024",
    url: "https://netflix.com",
    category: "personal",
    notes: "Family subscription",
    favorite: true,
    lastUsed: "3 days ago",
    strength: 78,
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "Chase Bank",
    username: "johndoe123",
    password: "Bank!Secure#2024$",
    url: "https://chase.com",
    category: "banking",
    notes: "Primary checking account",
    favorite: false,
    lastUsed: "1 week ago",
    strength: 95,
    createdAt: "2024-01-10",
  },
]

const sidebarItems = [
  { 
    id: "dashboard", 
    name: "Dashboard", 
    icon: LayoutDashboard, 
    description: "Overview of your passwords" 
  },
  { 
    id: "vault", 
    name: "Password Vault", 
    icon: LockKeyhole,
    description: "Manage all your passwords" 
  },
  { 
    id: "generator", 
    name: "Password Generator", 
    icon: KeyRound,
    description: "Create strong passwords" 
  }
]

const HomePage = () => {
  const { currentUser, signOut } = useAuth()
  const [passwords, setPasswords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPasswords, setShowPasswords] = useState({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    url: "",
    category: "personal",
    notes: "",
  })

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword((prev) => ({ ...prev, password: result }))
  }

  const handleSavePassword = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const passwordData = {
        ...newPassword,
        userId: currentUser.uid,
        favorite: editingPassword ? editingPassword.favorite : false,
        lastUsed: editingPassword ? editingPassword.lastUsed : "Never",
        strength: Math.floor(Math.random() * 40) + 60,
        createdAt: editingPassword ? editingPassword.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (editingPassword) {
        await updateDoc(doc(db, "passwords", editingPassword.id), passwordData)
      } else {
        await addDoc(collection(db, "passwords"), passwordData)
      }

      setEditingPassword(null)
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Error saving password: ", err)
      setError("Failed to save password. Please try again.")
    } finally {
      setLoading(false)
    }
    setNewPassword({
      name: "",
      username: "",
      email: "",
      password: "",
      url: "",
      category: "personal",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditPassword = (password) => {
    setEditingPassword(password)
    setNewPassword({
      name: password.name,
      username: password.username,
      email: password.email || "",
      password: password.password,
      url: password.url,
      category: password.category,
      notes: password.notes,
    })
    setIsAddDialogOpen(true)
  }

  const handleDeletePassword = async (id) => {
    if (!currentUser) return

    if (window.confirm("Are you sure you want to delete this password?")) {
      try {
        await deleteDoc(doc(db, "passwords", id))
      } catch (err) {
        console.error("Error deleting password: ", err)
        setError("Failed to delete password. Please try again.")
      }
    }
  }

  const toggleFavorite = async (id) => {
    if (!currentUser) return

    try {
      const passwordRef = doc(db, "passwords", id)
      const password = passwords.find((p) => p.id === id)
      if (password) {
        await updateDoc(passwordRef, { favorite: !password.favorite })
      }
    } catch (err) {
      console.error("Error toggling favorite: ", err)
      setError("Failed to update favorite status. Please try again.")
    }
  }

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, "passwords"),
      where("userId", "==", currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const passwords = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPasswords(passwords)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching passwords: ", error)
      setError("Failed to fetch passwords. Please try again.")
      setLoading(false)
    })

    return unsubscribe
  }, [db, currentUser])

  // Get unique categories from passwords and combine with defaults
  const passwordCategories = [...new Set(passwords.map(p => p?.category).filter(Boolean))]
  const allCategories = [...new Set([...defaultCategories, ...passwordCategories])]
  const categories = ["all", ...allCategories] // Include 'all' as first option

  // Filter passwords based on search query and selected category
  const filteredPasswords = passwords.filter(password => {
    if (!password) return false;
    
    const searchTerm = searchQuery.toLowerCase();
    const nameMatch = password.name?.toLowerCase().includes(searchTerm) || false;
    const usernameMatch = password.username?.toLowerCase().includes(searchTerm) || false;
    
    const matchesSearch = nameMatch || usernameMatch;
    const matchesCategory = selectedCategory === "all" || password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).filter(Boolean); // Remove any null/undefined entries

  if (loading && passwords.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Passwords</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-slate-800/50 z-50 transform transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Secure Vault
                </h1>
                <p className="text-xs text-slate-400">Strong Edition</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 text-left group",
                  activeView === item.id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                    : "hover:bg-slate-800/50",
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  activeView === item.id 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "font-medium text-sm",
                    activeView === item.id ? "text-white" : "text-slate-200"
                  )}>
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser?.photoURL || "/placeholder.svg"} />
                <AvatarFallback>{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{currentUser?.displayName || currentUser?.email || 'User'}</p>
                <p className="text-xs text-slate-400">Premium User</p>
              </div>
            </div>
            <div className="flex space-x-2">

              <Button variant="ghost" size="sm" className="flex-1" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold capitalize">{activeView}</h2>
                <p className="text-sm text-slate-400">
                  {activeView === "dashboard" && "Overview of your security"}
                  {activeView === "vault" && `${passwords.length} passwords stored`}
                  {activeView === "generator" && "Create secure passwords"}
                  {activeView === "security" && "Monitor your security health"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-400"
                />
              </div>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeView === "dashboard" && <DashboardView passwords={passwords} />}
          {activeView === "vault" && (
            <VaultView
              passwords={filteredPasswords}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showPasswords={showPasswords}
              togglePasswordVisibility={togglePasswordVisibility}
              copyToClipboard={copyToClipboard}
              toggleFavorite={toggleFavorite}
              handleEditPassword={handleEditPassword}
              handleDeletePassword={handleDeletePassword}
            />
          )}
          {activeView === "generator" && <GeneratorView />}
        </div>
      </div>

      {/* Add Password Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">{editingPassword ? "Edit Password" : "Add New Password"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingPassword ? "Update your password details." : "Add a new password to your vault."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-white" htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                value={newPassword.name}
                onChange={(e) => setNewPassword((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Gmail, GitHub"
                className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-white" htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  value={newPassword.username || ''}
                  onChange={(e) => setNewPassword((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="username"
                  className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newPassword.email || ''}
                  onChange={(e) => setNewPassword((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-white" htmlFor="password">
                Password
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword.password}
                    onChange={(e) => setNewPassword((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-white" htmlFor="url">
                Website URL
              </Label>
              <Input
                id="url"
                value={newPassword.url}
                onChange={(e) => setNewPassword((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white" htmlFor="category">
                Category
              </Label>
              <Select
                value={newPassword.category}
                onValueChange={(value) => setNewPassword((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-800/80 border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'all').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-white" htmlFor="notes">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={newPassword.notes}
                onChange={(e) => setNewPassword((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
                className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSavePassword}>
              {editingPassword ? "Update Password" : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Dashboard View Component
const DashboardView = ({ passwords = [] }) => {
  const hasPasswords = passwords.length > 0
  const averageStrength = hasPasswords 
    ? Math.round(passwords.reduce((acc, p) => acc + (p?.strength || 0), 0) / passwords.length)
    : 0
  const weakPasswords = passwords.filter((p) => (p?.strength || 0) < 60).length
  const strongPasswords = passwords.filter((p) => (p?.strength || 0) >= 80).length
  const recentPasswords = passwords.slice(0, 3)
  
  // Simple category color mapping
  const getCategoryColor = (category) => {
    switch(category) {
      case 'work': return 'from-orange-500 to-yellow-500';
      case 'social': return 'from-purple-500 to-pink-500';
      case 'email': return 'from-green-500 to-emerald-500';
      case 'banking': return 'from-red-500 to-orange-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  }
  
  // Simple category icon mapping
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'work': return Briefcase;
      case 'social': return Users;
      case 'email': return Mail;
      case 'banking': return CreditCard;
      default: return Key;
    }
  }

  return (
    <div className="space-y-8">
      {/* Total Passwords Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Passwords</p>
              <p className="text-4xl font-bold text-white">{passwords.length}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Passwords */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-amber-400" />
              Bookmarked Passwords
            </h3>
            <button 
              onClick={() => setActiveView('vault')}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {passwords.filter(p => p.favorite).length > 0 ? (
              passwords
                .filter(p => p.favorite)
                .map((password) => (
                  <div 
                    key={password.id} 
                    className="flex items-center p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPassword(password);
                      setShowAddPasswordDialog(true);
                    }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${getCategoryColor(password.category)} flex items-center justify-center mr-3`}>
                      {React.createElement(getCategoryIcon(password.category), { className: 'w-5 h-5 text-white' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-white truncate">{password.name}</p>
                        {password.favorite && (
                          <Star className="w-3.5 h-3.5 ml-2 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{password.username || 'No username'}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(password.password, 'Password');
                      }}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50"
                      title="Copy password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">No bookmarked passwords yet</p>
                <p className="text-slate-500 text-xs mt-1">Click the star icon to bookmark important passwords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Category helper functions
const getCategoryColor = (category) => {
  switch(category) {
    case 'work': return 'from-orange-500 to-yellow-500';
    case 'social': return 'from-purple-500 to-pink-500';
    case 'email': return 'from-green-500 to-emerald-500';
    case 'banking': return 'from-red-500 to-orange-500';
    default: return 'from-blue-500 to-cyan-500';
  }
}

const getCategoryIcon = (category) => {
  switch(category) {
    case 'work': return Briefcase;
    case 'social': return Users;
    case 'email': return Mail;
    case 'banking': return CreditCard;
    default: return Key;
  }
}

// Vault View Component
const VaultView = ({
  passwords = [],
  categories = [],
  selectedCategory,
  setSelectedCategory,
  showPasswords = {},
  togglePasswordVisibility = () => {},
  copyToClipboard = () => {},
  toggleFavorite = () => {},
  handleEditPassword = () => {},
  handleDeletePassword = () => {},
}) => {
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {/* All Categories Button */}
        <button
          key="all"
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200",
            selectedCategory === 'all'
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
              : "bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30"
          )}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">All</span>
        </button>
        
        {/* Category Buttons */}
        {categories
          .filter(cat => cat !== 'all')
          .map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 capitalize",
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                    : "bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category}</span>
              </button>
            );
          })}
      </div>

      {/* Password Grid */}
      <div className="grid gap-4">
        {passwords.map((password) => {
          if (!password) return null;
          const category = password.category || 'personal';
          const Icon = getCategoryIcon(category);
          return (
            <div key={password.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/10 to-slate-700/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br",
                        getCategoryColor(category),
                        "flex items-center justify-center"
                      )}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">{password.name}</h3>
                        {password.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <Badge
                          className={cn(
                            "bg-gradient-to-r",
                            password.strength >= 80
                              ? "from-green-500/20 to-green-600/20 text-green-300"
                              : password.strength >= 60
                                ? "from-yellow-500/20 to-yellow-600/20 text-yellow-300"
                                : "from-red-500/20 to-red-600/20 text-red-300",
                          )}
                        >
                          {password.strength >= 80 ? "Strong" : password.strength >= 60 ? "Medium" : "Weak"}
                        </Badge>
                      </div>
                      <p className="text-slate-300 truncate mb-1">{password.username}</p>
                      <p className="text-xs text-slate-400">Last used: {password.lastUsed}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="hidden lg:flex items-center space-x-2 mr-4">
                      <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-2">
                        <Input
                          type={showPasswords[password.id] ? "text" : "password"}
                          value={password.password}
                          readOnly
                          className="w-32 text-xs bg-transparent border-none text-white"
                        />
                        <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(password.id)}>
                          {showPasswords[password.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(password.password)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleFavorite(password.id)}>
                      <Star
                        className={cn("w-4 h-4", password.favorite ? "text-yellow-500 fill-current" : "text-slate-400")}
                      />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditPassword(password)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePassword(password.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Generator View Component
const GeneratorView = () => {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)

  const generatePassword = () => {
    let chars = ""
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) chars += "0123456789"
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (excludeSimilar) {
      chars = chars.replace(/[il1Lo0O]/g, "")
    }

    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
  }

  const getPasswordStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score += 25
    if (pwd.length >= 12) score += 25
    if (/[a-z]/.test(pwd)) score += 10
    if (/[A-Z]/.test(pwd)) score += 10
    if (/[0-9]/.test(pwd)) score += 10
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20
    return Math.min(score, 100)
  }

  const strength = password ? getPasswordStrength(password) : 0

  useEffect(() => {
    generatePassword()
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
          <div className="space-y-8">
            {/* Generated Password Display */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Generated Password</h3>
                <Badge
                  className={cn(
                    "bg-gradient-to-r",
                    strength >= 80
                      ? "from-green-500/20 to-green-600/20 text-green-300"
                      : strength >= 60
                        ? "from-yellow-500/20 to-yellow-600/20 text-yellow-300"
                        : "from-red-500/20 to-red-600/20 text-red-300",
                  )}
                >
                  {strength >= 80 ? "Strong" : strength >= 60 ? "Medium" : "Weak"}
                </Badge>
              </div>

              <div className="relative">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30">
                  <div className="font-mono text-2xl text-white break-all mb-4">{password}</div>
                  <Progress value={strength} className="h-2 mb-4" />
                  <div className="flex justify-center space-x-3">
                    <Button onClick={() => navigator.clipboard.writeText(password)} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={generatePassword} className="bg-gradient-to-r from-blue-500 to-purple-600">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-lg">Password Length</Label>
                  <span className="text-lg font-bold text-blue-400">{length}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="50"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <Label className="text-white font-medium">Uppercase Letters</Label>
                  <Switch checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <Label className="text-white font-medium">Lowercase Letters</Label>
                  <Switch checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <Label className="text-white font-medium">Numbers</Label>
                  <Switch checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <Label className="text-white font-medium">Symbols</Label>
                  <Switch checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 md:col-span-2">
                  <Label className="text-white font-medium">Exclude Similar Characters</Label>
                  <Switch checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Security View Component
const SecurityView = ({ passwords }) => {
  const averageStrength = Math.round(passwords.reduce((acc, p) => acc + p.strength, 0) / passwords.length)
  const weakPasswords = passwords.filter((p) => p.strength < 60)
  const strongPasswords = passwords.filter((p) => p.strength >= 80)

  return (
    <div className="space-y-8">
      {/* Security Score */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
          <div className="relative w-48 h-48 mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">{averageStrength}%</div>
              <div className="text-slate-400">Security Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{strongPasswords.length}</div>
            <div className="text-green-300 font-medium">Strong Passwords</div>
            <div className="text-sm text-slate-400 mt-2">Well protected accounts</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {passwords.filter((p) => p.strength >= 60 && p.strength < 80).length}
            </div>
            <div className="text-yellow-300 font-medium">Medium Passwords</div>
            <div className="text-sm text-slate-400 mt-2">Could be improved</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{weakPasswords.length}</div>
            <div className="text-red-300 font-medium">Weak Passwords</div>
            <div className="text-sm text-slate-400 mt-2">Need immediate attention</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/10 to-slate-700/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Security Recommendations</h3>
          <div className="space-y-4">
            {weakPasswords.length > 0 && (
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <div className="font-medium text-red-200 mb-1">Update Weak Passwords</div>
                  <div className="text-sm text-red-300 mb-3">
                    You have {weakPasswords.length} weak passwords that should be updated immediately.
                  </div>
                  <div className="space-y-2">
                    {weakPasswords.slice(0, 3).map((password) => (
                      <div key={password.id} className="text-sm text-red-300">
                        • {password.name} - {password.username}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <div className="font-medium text-blue-200 mb-1">Enable Two-Factor Authentication</div>
                <div className="text-sm text-blue-300">
                  Add an extra layer of security to your most important accounts.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <div className="font-medium text-green-200 mb-1">Regular Security Checkups</div>
                <div className="text-sm text-green-300">
                  Review and update your passwords every 3-6 months for optimal security.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
