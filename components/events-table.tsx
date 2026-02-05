"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronDown, Bell, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.03 },
  }),
}

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
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 card-hover">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-secondary/80">
                <Bell className="h-4 w-4 text-primary" />
              </span>
              Events
              {filteredEvents.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-normal bg-secondary/60 rounded-full text-muted-foreground">
                  {filteredEvents.length}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 w-52 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/30 transition-all duration-200"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-2 bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200">
                    <Filter className="h-3.5 w-3.5" />
                    {severityFilter}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt}
                      onClick={() => setSeverityFilter(opt)}
                      className={`${severityFilter === opt ? "bg-primary/10 text-primary" : ""} cursor-pointer transition-colors`}
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
                <div key={i} className="h-12 w-full shimmer rounded" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Bell className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm">No events recorded</p>
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableHead className="w-[140px] text-xs font-medium">Time</TableHead>
                    <TableHead className="w-[90px] text-xs font-medium">Severity</TableHead>
                    <TableHead className="w-[100px] text-xs font-medium">Type</TableHead>
                    <TableHead className="text-xs font-medium">Alerts</TableHead>
                    <TableHead className="w-[70px] text-right text-xs font-medium">Temp</TableHead>
                    <TableHead className="w-[70px] text-right text-xs font-medium">Vib</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, idx) => (
                    <motion.tr
                      key={`${event.eventTs}-${idx}`}
                      custom={idx}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="cursor-pointer border-border/20 table-row-hover"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatTime(event.eventTs)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSeverityColor(event.severity)} text-[10px] font-semibold`}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{event.eventType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {event.details.alerts.join(" • ") || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {event.details?.temp != null ? event.details.temp.toFixed(1) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {event.details?.vib != null ? event.details.vib.toFixed(2) : "—"}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-2xl max-h-[80vh] shadow-2xl">
              <DialogHeader className="pb-4 border-b border-border/30">
                <DialogTitle className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-secondary/80">
                    <Bell className="h-4 w-4 text-primary" />
                  </span>
                  Event Details
                  <Badge className={`${getSeverityColor(selectedEvent.severity)} ml-auto`}>
                    {selectedEvent.severity}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <pre className="p-4 bg-secondary/50 rounded-xl text-xs font-mono overflow-x-auto border border-border/20">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
