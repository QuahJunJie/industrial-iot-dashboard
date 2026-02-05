"use client"

import { motion } from "framer-motion"
import { RefreshCw, Copy, Check, Settings2, Server, Hash, Layers } from "lucide-react"
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
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 card-hover overflow-hidden">
      {/* Subtle top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-secondary/80">
            <Settings2 className="h-4 w-4 text-primary" />
          </span>
          API Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label htmlFor="apiBaseUrl" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Server className="h-3 w-3" />
              API Base URL
            </Label>
            <Input
              id="apiBaseUrl"
              value={config.apiBaseUrl}
              onChange={(e) => setConfig((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
              className="bg-secondary/60 border-border/50 text-sm h-10 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deviceId" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3 w-3" />
              Device ID
            </Label>
            <Input
              id="deviceId"
              value={config.deviceId}
              onChange={(e) => setConfig((prev) => ({ ...prev, deviceId: e.target.value }))}
              className="bg-secondary/60 border-border/50 text-sm h-10 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              Limit
            </Label>
            <Select
              value={config.limit.toString()}
              onValueChange={(value) => setConfig((prev) => ({ ...prev, limit: Number.parseInt(value) }))}
            >
              <SelectTrigger id="limit" className="bg-secondary/60 border-border/50 h-10 focus:bg-secondary transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="30">30 records</SelectItem>
                <SelectItem value="60">60 records</SelectItem>
                <SelectItem value="120">120 records</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="h-10 gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-foreground transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </motion.div>
            <div className="flex items-center gap-3 ml-auto px-3 py-2 rounded-lg bg-secondary/40">
              <Label htmlFor="autoRefresh" className="text-xs text-muted-foreground whitespace-nowrap">
                Auto-refresh
              </Label>
              <Switch
                id="autoRefresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Request URL</p>
            <code className="text-xs text-foreground/80 block truncate font-mono">
              {requestUrl}
            </code>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-primary/10"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
