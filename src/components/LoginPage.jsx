
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Mail, Eye, EyeOff, Shield, Fingerprint, Key, Scan, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { Plus } from "lucide-react"

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, updateUserProfile, sendPasswordReset: sendResetEmail, sendEmailVerification, signOut } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState("password")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [name, setName] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    try {
      // Sign up the user (this now includes sending verification email)
      await signUp(email, password)
      
      // Update profile if name is provided
      if (name) {
        try {
          await updateUserProfile({ displayName: name })
        } catch (profileError) {
          console.error("Error updating profile:", profileError)
          // Don't fail the whole flow if profile update fails
        }
      }
      
      // Clear sensitive data but keep email for login
      setPassword("")
      setConfirmPassword("")
      setName("")
      
      // Show success message with instructions
      setSuccess("✓ Registration successful! We've sent a verification email to your address. Please check your inbox (including spam folder) and click the verification link to activate your account.")
      
      // Switch to login tab after a short delay to show the success message
      setTimeout(() => {
        setLoginMethod("password")
        // Clear success message after switching tabs
        setTimeout(() => setSuccess(""), 10000) // Clear after 10 seconds
      }, 2000)
      
    } catch (error) {
      // The error is already formatted in AuthContext
      setError(error.message || 'Failed to create an account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    
    try {
      await signIn(email, password)
      // If signIn is successful, the user will be redirected by the auth state listener
    } catch (error) {
      // Handle specific error cases
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setError('Email not verified')
        setSuccess('We\'ve sent a new verification email. Please check your inbox (including spam folder) and click the verification link before signing in.')
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.')
      } else {
        setError(error.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      const user = await signInWithGoogle();
      if (user && !user.emailVerified) {
        await signOut();
        setError("Please verify your Google account email before logging in.");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email but different sign-in credentials.');
      } else {
        setError(error.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    try {
      // Sign up the user and get the user object from the response
      const { user } = await signUp(email, password)
      if (name) {
        await updateUserProfile({ displayName: name })
      }
      // Send email verification
      await sendEmailVerification(user)
      setSuccess("Registration successful! Please check your email to verify your account.")
      setLoginMethod("email") // Switch back to login form
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setName("")
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please try logging in instead.')
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!resetEmail) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      await sendResetEmail(resetEmail)
      setResetSent(true)
      setResetEmail("")
    } catch (error) {
      console.error("Error sending password reset email:", error)
      setError(error.message || "Failed to send password reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Secure Vault
          </h1>
          <p className="text-slate-400">Your passwords, secured for ever</p>
        </div>

        {/* Login Methods Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-1 border border-slate-700/30">
          <button
            onClick={() => setLoginMethod("password")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
              loginMethod === "password"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Mail className="w-4 h-4 mx-auto mb-1" />
            Sign In
          </button>
          <button
            onClick={() => setLoginMethod("signup")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
              loginMethod === "signup"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Plus className="w-4 h-4 mx-auto mb-1" />
            Sign Up
          </button>
          <button
            onClick={() => setLoginMethod("forgot")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
              loginMethod === "forgot"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Key className="w-4 h-4 mx-auto mb-1" />
            Forgot Password
          </button>
        </div>

        {/* Login Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/10 to-slate-700/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            {loginMethod === "password" && (
              <form onSubmit={handleLogin} className="space-y-6">
                {error && loginMethod === "password" && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Master Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your master password"
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={setRememberMe}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-slate-300">
                      Remember me
                    </Label>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-sm text-blue-400 hover:text-blue-300 p-0 h-auto"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600/50"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800/50 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
                <div className="text-center mt-8 space-y-4">
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto" onClick={() => setLoginMethod("signup")}>
              Create one
            </Button>
          </p>
        </div>
              </form>
            )}

            {loginMethod === "signup" && (
              <form onSubmit={handleRegister} className="space-y-6">
                {error && loginMethod === "signup" && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && loginMethod === "signup" && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-green-300 font-medium">Verification Email Sent!</h3>
                        <div className="mt-1 text-sm text-green-200">
                          <p>We've sent a verification link to your email address.</p>
                          <p className="mt-2 font-semibold">Please check your inbox and click the link to verify your account.</p>
                          <p className="mt-2 text-xs text-green-300/80">
                            <span className="font-medium">Note:</span> The email might be in your spam or junk folder.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Full Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                    onClick={() => setLoginMethod("password")}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {loginMethod === "forgot" && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">Reset Password</h3>
                  <p className="text-slate-400 text-sm">
                    {resetSent 
                      ? "Check your email for a link to reset your password."
                      : "Enter your email and we'll send you a link to reset your password."}
                  </p>
                </div>

                {!resetSent ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Email Address</Label>
                      <Input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {error && loginMethod === "forgot" && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      setLoginMethod("password")
                      setResetSent(false)
                      setResetEmail("")
                    }}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                  >
                    Back to Sign In
                  </Button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        
      </div>
    </div>
  )
}
