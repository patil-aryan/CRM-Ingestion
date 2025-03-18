"use client"

import { useState } from "react"
import type { SlackMessage } from "@/types/slack"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { formatTimestamp } from "@/lib/utils"

interface MessageListProps {
  messages: SlackMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({})

  const toggleThread = (threadTs: string) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [threadTs]: !prev[threadTs],
    }))
  }

  if (messages.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No messages in this channel yet.</div>
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.timestamp} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="font-medium text-sm">{message.userName?.substring(0, 2) || "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="font-medium truncate">{message.userName || "Unknown User"}</div>
                  <div className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</div>
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">{message.text}</div>

                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction) => (
                      <span
                        key={reaction.name}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                      >
                        :{reaction.name}: {reaction.count}
                      </span>
                    ))}
                  </div>
                )}

                {message.threadTs && message.replies && message.replies.length > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-xs"
                      onClick={() => toggleThread(message.threadTs!)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {message.replies.length} {message.replies.length === 1 ? "reply" : "replies"}
                      {expandedThreads[message.threadTs] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>

                    {expandedThreads[message.threadTs] && (
                      <div className="pl-4 mt-2 border-l-2 border-muted space-y-3">
                        {message.replies.map((reply) => (
                          <div key={reply.timestamp} className="text-sm">
                            <div className="flex items-baseline justify-between mb-1">
                              <div className="font-medium text-xs">{reply.userName || "Unknown User"}</div>
                              <div className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp)}</div>
                            </div>
                            <div className="text-sm">{reply.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

