"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Bell } from "lucide-react"
import { useAegis } from "@/lib/aegis-context"

export function AlertToast() {
  const { newAlert } = useAegis()

  const isCritical = newAlert?.severity === "CRITICAL"

  return (
    <AnimatePresence>
      {newAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            isCritical
              ? "bg-destructive text-destructive-foreground"
              : "bg-yellow-500 text-yellow-950"
          }`}
        >
          {isCritical ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="font-medium text-sm">
            {isCritical ? "CRITICAL alert received" : "Warning alert received"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
