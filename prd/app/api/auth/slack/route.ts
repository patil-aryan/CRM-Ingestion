import { NextResponse } from "next/server"

// This would be your Slack App's client ID
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
// The redirect URI must match what you've configured in your Slack App
const REDIRECT_URI = process.env.REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
// The scopes your app needs
const SCOPES = [
  "channels:history",
  "channels:read",
  "groups:history",
  "groups:read",
  "users:read",
  "files:read",
  "reactions:read",
].join(",")

export async function GET() {
  // Generate a random state value to prevent CSRF attacks
  const state = Math.random().toString(36).substring(2)

  // Store the state in a cookie for verification later
  const response = NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`,
  )

  console.log("REDIRECT_URI in slack/route.ts:", REDIRECT_URI)

  response.cookies.set("slack_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutes
  })

  return response
}

