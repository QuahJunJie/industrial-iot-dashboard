"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import type { AegisOneResponse, ApiConfig, EventItem } from "./types"

interface AegisContextValue {
  data: AegisOneResponse | null
  config: ApiConfig
  setConfig: React.Dispatch<React.SetStateAction<ApiConfig>>
  isConnected: boolean
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
  refresh: () => void
  newAlert: EventItem | null
  clearNewAlert: () => void
}

const AegisContext = createContext<AegisContextValue | null>(null)

const DEFAULT_CONFIG: ApiConfig = {
  apiBaseUrl: "https://vivfnom8oc.execute-api.ap-southeast-1.amazonaws.com/prod/data",
  deviceId: "AegisOne_M5_01",
  limit: 60,
}

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AegisOneResponse | null>(null)
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [newAlert, setNewAlert] = useState<EventItem | null>(null)

  const lastSeenEventTs = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearNewAlert = useCallback(() => {
    setNewAlert(null)
  }, [])

  const fetchData = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const url = `${config.apiBaseUrl}/data?deviceId=${config.deviceId}&limit=${config.limit}`
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: AegisOneResponse = await response.json()
      setData(result)
      setIsConnected(true)
      setLastUpdated(new Date())

      // Check for new events
      if (result.events && result.events.length > 0) {
        const latestEvent = result.events[0]
        if (latestEvent.eventTs > lastSeenEventTs.current) {
          lastSeenEventTs.current = latestEvent.eventTs
          setNewAlert(latestEvent)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return // Ignore aborted requests
      }
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <AegisContext.Provider
      value={{
        data,
        config,
        setConfig,
        isConnected,
        isLoading,
        error,
        lastUpdated,
        autoRefresh,
        setAutoRefresh,
        refresh,
        newAlert,
        clearNewAlert,
      }}
    >
      {children}
    </AegisContext.Provider>
  )
}

export function useAegis() {
  const context = useContext(AegisContext)
  if (!context) {
    throw new Error("useAegis must be used within an AegisProvider")
  }
  return context
}
