"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAegis } from "@/lib/aegis-context"

export function ExportPanel() {
  const { data, config } = useAegis()
  const [copiedUrl, setCopiedUrl] = useState(false)

  const requestUrl = `${config.apiBaseUrl}/data?deviceId=${config.deviceId}&limit=${config.limit}`

  const handleDownloadJson = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aegis-one-${config.deviceId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(requestUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
      <span className="text-xs text-muted-foreground mr-1">Export:</span>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadJson}
          disabled={!data}
          className="gap-2 h-9 bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          JSON
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyUrl}
          className="gap-2 h-9 bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
        >
          {copiedUrl ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-primary" />
              <span className="text-primary">Copied!</span>
            </motion.div>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              API URL
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
