// import { type NextRequest, NextResponse } from "next/server"

// // Mock data for demonstration purposes
// const mockChannels = [
//   {
//     channelId: "C1234567890",
//     channelName: "#general",
//     messages: [
//       {
//         userId: "U1234567890",
//         userName: "John Doe",
//         text: "Hello, world!",
//         timestamp: "1678886400.000000",
//         threadTs: null,
//         replies: [],
//         reactions: [{ name: "thumbsup", count: 2, users: ["U1234567890", "U0987654321"] }],
//       },
//       {
//         userId: "U0987654321",
//         userName: "Jane Smith",
//         text: "This is a thread starter",
//         timestamp: "1678886300.000000",
//         threadTs: "1678886300.000000",
//         replies: [
//           {
//             userId: "U1234567890",
//             userName: "John Doe",
//             text: "This is a reply",
//             timestamp: "1678886350.000000",
//             threadTs: "1678886300.000000",
//           },
//         ],
//       },
//     ],
//     files: [
//       {
//         fileId: "F1234567890",
//         userId: "U1234567890",
//         userName: "John Doe",
//         fileUrl: "https://example.com/files/document.pdf",
//         fileType: "application/pdf",
//         fileName: "document.pdf",
//         timestamp: "1678886400.000000",
//       },
//     ],
//   },
//   {
//     channelId: "C0987654321",
//     channelName: "#random",
//     messages: [
//       {
//         userId: "U0987654321",
//         userName: "Jane Smith",
//         text: "Random message",
//         timestamp: "1678886200.000000",
//         threadTs: null,
//         replies: [],
//       },
//     ],
//     files: [],
//   },
// ]

// export async function GET(request: NextRequest) {
//   const accessToken = request.cookies.get("slack_access_token")?.value

//   if (!accessToken) {
//     return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
//   }

//   try {
//     // In a real implementation, you would use the Slack API to fetch channels
//     // const client = new WebClient(accessToken);
//     // const result = await client.conversations.list();
//     // const channels = result.channels.map(channel => ({
//     //   channelId: channel.id,
//     //   channelName: channel.name,
//     //   messages: [],
//     //   files: [],
//     // }));

//     // For the PoC, we'll use mock data
//     return NextResponse.json({
//       success: true,
//       channels: mockChannels,
//     })
//   } catch (error) {
//     console.error("Error fetching channels:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch channels" }, { status: 500 })
//   }
// }



import { type NextRequest, NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"
import type { SlackChannel, SlackMessage, SlackFile } from "@/types/slack"

// Function to get messages from the past 2 months
async function getChannelMessages(client: WebClient, channelId: string): Promise<SlackMessage[]> {
  try {
    // Calculate timestamp for 2 months ago
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const oldest = twoMonthsAgo.getTime() / 1000

    // Get messages with pagination
    let messages: SlackMessage[] = []
    let cursor: string | undefined

    do {
      const response = await client.conversations.history({
        channel: channelId,
        limit: 100, // Max allowed by Slack API
        oldest: oldest.toString(),
        cursor: cursor,
      })

      if (response.messages && response.messages.length > 0) {
        // Transform Slack messages to our format
        const transformedMessages = await Promise.all(
          response.messages.map(async (msg: any) => {
            // Get user info for the message
            let userName = "Unknown User"
            if (msg.user) {
              try {
                const userInfo = await client.users.info({ user: msg.user })
                if (userInfo.user && userInfo.user.real_name) {
                  userName = userInfo.user.real_name
                }
              } catch (error) {
                console.error(`Error fetching user info for ${msg.user}:`, error)
              }
            }

            // Get thread replies if this is a thread
            let replies: SlackMessage[] = []
            if (msg.thread_ts && msg.thread_ts === msg.ts) {
              try {
                const threadResponse = await client.conversations.replies({
                  channel: channelId,
                  ts: msg.thread_ts,
                  limit: 100,
                })

                if (threadResponse.messages) {
                  // Skip the first message as it's the parent
                  const threadMessages = threadResponse.messages.slice(1)

                  replies = await Promise.all(
                    threadMessages.map(async (reply: any) => {
                      // Get user info for the reply
                      let replyUserName = "Unknown User"
                      if (reply.user) {
                        try {
                          const userInfo = await client.users.info({ user: reply.user })
                          if (userInfo.user && userInfo.user.real_name) {
                            replyUserName = userInfo.user.real_name
                          }
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
                        replies: [],
                        reactions: reply.reactions
                          ? reply.reactions.map((r: any) => ({
                              name: r.name,
                              count: r.count,
                              users: r.users || [],
                            }))
                          : [],
                      }
                    }),
                  )
                }
              } catch (error) {
                console.error(`Error fetching thread replies for ${msg.thread_ts}:`, error)
              }
            }

            return {
              userId: msg.user || "",
              userName: userName,
              text: msg.text || "",
              timestamp: msg.ts || "",
              threadTs: msg.thread_ts || null,
              replies: replies,
              reactions: msg.reactions
                ? msg.reactions.map((r: any) => ({
                    name: r.name,
                    count: r.count,
                    users: r.users || [],
                  }))
                : [],
            }
          }),
        )

        messages = [...messages, ...transformedMessages]
      }

      cursor = response.response_metadata?.next_cursor
    } while (cursor)

    return messages
  } catch (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error)
    return []
  }
}

// Function to get files from the past 2 months
async function getChannelFiles(client: WebClient, channelId: string): Promise<SlackFile[]> {
  try {
    // Calculate timestamp for 2 months ago
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const oldest = twoMonthsAgo.getTime() / 1000

    // Get files with pagination
    let files: SlackFile[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await client.files.list({
        channel: channelId,
        count: 100, // Max allowed by Slack API
        page: page,
        ts_from: oldest,
      })

      if (response.files && response.files.length > 0) {
        // Transform Slack files to our format
        const transformedFiles = await Promise.all(
          response.files.map(async (file: any) => {
            // Get user info for the file
            let userName = "Unknown User"
            if (file.user) {
              try {
                const userInfo = await client.users.info({ user: file.user })
                if (userInfo.user && userInfo.user.real_name) {
                  userName = userInfo.user.real_name
                }
              } catch (error) {
                console.error(`Error fetching user info for ${file.user}:`, error)
              }
            }

            return {
              fileId: file.id || "",
              userId: file.user || "",
              userName: userName,
              fileUrl: file.url_private || file.permalink || "",
              fileType: file.mimetype || "",
              fileName: file.name || "",
              timestamp: file.created.toString() || "",
            }
          }),
        )

        files = [...files, ...transformedFiles]
      }

      hasMore = response.paging && response.paging.pages > page
      page++
    }

    return files
  } catch (error) {
    console.error(`Error fetching files for channel ${channelId}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("slack_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Initialize Slack Web API client
    const client = new WebClient(accessToken)

    // Get list of channels
    const channelsResponse = await client.conversations.list({
      types: "public_channel,private_channel",
      exclude_archived: true,
      limit: 100, // Max allowed by Slack API
    })

    if (!channelsResponse.channels || channelsResponse.channels.length === 0) {
      return NextResponse.json({
        success: true,
        channels: [],
      })
    }

    // Transform and fetch data for each channel
    const channels: SlackChannel[] = await Promise.all(
      channelsResponse.channels.map(async (channel: any) => {
        const channelId = channel.id
        const channelName = channel.name

        // Get messages and files for this channel
        const messages = await getChannelMessages(client, channelId)
        const files = await getChannelFiles(client, channelId)

        return {
          channelId,
          channelName: `#${channelName}`,
          messages,
          files,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      channels,
    })
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch channels",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

