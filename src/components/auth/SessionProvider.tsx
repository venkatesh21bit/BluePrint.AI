"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

/**
 * Client-side SessionProvider that wraps the app so any child component
 * can call `useSession()` from `next-auth/react` to get the current user.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
