"use client"

import { useState } from "react"
import { AlertTriangle, Power, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EmergencyStop() {
  const [isTriggered, setIsTriggered] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleEmergencyStop = () => {
    setIsTriggered(true)
    setShowConfirm(false)
  }

  const handleReset = () => {
    setIsTriggered(false)
    setShowResetConfirm(false)
  }

  return (
    <>
      <Card className="bg-card border-border w-full max-w-xs">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-foreground flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Emergency Control
          </CardTitle>
          <CardDescription>{isTriggered ? "SYSTEM HALTED" : "All systems operational"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!isTriggered ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="relative group w-40 h-40 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[0_8px_0_0_#7f1d1d,0_12px_20px_rgba(0,0,0,0.5)] active:shadow-[0_4px_0_0_#7f1d1d,0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all duration-75 flex items-center justify-center hover:from-red-400 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50"
              aria-label="Emergency Stop"
            >
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center">
                <div className="text-center">
                  <Power className="h-10 w-10 text-white mx-auto mb-1" />
                  <span className="text-white font-bold text-sm tracking-wider">E-STOP</span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-red-400/30" />
            </button>
          ) : (
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-b from-red-800 to-red-950 shadow-[0_4px_0_0_#450a0a,0_6px_10px_rgba(0,0,0,0.5)] flex items-center justify-center animate-pulse">
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-red-900 to-red-950 flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-red-400 font-bold text-sm tracking-wider">STOPPED</span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-pulse" />
            </div>
          )}

          {isTriggered && (
            <Button variant="outline" onClick={() => setShowResetConfirm(true)} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset System
            </Button>
          )}

          <div
            className={`text-xs font-mono ${isTriggered ? "text-destructive animate-pulse" : "text-muted-foreground"}`}
          >
            {isTriggered ? "⚠ ALL OPERATIONS HALTED" : "Press to halt all operations"}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Stop Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Emergency Stop
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately halt all equipment and processes. This action should only be used in emergencies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencyStop}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              STOP ALL SYSTEMS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Emergency Stop</AlertDialogTitle>
            <AlertDialogDescription>
              Ensure all personnel are clear and it is safe to resume operations before resetting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Confirm Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
