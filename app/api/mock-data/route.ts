import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb"

const AWS_REGION = process.env.AWS_REGION || "ap-southeast-1"

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_REGION })
const docClient = DynamoDBDocumentClient.from(client)

const TELEMETRY_TABLE = process.env.DYNAMODB_TELEMETRY_TABLE || "AegisOneTelemetry"
const EVENTS_TABLE = process.env.DYNAMODB_EVENTS_TABLE || "AegisOneEvents"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, count } = body

    console.log("[v0] Mock data request:", { type, count })

    if (type === "telemetry") {
      // Generate single or batch telemetry records
      const records = count > 1 ? generateBatchTelemetry(data, count) : [data]
      
      if (records.length === 1) {
        // Single record
        await docClient.send(new PutCommand({
          TableName: TELEMETRY_TABLE,
          Item: {
            deviceId: data.deviceId || "aegis-one",
            ts: data.ts || Date.now(),
            temp: data.temp,
            vib: data.vib,
            distance: data.distance,
            status: data.status || determineStatus(data),
            source: "mock-generator",
          }
        }))
      } else {
        // Batch records
        const batches = chunkArray(records, 25) // DynamoDB batch limit
        
        for (const batch of batches) {
          await docClient.send(new BatchWriteCommand({
            RequestItems: {
              [TELEMETRY_TABLE]: batch.map(item => ({
                PutRequest: { Item: item }
              }))
            }
          }))
        }
      }

      return NextResponse.json({
        success: true,
        message: `${records.length} telemetry record(s) created`,
        data: records
      })
    }

    if (type === "event") {
      // Generate event record
      const eventRecord = {
        deviceId: data.deviceId || "aegis-one",
        eventTs: data.eventTs || Date.now(),
        eventType: data.eventType || "ALERT",
        severity: data.severity || determineSeverity(data),
        details: {
          alerts: data.alerts || generateAlerts(data),
          temp: data.temp,
          vib: data.vib,
          distance: data.distance,
          detectionLatencyMs: data.detectionLatencyMs || Math.floor(Math.random() * 500),
          driftPct: null,
          sampleIntervalMs: 5000,
          baselineVib: null,
          tp: data.severity === "CRITICAL" || data.severity === "WARNING",
          fp: false,
          tn: false,
          fn: false,
          metrics: {
            temp: data.temp,
            vib: data.vib,
            distance: data.distance
          }
        }
      }

      await docClient.send(new PutCommand({
        TableName: EVENTS_TABLE,
        Item: eventRecord
      }))

      return NextResponse.json({
        success: true,
        message: "Event record created",
        data: eventRecord
      })
    }

    if (type === "scenario") {
      // Generate scenario-based data
      const scenario = await generateScenario(data.scenario, data.deviceId)
      
      return NextResponse.json({
        success: true,
        message: `Scenario '${data.scenario}' generated`,
        data: scenario
      })
    }

    return NextResponse.json(
      { error: "Invalid type. Use 'telemetry', 'event', or 'scenario'" },
      { status: 400 }
    )

  } catch (error) {
    console.error("[v0] Mock data error:", error)
    return NextResponse.json(
      { error: "Failed to create mock data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper functions
function determineStatus(data: any): string {
  const { temp, vib, distance } = data
  
  if (temp > 45 || vib > 2.5 || (distance && distance < 30)) {
    return "CRITICAL"
  }
  if (temp > 35 || vib > 1.5 || (distance && distance < 100)) {
    return "WARNING"
  }
  return "RUNNING"
}

function determineSeverity(data: any): string {
  return determineStatus(data)
}

function generateAlerts(data: any): string[] {
  const alerts: string[] = []
  const { temp, vib, distance } = data
  
  if (temp > 45) alerts.push(`TEMP_CRIT ${temp.toFixed(2)}°C >= 40.00°C`)
  else if (temp > 35) alerts.push(`TEMP_WARN ${temp.toFixed(2)}°C >= 35.00°C`)
  
  if (vib > 2.5) alerts.push(`VIB_CRIT ${vib.toFixed(3)}g >= 0.550g`)
  else if (vib > 1.5) alerts.push(`VIB_WARN ${vib.toFixed(3)}g >= 0.350g`)
  
  if (distance !== undefined) {
    if (distance < 30) alerts.push(`PROX_CRIT ${distance.toFixed(1)}cm < 30cm`)
    else if (distance < 100) alerts.push(`PROX_WARN ${distance.toFixed(1)}cm < 100cm`)
  }
  
  return alerts
}

function generateBatchTelemetry(baseData: any, count: number): any[] {
  const records = []
  const now = Date.now()
  const interval = 5000 // 5 seconds between records
  
  for (let i = 0; i < count; i++) {
    const variance = () => (Math.random() - 0.5) * 0.2 // ±10% variance
    
    records.push({
      deviceId: baseData.deviceId || "aegis-one",
      ts: now - ((count - i - 1) * interval), // Reverse chronological
      temp: baseData.temp * (1 + variance()),
      vib: Math.max(0, baseData.vib * (1 + variance())),
      distance: baseData.distance ? baseData.distance * (1 + variance()) : undefined,
      status: determineStatus(baseData),
      source: "mock-generator"
    })
  }
  
  return records
}

async function generateScenario(scenario: string, deviceId: string): Promise<any> {
  const now = Date.now()
  const records: any[] = []
  
  switch (scenario) {
    case "normal":
      // 10 normal readings
      for (let i = 0; i < 10; i++) {
        records.push({
          deviceId,
          ts: now - (i * 5000),
          temp: 25 + Math.random() * 5,
          vib: 0.3 + Math.random() * 0.3,
          distance: 150 + Math.random() * 50,
          status: "RUNNING",
          source: "mock-scenario"
        })
      }
      break
      
    case "warning":
      // Gradual increase to warning levels
      for (let i = 0; i < 10; i++) {
        const progress = i / 10
        records.push({
          deviceId,
          ts: now - ((9 - i) * 5000),
          temp: 25 + (progress * 15), // 25°C → 40°C
          vib: 0.5 + (progress * 1.2), // 0.5 → 1.7
          distance: 150 - (progress * 70), // 150cm → 80cm
          status: progress > 0.6 ? "WARNING" : "RUNNING",
          source: "mock-scenario"
        })
      }
      break
      
    case "critical":
      // Spike to critical
      for (let i = 0; i < 5; i++) {
        records.push({
          deviceId,
          ts: now - ((4 - i) * 3000),
          temp: 48 + Math.random() * 5,
          vib: 2.8 + Math.random() * 0.5,
          distance: 20 + Math.random() * 10,
          status: "CRITICAL",
          source: "mock-scenario"
        })
      }
      break
      
    default:
      throw new Error(`Unknown scenario: ${scenario}`)
  }
  
  // Save all records
  const batches = chunkArray(records, 25)
  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TELEMETRY_TABLE]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    }))
  }
  
  return { recordsCreated: records.length, records }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
