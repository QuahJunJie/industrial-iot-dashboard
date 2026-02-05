"use client"

import { motion } from "framer-motion"
import { Clock, Percent, Timer, CheckCircle, XCircle, HelpCircle, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAegis } from "@/lib/aegis-context"
import { useMemo } from "react"

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      delay: 0.1 + i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94]
    },
  }),
}

interface ValidationBadgeProps {
  label: string
  value: boolean
  tooltip: string
}

function ValidationBadge({ label, value, tooltip }: ValidationBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-default transition-colors duration-200 ${
              value
                ? "bg-primary/15 text-primary border border-primary/20"
                : "bg-secondary/60 text-muted-foreground border border-transparent"
            }`}
          >
            {value ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {label}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] bg-card border-border">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function SystemHealth() {
  const { data, isLoading } = useAegis()

  const stats = useMemo(() => {
    if (!data) return null

    // Alert rate: events in last 10 minutes
    const tenMinAgo = Date.now() - 10 * 60 * 1000
    const recentEvents = data.events?.filter((e) => e.eventTs > tenMinAgo) || []
    const alertRate = recentEvents.length

    // Uptime: % of telemetry where status === "RUNNING"
    const runningCount = data.telemetry?.filter((t) => t.status === "RUNNING").length || 0
    const totalCount = data.telemetry?.length || 1
    const uptime = (runningCount / totalCount) * 100

    // Sample interval from latest event
    const latestEvent = data.events?.[0]
    const sampleInterval = latestEvent?.details?.sampleIntervalMs

    // Validation from latest event
    const validation = latestEvent?.details
      ? {
          tp: latestEvent.details.tp,
          fp: latestEvent.details.fp,
          tn: latestEvent.details.tn,
          fn: latestEvent.details.fn,
        }
      : null

    return { alertRate, uptime, sampleInterval, validation }
  }, [data])

  const healthItems = [
    {
      label: "Alert Rate",
      icon: <Clock className="h-4 w-4" />,
      value: stats?.alertRate ?? "—",
      suffix: "/10min",
    },
    {
      label: "Uptime",
      icon: <Percent className="h-4 w-4" />,
      value: stats?.uptime?.toFixed(1) ?? "—",
      suffix: "%",
    },
    {
      label: "Sample Interval",
      icon: <Timer className="h-4 w-4" />,
      value: stats?.sampleInterval ?? "N/A",
      suffix: stats?.sampleInterval ? "ms" : "",
    },
  ]

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 card-hover h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-secondary/80">
            <HeartPulse className="h-4 w-4 text-primary" />
          </span>
          System Health
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px] bg-card border-border">
                <p className="text-xs">
                  Real-time system metrics including alert frequency, operational uptime,
                  and test validation status.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {healthItems.map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-secondary/40 rounded-xl border border-border/30 hover:border-primary/20 transition-colors duration-300"
            >
              {isLoading && !data ? (
                <div className="h-12 w-full shimmer rounded" />
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    <span className="text-primary/70">{item.icon}</span>
                    {item.label}
                  </div>
                  <div className="text-xl font-mono font-bold text-foreground">
                    {item.value}
                    <span className="text-xs text-muted-foreground/70 ml-1 font-normal">
                      {item.suffix}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Validation Widget */}
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground font-medium">Test Validation</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px] bg-card border-border">
                  <p className="text-xs">
                    These flags indicate test validation results from the anomaly detection
                    system. Used to measure detection accuracy.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isLoading && !data ? (
            <div className="h-8 w-full shimmer rounded" />
          ) : stats?.validation ? (
            <div className="flex flex-wrap gap-2">
              <ValidationBadge
                label="TP"
                value={stats.validation.tp}
                tooltip="True Positive: Correctly detected a real anomaly"
              />
              <ValidationBadge
                label="FP"
                value={stats.validation.fp}
                tooltip="False Positive: Incorrectly flagged as anomaly when normal"
              />
              <ValidationBadge
                label="TN"
                value={stats.validation.tn}
                tooltip="True Negative: Correctly identified normal behavior"
              />
              <ValidationBadge
                label="FN"
                value={stats.validation.fn}
                tooltip="False Negative: Missed a real anomaly"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <XCircle className="h-3.5 w-3.5" />
              No validation data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
