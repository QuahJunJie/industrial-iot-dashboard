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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mx-4 lg:mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">
              <span className="font-medium">Connection Error:</span> {error}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
