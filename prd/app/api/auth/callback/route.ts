// import { type NextRequest, NextResponse } from "next/server"

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams
//   const code = searchParams.get("code")
//   const state = searchParams.get("state")
//   const error = searchParams.get("error")

//   // Get the state from the cookie
//   const storedState = request.cookies.get("slack_oauth_state")?.value

//   // Clear the state cookie
//   const response = NextResponse.redirect(new URL("/", request.url))
//   response.cookies.delete("slack_oauth_state")

//   // Check if there was an error or if the state doesn't match
//   if (error) {
//     console.error("Slack OAuth error:", error)
//     return response
//   }

//   if (!state || state !== storedState) {
//     console.error("Invalid state parameter")
//     return response
//   }

//   if (!code) {
//     console.error("No code parameter")
//     return response
//   }

//   try {
//     // Exchange the code for an access token
//     const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         client_id: process.env.SLACK_CLIENT_ID!,
//         client_secret: process.env.SLACK_CLIENT_SECRET!,
//         code,
//         redirect_uri: process.env.REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
//       }),
//     })

//     const tokenData = await tokenResponse.json()

//     if (!tokenData.ok) {
//       throw new Error(tokenData.error || "Failed to exchange code for token")
//     }

//     // Store the access token securely
//     // In a real app, you'd store this in a database
//     // For this PoC, we'll use a secure HTTP-only cookie
//     response.cookies.set("slack_access_token", tokenData.access_token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7, // 1 week
//     })

//     // Also store the bot token if available
//     if (tokenData.bot_user_id) {
//       response.cookies.set("slack_bot_token", tokenData.bot_token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 60 * 60 * 24 * 7, // 1 week
//       })
//     }

//     return response
//   } catch (error) {
//     console.error("Error exchanging code for token:", error)
//     return response
//   }
// }

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Get the state from the cookie
  const storedState = request.cookies.get("slack_oauth_state")?.value

  // Check if there was an error or if the state doesn't match
  if (error) {
    console.error("Slack OAuth error:", error)
     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
  }

  if (!state || state !== storedState) {
    console.error("Invalid state parameter")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
  }

  if (!code) {
    console.error("No code parameter")
     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      throw new Error(tokenData.error || "Failed to exchange code for token")
    }

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);

    // Store the access token securely
    // In a real app, you'd store this in a database
    // For this PoC, we'll use a secure HTTP-only cookie
    response.cookies.set("slack_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Also store the bot token if available
    if (tokenData.bot_user_id) {
      response.cookies.set("slack_bot_token", tokenData.bot_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }
    // Clear the state cookie
    response.cookies.delete("slack_oauth_state")

    return response
  } catch (error) {
    console.error("Error exchanging code for token:", error)
     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
  }
}