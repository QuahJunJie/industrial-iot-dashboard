"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  LogOut,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  ExternalLink,
  ChevronLeft,
  User,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isLoading: authLoading, signOut } = useAuth()
  
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [isLoadingEmbed, setIsLoadingEmbed] = useState(false)
  const [embedError, setEmbedError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  // Fetch QuickSight embed URL
  const fetchEmbedUrl = useCallback(async () => {
    if (!user?.accessToken || !user?.idToken) return

    setIsLoadingEmbed(true)
    setEmbedError(null)

    try {
      const response = await fetch("/api/quicksight/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "x-id-token": user.idToken,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load analytics")
      }

      setEmbedUrl(data.embedUrl)
      setLastRefreshed(new Date())
    } catch (err) {
      setEmbedError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setIsLoadingEmbed(false)
    }
  }, [user])

  // Load embed URL on mount
  useEffect(() => {
    if (isAuthenticated && isAdmin && user) {
      fetchEmbedUrl()
    }
  }, [isAuthenticated, isAdmin, user, fetchEmbedUrl])

  const handleSignOut = async () => {
    await signOut()
    router.push("/admin/login")
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying access...</span>
        </motion.div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl"
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-5">
          {/* Top row - Navigation & Actions */}
          <div className="flex items-center justify-between mb-4">
            {/* Left - Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
              
              <div className="h-5 w-px bg-border/40" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/mock-data")}
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                Mock Data
              </Button>
            </div>

            {/* Right - User & Actions */}
            <div className="flex items-center gap-3">
              {/* User info */}
              <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-secondary/40 border border-border/30">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{user?.email || user?.username}</span>
              </div>

              {/* Refresh button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEmbedUrl}
                  disabled={isLoadingEmbed}
                  className="gap-2 h-9 px-4"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingEmbed ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </motion.div>

              {/* Sign out button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 h-9 px-4 bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Bottom row - Title & Status */}
          <div className="flex items-center justify-between">
            {/* Title section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full -z-10" />
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Analytics</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  QuickSight Dashboard Integration
                </p>
              </div>

              <Badge className="bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 font-medium">
                <Shield className="h-3 w-3 mr-1.5" />
                Admin
              </Badge>
            </div>

            {/* Status info */}
            {lastRefreshed && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 border border-border/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last updated
                </span>
                <span className="text-xs font-mono text-foreground font-medium">
                  {lastRefreshed.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative z-10 p-4 lg:p-8 max-w-[1800px] mx-auto"
      >
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-secondary/80">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </span>
                QuickSight Analytics
              </div>
              {embedUrl && (
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  Open in new tab
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {isLoadingEmbed ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col items-center justify-center gap-4"
                >
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium">Loading Analytics</p>
                    <p className="text-sm text-muted-foreground">Generating secure embed URL...</p>
                  </div>
                </motion.div>
              ) : embedError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col items-center justify-center gap-4 p-8"
                >
                  <div className="p-4 rounded-2xl bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="text-center max-w-md">
                    <p className="text-foreground font-medium mb-1">Failed to Load Analytics</p>
                    <p className="text-sm text-muted-foreground mb-4">{embedError}</p>
                    <Button onClick={fetchEmbedUrl} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              ) : embedUrl ? (
                <motion.div
                  key="embed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col items-center justify-center gap-6 p-8"
                >
                  <div className="p-6 rounded-2xl bg-primary/10">
                    <BarChart3 className="h-16 w-16 text-primary" />
                  </div>
                  <div className="text-center max-w-md">
                    <p className="text-xl font-semibold text-foreground mb-2">QuickSight Dashboard Ready</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Due to security policies, QuickSight dashboards cannot be embedded directly. 
                      Click the button below to open your analytics dashboard in a new tab.
                    </p>
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                        <BarChart3 className="h-5 w-5" />
                        Open Analytics Dashboard
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-4">
                      Dashboard will open in a new tab with full interactivity
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col items-center justify-center gap-4"
                >
                  <div className="p-4 rounded-2xl bg-secondary/50">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium">No Analytics Available</p>
                    <p className="text-sm text-muted-foreground">Click refresh to load the dashboard</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Access Level</p>
                  <p className="text-sm font-medium">Administrator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Source</p>
                  <p className="text-sm font-medium">S3 + Athena</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Session Expires</p>
                  <p className="text-sm font-medium">10 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.main>
    </div>
  )
}
