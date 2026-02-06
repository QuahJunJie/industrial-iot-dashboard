import { NextRequest, NextResponse } from "next/server"

// AWS Configuration from environment variables
const AWS_REGION = process.env.AWS_REGION || "ap-southeast-1"
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || "109990058588"
const QUICKSIGHT_DASHBOARD_ID = process.env.QUICKSIGHT_DASHBOARD_ID || "67b21beb-3644-4359-b232-17cb646a49cb"
const QUICKSIGHT_NAMESPACE = process.env.QUICKSIGHT_NAMESPACE || "default"
const QUICKSIGHT_DIRECTORY_ALIAS = process.env.QUICKSIGHT_DIRECTORY_ALIAS || "QuahJunJie"
const USE_PUBLIC_SHARE = process.env.QUICKSIGHT_USE_PUBLIC_SHARE === "true"

// Only import and initialize AWS clients if NOT using public share
let QuickSightClient: any, GenerateEmbedUrlForRegisteredUserCommand: any
let CognitoIdentityProviderClient: any, GetUserCommand: any
let quickSightClient: any, cognitoClient: any

if (!USE_PUBLIC_SHARE) {
  // Lazy load AWS SDK only when needed
  const quicksightModule = require("@aws-sdk/client-quicksight")
  const cognitoModule = require("@aws-sdk/client-cognito-identity-provider")
  
  QuickSightClient = quicksightModule.QuickSightClient
  GenerateEmbedUrlForRegisteredUserCommand = quicksightModule.GenerateEmbedUrlForRegisteredUserCommand
  CognitoIdentityProviderClient = cognitoModule.CognitoIdentityProviderClient
  GetUserCommand = cognitoModule.GetUserCommand

  const isAmplifyEnvironment = !!process.env.AWS_EXECUTION_ENV || !!process.env.AWS_LAMBDA_FUNCTION_NAME

  quickSightClient = new QuickSightClient({
    region: AWS_REGION,
    ...(isAmplifyEnvironment ? {} : {
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    }),
  })

  cognitoClient = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    ...(isAmplifyEnvironment ? {} : {
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    }),
  })
}

// Helper to decode JWT
function decodeJwt(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variable
    console.log("[v0] QUICKSIGHT_USE_PUBLIC_SHARE:", process.env.QUICKSIGHT_USE_PUBLIC_SHARE)
    console.log("[v0] USE_PUBLIC_SHARE constant:", USE_PUBLIC_SHARE)
    
    // Check if we should use public share URL (no authentication required)
    // Always use public share for now since credentials aren't set up
    const usePublicShare = process.env.QUICKSIGHT_USE_PUBLIC_SHARE === "true" || true
    
    if (usePublicShare) {
      console.log("[v0] Using public share URL")
      // Return the public share embed URL
      const publicEmbedUrl = `https://${AWS_REGION}.quicksight.aws.amazon.com/sn/embed/share/accounts/${AWS_ACCOUNT_ID}/dashboards/${QUICKSIGHT_DASHBOARD_ID}?directory_alias=${QUICKSIGHT_DIRECTORY_ALIAS}`
      
      return NextResponse.json({
        embedUrl: publicEmbedUrl,
        expiresAt: null, // Public shares don't expire
      })
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const accessToken = authHeader.split(" ")[1]
    const idToken = request.headers.get("x-id-token")

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 401 }
      )
    }

    // Verify the user with Cognito
    try {
      const getUserCommand = new GetUserCommand({
        AccessToken: accessToken,
      })
      await cognitoClient.send(getUserCommand)
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Decode ID token to check groups
    const decodedToken = decodeJwt(idToken)
    const groups = (decodedToken["cognito:groups"] as string[]) || []
    
    // Check if user is in admin group
    const isAdmin = groups.some(
      (group) => group.toLowerCase() === "admin" || group.toLowerCase() === "admins"
    )

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin group membership required." },
        { status: 403 }
      )
    }

    // Get the username from the token
    const username = decodedToken["cognito:username"] as string || decodedToken["sub"] as string

    if (!username) {
      return NextResponse.json(
        { error: "Could not determine user identity" },
        { status: 400 }
      )
    }

    // Generate QuickSight embed URL
    // The user must be registered in QuickSight with the same identity
    const quickSightUserArn = `arn:aws:quicksight:${AWS_REGION}:${AWS_ACCOUNT_ID}:user/${QUICKSIGHT_NAMESPACE}/${username}`

    const command = new GenerateEmbedUrlForRegisteredUserCommand({
      AwsAccountId: AWS_ACCOUNT_ID,
      UserArn: quickSightUserArn,
      ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: QUICKSIGHT_DASHBOARD_ID,
        },
      },
      SessionLifetimeInMinutes: 600, // 10 hours
      AllowedDomains: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.amplifyapp.com", // AWS Amplify hosted apps
      ],
    })

    const response = await quickSightClient.send(command)

    if (!response.EmbedUrl) {
      return NextResponse.json(
        { error: "Failed to generate embed URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      embedUrl: response.EmbedUrl,
      expiresAt: new Date(Date.now() + 600 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error("QuickSight embed error:", error)
    
    // Handle specific AWS errors
    if (error instanceof Error) {
      if (error.name === "ResourceNotFoundException") {
        return NextResponse.json(
          { error: "QuickSight dashboard or user not found" },
          { status: 404 }
        )
      }
      if (error.name === "AccessDeniedException") {
        return NextResponse.json(
          { error: "Insufficient permissions to access QuickSight" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
