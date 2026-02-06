"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Thermometer, Activity, AlertTriangle, Gauge, TrendingUp, TrendingDown, Radar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAegis } from "@/lib/aegis-context"
import { useEffect, useState } from "react"

interface KpiItem {
  label: string
  icon: React.ReactNode
  value: string | number | undefined
  unit?: string
  isBadge?: boolean
  badgeClass?: string
  subValue?: string
  showPulse?: boolean
  delta?: { current: number; previous: number; unit: string } | null
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.5, 
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    },
  }),
}

const hoverVariants = {
  rest: { 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  hover: { 
    y: -4, 
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" }
  },
}

function DeltaChip({ current, previous, unit }: { current: number; previous: number; unit: string }) {
  const delta = current - previous
  const isPositive = delta > 0

  if (Math.abs(delta) < 0.01) return null

  return (
    <motion.span 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
        isPositive 
          ? "text-yellow-400 bg-yellow-500/10" 
          : "text-primary bg-primary/10"
      }`}
    >
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}
      {delta.toFixed(1)}
      {unit}
    </motion.span>
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

  // Sort telemetry by timestamp to ensure latest is actually the most recent
  const sortedTelemetry = data?.telemetry ? [...data.telemetry].sort((a, b) => a.ts - b.ts) : []
  
  const latest = sortedTelemetry[sortedTelemetry.length - 1]
  const previous = sortedTelemetry[sortedTelemetry.length - 2]
  const latestEvent = data?.events?.[0]
  
  // Debug logging
  useEffect(() => {
    if (latest) {
      console.log("[v0] Latest telemetry:", {
        timestamp: latest.ts,
        date: new Date(latest.ts).toISOString(),
        temp: latest.temp,
        vib: latest.vib,
        distance: latest.distance
      })
    }
  }, [latest])

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

  const getProximityColor = (proximity?: string) => {
    switch (proximity?.toUpperCase()) {
      case "DANGER":
        return "bg-destructive text-destructive-foreground"
      case "WARNING":
        return "bg-yellow-500 text-yellow-950"
      case "SAFE":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Calculate proximity status from distance (configurable thresholds)
  const getProximityStatus = (distance?: number): "SAFE" | "WARNING" | "DANGER" | undefined => {
    if (distance === undefined || distance === null) return undefined
    if (distance < 30) return "DANGER"   // < 30cm = danger zone
    if (distance < 100) return "WARNING" // < 100cm = warning zone
    return "SAFE"
  }

  // Determine proximity status (from data or calculated)
  const proximityStatus = latest?.proximity || getProximityStatus(latest?.distance)

  const kpis: KpiItem[] = [
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
    // Show Distance KPI if ultrasonic data is available, otherwise show Severity
    ...(latest?.distance !== undefined ? [{
      label: "Proximity",
      icon: <Radar className="h-4 w-4" />,
      value: proximityStatus || "N/A",
      subValue: latest?.distance !== undefined ? `${latest.distance.toFixed(0)} cm` : undefined,
      isBadge: true,
      badgeClass: getProximityColor(proximityStatus),
    }] : [{
      label: "Severity",
      icon: <AlertTriangle className="h-4 w-4" />,
      value: latestEvent?.severity || "None",
      isBadge: true,
      badgeClass: getSeverityColor(latestEvent?.severity),
      showPulse: true,
    }]),
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
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
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden group card-hover">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Pulse effect for severity card */}
              <AnimatePresence>
                {kpi.showPulse && showPulse && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-lg ${
                      pulseIntensity === "critical" ? "bg-destructive" : "bg-yellow-500"
                    }`}
                  />
                )}
              </AnimatePresence>
              
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-secondary/80 text-foreground/70">
                    {kpi.icon}
                  </span>
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                {isLoading && !data ? (
                  <div className="h-8 w-20 shimmer rounded" />
                ) : kpi.isBadge ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1"
                  >
                    <Badge className={`${kpi.badgeClass} text-xs font-semibold px-3 py-1`}>{kpi.value}</Badge>
                    {kpi.subValue && (
                      <span className="text-xs text-muted-foreground font-mono">{kpi.subValue}</span>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-mono font-bold text-foreground tracking-tight">
                        {typeof kpi.value === "number" ? (
                          <AnimatedNumber value={kpi.value} />
                        ) : (
                          kpi.value ?? "N/A"
                        )}
                      </span>
                      {kpi.unit && <span className="text-sm text-muted-foreground font-medium">{kpi.unit}</span>}
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
