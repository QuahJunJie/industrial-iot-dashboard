"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Lock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function AdminLoginPage() {
  const router = useRouter()
  const { signIn, isAuthenticated, isAdmin, isLoading, error, clearError, pendingChallenge, completeNewPassword } = useAuth()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push("/admin/analytics")
    }
  }, [isAuthenticated, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSubmitting(true)

    const success = await signIn(username, password)
    
    if (success) {
      router.push("/admin/analytics")
    }
    
    setIsSubmitting(false)
  }

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (newPassword !== confirmPassword) {
      return
    }

    if (newPassword.length < 8) {
      return
    }

    setIsSubmitting(true)
    const success = await completeNewPassword(newPassword)
    
    if (success) {
      router.push("/admin/analytics")
    }
    
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mx-auto mb-4 p-4 rounded-2xl bg-primary/10 w-fit"
            >
              <Shield className="h-10 w-10 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with your Cognito credentials to access QuickSight analytics
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* New Password Required Form */}
            {pendingChallenge?.challengeName === "NEW_PASSWORD_REQUIRED" ? (
              <form onSubmit={handleNewPassword} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3"
                >
                  <Lock className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-primary">Please set a new password to continue</p>
                </motion.div>

                {/* New Password field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    className="h-11 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
                  />
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isSubmitting}
                    className="h-11 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                {/* Show password toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPwd"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="showPwd" className="text-xs text-muted-foreground cursor-pointer">
                    Show passwords
                  </Label>
                </div>

                {/* Submit button */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Setting password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Set New Password
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isSubmitting}
                  className="h-11 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    className="h-11 pr-10 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || !username || !password}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            )}

            {/* Back to dashboard link */}
            <div className="mt-6 pt-4 border-t border-border/30 text-center">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to main dashboard
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Security notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground/60 mt-4"
        >
          Protected by AWS Cognito. Admin group membership required.
        </motion.p>
      </motion.div>
    </div>
  )
}
