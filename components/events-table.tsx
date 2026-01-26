"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAegis } from "@/lib/aegis-context"
import type { EventItem } from "@/lib/types"

const SEVERITY_OPTIONS = ["All", "CRITICAL", "WARNING", "INFO"]

export function EventsTable() {
  const { data, isLoading } = useAegis()
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)

  const filteredEvents = useMemo(() => {
    if (!data?.events) return []
    return data.events.filter((event) => {
      const matchesSearch =
        search === "" ||
        event.severity.toLowerCase().includes(search.toLowerCase()) ||
        event.eventType.toLowerCase().includes(search.toLowerCase()) ||
        event.details.alerts.some((a) => a.toLowerCase().includes(search.toLowerCase()))

      const matchesSeverity = severityFilter === "All" || event.severity === severityFilter

      return matchesSearch && matchesSeverity
    })
  }, [data?.events, search, severityFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-destructive text-destructive-foreground"
      case "WARNING":
        return "bg-yellow-500 text-yellow-950"
      case "INFO":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-foreground">Events</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-48 bg-secondary border-border"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1 bg-transparent">
                    {severityFilter}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt}
                      onClick={() => setSeverityFilter(opt)}
                      className={severityFilter === opt ? "bg-secondary" : ""}
                    >
                      {opt}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No events yet
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px]">Time</TableHead>
                    <TableHead className="w-[90px]">Severity</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead className="w-[70px] text-right">Temp</TableHead>
                    <TableHead className="w-[70px] text-right">Vib</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, idx) => (
                    <TableRow
                      key={`${event.eventTs}-${idx}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <TableCell className="font-mono text-xs">
                        {formatTime(event.eventTs)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSeverityColor(event.severity)} text-[10px]`}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{event.eventType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {event.details.alerts.join(" • ") || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {event.details.temp.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {event.details.vib.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Event Details
              {selectedEvent && (
                <Badge className={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="p-4 bg-secondary rounded-md text-xs font-mono overflow-x-auto">
              {selectedEvent && JSON.stringify(selectedEvent, null, 2)}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
