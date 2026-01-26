"use client"

import { motion } from "framer-motion"
import { RefreshCw, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAegis } from "@/lib/aegis-context"
import { useState } from "react"

export function ControlsCard() {
  const { config, setConfig, autoRefresh, setAutoRefresh, refresh, isLoading } = useAegis()
  const [copied, setCopied] = useState(false)

  const requestUrl = `${config.apiBaseUrl}/data?deviceId=${config.deviceId}&limit=${config.limit}`

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(requestUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="apiBaseUrl" className="text-xs text-muted-foreground">
                API Base URL
              </Label>
              <Input
                id="apiBaseUrl"
                value={config.apiBaseUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
                className="bg-secondary border-border text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deviceId" className="text-xs text-muted-foreground">
                Device ID
              </Label>
              <Input
                id="deviceId"
                value={config.deviceId}
                onChange={(e) => setConfig((prev) => ({ ...prev, deviceId: e.target.value }))}
                className="bg-secondary border-border text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit" className="text-xs text-muted-foreground">
                Limit
              </Label>
              <Select
                value={config.limit.toString()}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, limit: Number.parseInt(value) }))}
              >
                <SelectTrigger id="limit" className="bg-secondary border-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="120">120</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="h-9 gap-1.5 bg-transparent"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="autoRefresh" className="text-xs text-muted-foreground whitespace-nowrap">
                  Auto
                </Label>
                <Switch
                  id="autoRefresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
            <code className="text-xs text-muted-foreground flex-1 truncate font-mono">
              {requestUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleCopyUrl}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
