export interface SlackReaction {
  name: string
  count: number
  users: string[]
}

export interface SlackMessage {
  userId: string
  userName: string
  text: string
  timestamp: string
  threadTs: string | null
  replies?: SlackMessage[]
  reactions?: SlackReaction[]
}

export interface SlackFile {
  fileId: string
  userId: string
  userName: string
  fileUrl: string
  fileType: string
  fileName: string
  timestamp: string
}

export interface SlackChannel {
  channelId: string
  channelName: string
  messages: SlackMessage[]
  files: SlackFile[]
}

export type SlackData = SlackChannel[]

