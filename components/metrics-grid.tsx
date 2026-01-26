"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Gauge, Zap, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Metric {
  label: string
  value: number
  unit: string
  icon: React.ReactNode
  trend: "up" | "down" | "stable"
  trendValue: string
  min?: number
  max?: number
}

export function MetricsGrid() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: "Temperature",
      value: 42.3,
      unit: "°C",
      icon: <Thermometer className="h-5 w-5" />,
      trend: "stable",
      trendValue: "+0.2°",
      min: 0,
      max: 100,
    },
    {
      label: "Pressure",
      value: 2.45,
      unit: "bar",
      icon: <Gauge className="h-5 w-5" />,
      trend: "up",
      trendValue: "+0.05",
      min: 0,
      max: 5,
    },
    {
      label: "Power Draw",
      value: 12.8,
      unit: "kW",
      icon: <Zap className="h-5 w-5" />,
      trend: "down",
      trendValue: "-0.3",
      min: 0,
      max: 20,
    },
    {
      label: "Runtime",
      value: 847,
      unit: "hrs",
      icon: <Clock className="h-5 w-5" />,
      trend: "up",
      trendValue: "+1",
      min: 0,
      max: 1000,
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          const change = (Math.random() - 0.5) * 0.5
          const newValue = Math.max(metric.min || 0, Math.min(metric.max || 100, metric.value + change))
          const trend = change > 0.1 ? "up" : change < -0.1 ? "down" : "stable"
          return {
            ...metric,
            value: Number(newValue.toFixed(metric.unit === "hrs" ? 0 : 1)),
            trend,
            trendValue: change > 0 ? `+${Math.abs(change).toFixed(1)}` : `-${Math.abs(change).toFixed(1)}`,
          }
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-primary" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-yellow-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {metric.icon}
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-foreground">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {getTrendIcon(metric.trend)}
              <span className="text-muted-foreground">{metric.trendValue}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
