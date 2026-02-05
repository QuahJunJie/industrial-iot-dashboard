"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts"

interface DataPoint {
  time: string
  value: number
  timestamp: number
}

const THRESHOLD_WARNING = 4.5
const THRESHOLD_CRITICAL = 6.0

export function VibrationChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [currentValue, setCurrentValue] = useState(0)
  const [status, setStatus] = useState<"normal" | "warning" | "critical">("normal")

  const generateDataPoint = useCallback((): DataPoint => {
    const now = new Date()
    // Simulate realistic vibration data with occasional spikes
    const baseValue = 2.5 + Math.sin(now.getTime() / 2000) * 1.5
    const noise = (Math.random() - 0.5) * 1.5
    const spike = Math.random() > 0.95 ? Math.random() * 3 : 0
    const value = Math.max(0, baseValue + noise + spike)

    return {
      time: now.toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" }),
      value: Number(value.toFixed(2)),
      timestamp: now.getTime(),
    }
  }, [])

  useEffect(() => {
    // Initialize with historical data
    const initialData: DataPoint[] = []
    for (let i = 30; i >= 0; i--) {
      const point = generateDataPoint()
      point.timestamp = Date.now() - i * 1000
      point.time = new Date(point.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      })
      initialData.push(point)
    }
    setData(initialData)

    // Update data every 500ms for smooth animation
    const interval = setInterval(() => {
      const newPoint = generateDataPoint()
      setCurrentValue(newPoint.value)

      // Update status based on value
      if (newPoint.value >= THRESHOLD_CRITICAL) {
        setStatus("critical")
      } else if (newPoint.value >= THRESHOLD_WARNING) {
        setStatus("warning")
      } else {
        setStatus("normal")
      }

      setData((prev) => {
        const updated = [...prev, newPoint]
        return updated.slice(-60) // Keep last 60 points
      })
    }, 500)

    return () => clearInterval(interval)
  }, [generateDataPoint])

  const statusColor = {
    normal: "bg-primary text-primary-foreground",
    warning: "bg-yellow-500 text-yellow-950",
    critical: "bg-destructive text-destructive-foreground animate-pulse",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Vibration Monitor</CardTitle>
            <CardDescription>Motor Assembly Unit A-7 · Real-time FFT Analysis</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={statusColor[status]}>{status.toUpperCase()}</Badge>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">{currentValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">mm/s RMS</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46", strokeOpacity: 0.5 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 8]}
                tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46", strokeOpacity: 0.5 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value.toFixed(2)} mm/s`, "Vibration"]}
                cursor={{ stroke: "#444" }}
              />
              <ReferenceLine
                y={THRESHOLD_WARNING}
                stroke="#eab308"
                strokeDasharray="4 4"
                label={{ value: "Warning", fill: "#eab308", fontSize: 10 }}
              />
              <ReferenceLine
                y={THRESHOLD_CRITICAL}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Sampling: 500ms</span>
          <span>Sensor: VIB-A7-001</span>
          <span>Last Cal: 2025-12-01</span>
        </div>
      </CardContent>
    </Card>
  )
}
