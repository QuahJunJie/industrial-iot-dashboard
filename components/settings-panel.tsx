"use client"

import { useState } from "react"
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAegis } from "@/lib/aegis-context"
import { useSettings, type AppSettings } from "@/lib/settings-context"

export function SettingsPanel() {
  const [saved, setSaved] = useState(false)
  const { isConnected, autoRefresh, setAutoRefresh } = useAegis()
  const { settings, updateSetting: updateSettingContext, resetToDefaults: resetContextDefaults } = useSettings()

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettingContext(key, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    if (key === "autoRefreshDefault") {
      setAutoRefresh(value as boolean)
    }
  }

  const resetToDefaults = () => {
    resetContextDefaults()
    setAutoRefresh(true)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      <SheetContent className="w-full max-w-md flex flex-col bg-card border-border/50">
        <SheetHeader className="pb-6 flex-shrink-0 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Settings</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">Customize your dashboard</SheetDescription>
              </div>
            </div>
            {saved && (
              <Badge variant="outline" className="gap-1.5 text-primary border-primary/30 bg-primary/5 px-3 py-1">
                <Check className="h-3 w-3" />
                Saved
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-1">
          {/* Display Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/80">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Display</span>
            </div>
            <div className="space-y-4 ml-2 pl-4 border-l-2 border-border/30">
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
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/80">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Data & Refresh</span>
            </div>
            <div className="space-y-4 ml-2 pl-4 border-l-2 border-border/30">
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
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/80">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Alerts</span>
            </div>
            <div className="space-y-4 ml-2 pl-4 border-l-2 border-border/30">
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-yellow-500 mb-1">Warning</p>
                    <span className="text-xl font-mono font-bold text-foreground">{settings.tempWarningThreshold}°C</span>
                    <Slider
                      value={[settings.tempWarningThreshold]}
                      onValueChange={([v]) => updateSetting("tempWarningThreshold", v)}
                      min={25}
                      max={50}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">Critical</p>
                    <span className="text-xl font-mono font-bold text-foreground">{settings.tempCriticalThreshold}°C</span>
                    <Slider
                      value={[settings.tempCriticalThreshold]}
                      onValueChange={([v]) => updateSetting("tempCriticalThreshold", v)}
                      min={35}
                      max={60}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Vibration Thresholds</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-yellow-500 mb-1">Warning</p>
                    <span className="text-xl font-mono font-bold text-foreground">{(settings.vibWarningThreshold ?? 1.5).toFixed(1)}g</span>
                    <Slider
                      value={[(settings.vibWarningThreshold ?? 1.5) * 10]}
                      onValueChange={([v]) => updateSetting("vibWarningThreshold", v / 10)}
                      min={5}
                      max={30}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">Critical</p>
                    <span className="text-xl font-mono font-bold text-foreground">{(settings.vibCriticalThreshold ?? 2.5).toFixed(1)}g</span>
                    <Slider
                      value={[(settings.vibCriticalThreshold ?? 2.5) * 10]}
                      onValueChange={([v]) => updateSetting("vibCriticalThreshold", v / 10)}
                      min={15}
                      max={50}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Units Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/80">
                <Thermometer className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Units</span>
            </div>
            <div className="space-y-4 ml-2 pl-4 border-l-2 border-border/30">
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
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/80">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">About</span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/30 space-y-3">
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
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="w-full gap-2 h-11 bg-secondary/20 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
