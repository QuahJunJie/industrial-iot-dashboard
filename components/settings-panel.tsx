"use client"

import { useState, useEffect } from "react"
import {
  Settings,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAegis } from "@/lib/aegis-context"

export interface AppSettings {
  theme: "dark" | "light" | "system"
  compactMode: boolean
  enableAnimations: boolean
  refreshInterval: number
  autoRefreshDefault: boolean
  soundEnabled: boolean
  tempWarningThreshold: number
  tempCriticalThreshold: number
  vibWarningThreshold: number
  vibCriticalThreshold: number
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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const { isConnected, autoRefresh, setAutoRefresh } = useAegis()

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

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
    if (key === "autoRefreshDefault") {
      setAutoRefresh(value as boolean)
    }
  }

  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS)
    setAutoRefresh(DEFAULT_SETTINGS.autoRefreshDefault)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-secondary/30 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full max-w-md flex flex-col">
        <SheetHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle>Settings</SheetTitle>
            </div>
            {saved && (
              <Badge variant="outline" className="gap-1 text-primary border-primary/30">
                <Check className="h-3 w-3" />
                Saved
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-2">
          {/* Display Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4 text-primary" />
              Display
            </div>
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Theme</Label>
                  <p className="text-xs text-muted-foreground">Color scheme</p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(v) => updateSetting("theme", v as AppSettings["theme"])}
                >
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2"><Moon className="h-3 w-3" /> Dark</span>
                    </SelectItem>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2"><Sun className="h-3 w-3" /> Light</span>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce spacing</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(v) => updateSetting("compactMode", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Animations</Label>
                  <p className="text-xs text-muted-foreground">Smooth transitions</p>
                </div>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={(v) => updateSetting("enableAnimations", v)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Data & Refresh Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
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
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Auto-refresh default</Label>
                  <p className="text-xs text-muted-foreground">Start on load</p>
                </div>
                <Switch
                  checked={settings.autoRefreshDefault}
                  onCheckedChange={(v) => updateSetting("autoRefreshDefault", v)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Alerts Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" />
              Alerts
            </div>
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  <Label className="text-sm">Sound</Label>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => updateSetting("soundEnabled", v)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Temperature Thresholds</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-500 mb-1">Warning</p>
                    <span className="text-lg font-mono font-bold">{settings.tempWarningThreshold}°C</span>
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
                    <span className="text-lg font-mono font-bold">{settings.tempCriticalThreshold}°C</span>
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

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Vibration Thresholds</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-500 mb-1">Warning</p>
                    <span className="text-lg font-mono font-bold">{settings.vibWarningThreshold.toFixed(1)}g</span>
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
                    <span className="text-lg font-mono font-bold">{settings.vibCriticalThreshold.toFixed(1)}g</span>
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

          <Separator />

          {/* Units Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="h-4 w-4 text-primary" />
              Units
            </div>
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Temperature</Label>
                <Select
                  value={settings.temperatureUnit}
                  onValueChange={(v) => updateSetting("temperatureUnit", v as AppSettings["temperatureUnit"])}
                >
                  <SelectTrigger className="w-32 h-9">
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
                  <SelectTrigger className="w-32 h-9">
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

          <Separator />

          {/* About Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" />
              About
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
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
                <Badge variant="secondary">{autoRefresh ? "On" : "Off"}</Badge>
              </div>
            </div>
          </section>

          <Separator />

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
