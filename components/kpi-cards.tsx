"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Thermometer, Activity, AlertTriangle, Gauge, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAegis } from "@/lib/aegis-context"
import { useEffect, useState } from "react"

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.15 + i * 0.06 },
  }),
}

const hoverVariants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: { y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.25)" },
}

function DeltaChip({ current, previous, unit }: { current: number; previous: number; unit: string }) {
  const delta = current - previous
  const isPositive = delta > 0

  if (Math.abs(delta) < 0.01) return null

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${isPositive ? "text-yellow-500" : "text-primary"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}
      {delta.toFixed(1)}
      {unit}
    </span>
  )
}

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const duration = 300
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (value - startValue) * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <>{displayValue.toFixed(decimals)}</>
}

export function KpiCards() {
  const { data, isLoading, newAlert, clearNewAlert } = useAegis()
  const [showPulse, setShowPulse] = useState(false)
  const [pulseIntensity, setPulseIntensity] = useState<"warning" | "critical">("warning")

  const latest = data?.telemetry?.[data.telemetry.length - 1]
  const previous = data?.telemetry?.[data.telemetry.length - 2]
  const latestEvent = data?.events?.[0]

  // Handle new alert pulse
  useEffect(() => {
    if (newAlert) {
      setPulseIntensity(newAlert.severity === "CRITICAL" ? "critical" : "warning")
      setShowPulse(true)
      const timer = setTimeout(() => {
        setShowPulse(false)
        clearNewAlert()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [newAlert, clearNewAlert])

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "RUNNING":
        return "bg-primary text-primary-foreground"
      case "WARNING":
        return "bg-yellow-500 text-yellow-950"
      case "CRITICAL":
      case "STOPPED":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-destructive text-destructive-foreground"
      case "WARNING":
        return "bg-yellow-500 text-yellow-950"
      case "INFO":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const kpis = [
    {
      label: "Status",
      icon: <Activity className="h-4 w-4" />,
      value: latest?.status || "N/A",
      isBadge: true,
      badgeClass: getStatusColor(latest?.status),
    },
    {
      label: "Temperature",
      icon: <Thermometer className="h-4 w-4" />,
      value: latest?.temp,
      unit: "°C",
      delta: previous && latest ? { current: latest.temp, previous: previous.temp, unit: "°" } : null,
    },
    {
      label: "Vibration",
      icon: <Gauge className="h-4 w-4" />,
      value: latest?.vib,
      unit: "mm/s",
      delta: previous && latest ? { current: latest.vib, previous: previous.vib, unit: "" } : null,
    },
    {
      label: "Severity",
      icon: <AlertTriangle className="h-4 w-4" />,
      value: latestEvent?.severity || "None",
      isBadge: true,
      badgeClass: getSeverityColor(latestEvent?.severity),
      showPulse: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <motion.div variants={hoverVariants}>
            <Card className="bg-card border-border relative overflow-hidden">
              {/* Pulse effect for severity card */}
              <AnimatePresence>
                {kpi.showPulse && showPulse && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-lg ${
                      pulseIntensity === "critical" ? "bg-destructive" : "bg-yellow-500"
                    }`}
                  />
                )}
              </AnimatePresence>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  {kpi.icon}
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && !data ? (
                  <Skeleton className="h-8 w-20" />
                ) : kpi.isBadge ? (
                  <Badge className={kpi.badgeClass}>{kpi.value}</Badge>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-foreground">
                        {typeof kpi.value === "number" ? (
                          <AnimatedNumber value={kpi.value} />
                        ) : (
                          kpi.value ?? "N/A"
                        )}
                      </span>
                      {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
                    </div>
                    {kpi.delta && (
                      <DeltaChip
                        current={kpi.delta.current}
                        previous={kpi.delta.previous}
                        unit={kpi.delta.unit}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
