"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAegis } from "@/lib/aegis-context"
import { useState, useEffect } from "react"

export function ErrorBanner() {
  const { error } = useAegis()
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state when error changes
  useEffect(() => {
    if (error) {
      setDismissed(false)
    }
  }, [error])

  const showBanner = error && !dismissed

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-4 lg:mx-8 mt-4 max-w-[1600px] mx-auto"
        >
          <div className="p-4 bg-destructive/10 backdrop-blur-sm border border-destructive/20 rounded-xl flex items-center justify-between gap-4 shadow-lg shadow-destructive/5">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-lg bg-destructive/15">
                <AlertTriangle className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <span className="text-sm font-semibold block">Connection Error</span>
                <span className="text-xs text-destructive/80">{error}</span>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
