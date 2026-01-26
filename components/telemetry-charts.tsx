"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useAegis } from "@/lib/aegis-context"

type ChartTab = "temperature" | "vibration"
type RangeValue = "30" | "60" | "120"

export function TelemetryCharts() {
  const { data, isLoading } = useAegis()
  const [activeTab, setActiveTab] = useState<ChartTab>("temperature")
  const [range, setRange] = useState<RangeValue>("60")

  const chartData = useMemo(() => {
    if (!data?.telemetry) return []
    const sliced = data.telemetry.slice(-Number.parseInt(range))
    return sliced.map((item) => ({
      time: new Date(item.ts).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      temp: item.temp,
      vib: item.vib,
      ts: item.ts,
    }))
  }, [data?.telemetry, range])

  const chartConfig = {
    temperature: {
      dataKey: "temp",
      stroke: "#f97316",
      label: "Temperature (°C)",
      domain: [0, "auto"] as [number, "auto"],
    },
    vibration: {
      dataKey: "vib",
      stroke: "#22c55e",
      label: "Vibration (mm/s)",
      domain: [0, "auto"] as [number, "auto"],
    },
  }

  const config = chartConfig[activeTab]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-foreground">Telemetry Charts</CardTitle>
            <div className="flex items-center gap-3">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ChartTab)}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="temperature">Temperature</TabsTrigger>
                  <TabsTrigger value="vibration">Vibration</TabsTrigger>
                </TabsList>
              </Tabs>
              <ToggleGroup
                type="single"
                value={range}
                onValueChange={(v) => v && setRange(v as RangeValue)}
                className="bg-secondary rounded-md"
              >
                <ToggleGroupItem value="30" className="text-xs px-2 h-8">
                  30
                </ToggleGroupItem>
                <ToggleGroupItem value="60" className="text-xs px-2 h-8">
                  60
                </ToggleGroupItem>
                <ToggleGroupItem value="120" className="text-xs px-2 h-8">
                  120
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No telemetry yet — publish to topic aegisone/telemetry
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "#888", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#333" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={config.domain}
                        tick={{ fill: "#888", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#333" }}
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
                        formatter={(value: number) => [value.toFixed(2), config.label]}
                        cursor={{ stroke: "#444" }}
                      />
                      <Line
                        type="monotone"
                        dataKey={config.dataKey}
                        stroke={config.stroke}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
