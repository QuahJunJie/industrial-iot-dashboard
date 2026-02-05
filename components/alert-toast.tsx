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
          initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 400,
            mass: 0.8
          }}
          className={`fixed bottom-8 left-1/2 z-50 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${
            isCritical
              ? "bg-destructive/90 text-destructive-foreground border-destructive/50 shadow-destructive/20"
              : "bg-yellow-500/90 text-yellow-950 border-yellow-400/50 shadow-yellow-500/20"
          }`}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-2 rounded-xl ${isCritical ? "bg-destructive-foreground/10" : "bg-yellow-950/10"}`}
          >
            {isCritical ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </motion.div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {isCritical ? "Critical Alert" : "Warning Alert"}
            </span>
            <span className="text-xs opacity-80">
              {isCritical ? "Immediate attention required" : "Review recommended"}
            </span>
          </div>
          
          {/* Animated pulse ring */}
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`absolute inset-0 rounded-2xl ${isCritical ? "bg-destructive" : "bg-yellow-500"}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
