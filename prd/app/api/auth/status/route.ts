import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("slack_access_token")?.value

  return NextResponse.json({
    authenticated: !!accessToken,
  })
}

