"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Activity, Wifi, WifiOff, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAegis } from "@/lib/aegis-context"
import { useSettings } from "@/lib/settings-context"
import { SettingsPanel } from "@/components/settings-panel"

export function TopBar() {
  const { isConnected, lastUpdated } = useAegis()
  const { formatTime } = useSettings()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 lg:px-8 py-4"
    >
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-5">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Activity className="h-7 w-7 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Aegis-One</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Industrial IoT</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className={`gap-2 px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                isConnected ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15" : ""
              }`}
            >
              {isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full bg-primary"
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary pulse-glow" />
                  </span>
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Disconnected</span>
                </>
              )}
            </Badge>
          </motion.div>
        </div>

        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Updated{" "}
                <span className="font-mono text-foreground/80">
                  {formatTime(lastUpdated)}
                </span>
              </span>
            </div>
          )}
          
          {/* Settings Panel */}
          <SettingsPanel />
          
          {/* Admin Analytics Link */}
          <Link href="/admin/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 bg-secondary/30 border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  )
}
