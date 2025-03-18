import { type NextRequest, NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("slack_access_token")?.value
  const searchParams = request.nextUrl.searchParams
  const channelId = searchParams.get("channelId")
  const cursor = searchParams.get("cursor") || undefined

  if (!accessToken) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  if (!channelId) {
    return NextResponse.json({ success: false, error: "Channel ID is required" }, { status: 400 })
  }

  try {
    // Initialize the Slack Web API client
    const client = new WebClient(accessToken)

    // Calculate timestamp for 2 months ago
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const oldest = Math.floor(twoMonthsAgo.getTime() / 1000).toString()

    try {
      // First, try to join the channel if possible
      await client.conversations.join({ channel: channelId }).catch((err) => {
        // Ignore errors for private channels which can't be joined programmatically
        console.log(`Could not join channel ${channelId}: ${err.message}`)
      })

      // Fetch messages for the channel
      const result = await client.conversations.history({
        channel: channelId,
        limit: 50,
        cursor,
        oldest, // Messages from 2 months ago
      })

      // Process messages to include user info and thread replies
      const messages = await Promise.all(
        (result.messages || []).map(async (message: any) => {
          // Get user info for the message
          let userName = "Unknown User"
          if (message.user) {
            try {
              const userInfo = await client.users.info({ user: message.user })
              userName = userInfo.user?.real_name || userInfo.user?.name || "Unknown User"
            } catch (error) {
              console.error(`Error fetching user info for ${message.user}:`, error)
            }
          }

          // Get thread replies if this message has a thread
          let replies: any[] = []
          if (message.thread_ts && message.thread_ts === message.ts) {
            try {
              const threadResult = await client.conversations.replies({
                channel: channelId,
                ts: message.thread_ts,
                limit: 100,
              })

              // Skip the parent message in replies
              replies = await Promise.all(
                (threadResult.messages || [])
                  .filter((reply: any) => reply.ts !== message.ts)
                  .map(async (reply: any) => {
                    let replyUserName = "Unknown User"
                    if (reply.user) {
                      try {
                        const userInfo = await client.users.info({ user: reply.user })
                        replyUserName = userInfo.user?.real_name || userInfo.user?.name || "Unknown User"
                      } catch (error) {
                        console.error(`Error fetching user info for ${reply.user}:`, error)
                      }
                    }

                    return {
                      userId: reply.user || "",
                      userName: replyUserName,
                      text: reply.text || "",
                      timestamp: reply.ts || "",
                      threadTs: reply.thread_ts || null,
                    }
                  }),
              )
            } catch (error) {
              console.error(`Error fetching thread replies for ${message.thread_ts}:`, error)
            }
          }

          // Process reactions
          const reactions =
            message.reactions?.map((reaction: any) => ({
              name: reaction.name,
              count: reaction.count,
              users: reaction.users || [],
            })) || []

          return {
            userId: message.user || "",
            userName,
            text: message.text || "",
            timestamp: message.ts || "",
            threadTs: message.thread_ts === message.ts ? message.thread_ts : null,
            replies,
            reactions,
          }
        }),
      )

      return NextResponse.json({
        success: true,
        messages,
        hasMore: result.has_more || false,
        nextCursor: result.response_metadata?.next_cursor || null,
      })
    } catch (error: any) {
      // Handle specific Slack API errors
      if (error.code === "slack_webapi_platform_error" && error.data && error.data.error === "not_in_channel") {
        return NextResponse.json(
          {
            success: false,
            error: "not_in_channel",
            messages: [],
            hasMore: false,
            nextCursor: null,
          },
          { status: 200 },
        ) // Return 200 with error info instead of 500
      }
      throw error // Re-throw other errors
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

