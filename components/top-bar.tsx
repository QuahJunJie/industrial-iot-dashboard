"use client"

import { motion } from "framer-motion"
import { Activity, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAegis } from "@/lib/aegis-context"

export function TopBar() {
  const { isConnected, lastUpdated } = useAegis()

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
          className="flex items-center gap-4"
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
                  {lastUpdated.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  )
}
