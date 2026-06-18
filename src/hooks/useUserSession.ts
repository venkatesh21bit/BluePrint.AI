"use client"

import { useSession } from "next-auth/react"

/**
 * Custom hook providing typed, convenient access to the current user session.
 *
 * Returns:
 *  - user: the session user object (or null if not authenticated)
 *  - isLoading: true while the session is being fetched on page load
 *  - isAuthenticated: shorthand boolean for `!!user`
 *  - status: raw session status string ("loading" | "authenticated" | "unauthenticated")
 */
export function useUserSession() {
  const { data: session, status, update } = useSession()

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    status,
    update,
  }
}
