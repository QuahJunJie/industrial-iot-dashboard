"use client"

import { motion } from "framer-motion"
import { Activity, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAegis } from "@/lib/aegis-context"

export function TopBar() {
  const { isConnected, lastUpdated } = useAegis()

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="border-b border-border bg-card px-4 lg:px-6 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Aegis-One Dashboard</h1>
          </div>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="gap-1.5 pr-2"
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
                </span>
                <Wifi className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              Last updated:{" "}
              <span className="font-mono">
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </span>
          )}
        </div>
      </div>
    </motion.header>
  )
}
