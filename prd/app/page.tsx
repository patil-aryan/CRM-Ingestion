// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { MessageList } from "@/components/message-list"
// import { FileList } from "@/components/file-list"
// import { ChannelSelector } from "@/components/channel-selector"
// import { useToast } from "@/hooks/use-toast"
// import type { SlackData, SlackMessage, SlackFile } from "@/types/slack"
// import { Download, Bot } from "lucide-react"
// import { AllDataView } from "@/components/all-data-view"
// import { BotGuide } from "@/components/bot-guide"

// export default function Home() {
//   const [isConnected, setIsConnected] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [slackData, setSlackData] = useState<SlackData>([])
//   const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
//   const [isExporting, setIsExporting] = useState(false)
//   const { toast } = useToast()
//   const [showAllData, setShowAllData] = useState(false)
//   const [showBotGuide, setShowBotGuide] = useState(false)

//   // Function to initiate Slack OAuth flow
//   const connectToSlack = () => {
//     setIsLoading(true)
//     window.location.href = "/api/auth/slack"
//   }

//   // Check if already authenticated
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/auth/status")
//         const data = await response.json()
//         setIsConnected(data.authenticated)
//         if (data.authenticated) {
//           fetchChannels()
//         }
//       } catch (error) {
//         console.error("Error checking authentication status:", error)
//         toast({
//           title: "Error",
//           description: "Failed to check authentication status",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     checkAuth()
//   }, [])

//   // Fetch channels when authenticated
//   const fetchChannels = async () => {
//     try {
//       const response = await fetch("/api/slack/channels")
//       const data = await response.json()

//       if (data.success) {
//         setSlackData(data.channels)
//         if (data.channels.length > 0) {
//           setSelectedChannel(data.channels[0].channelId)
//         }
//       } else {
//         throw new Error(data.error || "Failed to fetch channels")
//       }
//     } catch (error) {
//       console.error("Error fetching channels:", error)
//       toast({
//         title: "Error",
//         description: "Failed to fetch channels",
//         variant: "destructive",
//       })
//     }
//   }

//   // Set up simulated real-time updates
//   useEffect(() => {
//     if (!isConnected) return

//     // For the PoC, we'll simulate real-time updates instead of using WebSockets
//     // This avoids WebSocket connection errors in development
//     const simulateRealTimeUpdates = () => {
//       const interval = setInterval(() => {
//         if (slackData.length > 0 && selectedChannel) {
//           const randomChannel = slackData.find((channel) => channel.channelId === selectedChannel)

//           if (randomChannel) {
//             const newMessage = {
//               userId: "U9876543210",
//               userName: "Real-time User",
//               text: `New real-time message at ${new Date().toLocaleTimeString()}`,
//               timestamp: (Date.now() / 1000).toString(),
//               threadTs: null,
//               replies: [],
//             }

//             setSlackData((prevData) => {
//               return prevData.map((channel) => {
//                 if (channel.channelId === selectedChannel) {
//                   return {
//                     ...channel,
//                     messages: [newMessage, ...channel.messages],
//                   }
//                 }
//                 return channel
//               })
//             })
//           }
//         }
//       }, 30000) // Add a new message every 30 seconds

//       return () => clearInterval(interval)
//     }

//     const cleanup = simulateRealTimeUpdates()
//     return cleanup
//   }, [isConnected, slackData, selectedChannel])

//   // Function to extract all messages from all channels
//   const extractAllMessages = () => {
//     setIsExporting(true)
//     try {
//       // Collect all messages from all channels
//       const allMessages: { channel: string; messages: SlackMessage[] }[] = slackData.map((channel) => ({
//         channel: channel.channelName,
//         messages: channel.messages,
//       }))

//       // Convert to JSON and create a downloadable file
//       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allMessages, null, 2))
//       const downloadAnchorNode = document.createElement("a")
//       downloadAnchorNode.setAttribute("href", dataStr)
//       downloadAnchorNode.setAttribute("download", "slack-messages.json")
//       document.body.appendChild(downloadAnchorNode)
//       downloadAnchorNode.click()
//       downloadAnchorNode.remove()

//       toast({
//         title: "Success",
//         description: "All messages exported successfully",
//         variant: "default",
//       })
//     } catch (error) {
//       console.error("Error exporting messages:", error)
//       toast({
//         title: "Error",
//         description: "Failed to export messages",
//         variant: "destructive",
//       })
//     } finally {
//       setIsExporting(false)
//     }
//   }

//   // Function to extract all files from all channels
//   const extractAllFiles = () => {
//     setIsExporting(true)
//     try {
//       // Collect all files from all channels
//       const allFiles: { channel: string; files: SlackFile[] }[] = slackData.map((channel) => ({
//         channel: channel.channelName,
//         files: channel.files,
//       }))

//       // Convert to JSON and create a downloadable file
//       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allFiles, null, 2))
//       const downloadAnchorNode = document.createElement("a")
//       downloadAnchorNode.setAttribute("href", dataStr)
//       downloadAnchorNode.setAttribute("download", "slack-files.json")
//       document.body.appendChild(downloadAnchorNode)
//       downloadAnchorNode.click()
//       downloadAnchorNode.remove()

//       toast({
//         title: "Success",
//         description: "All files exported successfully",
//         variant: "default",
//       })
//     } catch (error) {
//       console.error("Error exporting files:", error)
//       toast({
//         title: "Error",
//         description: "Failed to export files",
//         variant: "destructive",
//       })
//     } finally {
//       setIsExporting(false)
//     }
//   }

//   const selectedChannelData = slackData.find((channel) => channel.channelId === selectedChannel)

//   return (
//     <main className="flex min-h-screen flex-col p-4 md:p-8">
//       <Card className="w-full">
//         <CardHeader className="bg-primary text-primary-foreground">
//           <CardTitle className="text-xl md:text-2xl flex justify-between items-center">
//             <span>PRD.ai Slack Ingestion PoC</span>
//             {isConnected && (
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={extractAllMessages}
//                   disabled={isExporting}
//                   className="text-white border-white hover:bg-white/20"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Export All Messages
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={extractAllFiles}
//                   disabled={isExporting}
//                   className="text-white border-white hover:bg-white/20"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Export All Files
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowAllData(!showAllData)}
//                   className="text-white border-white hover:bg-white/20"
//                 >
//                   {showAllData ? "Show Channel View" : "Show All Data"}
//                 </Button>
//               </div>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-4 md:p-6">
//           {!isConnected ? (
//             <div className="flex flex-col items-center justify-center space-y-4 py-12">
//               <h2 className="text-xl font-semibold">Connect to Slack to get started</h2>
//               <Button onClick={connectToSlack} disabled={isLoading} size="lg" className="flex items-center gap-2">
//                 {isLoading ? "Connecting..." : "Connect to Slack"}
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
//                 <h3 className="font-medium flex items-center text-amber-800">
//                   <Bot className="h-5 w-5 mr-2" />
//                   Adding a Bot to Your Channel
//                 </h3>
//                 <p className="text-sm text-amber-700 mt-1">
//                   To add a bot to your Slack channel, go to your Slack App settings in the Slack API dashboard, navigate
//                   to "OAuth & Permissions", and ensure your bot has the required scopes.
//                 </p>
//                 <Button
//                   variant="link"
//                   size="sm"
//                   onClick={() => setShowBotGuide(!showBotGuide)}
//                   className="text-amber-800 p-0 h-auto mt-2"
//                 >
//                   {showBotGuide ? "Hide detailed guide" : "Show detailed guide"}
//                 </Button>
//               </div>

//               {showBotGuide && <BotGuide />}

//               <ChannelSelector
//                 channels={slackData}
//                 selectedChannel={selectedChannel}
//                 onSelectChannel={setSelectedChannel}
//               />

//               {showAllData ? (
//                 <AllDataView slackData={slackData} />
//               ) : (
//                 selectedChannelData && (
//                   <div className="mt-6">
//                     <h2 className="text-lg font-medium mb-4">Selected Channel: {selectedChannelData.channelName}</h2>

//                     <Tabs defaultValue="messages">
//                       <TabsList className="mb-4">
//                         <TabsTrigger value="messages">Messages</TabsTrigger>
//                         <TabsTrigger value="files">Files</TabsTrigger>
//                       </TabsList>

//                       <TabsContent value="messages">
//                         <MessageList messages={selectedChannelData.messages} />
//                       </TabsContent>

//                       <TabsContent value="files">
//                         <FileList files={selectedChannelData.files} />
//                       </TabsContent>
//                     </Tabs>
//                   </div>
//                 )
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   )
// }



"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageList } from "@/components/message-list"
import { FileList } from "@/components/file-list"
import { ChannelSelector } from "@/components/channel-selector"
import { useToast } from "@/hooks/use-toast"
import type { SlackData, SlackMessage, SlackFile } from "@/types/slack"
import { Download, Bot, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [slackData, setSlackData] = useState<SlackData>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [showAllData, setShowAllData] = useState(false)
  const [showBotGuide, setShowBotGuide] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for error in URL parameters
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(
        errorParam === "invalid_state"
          ? "Authentication state mismatch. Please try again."
          : `Authentication error: ${errorParam}`,
      )

      toast({
        title: "Authentication Error",
        description: `There was a problem connecting to Slack: ${errorParam}`,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  // Function to initiate Slack OAuth flow
  const connectToSlack = () => {
    setIsLoading(true)
    setError(null)
    window.location.href = "/api/auth/slack"
  }

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status")
        const data = await response.json()
        setIsConnected(data.authenticated)
        if (data.authenticated) {
          fetchChannels()
        }
      } catch (error) {
        console.error("Error checking authentication status:", error)
        setError("Failed to check authentication status")
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [toast])

  // Fetch channels when authenticated
  const fetchChannels = async () => {
    setIsLoadingChannels(true)
    setError(null)

    try {
      toast({
        title: "Loading Data",
        description: "Fetching channels, messages, and files from the past 2 months. This may take a moment...",
        variant: "default",
      })

      const response = await fetch("/api/slack/channels")
      const data = await response.json()

      if (data.success) {
        setSlackData(data.channels)
        if (data.channels.length > 0) {
          setSelectedChannel(data.channels[0].channelId)

          // Count total messages and files
          const totalMessages = data.channels.reduce((sum, channel) => sum + channel.messages.length, 0)
          const totalFiles = data.channels.reduce((sum, channel) => sum + channel.files.length, 0)

          toast({
            title: "Data Loaded Successfully",
            description: `Loaded ${data.channels.length} channels with ${totalMessages} messages and ${totalFiles} files.`,
            variant: "default",
          })
        } else {
          toast({
            title: "No Data Found",
            description: "No channels were found in your Slack workspace.",
            variant: "default",
          })
        }
      } else {
        throw new Error(data.error || "Failed to fetch channels")
      }
    } catch (error) {
      console.error("Error fetching channels:", error)
      setError("Failed to fetch channels. Please check your Slack token and permissions.")
      toast({
        title: "Error",
        description: "Failed to fetch channels from Slack",
        variant: "destructive",
      })
    } finally {
      setIsLoadingChannels(false)
    }
  }

  // Function to refresh data
  const refreshData = () => {
    if (isConnected) {
      fetchChannels()
    }
  }

  // Function to extract all messages from all channels
  const extractAllMessages = () => {
    setIsExporting(true)
    try {
      // Collect all messages from all channels
      const allMessages: { channel: string; messages: SlackMessage[] }[] = slackData.map((channel) => ({
        channel: channel.channelName,
        messages: channel.messages,
      }))

      // Convert to JSON and create a downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allMessages, null, 2))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", `slack-messages-${new Date().toISOString().split("T")[0]}.json`)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      toast({
        title: "Success",
        description: "All messages exported successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error exporting messages:", error)
      toast({
        title: "Error",
        description: "Failed to export messages",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Function to extract all files from all channels
  const extractAllFiles = () => {
    setIsExporting(true)
    try {
      // Collect all files from all channels
      const allFiles: { channel: string; files: SlackFile[] }[] = slackData.map((channel) => ({
        channel: channel.channelName,
        files: channel.files,
      }))

      // Convert to JSON and create a downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allFiles, null, 2))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", `slack-files-${new Date().toISOString().split("T")[0]}.json`)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      toast({
        title: "Success",
        description: "All files exported successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error exporting files:", error)
      toast({
        title: "Error",
        description: "Failed to export files",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const selectedChannelData = slackData.find((channel) => channel.channelId === selectedChannel)

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-xl md:text-2xl flex justify-between items-center">
            <span>Slack Ingestion PoC</span>
            {isConnected && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoadingChannels}
                  className="text-white border-white hover:bg-white/20"
                >
                  {isLoadingChannels ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Refresh Data</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={extractAllMessages}
                  disabled={isExporting || isLoadingChannels}
                  className="text-white border-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Messages
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={extractAllFiles}
                  disabled={isExporting || isLoadingChannels}
                  className="text-white border-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllData(!showAllData)}
                  disabled={isLoadingChannels}
                  className="text-white border-white hover:bg-white/20"
                >
                  {showAllData ? "Show Channel View" : "Show All Data"}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <h2 className="text-xl font-semibold">Connect to Slack to get started</h2>
              <Button onClick={connectToSlack} disabled={isLoading} size="lg" className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Slack"
                )}
              </Button>

              <div className="mt-4 max-w-md text-center text-sm text-muted-foreground">
                <p>Make sure your Slack app has the correct redirect URL configured:</p>
                <code className="mt-2 block bg-muted p-2 rounded text-xs overflow-auto">
                  {typeof window !== "undefined"
                    ? `${window.location.protocol}//${window.location.host}/api/auth/callback`
                    : "https://your-app-url.com/api/auth/callback"}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <h3 className="font-medium flex items-center text-amber-800">
                  <Bot className="h-5 w-5 mr-2" />
                  Slack Data Ingestion
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  This application is fetching real data from your Slack workspace for the past 2 months. You can view
                  messages and files by channel or see all data at once.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowBotGuide(!showBotGuide)}
                  className="text-amber-800 p-0 h-auto mt-2"
                >
                  {showBotGuide ? "Hide bot guide" : "Show bot guide"}
                </Button>
              </div>

              {showBotGuide && (
                <div className="bg-white p-4 rounded-md border">
                  <h3 className="font-medium mb-2">Bot Installation Guide</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>
                      Go to the{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Slack API Dashboard
                      </a>
                    </li>
                    <li>Select your app or create a new one</li>
                    <li>Go to "OAuth & Permissions" in the sidebar</li>
                    <li>Add the required scopes: channels:history, channels:read, chat:write, etc.</li>
                    <li>
                      Add your redirect URL:{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                        {typeof window !== "undefined"
                          ? `${window.location.protocol}//${window.location.host}/api/auth/callback`
                          : "your-redirect-url"}
                      </code>
                    </li>
                    <li>Install the app to your workspace</li>
                    <li>
                      In Slack, invite the bot to your channel with{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/invite @botname</code>
                    </li>
                  </ol>
                </div>
              )}

              {isLoadingChannels ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Loading Slack data...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Fetching channels, messages, and files from the past 2 months. This may take a moment depending on
                    the amount of data.
                  </p>
                </div>
              ) : slackData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg font-medium">No channels found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No channels were found in your Slack workspace or the bot doesn't have access to any channels.
                  </p>
                  <Button onClick={refreshData} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <ChannelSelector
                    channels={slackData}
                    selectedChannel={selectedChannel}
                    onSelectChannel={setSelectedChannel}
                  />

                  {showAllData ? (
                    <div className="mt-6">
                      <h2 className="text-lg font-medium mb-4">All Channels Data</h2>

                      <Tabs defaultValue="messages">
                        <TabsList className="mb-4">
                          <TabsTrigger value="messages">
                            All Messages ({slackData.reduce((sum, channel) => sum + channel.messages.length, 0)})
                          </TabsTrigger>
                          <TabsTrigger value="files">
                            All Files ({slackData.reduce((sum, channel) => sum + channel.files.length, 0)})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="messages">
                          <MessageList
                            messages={slackData
                              .flatMap((channel) =>
                                channel.messages.map((msg) => ({
                                  ...msg,
                                  text: `[${channel.channelName}] ${msg.text}`,
                                })),
                              )
                              .sort((a, b) => Number.parseFloat(b.timestamp) - Number.parseFloat(a.timestamp))}
                          />
                        </TabsContent>

                        <TabsContent value="files">
                          <FileList
                            files={slackData
                              .flatMap((channel) =>
                                channel.files.map((file) => ({
                                  ...file,
                                  fileName: `[${channel.channelName}] ${file.fileName}`,
                                })),
                              )
                              .sort((a, b) => Number.parseFloat(b.timestamp) - Number.parseFloat(a.timestamp))}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    selectedChannelData && (
                      <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                          Selected Channel: {selectedChannelData.channelName}
                        </h2>

                        <Tabs defaultValue="messages">
                          <TabsList className="mb-4">
                            <TabsTrigger value="messages">Messages ({selectedChannelData.messages.length})</TabsTrigger>
                            <TabsTrigger value="files">Files ({selectedChannelData.files.length})</TabsTrigger>
                          </TabsList>

                          <TabsContent value="messages">
                            <MessageList messages={selectedChannelData.messages} />
                          </TabsContent>

                          <TabsContent value="files">
                            <FileList files={selectedChannelData.files} />
                          </TabsContent>
                        </Tabs>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

