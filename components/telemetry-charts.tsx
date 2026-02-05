"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAegis } from "@/lib/aegis-context"
import { Thermometer, Gauge, BarChart3 } from "lucide-react"

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
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 card-hover h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-foreground flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-secondary/80">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            Telemetry
          </CardTitle>
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ChartTab)}>
              <TabsList className="bg-secondary/60 p-1 h-auto">
                <TabsTrigger 
                  value="temperature" 
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5 transition-all duration-200"
                >
                  <Thermometer className="h-3.5 w-3.5" />
                  Temp
                </TabsTrigger>
                <TabsTrigger 
                  value="vibration"
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5 transition-all duration-200"
                >
                  <Gauge className="h-3.5 w-3.5" />
                  Vib
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={(v) => v && setRange(v as RangeValue)}
              className="bg-secondary/40 rounded-lg p-0.5"
            >
              <ToggleGroupItem value="30" className="text-xs px-2.5 h-7 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm transition-all duration-200">
                30
              </ToggleGroupItem>
              <ToggleGroupItem value="60" className="text-xs px-2.5 h-7 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm transition-all duration-200">
                60
              </ToggleGroupItem>
              <ToggleGroupItem value="120" className="text-xs px-2.5 h-7 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm transition-all duration-200">
                120
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !data ? (
          <div className="h-[300px] w-full shimmer rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm">No telemetry data available</p>
            <p className="text-xs text-muted-foreground/60">Publish to topic aegisone/telemetry</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${config.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={config.stroke} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={config.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" strokeOpacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46", strokeOpacity: 0.5 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={config.domain}
                      tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46", strokeOpacity: 0.5 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        padding: "12px",
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                      itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
                      formatter={(value: number) => [value.toFixed(2), config.label]}
                      cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3, strokeDasharray: "5 5" }}
                    />
                    <Area
                      type="monotone"
                      dataKey={config.dataKey}
                      stroke={config.stroke}
                      strokeWidth={2.5}
                      fill={`url(#gradient-${config.dataKey})`}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
