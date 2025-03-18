"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageList } from "@/components/message-list"
import { FileList } from "@/components/file-list"
import type { SlackData, SlackMessage, SlackFile } from "@/types/slack"

interface AllDataViewProps {
  slackData: SlackData
}

export function AllDataView({ slackData }: AllDataViewProps) {
  // Combine all messages from all channels
  const allMessages: SlackMessage[] = slackData.flatMap((channel) =>
    channel.messages.map((message) => ({
      ...message,
      // Add channel info to each message
      text: `[${channel.channelName}] ${message.text}`,
    })),
  )

  // Sort messages by timestamp (newest first)
  allMessages.sort((a, b) => Number.parseFloat(b.timestamp) - Number.parseFloat(a.timestamp))

  // Combine all files from all channels
  const allFiles: SlackFile[] = slackData.flatMap((channel) =>
    channel.files.map((file) => ({
      ...file,
      // Add channel info to each file
      fileName: `[${channel.channelName}] ${file.fileName}`,
    })),
  )

  // Sort files by timestamp (newest first)
  allFiles.sort((a, b) => Number.parseFloat(b.timestamp) - Number.parseFloat(a.timestamp))

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>All Channels Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages">
          <TabsList className="mb-4">
            <TabsTrigger value="messages">All Messages ({allMessages.length})</TabsTrigger>
            <TabsTrigger value="files">All Files ({allFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessageList messages={allMessages} />
          </TabsContent>

          <TabsContent value="files">
            <FileList files={allFiles} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

