import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Check, ExternalLink } from "lucide-react"

export function BotGuide() {
  return (
    <Card className="w-full mt-6">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-800 flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          How to Add a Bot to Your Slack Channel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm">
          Adding a bot to your Slack channel involves a few steps. Follow this guide to get your bot up and running:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Create a Slack App</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Slack API Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                </a>{" "}
                and click "Create New App". Choose "From scratch" and give your app a name.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Add Bot User</h3>
              <p className="text-sm text-muted-foreground">
                In your app settings, go to "Bot Users" and click "Add a Bot User". Give your bot a display name and
                username.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Set OAuth Scopes</h3>
              <p className="text-sm text-muted-foreground">
                Go to "OAuth & Permissions" and scroll down to "Scopes". Add the following Bot Token Scopes:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 mt-1">
                <li>channels:history</li>
                <li>channels:read</li>
                <li>chat:write</li>
                <li>files:read</li>
                <li>groups:history</li>
                <li>groups:read</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Install App to Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Go back to "OAuth & Permissions" and click "Install App to Workspace". Authorize the app when prompted.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Invite Bot to Channel</h3>
              <p className="text-sm text-muted-foreground">
                In Slack, go to the channel where you want to add the bot. Type <code>/invite @botname</code> and send
                the message.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
          <strong>Note:</strong> For this PoC application, we're using a simulated environment. In a real
          implementation, you would need to set up event subscriptions and interactive components in your Slack App
          settings.
        </p>
      </CardContent>
    </Card>
  )
}

