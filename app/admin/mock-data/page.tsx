"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Zap, CheckCircle2, Database, Play, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function MockDataPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Single record state
  const [temp, setTemp] = useState(30)
  const [vib, setVib] = useState(1.0)
  const [distance, setDistance] = useState(100)
  const [deviceId, setDeviceId] = useState("aegis-one")

  // Batch generation state
  const [batchCount, setBatchCount] = useState(10)

  const generateData = async (type: "telemetry" | "event" | "scenario", data?: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/mock-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data: data || { temp, vib, distance, deviceId },
          count: type === "telemetry" && data?.batch ? batchCount : 1,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateScenario = async (scenario: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/mock-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "scenario",
          data: { scenario, deviceId },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Scenario Generated",
          description: result.message,
        })
        
        // Navigate to main dashboard after 1.5 seconds
        setTimeout(() => router.push("/"), 1500)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate scenario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (temp > 45 || vib > 2.5 || distance < 30) return "text-destructive"
    if (temp > 35 || vib > 1.5 || distance < 100) return "text-yellow-500"
    return "text-green-500"
  }

  const getStatus = () => {
    if (temp > 45 || vib > 2.5 || distance < 30) return "CRITICAL"
    if (temp > 35 || vib > 1.5 || distance < 100) return "WARNING"
    return "RUNNING"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mock Data Generator</h1>
            <p className="text-muted-foreground mt-1">Generate test data for the AegisOne dashboard</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="single">Single Record</TabsTrigger>
            <TabsTrigger value="batch">Batch Generate</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          {/* Single Record */}
          <TabsContent value="single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Single Telemetry Record</CardTitle>
                <CardDescription>
                  Adjust sliders to create a custom telemetry data point
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Device ID */}
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <Input
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      placeholder="aegis-one"
                    />
                  </div>

                  {/* Status Preview */}
                  <div className="space-y-2">
                    <Label>Predicted Status</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Badge className={getStatusColor()}>{getStatus()}</Badge>
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Temperature (°C)</Label>
                    <span className="text-sm font-mono text-muted-foreground">{temp.toFixed(1)}°C</span>
                  </div>
                  <Slider
                    value={[temp]}
                    onValueChange={([val]) => setTemp(val)}
                    min={20}
                    max={60}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20°C</span>
                    <span className="text-yellow-500">Warning: 35°C</span>
                    <span className="text-destructive">Critical: 45°C</span>
                    <span>60°C</span>
                  </div>
                </div>

                {/* Vibration */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Vibration (mm/s)</Label>
                    <span className="text-sm font-mono text-muted-foreground">{vib.toFixed(2)} mm/s</span>
                  </div>
                  <Slider
                    value={[vib]}
                    onValueChange={([val]) => setVib(val)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className="text-yellow-500">Warning: 1.5</span>
                    <span className="text-destructive">Critical: 2.5</span>
                    <span>5.0</span>
                  </div>
                </div>

                {/* Distance */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Distance (cm)</Label>
                    <span className="text-sm font-mono text-muted-foreground">{distance.toFixed(0)} cm</span>
                  </div>
                  <Slider
                    value={[distance]}
                    onValueChange={([val]) => setDistance(val)}
                    min={0}
                    max={300}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-destructive">Danger: 0cm</span>
                    <span className="text-destructive">Critical: 30cm</span>
                    <span className="text-yellow-500">Warning: 100cm</span>
                    <span>300cm</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => generateData("telemetry")}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Generate Telemetry
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => generateData("event")}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Generate Event
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Generate */}
          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Generate Historical Data</CardTitle>
                <CardDescription>
                  Generate multiple telemetry records with slight variations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Number of Records</Label>
                    <span className="text-sm font-mono text-muted-foreground">{batchCount}</span>
                  </div>
                  <Slider
                    value={[batchCount]}
                    onValueChange={([val]) => setBatchCount(val)}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Records will be spaced 5 seconds apart
                  </p>
                </div>

                <Button
                  onClick={() => generateData("telemetry", { ...{ temp, vib, distance, deviceId }, batch: true })}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating {batchCount} Records...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Generate {batchCount} Records
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Normal Operation */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <CardTitle>Normal Operation</CardTitle>
                    </div>
                    <CardDescription>
                      10 readings with healthy parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>• Temp: 25-30°C</li>
                      <li>• Vibration: 0.3-0.6 mm/s</li>
                      <li>• Distance: 150-200cm</li>
                    </ul>
                    <Button
                      onClick={() => generateScenario("normal")}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Run Scenario
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Warning Escalation */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                      </div>
                      <CardTitle>Warning Escalation</CardTitle>
                    </div>
                    <CardDescription>
                      Gradual increase to warning levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>• Temp: 25°C → 40°C</li>
                      <li>• Vibration: 0.5 → 1.7 mm/s</li>
                      <li>• Distance: 150cm → 80cm</li>
                    </ul>
                    <Button
                      onClick={() => generateScenario("warning")}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Run Scenario
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Critical Alert */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <Zap className="h-6 w-6 text-destructive" />
                      </div>
                      <CardTitle>Critical Alert</CardTitle>
                    </div>
                    <CardDescription>
                      Immediate critical condition spike
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>• Temp: 48-53°C</li>
                      <li>• Vibration: 2.8-3.3 mm/s</li>
                      <li>• Distance: 20-30cm</li>
                    </ul>
                    <Button
                      onClick={() => generateScenario("critical")}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Run Scenario
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
