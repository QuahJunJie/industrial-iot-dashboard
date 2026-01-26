// Aegis-One API types - exact field names from API

export interface TelemetryItem {
  temp: number
  deviceId: string
  vib: number
  status: string
  ts: number
}

export interface EventDetails {
  alerts: string[]
  detectionLatencyMs: number | null
  temp: number
  driftPct: number | null
  sampleIntervalMs: number
  fn: boolean
  baselineVib: number | null
  fp: boolean
  tn: boolean
  tp: boolean
  vib: number
}

export interface EventItem {
  eventType: string
  severity: string
  eventTs: number
  deviceId: string
  details: EventDetails
}

export interface AegisOneResponse {
  deviceId: string
  telemetry: TelemetryItem[]
  events: EventItem[]
}

export interface ApiConfig {
  apiBaseUrl: string
  deviceId: string
  limit: number
}
