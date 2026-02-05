"use client"

import { motion } from "framer-motion"
import { AegisProvider } from "@/lib/aegis-context"
import { SettingsProvider } from "@/lib/settings-context"
import { TopBar } from "@/components/top-bar"
import { ControlsCard } from "@/components/controls-card"
import { KpiCards } from "@/components/kpi-cards"
import { TelemetryCharts } from "@/components/telemetry-charts"
import { EventsTable } from "@/components/events-table"
import { SystemHealth } from "@/components/system-health"
import { ExportPanel } from "@/components/export-panel"
import { ErrorBanner } from "@/components/error-banner"
import { AlertToast } from "@/components/alert-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function Dashboard() {
  return (
    <SettingsProvider>
      <AegisProvider>
        <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        
        <TopBar />
        <ErrorBanner />

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
        >
          {/* Controls */}
          <motion.div variants={itemVariants}>
            <ControlsCard />
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={itemVariants}>
            <KpiCards />
          </motion.div>

          {/* Charts and System Health */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TelemetryCharts />
            </div>
            <div>
              <SystemHealth />
            </div>
          </motion.div>

          {/* Events Table */}
          <motion.div variants={itemVariants}>
            <EventsTable />
          </motion.div>

          {/* Export Panel */}
          <motion.div variants={itemVariants} className="flex justify-end pb-4">
            <ExportPanel />
          </motion.div>
        </motion.main>

        {/* Alert Toast */}
        <AlertToast />
      </div>
      </AegisProvider>
    </SettingsProvider>
  )
}
