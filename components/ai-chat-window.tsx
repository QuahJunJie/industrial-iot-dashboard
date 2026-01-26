"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  "What's causing the vibration spike?",
  "Show me maintenance schedule",
  "Analyze power consumption",
  "Check sensor status",
]

export function AiChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your IoT assistant. I can help you analyze equipment data, troubleshoot issues, and provide maintenance recommendations. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const simulateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("vibration") || lowerMessage.includes("spike")) {
      return "Based on the current vibration data, I'm seeing elevated readings in Motor Assembly Unit A-7. The RMS velocity is fluctuating between 2.5-5.0 mm/s. This could indicate:\n\n• Bearing wear (most likely)\n• Shaft misalignment\n• Imbalance in rotating components\n\nI recommend scheduling a maintenance inspection within the next 48 hours."
    }
    if (lowerMessage.includes("maintenance") || lowerMessage.includes("schedule")) {
      return "Here's the upcoming maintenance schedule:\n\n• Motor A-7: Bearing inspection - Due in 2 days\n• Pump P-12: Oil change - Due in 5 days\n• Conveyor C-3: Belt tension check - Due in 7 days\n\nWould you like me to create a work order for any of these?"
    }
    if (lowerMessage.includes("power") || lowerMessage.includes("consumption")) {
      return "Current power analysis for the facility:\n\n• Total consumption: 12.8 kW (within normal range)\n• Peak today: 15.2 kW at 14:32\n• Average: 11.9 kW\n\nPower factor is at 0.92, which is acceptable. No anomalies detected."
    }
    if (lowerMessage.includes("sensor") || lowerMessage.includes("status")) {
      return "Sensor status overview:\n\n✅ VIB-A7-001: Online (last reading: 0.5s ago)\n✅ TEMP-A7-001: Online (42.3°C)\n✅ PRESS-A7-001: Online (2.45 bar)\n⚠️ FLOW-B2-003: Warning - Signal weak\n\nThe flow sensor on line B2 may need recalibration."
    }

    return "I've analyzed your query. Based on the current system data, all critical parameters are within acceptable ranges. The vibration levels are being monitored continuously. Is there anything specific you'd like me to investigate?"
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: simulateResponse(input),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Equipment analysis & diagnostics</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "p-2 rounded-full shrink-0",
                  message.role === "assistant" ? "bg-primary/10" : "bg-secondary",
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[85%]",
                  message.role === "assistant"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-[10px] opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestion(suggestion)}
                className="text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about equipment status..."
            className="flex-1 bg-secondary border-border"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
