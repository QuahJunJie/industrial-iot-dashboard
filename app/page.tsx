"use client"

import { motion } from "framer-motion"
import { AegisProvider } from "@/lib/aegis-context"
import { TopBar } from "@/components/top-bar"
import { ControlsCard } from "@/components/controls-card"
import { KpiCards } from "@/components/kpi-cards"
import { TelemetryCharts } from "@/components/telemetry-charts"
import { EventsTable } from "@/components/events-table"
import { SystemHealth } from "@/components/system-health"
import { ExportPanel } from "@/components/export-panel"
import { ErrorBanner } from "@/components/error-banner"
import { AlertToast } from "@/components/alert-toast"

export default function Dashboard() {
  return (
    <AegisProvider>
      <div className="min-h-screen bg-background">
        <TopBar />
        <ErrorBanner />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
        >
          {/* Controls */}
          <ControlsCard />

          {/* KPI Cards */}
          <KpiCards />

          {/* Charts and System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TelemetryCharts />
            </div>
            <div>
              <SystemHealth />
            </div>
          </div>

          {/* Events Table */}
          <EventsTable />

          {/* Export Panel */}
          <div className="flex justify-end">
            <ExportPanel />
          </div>
        </motion.main>

        {/* Alert Toast */}
        <AlertToast />
      </div>
    </AegisProvider>
  )
}
