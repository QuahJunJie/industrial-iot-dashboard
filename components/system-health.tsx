"use client"

import { motion } from "framer-motion"
import { Clock, Percent, Timer, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAegis } from "@/lib/aegis-context"
import { useMemo } from "react"

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.4 + i * 0.06 },
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
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
              value
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {value ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {label}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.45 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            System Health
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                  <p className="text-xs">
                    Real-time system metrics including alert frequency, operational uptime,
                    and test validation status.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {healthItems.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-3 bg-secondary/50 rounded-lg"
              >
                {isLoading && !data ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="text-lg font-mono font-semibold text-foreground">
                      {item.value}
                      <span className="text-xs text-muted-foreground ml-0.5">
                        {item.suffix}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Validation Widget */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Test Validation</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p className="text-xs">
                      These flags indicate test validation results from the anomaly detection
                      system. Used to measure detection accuracy.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {isLoading && !data ? (
              <Skeleton className="h-8 w-full" />
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
              <span className="text-xs text-muted-foreground">No validation data</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
