"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider"

// Types for authentication
interface CognitoUser {
  username: string
  email: string
  groups: string[]
  accessToken: string
  idToken: string
  refreshToken: string
}

interface AuthContextValue {
  user: CognitoUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  signIn: (username: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Cognito configuration - these should be set as environment variables
const COGNITO_REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || "ap-southeast-1"
const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ""
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ""

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
})

// Helper to decode JWT and extract groups
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

// Storage keys
const STORAGE_KEY = "aegis_auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user
  const isAdmin = user?.groups?.some(
    (group) => group.toLowerCase() === "admin" || group.toLowerCase() === "admins"
  ) || false

  // Restore session from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Persist session to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const signIn = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      })

      const response = await cognitoClient.send(command)

      if (!response.AuthenticationResult) {
        throw new Error("Authentication failed - no result returned")
      }

      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult

      if (!AccessToken || !IdToken) {
        throw new Error("Authentication failed - missing tokens")
      }

      // Decode ID token to get user info and groups
      const decodedIdToken = decodeJwt(IdToken)
      const groups = (decodedIdToken["cognito:groups"] as string[]) || []
      const email = (decodedIdToken["email"] as string) || username

      const cognitoUser: CognitoUser = {
        username,
        email,
        groups,
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken || "",
      }

      setUser(cognitoUser)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      
      // Handle common Cognito errors
      if (message.includes("NotAuthorizedException")) {
        setError("Incorrect username or password")
      } else if (message.includes("UserNotFoundException")) {
        setError("User not found")
      } else if (message.includes("UserNotConfirmedException")) {
        setError("User is not confirmed")
      } else {
        setError(message)
      }
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)

    try {
      if (user?.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: user.accessToken,
        })
        await cognitoClient.send(command)
      }
    } catch {
      // Ignore sign out errors - we'll clear local state anyway
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
