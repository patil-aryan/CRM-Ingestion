"use client"

import { Button } from "@/components/ui/button"
import type { SlackChannel } from "@/types/slack"

interface ChannelSelectorProps {
  channels: SlackChannel[]
  selectedChannel: string | null
  onSelectChannel: (channelId: string) => void
}

export function ChannelSelector({ channels, selectedChannel, onSelectChannel }: ChannelSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Channels:</h3>
      <div className="flex flex-wrap gap-2">
        {channels.map((channel) => (
          <Button
            key={channel.channelId}
            variant={selectedChannel === channel.channelId ? "default" : "outline"}
            onClick={() => onSelectChannel(channel.channelId)}
            className="text-sm"
          >
            {channel.channelName}
          </Button>
        ))}
      </div>
    </div>
  )
}

