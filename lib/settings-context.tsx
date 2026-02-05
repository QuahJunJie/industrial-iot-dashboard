"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

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

export const DEFAULT_SETTINGS: AppSettings = {
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

interface SettingsContextValue {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetToDefaults: () => void
  convertTemperature: (celsius: number) => number
  formatTemperature: (celsius: number) => string
  formatTime: (date: Date) => string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

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
    setMounted(true)
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    const theme = settings.theme
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [settings.theme, mounted])

  // Apply compact mode
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("compact", settings.compactMode)
  }, [settings.compactMode, mounted])

  // Apply animations setting
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("no-animations", !settings.enableAnimations)
  }, [settings.enableAnimations, mounted])

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }, [])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  // Temperature conversion helpers
  const convertTemperature = useCallback((celsius: number): number => {
    if (settings.temperatureUnit === "fahrenheit") {
      return (celsius * 9/5) + 32
    }
    return celsius
  }, [settings.temperatureUnit])

  const formatTemperature = useCallback((celsius: number): string => {
    const value = convertTemperature(celsius)
    const unit = settings.temperatureUnit === "fahrenheit" ? "°F" : "°C"
    return `${value.toFixed(1)}${unit}`
  }, [convertTemperature, settings.temperatureUnit])

  // Time format helper
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour12: settings.timeFormat === "12h",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }, [settings.timeFormat])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetToDefaults,
        convertTemperature,
        formatTemperature,
        formatTime,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
