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
    const tsFrom = Math.floor(twoMonthsAgo.getTime() / 1000).toString()

    try {
      // First, try to join the channel if possible
      await client.conversations.join({ channel: channelId }).catch((err) => {
        // Ignore errors for private channels which can't be joined programmatically
        console.log(`Could not join channel ${channelId}: ${err.message}`)
      })

      // Fetch files for the channel
      const result = await client.files.list({
        channel: channelId,
        count: 50,
        page: cursor ? Number.parseInt(cursor) : 1,
        ts_from: tsFrom,
      })

      // Process files to include user info
      const files = await Promise.all(
        (result.files || []).map(async (file: any) => {
          // Get user info for the file
          let userName = "Unknown User"
          if (file.user) {
            try {
              const userInfo = await client.users.info({ user: file.user })
              userName = userInfo.user?.real_name || userInfo.user?.name || "Unknown User"
            } catch (error) {
              console.error(`Error fetching user info for ${file.user}:`, error)
            }
          }

          return {
            fileId: file.id || "",
            userId: file.user || "",
            userName,
            fileUrl: file.url_private || file.permalink || "",
            fileType: file.mimetype || file.filetype || "unknown",
            fileName: file.name || "Unnamed File",
            timestamp: file.created.toString() || "",
          }
        }),
      )

      return NextResponse.json({
        success: true,
        files,
        hasMore: result.paging?.pages ? result.paging.page < result.paging.pages : false,
        nextCursor: result.paging?.page ? (result.paging.page + 1).toString() : null,
      })
    } catch (error: any) {
      // Handle specific Slack API errors
      if (error.code === "slack_webapi_platform_error" && error.data && error.data.error === "not_in_channel") {
        return NextResponse.json(
          {
            success: false,
            error: "not_in_channel",
            files: [],
            hasMore: false,
            nextCursor: null,
          },
          { status: 200 },
        ) // Return 200 with error info instead of 500
      }
      throw error // Re-throw other errors
    }
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch files" }, { status: 500 })
  }
}

