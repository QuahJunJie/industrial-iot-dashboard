"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  X,
  Monitor,
  Bell,
  Clock,
  Thermometer,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Gauge,
  Info,
  RotateCcw,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAegis } from "@/lib/aegis-context"

// Settings type
export interface AppSettings {
  // Display
  theme: "dark" | "light" | "system"
  compactMode: boolean
  enableAnimations: boolean
  
  // Data & Refresh
  refreshInterval: number // in seconds
  autoRefreshDefault: boolean
  
  // Alerts
  soundEnabled: boolean
  tempWarningThreshold: number
  tempCriticalThreshold: number
  vibWarningThreshold: number
  vibCriticalThreshold: number
  
  // Units
  temperatureUnit: "celsius" | "fahrenheit"
  timeFormat: "12h" | "24h"
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  compactMode: false,
  enableAnimations: true,
  refreshInterval: 5,
  autoRefreshDefault: true,
  soundEnabled: true,
  tempWarningThreshold: 35,
  tempCriticalThreshold: 45,
  vibWarningThreshold: 1.5,
  vibCriticalThreshold: 2.5,
  temperatureUnit: "celsius",
  timeFormat: "24h",
}

const STORAGE_KEY = "aegis-one-settings"

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const { isConnected, autoRefresh, setAutoRefresh } = useAegis()
  
  console.log("[v0] SettingsPanel rendered, isOpen:", isOpen)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
    
    // Apply auto-refresh setting immediately
    if (key === "autoRefreshDefault") {
      setAutoRefresh(value as boolean)
    }
  }

  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS)
    setAutoRefresh(DEFAULT_SETTINGS.autoRefreshDefault)
  }

  return (
    <>
      {/* Settings Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            console.log("[v0] Settings button clicked")
            setIsOpen(true)
          }}
          className="h-9 w-9 bg-secondary/30 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border/50 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/80">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <p className="text-xs text-muted-foreground">Configure your dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-primary text-xs"
                    >
                      <Check className="h-3 w-3" />
                      Saved
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Display Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Monitor className="h-4 w-4 text-primary" />
                  Display
                </div>
                
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Theme</Label>
                      <p className="text-xs text-muted-foreground">Choose your color scheme</p>
                    </div>
                    <Select
                      value={settings.theme}
                      onValueChange={(v) => updateSetting("theme", v as AppSettings["theme"])}
                    >
                      <SelectTrigger className="w-32 h-9 bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">
                          <span className="flex items-center gap-2">
                            <Moon className="h-3 w-3" /> Dark
                          </span>
                        </SelectItem>
                        <SelectItem value="light">
                          <span className="flex items-center gap-2">
                            <Sun className="h-3 w-3" /> Light
                          </span>
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(v) => updateSetting("compactMode", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Animations</Label>
                      <p className="text-xs text-muted-foreground">Enable smooth transitions</p>
                    </div>
                    <Switch
                      checked={settings.enableAnimations}
                      onCheckedChange={(v) => updateSetting("enableAnimations", v)}
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-border/30" />

              {/* Data & Refresh Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Data & Refresh
                </div>
                
                <div className="space-y-4 pl-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Refresh Interval</Label>
                      <span className="text-sm font-mono text-primary">{settings.refreshInterval}s</span>
                    </div>
                    <Slider
                      value={[settings.refreshInterval]}
                      onValueChange={([v]) => updateSetting("refreshInterval", v)}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5s (Fast)</span>
                      <span>60s (Slow)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Auto-refresh by default</Label>
                      <p className="text-xs text-muted-foreground">Start refreshing on load</p>
                    </div>
                    <Switch
                      checked={settings.autoRefreshDefault}
                      onCheckedChange={(v) => updateSetting("autoRefreshDefault", v)}
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-border/30" />

              {/* Alerts Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Bell className="h-4 w-4 text-primary" />
                  Alerts & Notifications
                </div>
                
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <Label className="text-sm">Sound Notifications</Label>
                        <p className="text-xs text-muted-foreground">Play sound on alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(v) => updateSetting("soundEnabled", v)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Temperature Thresholds</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-500 mb-1">Warning</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-bold text-foreground">
                            {settings.tempWarningThreshold}
                          </span>
                          <span className="text-xs text-muted-foreground">°C</span>
                        </div>
                        <Slider
                          value={[settings.tempWarningThreshold]}
                          onValueChange={([v]) => updateSetting("tempWarningThreshold", v)}
                          min={25}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive mb-1">Critical</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-bold text-foreground">
                            {settings.tempCriticalThreshold}
                          </span>
                          <span className="text-xs text-muted-foreground">°C</span>
                        </div>
                        <Slider
                          value={[settings.tempCriticalThreshold]}
                          onValueChange={([v]) => updateSetting("tempCriticalThreshold", v)}
                          min={35}
                          max={60}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Vibration Thresholds</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-500 mb-1">Warning</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-bold text-foreground">
                            {settings.vibWarningThreshold.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">g</span>
                        </div>
                        <Slider
                          value={[settings.vibWarningThreshold * 10]}
                          onValueChange={([v]) => updateSetting("vibWarningThreshold", v / 10)}
                          min={5}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive mb-1">Critical</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-bold text-foreground">
                            {settings.vibCriticalThreshold.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">g</span>
                        </div>
                        <Slider
                          value={[settings.vibCriticalThreshold * 10]}
                          onValueChange={([v]) => updateSetting("vibCriticalThreshold", v / 10)}
                          min={15}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Separator className="bg-border/30" />

              {/* Units Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Thermometer className="h-4 w-4 text-primary" />
                  Units & Format
                </div>
                
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Temperature Unit</Label>
                    <Select
                      value={settings.temperatureUnit}
                      onValueChange={(v) => updateSetting("temperatureUnit", v as AppSettings["temperatureUnit"])}
                    >
                      <SelectTrigger className="w-32 h-9 bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Time Format</Label>
                    <Select
                      value={settings.timeFormat}
                      onValueChange={(v) => updateSetting("timeFormat", v as AppSettings["timeFormat"])}
                    >
                      <SelectTrigger className="w-32 h-9 bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-hour</SelectItem>
                        <SelectItem value="12h">12-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <Separator className="bg-border/30" />

              {/* About Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Info className="h-4 w-4 text-primary" />
                  About
                </div>
                
                <div className="space-y-3 pl-6">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Version</span>
                      <Badge variant="secondary" className="font-mono">1.0.0</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Status</span>
                      <Badge className={isConnected ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}>
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Auto-refresh</span>
                      <Badge variant="secondary">{autoRefresh ? "Active" : "Paused"}</Badge>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/30">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="w-full gap-2 bg-secondary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
