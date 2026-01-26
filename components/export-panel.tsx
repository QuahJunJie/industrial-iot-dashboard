"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Copy, Check } from "lucide-react"
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.5 }}
      className="flex items-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadJson}
        disabled={!data}
        className="gap-1.5 bg-transparent"
      >
        <Download className="h-3.5 w-3.5" />
        Download JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyUrl}
        className="gap-1.5 bg-transparent"
      >
        {copiedUrl ? (
          <>
            <Check className="h-3.5 w-3.5 text-primary" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy API URL
          </>
        )}
      </Button>
    </motion.div>
  )
}
